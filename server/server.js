const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

app.use(express.json());

const today = () => new Date().toISOString().slice(0, 10);

const defaultExercises = [
    {
        id: 'pushups',
        name: 'Push-ups',
        beginnerSummary: 'Push-ups build chest, shoulder, triceps, and core strength. Beginners can use wall push-ups or knee push-ups first.',
        videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
        imageUrl: '',
        imageCaption: 'Keep a straight line from shoulders through hips and brace the core.',
        instructions: ['Start in a high plank or elevated wall position.', 'Place hands slightly wider than shoulders.', 'Lower with control, then press away from the floor or wall.'],
        tips: ['Use wall push-ups if floor reps are too hard.', 'Keep elbows roughly 45 degrees from your body.', 'Stop if wrists or shoulders feel sharp pain.'],
        youtubeQuery: 'beginner push up proper form tutorial'
    },
    {
        id: 'situps',
        name: 'Sit-ups',
        beginnerSummary: 'Sit-ups train the front of the core. If your lower back feels uncomfortable, use dead bugs or crunches instead.',
        videoUrl: 'https://www.youtube.com/watch?v=1fbU_MkV7NE',
        imageUrl: '',
        imageCaption: 'Move slowly and avoid yanking on your neck.',
        instructions: ['Lie on your back with knees bent.', 'Brace your stomach before moving.', 'Curl up under control, then lower slowly.'],
        tips: ['Keep the neck relaxed.', 'Exhale as you come up.', 'Switch to dead bugs if your back feels strained.'],
        youtubeQuery: 'beginner sit up proper form tutorial'
    },
    {
        id: 'squats',
        name: 'Squats',
        beginnerSummary: 'Squats train the legs and hips. Chair squats are the safest beginner version because they teach depth and balance.',
        videoUrl: 'https://www.youtube.com/watch?v=YaXPRqUwItQ',
        imageUrl: '',
        imageCaption: 'Sit hips back toward a chair while keeping your chest tall.',
        instructions: ['Stand with feet about shoulder-width apart.', 'Push hips back like sitting into a chair.', 'Stand tall by pressing through the whole foot.'],
        tips: ['Use a chair or counter for support.', 'Keep knees tracking over toes.', 'Stop before knee or hip pain.'],
        youtubeQuery: 'beginner chair squat proper form tutorial'
    },
    {
        id: 'running',
        name: 'Running',
        beginnerSummary: 'Running can be scaled to walking intervals. Keep the pace conversational and build distance slowly.',
        videoUrl: 'https://www.youtube.com/watch?v=_kGESn8ArrU',
        imageUrl: '',
        imageCaption: 'Use short relaxed steps and keep breathing steady.',
        instructions: ['Warm up with five minutes of walking.', 'Alternate easy jogging and walking if needed.', 'Finish with a slow walk to recover.'],
        tips: ['Start with walking if running is too intense.', 'Keep shoulders relaxed.', 'Do not chase speed on beginner days.'],
        youtubeQuery: 'beginner running form tutorial walk jog intervals'
    }
];

const presets = {
    Beginner: [
        { id: 'beginner-pushups', text: '10 push-ups or wall push-ups', difficulty: 'Beginner' },
        { id: 'beginner-situps', text: '10 sit-ups or dead bugs', difficulty: 'Beginner' },
        { id: 'beginner-squats', text: '10 squats or chair squats', difficulty: 'Beginner' },
        { id: 'beginner-running', text: 'Walk or jog 1 km', difficulty: 'Beginner' }
    ],
    Intermediate: [
        { id: 'intermediate-pushups', text: '50 push-ups', difficulty: 'Intermediate' },
        { id: 'intermediate-situps', text: '50 sit-ups', difficulty: 'Intermediate' },
        { id: 'intermediate-squats', text: '50 squats', difficulty: 'Intermediate' },
        { id: 'intermediate-running', text: 'Run 5 km', difficulty: 'Intermediate' }
    ],
    Advanced: [
        { id: 'advanced-pushups', text: '100 push-ups', difficulty: 'Advanced' },
        { id: 'advanced-situps', text: '100 sit-ups', difficulty: 'Advanced' },
        { id: 'advanced-squats', text: '100 squats', difficulty: 'Advanced' },
        { id: 'advanced-running', text: 'Run 10 km', difficulty: 'Advanced' }
    ]
};

function buildPresetItems(difficulty = 'Beginner') {
    return (presets[difficulty] || presets.Beginner).map((item) => ({ ...item, done: false }));
}

function defaultDb() {
    return {
        profile: {
            name: '',
            goal: 'general_fitness',
            age: null,
            height: null,
            startWeight: null,
            goalWeight: null,
            onboarded: false,
            createdAt: new Date().toISOString()
        },
        checklist: {
            date: today(),
            difficulty: 'Beginner',
            items: buildPresetItems('Beginner'),
            completedDays: []
        },
        meals: [],
        weights: [],
        sessions: [],
        achievements: [],
        progress: { xp: 0, level: 1, rank: 'E-Rank', currentStreak: 0 },
        exercises: defaultExercises
    };
}

function ensureDb() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DB_PATH)) writeDb(defaultDb());
}

function migrateDb(db) {
    const fresh = defaultDb();
    const merged = {
        ...fresh,
        ...db,
        profile: { ...fresh.profile, ...(db.profile || {}) },
        checklist: { ...fresh.checklist, ...(db.checklist || {}) },
        progress: { ...fresh.progress, ...(db.progress || {}) },
        exercises: Array.isArray(db.exercises) && db.exercises.length ? db.exercises : fresh.exercises,
        meals: Array.isArray(db.meals) ? db.meals : [],
        weights: Array.isArray(db.weights) ? db.weights : [],
        sessions: Array.isArray(db.sessions) ? db.sessions : [],
        achievements: Array.isArray(db.achievements) ? db.achievements : []
    };

    if (!Array.isArray(merged.checklist.completedDays)) merged.checklist.completedDays = [];
    if (!Array.isArray(merged.checklist.items) || merged.checklist.items.length === 0) {
        merged.checklist.items = buildPresetItems(merged.checklist.difficulty);
    }

    return merged;
}

function readDb() {
    ensureDb();
    try {
        return migrateDb(JSON.parse(fs.readFileSync(DB_PATH, 'utf8')));
    } catch (error) {
        const fresh = defaultDb();
        writeDb(fresh);
        return fresh;
    }
}

function writeDb(db) {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmpPath = `${DB_PATH}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(migrateDb(db), null, 2));
    fs.renameSync(tmpPath, DB_PATH);
}

function calculateStats(db) {
    const completed = db.checklist.completedDays.length;
    const xp = db.progress.xp || completed * 100;
    const level = Math.max(1, Math.floor(xp / 250) + 1);
    const rank = level >= 15 ? 'S-Rank' : level >= 10 ? 'A-Rank' : level >= 6 ? 'B-Rank' : level >= 3 ? 'D-Rank' : 'E-Rank';

    return { ...db.progress, xp, level, rank, currentStreak: db.progress.currentStreak || completed };
}

function saveAndRespond(res, db, body, status = 200) {
    try {
        writeDb(db);
        res.status(status).json(body);
    } catch (error) {
        res.status(500).json({ error: 'The Hunter Tracker API could not save data. Check server/data/db.json permissions.' });
    }
}

app.get('/api/health', (req, res) => res.json({ ok: true, dbPath: DB_PATH }));

app.get('/api/profile', (req, res) => res.json(readDb().profile));
app.put('/api/profile', (req, res) => {
    const db = readDb();
    db.profile = { ...db.profile, ...req.body, updatedAt: new Date().toISOString() };
    saveAndRespond(res, db, db.profile);
});

app.get('/api/stats', (req, res) => res.json(calculateStats(readDb())));
app.get('/api/checklist', (req, res) => res.json(readDb().checklist));
app.post('/api/checklist', (req, res) => {
    if (!req.body.text?.trim()) return res.status(400).json({ error: 'Checklist objective text is required.' });
    const db = readDb();
    const item = { id: crypto.randomUUID(), text: req.body.text.trim(), difficulty: req.body.difficulty || 'Custom', done: false };
    db.checklist.items.push(item);
    saveAndRespond(res, db, item, 201);
});

app.post('/api/checklist/preset', (req, res) => {
    const db = readDb();
    const difficulty = presets[req.body.difficulty] ? req.body.difficulty : 'Beginner';
    db.checklist.difficulty = difficulty;
    db.checklist.date = today();
    db.checklist.items = buildPresetItems(difficulty);
    saveAndRespond(res, db, db.checklist);
});

app.put('/api/checklist/:id', (req, res) => {
    const db = readDb();
    const item = db.checklist.items.find((entry) => entry.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Checklist item not found.' });

    item.done = Boolean(req.body.done);
    const allDone = db.checklist.items.length > 0 && db.checklist.items.every((entry) => entry.done);
    let completionRecorded = false;

    if (allDone && !db.checklist.completedDays.includes(db.checklist.date)) {
        db.checklist.completedDays.push(db.checklist.date);
        db.progress.xp = (db.progress.xp || 0) + 100;
        db.progress.currentStreak = (db.progress.currentStreak || 0) + 1;
        completionRecorded = true;
    }

    saveAndRespond(res, db, { item, checklist: db.checklist, stats: calculateStats(db), completionRecorded });
});

app.delete('/api/checklist/:id', (req, res) => {
    const db = readDb();
    db.checklist.items = db.checklist.items.filter((entry) => entry.id !== req.params.id);
    try {
        writeDb(db);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: 'The Hunter Tracker API could not save data. Check server/data/db.json permissions.' });
    }
});

app.get('/api/exercises', (req, res) => res.json(readDb().exercises));
app.put('/api/exercises/:id', (req, res) => {
    const db = readDb();
    const index = db.exercises.findIndex((exercise) => exercise.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Exercise not found.' });
    db.exercises[index] = { ...db.exercises[index], ...req.body };
    saveAndRespond(res, db, db.exercises[index]);
});

app.get('/api/meals', (req, res) => res.json(readDb().meals));
app.post('/api/meals', (req, res) => {
    const db = readDb();
    const meal = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...req.body };
    db.meals.push(meal);
    saveAndRespond(res, db, meal, 201);
});

app.get('/api/weights', (req, res) => res.json(readDb().weights));
app.post('/api/weights', (req, res) => {
    const db = readDb();
    const entry = { id: crypto.randomUUID(), date: today(), ...req.body };
    db.weights.push(entry);
    saveAndRespond(res, db, entry, 201);
});

app.get('/api/sessions', (req, res) => res.json(readDb().sessions));
app.post('/api/sessions', (req, res) => {
    const db = readDb();
    const session = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...req.body };
    db.sessions.push(session);
    saveAndRespond(res, db, session, 201);
});

app.get('/api/achievements', (req, res) => res.json(readDb().achievements));

app.post('/api/reset', (req, res) => {
    const fresh = defaultDb();
    saveAndRespond(res, fresh, fresh);
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'The Hunter Tracker API could not save data. Check server/data/db.json permissions.' });
});

if (require.main === module) {
    ensureDb();
    app.listen(PORT, () => {
        console.log(`Hunter Tracker API listening on http://localhost:${PORT}`);
        console.log(`Local development data: ${DB_PATH}`);
    });
}

module.exports = { app, DB_PATH, defaultDb, readDb, writeDb, migrateDb };
