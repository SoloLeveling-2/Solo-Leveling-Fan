import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import ExerciseMedia from '../components/ExerciseMedia.jsx';

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

function matchExercise(text, exercises) {
    if (!text || !exercises.length) return null;
    const lower = text.toLowerCase();
    return exercises.find((exercise) => lower.includes(exercise.name.toLowerCase()))
        || exercises.find((exercise) => {
            const key = exercise.name.toLowerCase().replace(/-/g, '');
            return lower.replace(/-/g, '').includes(key);
        })
        || null;
}

function HowToPanel({ exercise }) {
    return (
        <div className="how-to-panel">
            <section>
                <h4>Beginner explanation</h4>
                <p>{exercise.beginnerSummary || `${exercise.name} should feel controlled and repeatable. Move slowly, breathe normally, and stop before pain.`}</p>
            </section>

            <ExerciseMedia exercise={exercise} />

            <section>
                <h4>Step-by-step</h4>
                {exercise.instructions?.length ? (
                    <ol>
                        {exercise.instructions.map((line) => <li key={line}>{line}</li>)}
                    </ol>
                ) : (
                    <p className="empty-note">No instructions yet. Add beginner steps on the Exercises page.</p>
                )}
            </section>

            <section>
                <h4>Form tips</h4>
                {exercise.tips?.length ? (
                    <ul>
                        {exercise.tips.map((tip) => <li key={tip}>{tip}</li>)}
                    </ul>
                ) : (
                    <p className="empty-note">No form tips yet. Keep reps slow, pain-free, and easy enough to repeat.</p>
                )}
            </section>
        </div>
    );
}

export default function Checklist({ onSaved }) {
    const [items, setItems] = useState([]);
    const [date, setDate] = useState('');
    const [difficulty, setDifficulty] = useState('Beginner');
    const [text, setText] = useState('');
    const [exercises, setExercises] = useState([]);
    const [expanded, setExpanded] = useState({});
    const [completedDays, setCompletedDays] = useState([]);
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');

    const loadAll = async () => {
        setError('');
        try {
            const [checklist, exerciseList] = await Promise.all([api.get('/checklist'), api.get('/exercises')]);
            setItems(checklist.items || []);
            setDate(checklist.date || '');
            setDifficulty(checklist.difficulty || 'Beginner');
            setCompletedDays(checklist.completedDays || []);
            setExercises(exerciseList || []);
        } catch (loadError) {
            setError(loadError.message || 'Unable to load the daily quest.');
        }
    };

    useEffect(() => {
        loadAll();
    }, []);

    const toggle = async (item) => {
        setError('');
        try {
            const result = await api.put(`/checklist/${item.id}`, { done: !item.done });
            setStatus(result.completionRecorded ? 'Quest cleared and saved.' : 'Checklist saved.');
            await loadAll();
            await onSaved?.();
        } catch (saveError) {
            setError(saveError.message || 'Unable to save checklist progress. Refresh was not changed.');
        }
    };

    const addItem = async (event) => {
        event.preventDefault();
        if (!text.trim()) return;
        setError('');
        try {
            await api.post('/checklist', { text: text.trim(), difficulty: 'Custom' });
            setText('');
            setStatus('Objective saved.');
            await loadAll();
            await onSaved?.();
        } catch (saveError) {
            setError(saveError.message || 'Unable to save the objective.');
        }
    };

    const remove = async (id) => {
        setError('');
        try {
            await api.del(`/checklist/${id}`);
            setStatus('Objective removed.');
            await loadAll();
            await onSaved?.();
        } catch (deleteError) {
            setError(deleteError.message || 'Unable to remove the objective.');
        }
    };

    const switchDifficulty = async (level) => {
        if (level === difficulty) return;
        setError('');
        try {
            await api.post('/checklist/preset', { difficulty: level });
            setExpanded({});
            setStatus(`Difficulty set to ${level} and saved.`);
            await loadAll();
            await onSaved?.();
        } catch (saveError) {
            setError(saveError.message || 'Unable to save the difficulty preset.');
        }
    };

    const toggleExpand = (id) => setExpanded((state) => ({ ...state, [id]: !state[id] }));
    const completed = items.filter((item) => item.done).length;
    const total = items.length;
    const pct = total ? Math.round((completed / total) * 100) : 0;
    const completedToday = completedDays.includes(date);
    const enriched = useMemo(
        () => items.map((item) => ({ ...item, exercise: matchExercise(item.text, exercises) })),
        [items, exercises]
    );

    return (
        <section className="page daily-quest-page">
            <header className="page-header">
                <p className="eyebrow">[ DAILY QUEST ]</p>
                <h1>Daily Quest</h1>
                <p>Complete every objective before the day resets. Refreshing the browser will not wipe saved progress.</p>
            </header>

            {error && <div className="alert error" role="alert">{error}</div>}
            {status && <div className="alert success" role="status">{status}</div>}

            <div className="card">
                <h3>Difficulty</h3>
                <p>Today: {date}</p>
                <div className="button-row">
                    {DIFFICULTIES.map((level) => (
                        <button key={level} className={level === difficulty ? 'active' : ''} onClick={() => switchDifficulty(level)} type="button">
                            {level}
                        </button>
                    ))}
                </div>
            </div>

            <div className="card">
                <h3>Progress · {completed}/{total}</h3>
                <div className="progress"><span style={{ width: `${pct}%` }} /></div>
                <p>{pct}%{completedToday ? ' · Cleared!' : ''}</p>
            </div>

            <div className="quest-list">
                {enriched.map((item) => {
                    const isOpen = Boolean(expanded[item.id]);
                    const exercise = item.exercise;

                    return (
                        <article className={`quest-item${item.done ? ' done' : ''}`} key={item.id}>
                            <div className="quest-row">
                                <button onClick={() => toggle(item)} aria-label={item.done ? 'Mark incomplete' : 'Mark complete'} type="button">
                                    {item.done ? '✓' : ''}
                                </button>
                                <div>
                                    <strong>{item.text}</strong>
                                    {item.difficulty && <small>{item.difficulty}</small>}
                                </div>
                                {exercise && <button onClick={() => toggleExpand(item.id)} type="button">{isOpen ? 'Hide how to' : 'How to'}</button>}
                                <button onClick={() => remove(item.id)} type="button">Remove</button>
                            </div>
                            {isOpen && exercise && <HowToPanel exercise={exercise} />}
                        </article>
                    );
                })}
            </div>

            <form className="card add-objective" onSubmit={addItem}>
                <label htmlFor="custom-objective">Add custom objective</label>
                <input id="custom-objective" value={text} onChange={(event) => setText(event.target.value)} />
                <button type="submit">Add Objective</button>
            </form>
        </section>
    );
}
