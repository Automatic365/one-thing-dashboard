import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { getInitialState } from '../migrateData.mjs';

const extractFunction = (source, name) => {
    const startToken = `const ${name} =`;
    const startIndex = source.indexOf(startToken);
    if (startIndex === -1) {
        throw new Error(`Unable to find ${name} in index.html`);
    }

    const braceStart = source.indexOf('{', startIndex);
    if (braceStart === -1) {
        throw new Error(`Unable to find opening brace for ${name}`);
    }

    let depth = 0;
    let endIndex = braceStart;
    for (; endIndex < source.length; endIndex += 1) {
        const char = source[endIndex];
        if (char === '{') {
            depth += 1;
        } else if (char === '}') {
            depth -= 1;
            if (depth === 0) {
                endIndex += 1;
                break;
            }
        }
    }

    const snippet = source.slice(startIndex, endIndex);
    return snippet.endsWith(';') ? snippet : `${snippet};`;
};

const loadIndexFunctions = ({ DateOverride } = {}) => {
    const indexSource = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    const functionsSource = [
        extractFunction(indexSource, 'getLocalDateString'),
        extractFunction(indexSource, 'completeDaily')
    ].join('\n');

    const context = {
        Date: DateOverride ?? Date
    };
    vm.createContext(context);
    vm.runInContext(`${functionsSource}\nthis.getLocalDateString = getLocalDateString;\nthis.completeDaily = completeDaily;`, context);

    return {
        getLocalDateString: context.getLocalDateString,
        completeDaily: context.completeDaily
    };
};

const loadOneThingSetters = (initialState) => {
    const indexSource = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    const functionsSource = [
        extractFunction(indexSource, 'setAnnualOneThing'),
        extractFunction(indexSource, 'setMonthlyOneThing'),
        extractFunction(indexSource, 'setWeeklyOneThing')
    ].join('\n');

    const saveCalls = [];
    const context = {
        state: initialState,
        saveState: (nextState) => {
            saveCalls.push(nextState);
            context.state = nextState;
        }
    };

    vm.createContext(context);
    vm.runInContext(`${functionsSource}
this.setAnnualOneThing = setAnnualOneThing;
this.setMonthlyOneThing = setMonthlyOneThing;
this.setWeeklyOneThing = setWeeklyOneThing;`, context);

    return {
        setAnnualOneThing: context.setAnnualOneThing,
        setMonthlyOneThing: context.setMonthlyOneThing,
        setWeeklyOneThing: context.setWeeklyOneThing,
        getState: () => context.state,
        saveCalls
    };
};

test('adds a completion when a daily goal exists', () => {
    const { completeDaily } = loadIndexFunctions();
    const state = {
        lifeAreas: {
            business: {
                completions: [],
                goals: {
                    daily: { text: 'Write outline' }
                }
            }
        }
    };

    const result = completeDaily(state, 'business', '2023-03-10');

    assert.equal(result.lifeAreas.business.completions.length, 1);
    assert.equal(result.lifeAreas.business.completions[0].date, '2023-03-10');
    assert.equal(result.lifeAreas.business.completions[0].goal, 'Write outline');
});

test('does not add a completion when daily goal text is empty', () => {
    const { completeDaily } = loadIndexFunctions();
    const state = {
        lifeAreas: {
            business: {
                completions: [],
                goals: {
                    daily: { text: '' }
                }
            }
        }
    };

    const result = completeDaily(state, 'business', '2023-03-10');

    assert.equal(result.lifeAreas.business.completions.length, 0);
});

test('toggling completion on the same day removes it', () => {
    const { completeDaily } = loadIndexFunctions();
    const state = {
        lifeAreas: {
            business: {
                completions: [{ date: '2023-03-10', goal: 'Write outline' }],
                goals: {
                    daily: { text: 'Write outline' }
                }
            }
        }
    };

    const result = completeDaily(state, 'business', '2023-03-10');

    assert.equal(result.lifeAreas.business.completions.length, 0);
});

test('getLocalDateString uses local time with mocked Date and offset', () => {
    const fixedTime = new Date('2023-03-10T05:30:00Z').getTime();

    class MockDate extends Date {
        constructor(...args) {
            if (args.length === 0) {
                super(fixedTime);
                return;
            }
            super(...args);
        }

        static now() {
            return fixedTime;
        }

        getTimezoneOffset() {
            return 600;
        }
    }

    const { getLocalDateString } = loadIndexFunctions({ DateOverride: MockDate });

    assert.equal(getLocalDateString(), '2023-03-09');
});

test('setAnnualOneThing updates only the selected life area', () => {
    const state = getInitialState();
    state.lifeAreas.personal.goals.annualOneThingIndex = 2;
    const { setAnnualOneThing, getState } = loadOneThingSetters(state);

    setAnnualOneThing('business', 4);

    const nextState = getState();
    assert.equal(nextState.lifeAreas.business.goals.annualOneThingIndex, 4);
    assert.equal(nextState.lifeAreas.personal.goals.annualOneThingIndex, 2);
});

test('setMonthlyOneThing preserves other one-thing indices', () => {
    const state = getInitialState();
    state.lifeAreas.business.goals.annualOneThingIndex = 2;
    state.lifeAreas.business.goals.weeklyOneThingIndex = 4;
    state.lifeAreas.personal.goals.monthlyOneThingIndex = 1;
    const { setMonthlyOneThing, getState } = loadOneThingSetters(state);

    setMonthlyOneThing('business', 3);

    const nextState = getState();
    assert.equal(nextState.lifeAreas.business.goals.monthlyOneThingIndex, 3);
    assert.equal(nextState.lifeAreas.business.goals.annualOneThingIndex, 2);
    assert.equal(nextState.lifeAreas.business.goals.weeklyOneThingIndex, 4);
    assert.equal(nextState.lifeAreas.personal.goals.monthlyOneThingIndex, 1);
});

test('one-thing setters ignore invalid indices', () => {
    const state = getInitialState();
    state.lifeAreas.business.goals.annualOneThingIndex = 1;
    state.lifeAreas.business.goals.monthlyOneThingIndex = 2;
    state.lifeAreas.business.goals.weeklyOneThingIndex = 3;
    const { setAnnualOneThing, setMonthlyOneThing, setWeeklyOneThing, getState, saveCalls } = loadOneThingSetters(state);

    setAnnualOneThing('business', -1);
    setMonthlyOneThing('business', 5);
    setWeeklyOneThing('business', 10);

    assert.equal(saveCalls.length, 0);
    assert.equal(getState(), state);
    assert.equal(state.lifeAreas.business.goals.annualOneThingIndex, 1);
    assert.equal(state.lifeAreas.business.goals.monthlyOneThingIndex, 2);
    assert.equal(state.lifeAreas.business.goals.weeklyOneThingIndex, 3);
});
