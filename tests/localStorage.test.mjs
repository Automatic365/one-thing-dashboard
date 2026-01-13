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

const loadFunctions = async (localStorage) => {
    const html = await fs.readFile('index.html', 'utf8');
    const loadSource = extractFunctionSource(html, 'loadFromLocalStorage');
    const saveSource = extractFunctionSource(html, 'saveToLocalStorage');

    const errors = [];
    const context = {
        migrateData,
        getInitialState,
        localStorage,
        console: {
            error: (...args) => errors.push(args)
        }
    };

    vm.runInNewContext(`
${loadSource}
${saveSource}
this.loadFromLocalStorage = loadFromLocalStorage;
this.saveToLocalStorage = saveToLocalStorage;
`, context);

    return { ...context, errors };
};

const createLocalStorageMock = () => {
    const store = new Map();
    const getCalls = [];
    const setCalls = [];

    return {
        getCalls,
        setCalls,
        getItem: (key) => {
            getCalls.push(key);
            return store.has(key) ? store.get(key) : null;
        },
        setItem: (key, value) => {
            setCalls.push([key, value]);
            store.set(key, value);
        },
        setStoredValue: (key, value) => {
            store.set(key, value);
        }
    };
};

test('loadFromLocalStorage returns getInitialState when storage is empty', async () => {
    const localStorage = createLocalStorageMock();
    const { loadFromLocalStorage } = await loadFunctions(localStorage);

    const state = loadFromLocalStorage();

    assert.deepEqual(state, getInitialState());
    assert.deepEqual(localStorage.getCalls, ['oneThingApp']);
});

test('loadFromLocalStorage falls back to getInitialState on malformed JSON', async () => {
    const localStorage = createLocalStorageMock();
    localStorage.setStoredValue('oneThingApp', '{bad json');
    const { loadFromLocalStorage, errors } = await loadFunctions(localStorage);

    const state = loadFromLocalStorage();

    assert.deepEqual(state, getInitialState());
    assert.deepEqual(localStorage.getCalls, ['oneThingApp']);
    assert.equal(errors.length, 1);
});

test('saveToLocalStorage persists and loadFromLocalStorage restores state', async () => {
    const localStorage = createLocalStorageMock();
    const { loadFromLocalStorage, saveToLocalStorage } = await loadFunctions(localStorage);

    const state = getInitialState();
    state.currentQuoteIndex = 3;
    state.timeBlocks = [
        { id: 'block-1', start: '09:00', end: '10:00', lifeArea: 'business' },
        { id: 'block-2', start: '10:00', end: '11:00', lifeArea: 'personal' }
    ];
    state.lifeAreas.business.active = true;
    state.lifeAreas.business.completions = [{ date: '2024-01-01', lifeArea: 'business' }];

    saveToLocalStorage(state);

    assert.deepEqual(localStorage.setCalls.length, 1);
    const [key, payload] = localStorage.setCalls[0];
    assert.equal(key, 'oneThingApp');

    const parsed = JSON.parse(payload);
    assert.equal(parsed.currentQuoteIndex, 3);
    assert.equal(parsed.timeBlocks.length, 2);
    assert.ok(parsed.lifeAreas.business);

    localStorage.setStoredValue('oneThingApp', payload);
    const restored = loadFromLocalStorage();

    assert.equal(restored.currentQuoteIndex, state.currentQuoteIndex);
    assert.equal(JSON.stringify(restored.timeBlocks), JSON.stringify(state.timeBlocks));
    assert.equal(JSON.stringify(restored.lifeAreas), JSON.stringify(state.lifeAreas));
    assert.deepEqual(localStorage.getCalls, ['oneThingApp']);
});
