import React from 'react';
import './Navbar.css'; // Ensure you have this file or styles in App.css

const Navbar = ({ activePage, setActivePage, onBack }) => {
    return (
        <nav className="student-navbar">
            <div className="nav-logo">
                <span className="logo-icon">🎓</span>
                <span className="logo-text">Student Portal</span>
            </div>
            
            <div className="nav-links">
                <button 
                    className={`nav-item ${activePage === 'home' ? 'active' : ''}`}
                    onClick={() => setActivePage('home')}
                >
                    🏠 Home
                </button>
                
                {/* "My Routes" Button REMOVED */}

                <button 
                    className={`nav-item ${activePage === 'bus-schedule' ? 'active' : ''}`}
                    onClick={() => setActivePage('bus-schedule')}
                >
                    🚌 Bus Schedule
                </button>
                
                <button 
                    className={`nav-item ${activePage === 'alerts' ? 'active' : ''}`}
                    onClick={() => setActivePage('alerts')}
                >
                    📢 Alerts
                </button>
            </div>

            <button className="logout-btn" onClick={onBack}>
                ⬅ Logout
            </button>
        </nav>
    );
};

export default Navbar;