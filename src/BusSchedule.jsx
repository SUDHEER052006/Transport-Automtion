import React, { useState } from 'react';
import './BusSchedule.css'; 

const BusSchedule = ({ buses }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // --- FILTERING LOGIC ---
  const filteredBuses = buses.filter(bus => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (bus.routeName && bus.routeName.toLowerCase().includes(term)) ||
      (bus.busNo && bus.busNo.toLowerCase().includes(term));

    const matchesStatus = filterStatus === 'all' 
      ? true 
      : filterStatus === 'In' 
        ? bus.status === 'In'
        : filterStatus === 'Out' 
          ? bus.status === 'Out'
          : bus.status === 'Idle';

    return matchesSearch && matchesStatus;
  });

  const getTimeDisplay = (bus) => {
    if (bus.status === 'In') return `Arrived: ${bus.inTime && bus.inTime.includes(',') ? bus.inTime.split(',')[1] : 'Just now'}`;
    if (bus.status === 'Out') return `Departed: ${bus.outTime && bus.outTime.includes(',') ? bus.outTime.split(',')[1] : 'Just now'}`;
    return 'Not Active Yet';
  };

  return (
    <div className="schedule-container">
      
      {/* --- HEADER --- */}
      <div className="schedule-header">
        <div className="header-text">
            <h2>Live Bus Status</h2>
            <p>Track arrival and departure times in real-time.</p>
        </div>
        
        <div className="controls-wrapper">
            <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input 
                    type="text" 
                    placeholder="Search Route or Bus No..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="filter-tabs">
                <button className={filterStatus === 'all' ? 'active' : ''} onClick={() => setFilterStatus('all')}>All</button>
                <button className={filterStatus === 'In' ? 'active' : ''} onClick={() => setFilterStatus('In')}>In Campus</button>
                <button className={filterStatus === 'Out' ? 'active' : ''} onClick={() => setFilterStatus('Out')}>Departed</button>
            </div>
        </div>
      </div>

      {/* --- BUS GRID --- */}
      <div className="bus-grid">
        {filteredBuses.length > 0 ? (
            filteredBuses.map((bus) => (
            <div key={bus.id} className={`bus-card ${bus.status ? bus.status.toLowerCase() : 'idle'}-border`}>
                
                <div className="card-top">
                    <div className="route-identity">
                        <h3>{bus.routeName}</h3>
                        <span className="bus-number">{bus.busNo || 'No Bus No.'}</span>
                    </div>
                    {/* Pin Button Removed - Feature Deprecated */}
                </div>

                <div className="route-flow">
                    <div className="point start">
                        <span className="dot"></span>
                        <span className="label">{bus.startPoint || 'Campus'}</span>
                    </div>
                    <div className="line"></div>
                    <div className="point end">
                        <span className="dot"></span>
                        <span className="label">{bus.endPoint || 'City'}</span>
                    </div>
                </div>

                <div className="card-bottom">
                    <div className={`status-pill ${bus.status ? bus.status.toLowerCase() : 'idle'}`}>
                        <span className="indicator-dot"></span>
                        {bus.status === 'Idle' ? 'Not Started' : bus.status === 'In' ? 'On Campus' : 'Departed'}
                    </div>
                    <div className="time-info">
                        {getTimeDisplay(bus)}
                    </div>
                </div>
            </div>
            ))
        ) : (
            <div className="empty-search">
                <div className="empty-icon">🚌</div>
                <h3>No buses found</h3>
                <p>Try adjusting your search or filters.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default BusSchedule;