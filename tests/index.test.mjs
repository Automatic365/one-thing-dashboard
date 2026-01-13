import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

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
