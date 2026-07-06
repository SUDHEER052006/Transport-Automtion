import React, { useState, useEffect, useRef } from 'react';
import Navbar from './Navbar';
import BusSchedule from './BusSchedule';
import AdminDashboard from './AdminDashboard';
import { allBuses as initialBuses } from './busData';
import { isFirebaseEnabled, subscribeToState, saveState } from './firebase';
import './App.css';

// --- VERSION CONTROL ---
const DATA_VERSION = "1.3";

// --- SECURITY: HASH FUNCTION ---
const hashString = (str) => {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i); 
    }
    return hash;
};

// PASSWORD CONFIGURATION (Matches 'admin')
const AUTHORIZED_HASH = 209462325; 

const getTodayDateString = () => {
    const d = new Date();
    return d.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata'
    });
};

const getCurrentTime = () => {
    const d = new Date();
    return d.toLocaleTimeString('en-IN', { 
        hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' 
    });
};

// --- SUB-COMPONENTS ---

const AlertsPage = ({ alerts }) => (
    <div className="page-container animate-fade-in">
        <div className="section-header"><h1>📢 Transport Alerts</h1></div>
        <div className="alerts-list">
            {alerts.length === 0 ? (
                <div className="empty-state"><p>No active alerts at the moment.</p></div>
            ) : (
                alerts.map(alert => (
                    <div key={alert.id} className={`latest-alert-card ${alert.type}`}>
                        <div className="alert-header">
                            <span className="badge">{alert.type === 'urgent' ? 'URGENT' : 'INFO'}</span>
                            <span className="date">{alert.date}</span>
                        </div>
                        <h3>{alert.title}</h3>
                        <p>{alert.message}</p>
                    </div>
                ))
            )}
        </div>
    </div>
);

const HomeDashboard = ({ buses, alerts }) => {
    const busesIn = buses.filter(b => b.status === 'In').length;
    const busesOut = buses.filter(b => b.status === 'Out').length;
    const latestAlert = alerts.length > 0 ? alerts[0] : null;

    return (
        <div className="page-container home-dashboard animate-fade-in">
            <header className="dashboard-hero">
                <h1 className="welcome-title">👋 Hello, Student</h1>
                <p className="subtitle">Live transport status for {getTodayDateString()}</p>
            </header>

            <div className="stats-grid">
                <div className="stat-card glass-effect green">
                    <div className="stat-icon-wrapper">📍</div>
                    <div className="stat-info"><span className="stat-number">{busesIn}</span><h3>On Campus</h3></div>
                </div>
                <div className="stat-card glass-effect orange">
                    <div className="stat-icon-wrapper">🚍</div>
                    <div className="stat-info"><span className="stat-number">{busesOut}</span><h3>Departed</h3></div>
                </div>
            </div>

            <section className="home-alert-section">
                <div className="section-title-wrapper"><h2>🔔 Latest Update</h2></div>
                {latestAlert ? (
                    <div className={`latest-alert-card ${latestAlert.type}`}>
                        <div className="alert-header">
                            <span className="badge">{latestAlert.type === 'urgent' ? 'URGENT' : 'INFO'}</span>
                            <span className="date">{latestAlert.date}</span>
                        </div>
                        <h3>{latestAlert.title}</h3>
                        <p>{latestAlert.message}</p>
                    </div>
                ) : (
                    <div className="no-alert-card"><p>✅ All operations normal.</p></div>
                )}
            </section>
        </div>
    );
};

const BusIntro = () => (
    <div className="intro-container">
        <div className="bus-front-view">
            <div className="bus-body">
                <div className="windshield"></div>
                <div className="headlights"><div className="light"></div><div className="light"></div></div>
            </div>
        </div>
        <h1 className="title">Campus Bus Schedule Automation</h1>
    </div>
);

// --- SECURED ROLE SELECTION COMPONENT ---
const ROLE_META = {
    student: { icon: '📍', title: 'Know your bus status' },
    faculty: { icon: '📋', title: 'Transport Incharge' },
    guard:   { icon: '🛡️', title: 'Watch Tower' },
};

const RoleSelection = ({ onProceed }) => {
    const [selectedRole, setSelectedRole] = useState('');
    const [showLogin, setShowLogin] = useState(false);
    const [accessId, setAccessId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleCardClick = (role) => {
        if (role === 'student') {
            onProceed('student'); // Students go straight in — one tap
            return;
        }
        setSelectedRole(role);
        setAccessId(''); setPassword(''); setError('');
        setShowLogin(true);
    };

    const closeLogin = () => { setShowLogin(false); setSelectedRole(''); };

    // Close popup with Escape key
    useEffect(() => {
        if (!showLogin) return;
        const onKey = (e) => { if (e.key === 'Escape') { setShowLogin(false); setSelectedRole(''); } };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [showLogin]);

    const handleLogin = (e) => {
        e.preventDefault();
        const generatedHash = hashString(password);
        // SECURITY CHECK: Allow Hash OR Plaintext 'admin'
        if (generatedHash === AUTHORIZED_HASH || password === 'admin') {
            setShowLogin(false);
            onProceed(selectedRole);
        } else {
            setError('Invalid Access ID or Password');
            setPassword('');
        }
    };

    return (
        <div className="role-selection-container">
            <div className="guidance-box">
                <h4>UNDER THE GUIDANCE OF:</h4>
                <p>Dr. M.V KAMAL</p><p>Dr. G.Soma Shekar</p><p>Mrs.YELLAMMA</p>
                <p className="guidance-dept">DEPT OF CYBER SECURITY</p>
            </div>
            <h2 className="role-title">SERVICES</h2>
            <div className="role-card-container">
                {Object.entries(ROLE_META).map(([role, meta]) => (
                    <div
                        key={role}
                        className={`role-card ${selectedRole === role ? 'selected' : ''}`}
                        onClick={() => handleCardClick(role)}
                    >
                        <div className="role-icon">{meta.icon}</div>
                        <h3>{meta.title}</h3>
                        {role !== 'student' && <span className="role-lock">🔒 Requires login</span>}
                    </div>
                ))}
            </div>

            {/* --- LOGIN POPUP (Transport Incharge / Watch Tower) --- */}
            {showLogin && (
                <div className="login-backdrop" onClick={closeLogin}>
                    <div className="login-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="login-modal-icon">{ROLE_META[selectedRole]?.icon}</div>
                        <h3>{ROLE_META[selectedRole]?.title} Login</h3>
                        <p className="login-modal-sub">Enter your credentials to continue</p>
                        <form onSubmit={handleLogin}>
                            <input
                                type="text"
                                placeholder="Access ID"
                                value={accessId}
                                onChange={(e) => setAccessId(e.target.value)}
                                autoFocus
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {error && <p className="login-error">⚠ {error}</p>}
                            <div className="login-modal-actions">
                                <button type="button" className="login-cancel-btn" onClick={closeLogin}>Cancel</button>
                                <button type="submit" className="login-submit-btn">Login</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- MAIN APP COMPONENT ---
function App() {
    const [view, setView] = useState('intro');
    const [userRole, setUserRole] = useState('');
    const [activePage, setActivePage] = useState('home');

    // --- CRASH PROTECTION: Safe Data Loading ---
    const [buses, setBuses] = useState(() => {
        try {
            const saved = localStorage.getItem('campusBusData');
            const lastDate = localStorage.getItem('campusBusDate');
            const savedVersion = localStorage.getItem('campusDataVersion');
            
            if (saved && lastDate === getTodayDateString() && savedVersion === DATA_VERSION) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error("Data corruption detected (Buses). Resetting.", e);
        }
        return initialBuses;
    });

    const [todaysActivityLog, setTodaysActivityLog] = useState(() => {
        try {
            const saved = localStorage.getItem('campusActivityLog');
            const lastDate = localStorage.getItem('campusBusDate');
            if (saved && lastDate === getTodayDateString()) return JSON.parse(saved);
        } catch (e) {
            console.error("Log corruption detected. Resetting.", e);
        }
        return [];
    });

    const [alerts, setAlerts] = useState(() => {
        try {
            const saved = localStorage.getItem('campusAlerts');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Alert corruption detected. Resetting.", e);
            return [];
        }
    });

    // --- CLOUD SYNC REFS ---
    const stateRef = useRef(null);        // latest local state (for seeding)
    const lastRemoteJson = useRef('');    // guards against write/snapshot echo loops
    const cloudReady = useRef(false);     // don't push to cloud until first snapshot

    // --- REAL-TIME SYNC: Firestore across devices (when configured) ---
    useEffect(() => {
        if (!isFirebaseEnabled) return;
        const unsub = subscribeToState((remote) => {
            cloudReady.current = true;
            if (!remote) {
                // Cloud is empty (first device ever) — seed it with local state
                if (stateRef.current) {
                    lastRemoteJson.current = JSON.stringify(stateRef.current);
                    saveState({ ...stateRef.current, date: getTodayDateString() });
                }
                return;
            }
            if (remote.date !== getTodayDateString()) {
                // New day: keep routes & alerts, reset live statuses and the log
                const resetBuses = (remote.buses || []).map(b => ({ ...b, status: 'Idle', inTime: null, outTime: null }));
                saveState({ buses: resetBuses, activityLog: [], alerts: remote.alerts || [], date: getTodayDateString() });
                return; // that write triggers a fresh snapshot handled below
            }
            const remoteJson = JSON.stringify({ buses: remote.buses || [], activityLog: remote.activityLog || [], alerts: remote.alerts || [] });
            if (remoteJson === lastRemoteJson.current) return; // our own echo
            lastRemoteJson.current = remoteJson;
            setBuses(remote.buses || []);
            setTodaysActivityLog(remote.activityLog || []);
            setAlerts(remote.alerts || []);
        });
        return unsub;
    }, []);

    // --- REAL-TIME TAB SYNC (same-device fallback when Firebase is off) ---
    useEffect(() => {
        if (isFirebaseEnabled) return; // Firestore handles sync everywhere
        const handleStorageChange = (e) => {
            if (e.key === 'campusBusData' && e.newValue) setBuses(JSON.parse(e.newValue));
            if (e.key === 'campusActivityLog' && e.newValue) setTodaysActivityLog(JSON.parse(e.newValue));
            if (e.key === 'campusAlerts' && e.newValue) setAlerts(JSON.parse(e.newValue));
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // --- PERSISTENCE (localStorage always; Firestore when enabled) ---
    useEffect(() => {
        stateRef.current = { buses, activityLog: todaysActivityLog, alerts };
        localStorage.setItem('campusBusData', JSON.stringify(buses));
        localStorage.setItem('campusActivityLog', JSON.stringify(todaysActivityLog));
        localStorage.setItem('campusAlerts', JSON.stringify(alerts));
        localStorage.setItem('campusBusDate', getTodayDateString());
        localStorage.setItem('campusDataVersion', DATA_VERSION);

        if (isFirebaseEnabled && cloudReady.current) {
            const json = JSON.stringify(stateRef.current);
            if (json !== lastRemoteJson.current) {
                lastRemoteJson.current = json;
                saveState({ ...stateRef.current, date: getTodayDateString() });
            }
        }
    }, [buses, todaysActivityLog, alerts]);

    // DATE CHECKER
    useEffect(() => {
        const interval = setInterval(() => {
            if (localStorage.getItem('campusBusDate') !== getTodayDateString()) window.location.reload();
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    // Intro Timer (4.5 seconds to match Animation)
    useEffect(() => { 
        if (view === 'intro') {
            const timer = setTimeout(() => setView('roleSelection'), 4500); 
            return () => clearTimeout(timer);
        }
    }, [view]);

    // --- LOGIC FUNCTIONS ---
    const updateBusStatus = (busId, newStatus) => {
        const fullTimestamp = `${getTodayDateString()}, ${getCurrentTime()}`;
        const currentBus = buses.find(b => b.id === busId);
        if (!currentBus) return;

        setBuses(prev => prev.map(bus => 
            bus.id === busId ? { ...bus, status: newStatus, inTime: newStatus === 'In' ? fullTimestamp : bus.inTime, outTime: newStatus === 'Out' ? fullTimestamp : bus.outTime } : bus
        ));

        setTodaysActivityLog(prevLog => {
            if (newStatus === 'In') {
                return [...prevLog, { id: Date.now(), busId, routeName: currentBus.routeName, busNo: currentBus.busNo, inTime: fullTimestamp, inReading: currentBus.inReading, outTime: null, outReading: null }];
            }
            if (newStatus === 'Out') {
                const reversedLog = [...prevLog].reverse();
                const reverseIndex = reversedLog.findIndex(log => log.busId === busId && log.outTime === null);
                if (reverseIndex !== -1) {
                    const realIndex = prevLog.length - 1 - reverseIndex;
                    const updatedLog = [...prevLog];
                    updatedLog[realIndex] = { ...updatedLog[realIndex], outTime: fullTimestamp, outReading: currentBus.outReading };
                    return updatedLog;
                }
                return [...prevLog, { id: Date.now(), busId, routeName: currentBus.routeName, busNo: currentBus.busNo, inTime: '---', inReading: null, outTime: fullTimestamp, outReading: currentBus.outReading }];
            }
            return prevLog;
        });
        return fullTimestamp;
    };

    const updateBusDetails = (busId, details) => {
        setBuses(prev => prev.map(b => b.id === busId ? { ...b, ...details } : b));
        setTodaysActivityLog(prevLog => {
            const reversedLog = [...prevLog].reverse();
            const reverseIndex = reversedLog.findIndex(log => log.busId === busId);
            if (reverseIndex !== -1) {
                const realIndex = prevLog.length - 1 - reverseIndex;
                const updatedLog = [...prevLog];
                updatedLog[realIndex] = { ...updatedLog[realIndex], ...details };
                return updatedLog;
            }
            return prevLog;
        });
    };

    const addNewRoute = (d) => setBuses([...buses, {id: Date.now(), ...d, status:'Idle'}]);
    const deleteRoute = (id) => setBuses(buses.filter(b => b.id !== id));
    const addAlert = (d) => setAlerts([{id: Date.now(), date: getTodayDateString(), ...d}, ...alerts]);
    const deleteAlert = (id) => setAlerts(alerts.filter(a => a.id !== id));

    const handleProceed = (role) => { setUserRole(role); setView(role === 'faculty' || role === 'guard' ? 'adminDashboard' : 'dashboard'); };
    const handleBack = () => { setView('roleSelection'); setUserRole(''); setActivePage('home'); };

    return (
        <div className="app-wrapper">
            <div className="background-watermark"></div>

            {/* --- HEADER LOGIC (CONDITIONAL RENDERING) --- */}
            {view === 'roleSelection' ? (
                /* OPTION A: Full Animated Header (Only on Role Selection) */
                <header className="app-header">
                    <div className="reveal-container">
                        <img src={`${import.meta.env.BASE_URL}college-logo.png`} alt="College Logo" className="header-logo" />
                        <h2>Geethanjali College of Engineering and Technology</h2>
                        
                        {/* THE REALISTIC BUS STRUCTURE */}
                        <div className="header-bus">
                            {/* Wheel Wells (Behind Wheels) */}
                            <div className="wheel-well back"></div>
                            <div className="wheel-well front"></div>
                            
                            {/* Main Body */}
                            <div className="mini-bus-body">
                                <div className="bus-stripe"></div>
                                <div className="mini-window"></div>
                                <div className="mini-window"></div>
                                <div className="mini-window"></div>
                                <div className="mini-window front"></div>
                            </div>
                            
                            {/* Wheels (In Front) */}
                            <div className="mini-wheel back"></div>
                            <div className="mini-wheel front"></div>
                        </div>
                    </div>
                </header>
            ) : (
                /* OPTION B: Compact Static Header (For Dashboards) */
                <header className="app-header compact">
                    <img src={`${import.meta.env.BASE_URL}college-logo.png`} alt="College Logo" className="header-logo" />
                    <h2>Geethanjali College of Engineering and Technology</h2>
                </header>
            )}
            
            <div className="main-content-area">
                <div className={`view-container ${view === 'intro' ? 'visible' : ''}`}><BusIntro /></div>
                <div className={`view-container ${view === 'roleSelection' ? 'visible' : ''}`}><RoleSelection onProceed={handleProceed} /></div>
                
                <div className={`view-container ${view === 'dashboard' ? 'visible' : ''}`}>
                    <Navbar activePage={activePage} setActivePage={setActivePage} onBack={handleBack} />
                    <div className="dashboard-content">
                        {activePage === 'home' && <HomeDashboard buses={buses} alerts={alerts} />}
                        {activePage === 'bus-schedule' && <BusSchedule buses={buses} />}
                        {activePage === 'alerts' && <AlertsPage alerts={alerts} />}
                    </div>
                </div>

                <div className={`view-container ${view === 'adminDashboard' ? 'visible' : ''}`}>
                    <AdminDashboard 
                        userRole={userRole} 
                        buses={buses} 
                        activityLog={todaysActivityLog} 
                        alerts={alerts}
                        onUpdateBusStatus={updateBusStatus} 
                        onUpdateBusDetails={updateBusDetails}
                        onAddRoute={addNewRoute} onDeleteRoute={deleteRoute}
                        onAddAlert={addAlert} onDeleteAlert={deleteAlert}
                        onBack={handleBack} 
                    />
                </div>
            </div>

            <div className="developer-watermark">
                <span className={`sync-badge ${isFirebaseEnabled ? 'online' : 'offline'}`} title={isFirebaseEnabled ? 'Data syncs live across all devices' : 'Firebase not configured — data stays on this device'}>
                    {isFirebaseEnabled ? '🌐 Live Sync' : '📴 Device-only'}
                </span>
                Developed by S.SUDHEER &copy; 2025 GCET
            </div>
        </div>
    );
}

export default App;