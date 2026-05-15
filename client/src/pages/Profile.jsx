import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

export default function Profile() {
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        Promise.all([api.get('/profile'), api.get('/stats')])
            .then(([profileData, statsData]) => {
                if (!cancelled) {
                    setProfile(profileData);
                    setStats(statsData);
                }
            })
            .catch((loadError) => {
                if (!cancelled) setError(loadError.message || 'Unable to load profile.');
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const update = (key, value) => {
        setProfile((current) => ({ ...current, [key]: value }));
        setSaveMessage('');
    };

    const save = async () => {
        setSaving(true);
        setError('');
        setSaveMessage('');
        try {
            const updated = await api.put('/profile', profile);
            setProfile(updated);
            setSaveMessage('Profile saved. Refreshing will keep these changes.');
        } catch (saveError) {
            setError(saveError.message || 'Profile did not save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const reset = async () => {
        const confirmed = window.confirm('Reset all local Hunter Tracker data? This cannot be undone.');
        if (!confirmed) return;
        setError('');
        try {
            await api.post('/reset');
            window.location.href = '/';
        } catch (resetError) {
            setError(resetError.message || 'Unable to reset data.');
        }
    };

    if (!profile || !stats) return <p>Loading…</p>;

    return (
        <section className="page profile-page">
            <header className="page-header">
                <p className="eyebrow">[ HUNTER PROFILE ]</p>
                <h1>Hunter Profile</h1>
                <p>Your registration with the system.</p>
            </header>

            {error && <div className="alert error" role="alert">{error}</div>}
            {saveMessage && <div className="alert success" role="status">{saveMessage}</div>}

            <div className="card profile-card">
                <h2>{profile.name || 'Unnamed Hunter'}</h2>
                <p>{stats.rank} · LV {stats.level} · {stats.xp} XP</p>
                <p>Awakened {new Date(profile.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="card form-grid">
                <label>Hunter Name<input value={profile.name || ''} onChange={(event) => update('name', event.target.value)} placeholder="Hunter" /></label>
                <label>Age<input type="number" value={profile.age || ''} onChange={(event) => update('age', event.target.value ? Number(event.target.value) : null)} placeholder="—" /></label>
                <label>Height (cm)<input type="number" value={profile.height || ''} onChange={(event) => update('height', event.target.value ? Number(event.target.value) : null)} placeholder="—" /></label>
                <label>Goal
                    <select value={profile.goal || 'general_fitness'} onChange={(event) => update('goal', event.target.value)}>
                        <option value="general_fitness">General Fitness</option>
                        <option value="lose_weight">Lose Weight</option>
                        <option value="build_muscle">Build Muscle</option>
                        <option value="endurance">Endurance</option>
                    </select>
                </label>
                <label>Current Weight (kg)<input type="number" value={profile.startWeight || ''} onChange={(event) => update('startWeight', event.target.value ? Number(event.target.value) : null)} placeholder="—" /></label>
                <label>Goal Weight (kg)<input type="number" value={profile.goalWeight || ''} onChange={(event) => update('goalWeight', event.target.value ? Number(event.target.value) : null)} placeholder="—" /></label>
            </div>

            <button onClick={save} disabled={saving} type="button">{saving ? 'Saving…' : 'Save Profile'}</button>

            <div className="card danger-zone">
                <h3>Danger Zone</h3>
                <p>Resetting wipes everything. This is the only place the app calls /api/reset.</p>
                <button onClick={reset} type="button">Reset All Data</button>
            </div>
        </section>
    );
}
