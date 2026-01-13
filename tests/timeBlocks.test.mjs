import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const loadIndexHtml = async () => readFile(new URL('../index.html', import.meta.url), 'utf8');

const getFunctionSource = (name, html) => {
    const signatureIndex = html.indexOf(`const ${name} =`);
    assert.ok(signatureIndex !== -1, `Expected to find ${name} in index.html`);

    const argsStart = html.indexOf('(', signatureIndex);
    const argsEnd = html.indexOf(')', argsStart);
    assert.ok(argsStart !== -1 && argsEnd !== -1, `Expected arguments for ${name}`);

    const arrowIndex = html.indexOf('=>', argsEnd);
    const bodyStart = html.indexOf('{', arrowIndex);
    assert.ok(arrowIndex !== -1 && bodyStart !== -1, `Expected body for ${name}`);

    let depth = 0;
    let bodyEnd = -1;
    for (let i = bodyStart; i < html.length; i += 1) {
        const char = html[i];
        if (char === '{') {
            depth += 1;
        } else if (char === '}') {
            depth -= 1;
            if (depth === 0) {
                bodyEnd = i;
                break;
            }
        }
    }

    assert.ok(bodyEnd !== -1, `Expected closing brace for ${name}`);

    return {
        args: html.slice(argsStart + 1, argsEnd).trim(),
        body: html.slice(bodyStart + 1, bodyEnd)
    };
};

const buildFunctionFactory = (name, html) => {
    const { args, body } = getFunctionSource(name, html);
    return new Function('state', 'saveState', `return (${`(${args}) => {${body}}`});`);
};

const runWithState = (fnFactory, state, ...args) => {
    let savedState;
    const saveState = (newState) => {
        savedState = newState;
    };
    const fn = fnFactory(state, saveState);
    fn(...args);
    return savedState;
};

test('addTimeBlock appends blocks with a numeric id', async () => {
    const html = await loadIndexHtml();
    const addTimeBlockFactory = buildFunctionFactory('addTimeBlock', html);
    const originalNow = Date.now;

    Date.now = () => 1234567890;

    const state = { timeBlocks: [] };
    const block = { start: '09:00', end: '10:00', title: 'Focus' };
    const newState = runWithState(addTimeBlockFactory, state, block);

    assert.equal(newState.timeBlocks.length, 1);
    assert.equal(newState.timeBlocks[0].id, 1234567890);
    assert.equal(typeof newState.timeBlocks[0].id, 'number');
    assert.deepEqual(newState.timeBlocks[0].start, '09:00');
    assert.deepEqual(newState.timeBlocks[0].end, '10:00');
    assert.deepEqual(newState.timeBlocks[0].title, 'Focus');

    Date.now = originalNow;
});

test('updateTimeBlock updates only the matching block', async () => {
    const html = await loadIndexHtml();
    const updateTimeBlockFactory = buildFunctionFactory('updateTimeBlock', html);

    const state = {
        timeBlocks: [
            { id: 1, start: '09:00', end: '10:00', title: 'Original' },
            { id: 2, start: '10:00', end: '11:00', title: 'Keep' }
        ]
    };

    const newState = runWithState(updateTimeBlockFactory, state, 1, { title: 'Updated' });

    assert.equal(newState.timeBlocks.length, 2);
    assert.deepEqual(newState.timeBlocks[0], {
        id: 1,
        start: '09:00',
        end: '10:00',
        title: 'Updated'
    });
    assert.deepEqual(newState.timeBlocks[1], state.timeBlocks[1]);
});

test('deleteTimeBlock removes the block without mutating others', async () => {
    const html = await loadIndexHtml();
    const deleteTimeBlockFactory = buildFunctionFactory('deleteTimeBlock', html);

    const blockA = { id: 1, start: '08:00', end: '09:00', title: 'Remove' };
    const blockB = { id: 2, start: '09:00', end: '10:00', title: 'Keep' };
    const blockC = { id: 3, start: '10:00', end: '11:00', title: 'Keep Too' };
    const state = { timeBlocks: [blockA, blockB, blockC] };

    const newState = runWithState(deleteTimeBlockFactory, state, 1);

    assert.equal(newState.timeBlocks.length, 2);
    assert.deepEqual(newState.timeBlocks, [blockB, blockC]);
    assert.equal(newState.timeBlocks[0], blockB);
    assert.equal(newState.timeBlocks[1], blockC);
});
