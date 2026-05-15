import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';

const GOALS = [
    { id: 'general_fitness', label: 'Get Moving', desc: 'Build a daily exercise habit', icon: '✦' },
    { id: 'lose_weight', label: 'Lose Weight', desc: 'Reduce body weight gradually', icon: '◐' },
    { id: 'build_muscle', label: 'Build Muscle', desc: 'Gain strength and size', icon: '◈' },
    { id: 'endurance', label: 'Endurance', desc: 'Run longer, last longer', icon: '◎' }
];

const DIFFICULTIES = [
    { id: 'Beginner', title: 'Beginner', desc: 'Brand new or returning. 10 reps + 1 km walk/jog.', recommended: 'Start here if you have not exercised in a while.' },
    { id: 'Intermediate', title: 'Intermediate', desc: 'You can do 20+ push-ups already. 50 reps + 5 km run.', recommended: 'Pick this if you have been training a few months.' },
    { id: 'Advanced', title: 'Advanced', desc: 'The full Solo Leveling challenge. 100 reps + 10 km run.', recommended: 'For experienced trainees — this is no joke.' }
];

export default function Onboarding({ onComplete }) {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [name, setName] = useState('');
    const [goal, setGoal] = useState('general_fitness');
    const [difficulty, setDifficulty] = useState('Beginner');
    const [age, setAge] = useState('');
    const [height, setHeight] = useState('');
    const [startWeight, setStartWeight] = useState('');
    const [goalWeight, setGoalWeight] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [error, setError] = useState('');

    const next = () => setStep((value) => value + 1);
    const back = () => setStep((value) => Math.max(0, value - 1));

    const finish = async () => {
        setSaving(true);
        setError('');
        setSaveMessage('');
        try {
            await api.put('/profile', {
                name: name.trim() || 'Hunter',
                goal,
                age: age ? Number(age) : null,
                height: height ? Number(height) : null,
                startWeight: startWeight ? Number(startWeight) : null,
                goalWeight: goalWeight ? Number(goalWeight) : null,
                onboarded: true
            });
            await api.post('/checklist/preset', { difficulty });
            if (startWeight) await api.post('/weights', { weight: Number(startWeight) });
            setSaveMessage('Registration saved. Your onboarding will stay complete after refresh.');
            await onComplete?.();
            navigate('/');
        } catch (saveError) {
            setError(saveError.message || 'The system could not save onboarding. Please try again before refreshing.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="page onboarding-page">
            <div className="stepper" aria-label="Onboarding progress">
                {[0, 1, 2, 3].map((index) => <span key={index} className={index <= step ? 'active' : ''} />)}
            </div>

            {error && <div className="alert error" role="alert">{error}</div>}
            {saveMessage && <div className="alert success" role="status">{saveMessage}</div>}

            {step === 0 && (
                <div className="card onboarding-card">
                    <p className="eyebrow">[ System Activation ]</p>
                    <h1>A new hunter has awakened.</h1>
                    <p>The System has detected potential. Before you begin your ascent, let us register you.</p>
                    <label>What should we call you?<input value={name} onChange={(event) => setName(event.target.value)} /></label>
                    <button onClick={next} type="button">Continue →</button>
                </div>
            )}

            {step === 1 && (
                <div className="card onboarding-card">
                    <p className="eyebrow">[ Step 2 of 4 ]</p>
                    <h1>What is your goal?</h1>
                    <div className="choice-grid">
                        {GOALS.map((item) => (
                            <button key={item.id} className={goal === item.id ? 'active' : ''} onClick={() => setGoal(item.id)} type="button">
                                <span>{item.icon}</span><strong>{item.label}</strong><small>{item.desc}</small>
                            </button>
                        ))}
                    </div>
                    <button onClick={back} type="button">← Back</button><button onClick={next} type="button">Continue →</button>
                </div>
            )}

            {step === 2 && (
                <div className="card onboarding-card">
                    <p className="eyebrow">[ Step 3 of 4 ]</p>
                    <h1>Choose your starting difficulty.</h1>
                    <div className="choice-grid">
                        {DIFFICULTIES.map((item) => (
                            <button key={item.id} className={difficulty === item.id ? 'active' : ''} onClick={() => setDifficulty(item.id)} type="button">
                                <strong>{item.title}</strong><small>{item.desc}</small><em>{item.recommended}</em>
                            </button>
                        ))}
                    </div>
                    <button onClick={back} type="button">← Back</button><button onClick={next} type="button">Continue →</button>
                </div>
            )}

            {step === 3 && (
                <div className="card onboarding-card">
                    <p className="eyebrow">[ Step 4 of 4 ]</p>
                    <h1>Optional body metrics.</h1>
                    <div className="form-grid">
                        <label>Age<input type="number" value={age} onChange={(event) => setAge(event.target.value)} /></label>
                        <label>Height (cm)<input type="number" value={height} onChange={(event) => setHeight(event.target.value)} /></label>
                        <label>Current weight (kg)<input type="number" value={startWeight} onChange={(event) => setStartWeight(event.target.value)} /></label>
                        <label>Goal weight (kg)<input type="number" value={goalWeight} onChange={(event) => setGoalWeight(event.target.value)} /></label>
                    </div>
                    <button onClick={back} type="button">← Back</button>
                    <button onClick={finish} disabled={saving} type="button">{saving ? 'Saving…' : 'Begin Training'}</button>
                </div>
            )}
        </section>
    );
}
