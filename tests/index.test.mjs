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

const loadImportExportFunctions = ({
    state = {},
    saveState = () => {},
    getLocalDateString = () => '2024-01-01',
    BlobOverride,
    URLOverride,
    documentOverride,
    FileReaderOverride,
    alertOverride = () => {}
} = {}) => {
    const indexSource = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    const functionsSource = [
        extractFunction(indexSource, 'exportData'),
        extractFunction(indexSource, 'importData')
    ].join('\n');

    const context = {
        state,
        saveState,
        getLocalDateString,
        Blob: BlobOverride,
        URL: URLOverride,
        document: documentOverride,
        FileReader: FileReaderOverride,
        alert: alertOverride
    };
    vm.createContext(context);
    vm.runInContext(`${functionsSource}\nthis.exportData = exportData;\nthis.importData = importData;`, context);

    return {
        exportData: context.exportData,
        importData: context.importData
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

test('exportData generates a JSON file with the expected filename format', () => {
    const state = { example: 'data' };
    const blobs = [];
    const urlCalls = [];
    const revokeCalls = [];
    const link = {
        clickCalls: 0,
        click() {
            this.clickCalls += 1;
        }
    };

    class MockBlob {
        constructor(parts, options) {
            this.parts = parts;
            this.options = options;
            blobs.push(this);
        }
    }

    const urlMock = {
        createObjectURL: (blob) => {
            urlCalls.push(blob);
            return 'blob:mock';
        },
        revokeObjectURL: (url) => {
            revokeCalls.push(url);
        }
    };

    const { exportData } = loadImportExportFunctions({
        state,
        BlobOverride: MockBlob,
        URLOverride: urlMock,
        documentOverride: {
            createElement: (tagName) => {
                assert.equal(tagName, 'a');
                return link;
            }
        },
        getLocalDateString: () => '2024-02-03'
    });

    exportData();

    assert.equal(blobs.length, 1);
    assert.equal(
        JSON.stringify(blobs[0].parts),
        JSON.stringify([JSON.stringify(state, null, 2)])
    );
    assert.deepEqual(JSON.parse(JSON.stringify(blobs[0].options)), { type: 'application/json' });
    assert.equal(urlCalls[0], blobs[0]);
    assert.equal(link.href, 'blob:mock');
    assert.equal(link.download, 'one-thing-backup-2024-02-03.json');
    assert.equal(link.clickCalls, 1);
    assert.deepEqual(revokeCalls, ['blob:mock']);
});

test('importData accepts valid JSON and updates state', () => {
    const saveCalls = [];
    const alerts = [];

    class MockFileReader {
        readAsText(file) {
            this.onload?.({ target: { result: file.contents } });
        }
    }

    const { importData } = loadImportExportFunctions({
        FileReaderOverride: MockFileReader,
        saveState: (nextState) => saveCalls.push(nextState),
        alertOverride: (message) => alerts.push(message)
    });

    const file = { contents: JSON.stringify({ updated: true }) };
    importData(file);

    assert.equal(saveCalls.length, 1);
    assert.deepEqual(JSON.parse(JSON.stringify(saveCalls[0])), { updated: true });
    assert.deepEqual(alerts, ['Data imported successfully!']);
});

test('importData alerts on invalid JSON and does not mutate state', () => {
    const initialState = { unchanged: true };
    let currentState = initialState;
    const saveCalls = [];
    const alerts = [];

    class MockFileReader {
        readAsText(file) {
            this.onload?.({ target: { result: file.contents } });
        }
    }

    const { importData } = loadImportExportFunctions({
        state: initialState,
        FileReaderOverride: MockFileReader,
        saveState: (nextState) => {
            currentState = nextState;
            saveCalls.push(nextState);
        },
        alertOverride: (message) => alerts.push(message)
    });

    const file = { contents: '{bad json' };
    importData(file);

    assert.equal(saveCalls.length, 0);
    assert.deepEqual(currentState, initialState);
    assert.deepEqual(alerts, ['Error importing data. Please check the file format.']);
});
