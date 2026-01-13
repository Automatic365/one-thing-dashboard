export const LIFE_AREAS = {
    spiritual: { name: 'Spiritual Life', icon: '🙏', color: 'purple', order: 1 },
    health: { name: 'Physical Health', icon: '💪', color: 'green', order: 2 },
    personal: { name: 'Personal Life', icon: '🌟', color: 'blue', order: 3 },
    relationships: { name: 'Key Relationships', icon: '❤️', color: 'pink', order: 4 },
    job: { name: 'Job/Career', icon: '💼', color: 'indigo', order: 5 },
    business: { name: 'Business', icon: '🚀', color: 'orange', order: 6 },
    financial: { name: 'Financial Life', icon: '💰', color: 'yellow', order: 7 }
};

export const createEmptyGoals = () => ({
    someday: { text: '', updatedAt: null },
    fiveYear: { text: '', updatedAt: null },
    // Annual (1-Year) - up to 5 goals in priority order
    annualGoals: [
        { text: '', updatedAt: null },
        { text: '', updatedAt: null },
        { text: '', updatedAt: null },
        { text: '', updatedAt: null },
        { text: '', updatedAt: null }
    ],
    annualOneThingIndex: 0, // Which of the 5 is THE ONE (0-4)
    // Monthly - up to 5 goals in priority order
    monthlyGoals: [
        { text: '', updatedAt: null },
        { text: '', updatedAt: null },
        { text: '', updatedAt: null },
        { text: '', updatedAt: null },
        { text: '', updatedAt: null }
    ],
    monthlyOneThingIndex: 0, // Which of the 5 is THE ONE (0-4)
    // Weekly - up to 5 goals in priority order
    weeklyGoals: [
        { text: '', updatedAt: null },
        { text: '', updatedAt: null },
        { text: '', updatedAt: null },
        { text: '', updatedAt: null },
        { text: '', updatedAt: null }
    ],
    weeklyOneThingIndex: 0, // Which of the 5 is THE ONE (0-4)
    daily: { text: '', updatedAt: null }
});

export const getInitialState = () => ({
    version: 5, // Track data version for migrations (v5 = 5 goals per timeframe with selection)
    lifeAreas: Object.keys(LIFE_AREAS).reduce((acc, key) => {
        acc[key] = {
            active: false,
            goals: createEmptyGoals(),
            completions: []
        };
        return acc;
    }, {}),
    timeBlocks: [],
    currentQuoteIndex: 0,
    // 4-1-1 System tracking
    lastWeeklyReview: null, // ISO date of last weekly review
    lastAnnualReview: null // ISO date of last annual review
});

const convertWeeklyTo411 = (goals) => {
    if (goals.weeklyGoals) return goals; // Already converted

    const newGoals = { ...goals };
    const oldWeeklyText = goals.weekly?.text || '';

    // Convert single weekly to 4 weekly goals (put old one in slot 0)
    newGoals.weeklyGoals = [
        { text: oldWeeklyText, updatedAt: goals.weekly?.updatedAt || null },
        { text: '', updatedAt: null },
        { text: '', updatedAt: null },
        { text: '', updatedAt: null }
    ];
    newGoals.weeklyOneThingIndex = 0; // First goal is THE ONE by default
    delete newGoals.weekly; // Remove old field

    return newGoals;
};

const convertV4GoalsToV5 = (goals) => {
    const annualGoals = [
        { text: goals.oneYear?.text || '', updatedAt: goals.oneYear?.updatedAt || null },
        { text: '', updatedAt: null },
        { text: '', updatedAt: null },
        { text: '', updatedAt: null },
        { text: '', updatedAt: null }
    ];

    const monthlyGoals = [
        { text: goals.monthly?.text || '', updatedAt: goals.monthly?.updatedAt || null },
        { text: '', updatedAt: null },
        { text: '', updatedAt: null },
        { text: '', updatedAt: null },
        { text: '', updatedAt: null }
    ];

    const weeklyGoals = [
        ...(goals.weeklyGoals || []),
        { text: '', updatedAt: null }
    ].slice(0, 5);

    return {
        someday: goals.someday,
        fiveYear: goals.fiveYear,
        annualGoals,
        annualOneThingIndex: 0,
        monthlyGoals,
        monthlyOneThingIndex: 0,
        weeklyGoals,
        weeklyOneThingIndex: goals.weeklyOneThingIndex || 0,
        daily: goals.daily
    };
};

// Migrate old data format to new multi-goal format
export const migrateData = (oldData) => {
    // If already version 5, no migration needed
    if (oldData.version === 5) return oldData;

    // Version 4 → 5: Convert to 5 goals per timeframe with selection
    if (oldData.version === 4) {
        const newData = { ...oldData, version: 5 };
        Object.keys(newData.lifeAreas).forEach(areaKey => {
            newData.lifeAreas[areaKey].goals = convertV4GoalsToV5(newData.lifeAreas[areaKey].goals);
        });
        return newData;
    }

    // Version 3 → 5: Convert weekly goals to 4-1-1 then to 5-goal system
    if (oldData.version === 3) {
        const v4Data = { ...oldData, version: 4 };
        Object.keys(v4Data.lifeAreas).forEach(areaKey => {
            v4Data.lifeAreas[areaKey].goals = convertWeeklyTo411(v4Data.lifeAreas[areaKey].goals);
        });
        // Now convert v4 to v5
        return migrateData(v4Data);
    }

    // Version 2 → 5: Add time blocking fields + convert to 4-1-1 then to 5-goal system
    if (oldData.version === 2) {
        const v4Data = {
            ...oldData,
            version: 4,
            lastWeeklyReview: null,
            lastAnnualReview: null
        };
        Object.keys(v4Data.lifeAreas).forEach(areaKey => {
            v4Data.lifeAreas[areaKey].goals = convertWeeklyTo411(v4Data.lifeAreas[areaKey].goals);
        });
        // Now convert v4 to v5
        return migrateData(v4Data);
    }

    // Version 1 → 5: Full migration (single track to multi-track + 4-1-1 + 5-goal system)
    const newState = getInitialState();

    // If old data has goals, migrate them to "business" area
    if (oldData.goals) {
        newState.lifeAreas.business.active = true;
        const convertedGoals = convertWeeklyTo411(oldData.goals);
        newState.lifeAreas.business.goals = convertV4GoalsToV5(convertedGoals);

        // Migrate completions
        if (oldData.completions) {
            newState.lifeAreas.business.completions = oldData.completions;
        }
    }

    // Migrate time blocks (add lifeArea: 'business' if not present)
    if (oldData.timeBlocks) {
        newState.timeBlocks = oldData.timeBlocks.map(block => ({
            ...block,
            lifeArea: block.lifeArea || 'business'
        }));
    }

    // Preserve quote index
    if (oldData.currentQuoteIndex !== undefined) {
        newState.currentQuoteIndex = oldData.currentQuoteIndex;
    }

    return newState;
};
