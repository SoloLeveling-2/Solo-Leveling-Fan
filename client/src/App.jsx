import { useEffect, useState } from 'react';
import { NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { api } from './api/client.js';
import Checklist from './pages/Checklist.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Profile from './pages/Profile.jsx';

const NAV = [
    { to: '/', label: 'Dashboard', end: true, icon: '◈' },
    { to: '/quest', label: 'Daily Quest', icon: '✦' },
    { to: '/profile', label: 'Profile', icon: '◉' }
];

function Dashboard({ profile, stats, error }) {
    return (
        <section className="page dashboard-page">
            <h1>Hunter Dashboard</h1>
            {error && <div className="alert error" role="alert">{error}</div>}
            <div className="card">
                <h2>{profile?.name ? `Welcome, ${profile.name}` : 'Arise & Train'}</h2>
                <p>{stats ? `${stats.rank} · Level ${stats.level} · ${stats.currentStreak} day streak` : 'Loading stats…'}</p>
            </div>
        </section>
    );
}

function Shell() {
    const [stats, setStats] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loadError, setLoadError] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    const refresh = async () => {
        setLoadError('');
        try {
            const [statsData, profileData] = await Promise.all([api.get('/stats'), api.get('/profile')]);
            setStats(statsData);
            setProfile(profileData);
        } catch (error) {
            setLoadError(error.message || 'Unable to load saved Hunter Tracker data.');
        }
    };

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoadError('');
            try {
                const [statsData, profileData] = await Promise.all([api.get('/stats'), api.get('/profile')]);
                if (!cancelled) {
                    setStats(statsData);
                    setProfile(profileData);
                }
            } catch (error) {
                if (!cancelled) setLoadError(error.message || 'Unable to load saved Hunter Tracker data.');
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (profile && !profile.onboarded && location.pathname !== '/welcome') {
            navigate('/welcome', { replace: true });
        }
    }, [profile, location.pathname, navigate]);

    if (location.pathname === '/welcome') {
        return profile?.onboarded ? <Navigate to="/" replace /> : <Onboarding onComplete={refresh} />;
    }

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="brand">[ SYSTEM ] Hunter Tracker</div>
                <nav>
                    {NAV.map((item) => (
                        <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                            <span>{item.icon}</span>{item.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>
            <main>
                <Routes>
                    <Route path="/" element={<Dashboard profile={profile} stats={stats} error={loadError} />} />
                    <Route path="/quest" element={<Checklist onSaved={refresh} />} />
                    <Route path="/profile" element={<Profile onSaved={refresh} />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
}

export default function App() {
    return <Shell />;
}
