import test from 'node:test';
import assert from 'node:assert/strict';
import { migrateData } from '../migrateData.mjs';

const assertV5GoalsShape = (goals) => {
    assert.equal(goals.annualGoals.length, 5, 'annualGoals should have 5 entries');
    assert.equal(goals.monthlyGoals.length, 5, 'monthlyGoals should have 5 entries');
    assert.equal(goals.weeklyGoals.length, 5, 'weeklyGoals should have 5 entries');
};

const baseLifeAreas = {
    business: {
        active: true,
        completions: [],
        goals: {}
    }
};

test('migrates v4 payloads to v5 structure', () => {
    const v4Data = {
        version: 4,
        lifeAreas: {
            ...baseLifeAreas,
            business: {
                ...baseLifeAreas.business,
                goals: {
                    someday: { text: 'someday', updatedAt: null },
                    fiveYear: { text: 'five', updatedAt: null },
                    oneYear: { text: 'annual', updatedAt: '2023-01-01' },
                    monthly: { text: 'monthly', updatedAt: '2023-02-01' },
                    weeklyGoals: [
                        { text: 'weekly', updatedAt: '2023-03-01' },
                        { text: '', updatedAt: null },
                        { text: '', updatedAt: null },
                        { text: '', updatedAt: null }
                    ],
                    daily: { text: 'daily', updatedAt: null }
                }
            }
        },
        timeBlocks: [],
        currentQuoteIndex: 2,
        lastWeeklyReview: null,
        lastAnnualReview: null
    };

    const migrated = migrateData(v4Data);

    assert.equal(migrated.version, 5);
    assertV5GoalsShape(migrated.lifeAreas.business.goals);
    assert.equal(migrated.lifeAreas.business.goals.annualOneThingIndex, 0);
    assert.equal(migrated.lifeAreas.business.goals.monthlyOneThingIndex, 0);
    assert.equal(migrated.lifeAreas.business.goals.weeklyOneThingIndex, 0);
});

test('migrates v3 payloads to v5 structure', () => {
    const v3Data = {
        version: 3,
        lifeAreas: {
            ...baseLifeAreas,
            business: {
                ...baseLifeAreas.business,
                goals: {
                    someday: { text: 'someday', updatedAt: null },
                    fiveYear: { text: 'five', updatedAt: null },
                    oneYear: { text: 'annual', updatedAt: null },
                    monthly: { text: 'monthly', updatedAt: null },
                    weekly: { text: 'weekly', updatedAt: '2023-04-01' },
                    daily: { text: 'daily', updatedAt: null }
                }
            }
        },
        timeBlocks: []
    };

    const migrated = migrateData(v3Data);

    assert.equal(migrated.version, 5);
    assertV5GoalsShape(migrated.lifeAreas.business.goals);
    assert.equal(migrated.lifeAreas.business.goals.weeklyGoals[0].text, 'weekly');
    assert.equal(migrated.lifeAreas.business.goals.weeklyOneThingIndex, 0);
});

test('migrates v2 payloads to v5 structure', () => {
    const v2Data = {
        version: 2,
        lifeAreas: {
            ...baseLifeAreas,
            business: {
                ...baseLifeAreas.business,
                goals: {
                    someday: { text: 'someday', updatedAt: null },
                    fiveYear: { text: 'five', updatedAt: null },
                    oneYear: { text: 'annual', updatedAt: null },
                    monthly: { text: 'monthly', updatedAt: null },
                    weekly: { text: 'weekly', updatedAt: null },
                    daily: { text: 'daily', updatedAt: null }
                }
            }
        }
    };

    const migrated = migrateData(v2Data);

    assert.equal(migrated.version, 5);
    assertV5GoalsShape(migrated.lifeAreas.business.goals);
    assert.equal(migrated.lifeAreas.business.goals.annualOneThingIndex, 0);
    assert.equal(migrated.lifeAreas.business.goals.monthlyOneThingIndex, 0);
    assert.equal(migrated.lifeAreas.business.goals.weeklyOneThingIndex, 0);
});

test('migrates v1 payloads with timeBlocks defaults and idempotency', () => {
    const v1Data = {
        version: 1,
        goals: {
            someday: { text: 'someday', updatedAt: null },
            fiveYear: { text: 'five', updatedAt: null },
            oneYear: { text: 'annual', updatedAt: null },
            monthly: { text: 'monthly', updatedAt: null },
            weekly: { text: 'weekly', updatedAt: null },
            daily: { text: 'daily', updatedAt: null }
        },
        completions: [{ date: '2023-05-01', lifeArea: 'business' }],
        timeBlocks: [
            { id: 'block-1', start: '09:00', end: '10:00' },
            { id: 'block-2', start: '10:00', end: '11:00', lifeArea: 'personal' }
        ],
        currentQuoteIndex: 1
    };

    const migrated = migrateData(v1Data);

    assert.equal(migrated.version, 5);
    assertV5GoalsShape(migrated.lifeAreas.business.goals);
    assert.equal(migrated.lifeAreas.business.goals.weeklyOneThingIndex, 0);
    assert.equal(migrated.timeBlocks[0].lifeArea, 'business');
    assert.equal(migrated.timeBlocks[1].lifeArea, 'personal');

    const migratedTwice = migrateData(migrated);
    assert.deepEqual(migratedTwice, migrated);
});
