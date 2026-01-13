import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { getInitialState, migrateData } from '../migrateData.mjs';

const extractFunctionSource = (html, name) => {
    const regex = new RegExp(`const ${name} = \\([^)]*\\) => \\{[\\s\\S]*?\\};`);
    const match = html.match(regex);
    assert.ok(match, `Expected to find ${name} definition in index.html`);
    return match[0];
};

const extractUseEffectBody = (html, occurrence = 0) => {
    const token = 'useEffect(() => {';
    let index = -1;

    for (let i = 0; i <= occurrence; i += 1) {
        index = html.indexOf(token, index + 1);
        if (index === -1) {
            throw new Error(`Unable to locate useEffect occurrence ${occurrence}`);
        }
    }

    const braceStart = html.indexOf('{', index + token.length - 1);
    if (braceStart === -1) {
        throw new Error('Unable to find useEffect opening brace');
    }

    let depth = 0;
    let endIndex = braceStart;
    for (; endIndex < html.length; endIndex += 1) {
        const char = html[endIndex];
        if (char === '{') {
            depth += 1;
        } else if (char === '}') {
            depth -= 1;
            if (depth === 0) {
                break;
            }
        }
    }

    if (depth !== 0) {
        throw new Error('Unbalanced braces in useEffect body');
    }

    return html.slice(braceStart + 1, endIndex);
};

const createLocalStorageMock = () => {
    const store = new Map();
    const getCalls = [];

    return {
        getCalls,
        getItem: (key) => {
            getCalls.push(key);
            return store.has(key) ? store.get(key) : null;
        },
        setItem: (key, value) => {
            store.set(key, value);
        },
        setStoredValue: (key, value) => {
            store.set(key, value);
        }
    };
};

const loadIndexHelpers = async (localStorage) => {
    const html = await fs.readFile('index.html', 'utf8');
    const loadSource = extractFunctionSource(html, 'loadFromLocalStorage');

    const context = {
        migrateData,
        getInitialState,
        localStorage,
        console
    };

    vm.runInNewContext(`
${loadSource}
this.loadFromLocalStorage = loadFromLocalStorage;
`, context);

    return {
        loadFromLocalStorage: context.loadFromLocalStorage,
        html
    };
};

const buildEffect = (body, context) => {
    const sandbox = { ...context };
    vm.createContext(sandbox);
    vm.runInContext(`this.effect = () => {${body}};`, sandbox);
    return sandbox.effect;
};

const createSpy = () => {
    const calls = [];
    const spy = (...args) => {
        calls.push(args);
    };
    spy.calls = calls;
    return spy;
};

test('unauthenticated state loads from localStorage', async () => {
    const localStorage = createLocalStorageMock();
    const storedState = { ...getInitialState(), version: 5, currentQuoteIndex: 2 };
    localStorage.setStoredValue('oneThingApp', JSON.stringify(storedState));

    const { loadFromLocalStorage, html } = await loadIndexHelpers(localStorage);
    const authEffectBody = extractUseEffectBody(html, 0);

    const setLoading = createSpy();
    const setState = createSpy();

    const effect = buildEffect(authEffectBody, {
        isFirebaseConfigured: true,
        auth: null,
        loadFromLocalStorage,
        setLoading,
        setState
    });

    effect();

    assert.deepEqual(setLoading.calls, [[false]]);
    assert.equal(setState.calls.length, 1);
    assert.equal(setState.calls[0][0].currentQuoteIndex, 2);
    assert.deepEqual(localStorage.getCalls, ['oneThingApp']);
});

test('authenticated state migrates Firestore data and persists upgrades', async () => {
    const localStorage = createLocalStorageMock();
    const { loadFromLocalStorage, html } = await loadIndexHelpers(localStorage);
    const firestoreEffectBody = extractUseEffectBody(html, 1);

    const setState = createSpy();
    const setSyncing = createSpy();

    const originalData = {
        version: 4,
        lifeAreas: {
            business: {
                active: true,
                completions: [],
                goals: {
                    someday: { text: 'someday', updatedAt: null },
                    fiveYear: { text: 'five', updatedAt: null },
                    oneYear: { text: 'annual', updatedAt: null },
                    monthly: { text: 'monthly', updatedAt: null },
                    weeklyGoals: [{ text: 'weekly', updatedAt: null }],
                    daily: { text: 'daily', updatedAt: null }
                }
            }
        },
        timeBlocks: [],
        currentQuoteIndex: 0,
        lastWeeklyReview: null,
        lastAnnualReview: null
    };

    const snapshot = {
        exists: true,
        data: () => originalData
    };

    const setCalls = [];
    const docRef = {
        onSnapshot: (onNext) => {
            onNext(snapshot);
            return () => {};
        },
        set: (data) => {
            setCalls.push(data);
            return Promise.resolve();
        }
    };

    const db = {
        collection: (name) => {
            assert.equal(name, 'users');
            return {
                doc: (uid) => {
                    assert.equal(uid, 'user-123');
                    return docRef;
                }
            };
        }
    };

    const effect = buildEffect(firestoreEffectBody, {
        user: { uid: 'user-123' },
        db,
        isFirebaseConfigured: true,
        loadFromLocalStorage,
        migrateData,
        setState,
        setSyncing,
        console
    });

    effect();

    assert.deepEqual(setSyncing.calls[0], [true]);
    assert.equal(setState.calls.length, 1);

    const migrated = migrateData(originalData);
    assert.deepEqual(setState.calls[0][0], migrated);
    assert.equal(setCalls.length, 1);
    assert.deepEqual(setCalls[0], migrated);
    assert.deepEqual(setSyncing.calls[setSyncing.calls.length - 1], [false]);
});

test('first-time user loads localStorage then persists to Firestore', async () => {
    const localStorage = createLocalStorageMock();
    const storedState = { ...getInitialState(), version: 5, currentQuoteIndex: 4 };
    localStorage.setStoredValue('oneThingApp', JSON.stringify(storedState));

    const { loadFromLocalStorage, html } = await loadIndexHelpers(localStorage);
    const firestoreEffectBody = extractUseEffectBody(html, 1);

    const setState = createSpy();
    const setSyncing = createSpy();
    let resolveSet;

    const setCalls = [];
    const docRef = {
        onSnapshot: (onNext) => {
            onNext({ exists: false });
            return () => {};
        },
        set: (data) => {
            setCalls.push(data);
            return new Promise((resolve) => {
                resolveSet = resolve;
            });
        }
    };

    const db = {
        collection: () => ({
            doc: () => docRef
        })
    };

    const effect = buildEffect(firestoreEffectBody, {
        user: { uid: 'user-456' },
        db,
        isFirebaseConfigured: true,
        loadFromLocalStorage,
        migrateData,
        setState,
        setSyncing,
        console
    });

    effect();

    assert.deepEqual(setSyncing.calls[0], [true]);
    assert.deepEqual(localStorage.getCalls, ['oneThingApp']);

    resolveSet();
    await new Promise((resolve) => setImmediate(resolve));

    assert.equal(setCalls.length, 1);
    assert.equal(setCalls[0].currentQuoteIndex, 4);
    assert.equal(setState.calls.length, 1);
    assert.equal(setState.calls[0][0].currentQuoteIndex, 4);
    assert.deepEqual(setSyncing.calls[setSyncing.calls.length - 1], [false]);
});
