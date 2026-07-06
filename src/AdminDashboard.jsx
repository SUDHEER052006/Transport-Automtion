import React, { useState, useEffect } from 'react';
import { generateExcelReport } from './reportGenerator';
import './AdminDashboard.css'; 

// --- REPORT PAGE ---
const ReportPage = ({ activityLog, onBack, embedded }) => {
  const recentLogs = [...activityLog].reverse();
  const reportDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="report-page-container">
      <div className="report-header">
        <div>
          <h1>Daily Activity Log</h1>
          <p style={{margin:0, color:'#94a3b8'}}>Date: {reportDate} &middot; {recentLogs.length} {recentLogs.length === 1 ? 'entry' : 'entries'}</p>
        </div>
        <div className="report-actions">
          {!embedded && <button className="modal-cancel-btn" onClick={onBack}>&larr; Back</button>}
          <button className="export-pdf-btn" onClick={() => generateExcelReport(activityLog, reportDate)} disabled={recentLogs.length === 0}>⬇ Export Excel</button>
        </div>
      </div>
      {recentLogs.length === 0 ? (
        <div className="report-empty-state">
          <div className="report-empty-icon">📋</div>
          <h3>No activity logged yet</h3>
          <p>Bus arrivals and departures recorded by the Watch Tower will appear here.</p>
        </div>
      ) : (
      <div className="report-table-wrapper">
        <table className="report-table">
          <thead>
            <tr>
              <th>Route</th>
              <th>Bus No</th>
              <th>Arrival</th>
              <th>In Reading</th>
              <th>Departure</th>
              <th>Out Reading</th>
            </tr>
          </thead>
          <tbody>
            {recentLogs.map((log) => (
              <tr key={log.id}>
                <td>{log.routeName}</td>
                <td>{log.busNo || '-'}</td>
                <td>{log.inTime && log.inTime.includes(',') ? log.inTime.split(',')[1] : '-'}</td>
                <td>{log.inReading || '-'}</td>
                <td>{log.outTime && log.outTime.includes(',') ? log.outTime.split(',')[1] : '-'}</td>
                <td>{log.outReading || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
};

// --- FACULTY: ROUTE MANAGER ---
const RouteManager = ({ buses, onAddRoute, onDeleteRoute }) => {
    const [d, setD] = useState({ name:'', no:'', start:'', end:'GCET Campus' });
    
    const submit = (e) => { 
        e.preventDefault(); 
        if(d.name && d.no) { 
            onAddRoute({ routeName: d.name, busNo: d.no, startPoint: d.start, endPoint: d.end }); 
            setD({name:'',no:'',start:'',end:'GCET Campus'}); 
        } 
    };
    
    return (
        <div className="manager-container">
            <div className="manager-card">
                <h3>Add New Route</h3>
                <form onSubmit={submit} className="admin-form">
                    <input type="text" placeholder="Route Name" value={d.name} onChange={e=>setD({...d, name:e.target.value})} required />
                    <input type="text" placeholder="Bus Number" value={d.no} onChange={e=>setD({...d, no:e.target.value.toUpperCase()})} required />
                    <div style={{display:'flex', gap:'10px'}}>
                        <input type="text" placeholder="Start" value={d.start} onChange={e=>setD({...d, start:e.target.value})} />
                        <input type="text" value={d.end} readOnly style={{background:'#333', color:'#888'}} />
                    </div>
                    <button className="add-btn">Add Route</button>
                </form>
            </div>
            
            <div className="manager-card">
                <h3>Existing Routes ({buses.length})</h3>
                <div className="scrolling-list-container">
                    {buses.length === 0 && <p className="list-empty-hint">No routes yet. Add your first route on the left.</p>}
                    {buses.map(b => (
                        <div key={b.id} className="list-card-item" style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                            <div><strong>{b.routeName}</strong> <span style={{color:'#aaa', fontSize:'0.8rem', marginLeft:'10px'}}>{b.busNo}</span></div>
                            <button className="delete-btn" onClick={()=>onDeleteRoute(b.id)}>🗑️</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- FACULTY: ALERT MANAGER (With Copy Button) ---
const AlertManager = ({ alerts, buses, onAddAlert, onDeleteAlert }) => {
    const [mode, setMode] = useState('manual');
    const [msg, setMsg] = useState(''); const [title, setTitle] = useState(''); const [type, setType] = useState('info');
    const [sel, setSel] = useState({});

    const handleGen = () => {
        const active = buses.filter(b => sel[b.id]?.checked);
        if(active.length === 0) return alert("Select routes first");
        
        const groups = {};
        active.forEach(b => {
            const note = (sel[b.id]?.note || '').trim();
            if (!groups[note]) groups[note] = [];
            groups[note].push(b.routeName);
        });

        const d = new Date(); d.setDate(d.getDate()+1);
        const dateStr = d.toLocaleDateString('en-IN', {day:'numeric', month:'short'});
        
        let txt = `🚌 *TRANSPORT UPDATE* (${dateStr})\n\nAvailable Buses:\n`;
        Object.keys(groups).forEach(note => {
            const routeNames = groups[note].join(', ');
            const noteText = note ? ` (${note})` : '';
            txt += `✅ ${routeNames}${noteText}\n`;
        });

        onAddAlert({ title: `Transport for ${dateStr}`, message: txt + "\nBe 5 mins early.", type:'info' });
        setSel({}); setMode('manual');
    };

    return (
        <div className="manager-container">
            <div className="manager-card">
                <div className="alert-mode-switch">
                    <button className={mode==='manual'?'active':''} onClick={()=>setMode('manual')}>Manual</button>
                    <button className={mode==='route'?'active':''} onClick={()=>setMode('route')}>Route Updates</button>
                </div>
                {mode === 'manual' ? (
                    <form onSubmit={e=>{e.preventDefault(); if(title&&msg){onAddAlert({title,message:msg,type});setTitle('');setMsg('');}}} className="admin-form">
                        <div className="templates-row">
                            {[{t:'Breakdown',m:'⚠️ BUS BREAKDOWN\nRoute [] broken down.'},{t:'Delay',m:'⏳ DELAY ALERT\nTraffic delay 15 mins.'}].map((x,i)=><button key={i} type="button" className="template-pill" onClick={()=>{setTitle(x.t);setMsg(x.m)}}>{x.t}</button>)}
                        </div>
                        <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} required />
                        <textarea placeholder="Message" value={msg} onChange={e=>setMsg(e.target.value)} rows="3" required />
                        <div className="radio-group">
                            <label><input type="radio" name="t" checked={type==='info'} onChange={()=>setType('info')}/> Info</label>
                            <label><input type="radio" name="t" checked={type==='urgent'} onChange={()=>setType('urgent')}/> Urgent</label>
                        </div>
                        <button className="add-btn broadcast">Broadcast</button>
                    </form>
                ) : (
                    <>
                        <p style={{color:'#ccc', marginBottom:'10px', fontSize:'0.9rem'}}>Select routes available for <strong>TOMORROW</strong>:</p>
                        <div className="scrolling-list-container">
                            {buses.map(b => (
                                <div key={b.id} className={`list-card-item ${sel[b.id]?.checked ? 'active-selection' : ''}`}>
                                    <label className="checkbox-wrapper">
                                        <input type="checkbox" checked={sel[b.id]?.checked||false} onChange={()=>setSel({...sel, [b.id]:{...sel[b.id], checked:!sel[b.id]?.checked}})} />
                                        <span>{b.routeName}</span>
                                    </label>
                                    {sel[b.id]?.checked && (
                                        <input type="text" className="note-input" placeholder="Coverage Note" value={sel[b.id]?.note||''} onChange={e=>setSel({...sel, [b.id]:{...sel[b.id], note:e.target.value}})} />
                                    )}
                                </div>
                            ))}
                        </div>
                        <button className="add-btn broadcast" onClick={handleGen}>Generate Update</button>
                    </>
                )}
            </div>
            
            <div className="manager-card">
                <h3>Active Alerts ({alerts.length})</h3>
                <div className="scrolling-list-container">
                    {alerts.length === 0 && <p className="list-empty-hint">No active alerts. Broadcasts you send will appear here.</p>}
                    {alerts.map(a => (
                        <div key={a.id} className="list-card-item" style={{borderLeft:`4px solid ${a.type==='urgent'?'#ef4444':'#3b82f6'}`, display:'block'}}>
                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'5px', alignItems:'center'}}>
                                <strong>{a.title}</strong>
                                <div style={{display:'flex', gap:'8px'}}>
                                    {/* --- COPY BUTTON ADDED HERE --- */}
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(`*${a.title}*\n${a.message}`);
                                            alert("Copied to clipboard!");
                                        }}
                                        style={{background:'transparent', border:'1px solid #475569', color:'#cbd5e1', borderRadius:'6px', cursor:'pointer', padding:'4px 8px', fontSize:'0.75rem', display:'flex', alignItems:'center', gap:'4px'}}
                                        title="Copy to clipboard"
                                    >
                                        📋 Copy
                                    </button>
                                    <button className="delete-btn" onClick={()=>onDeleteAlert(a.id)}>✕</button>
                                </div>
                            </div>
                            <p style={{margin:0, color:'#aaa', fontSize:'0.85rem', whiteSpace:'pre-line'}}>{a.message}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- SHARED BUS ICON (uniform art for both action cards) ---
const BusActionIcon = ({ variant }) => {
    const isIn = variant === 'in';
    const id = isIn ? 'Green' : 'Orange';
    const [c1, c2, strokeC] = isIn ? ['#4ade80', '#22c55e', '#166534'] : ['#fb923c', '#ea580c', '#7c2d12'];
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="72" height="72">
            <defs>
                <linearGradient id={`busBody${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} />
                </linearGradient>
                <linearGradient id={`window${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#bae6fd" /><stop offset="100%" stopColor="#7dd3fc" />
                </linearGradient>
                <filter id={`shadow${id}`} x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
                    <feOffset in="blur" dx="2" dy="4" result="offsetBlur" />
                    <feMerge><feMergeNode in="offsetBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
            </defs>
            <g filter={`url(#shadow${id})`}>
                {/* Same bus body for both — only colors + arrow differ */}
                <rect x="15" y="30" width="70" height="45" rx="10" fill={`url(#busBody${id})`} stroke={strokeC} strokeWidth="3" />
                <rect x="20" y="35" width="60" height="20" rx="5" fill={`url(#window${id})`} stroke="#0ea5e9" strokeWidth="2" />
                <path d="M 25 38 L 45 38 L 35 50 Z" fill="white" opacity="0.4" />
                <circle cx="25" cy="65" r="5" fill="#facc15" stroke="#eab308" strokeWidth="2" />
                <circle cx="75" cy="65" r="5" fill="#facc15" stroke="#eab308" strokeWidth="2" />
                <rect x="40" y="62" width="20" height="8" rx="2" fill={strokeC} />
                <ellipse cx="30" cy="80" rx="8" ry="5" fill="#333" />
                <ellipse cx="70" cy="80" rx="8" ry="5" fill="#333" />
                {/* Direction badge: green = arriving (down-in), orange = departing (out-right) */}
                {isIn ? (
                    <g><circle cx="85" cy="22" r="13" fill="#166534" /><path d="M 85 14 L 85 28 M 79 22 L 85 28 L 91 22" stroke="#4ade80" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>
                ) : (
                    <g><circle cx="85" cy="22" r="13" fill="#7c2d12" /><path d="M 77 22 L 91 22 M 85 16 L 91 22 L 85 28" stroke="#fdba74" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>
                )}
            </g>
        </svg>
    );
};

// --- GUARD DASHBOARD (Preserving all previous styles & fixes) ---
const GuardDashboard = ({ buses, onUpdateBusStatus, onUpdateBusDetails, onBack, activityLog }) => {
    const [view, setView] = useState('menu'); 
    const [selBus, setSelBus] = useState(null);
    const [toast, setToast] = useState(null);
    const [det, setDet] = useState({no:'', inR:'', outR:''});

    useEffect(() => { if(toast) setTimeout(() => setToast(null), 3000); }, [toast]);

    const handleAction = (bus, type) => {
        onUpdateBusStatus(bus.id, type);
        setToast({ msg: `${bus.routeName} marked ${type}`, type: type.toLowerCase() });
    };

    const saveDetails = () => {
        if(selBus) {
            onUpdateBusDetails(selBus.id, { busNo: det.no, inReading: det.inR, outReading: det.outR });
            setToast({ msg: 'Details Saved', type: 'success' });
            // Clear selection but stay on list view
            setSelBus(null);
            setDet({no:'', inR:'', outR:''});
        }
    };

    if(view === 'report') return <ReportPage activityLog={activityLog} onBack={()=>setView('menu')} />;

    const busesIn = buses.filter(b => b.status === 'In').length;

    return (
        <div className="admin-dashboard">
            {toast && <div className={`toast-notification ${toast.type}`}>{toast.msg}</div>}
            <div className="admin-header with-actions">
                <div>
                    <h1>Watch Tower</h1>
                    <p className="admin-subtitle">Guard Dashboard &middot; {busesIn} {busesIn === 1 ? 'bus' : 'buses'} on campus</p>
                </div>
                <button className="header-logout-btn" onClick={onBack}>⬅ Logout</button>
            </div>

            {view === 'menu' && (
                <div className="guard-menu-container animate-fade-in">
                    <div className="guard-actions-grid">
                        {/* BUTTON 1: BUS ARRIVAL */}
                        <button className="big-action-card green" onClick={() => setView('in')}>
                            <div className="big-icon svg-icon"><BusActionIcon variant="in" /></div>
                            <span className="big-label">BUS ARRIVAL</span>
                            <span className="big-sub">Log entry time</span>
                        </button>

                        {/* BUTTON 2: BUS DEPARTURE */}
                        <button className="big-action-card orange" onClick={() => setView('out')}>
                            <div className="big-icon svg-icon"><BusActionIcon variant="out" /></div>
                            <span className="big-label">BUS DEPARTURE</span>
                            <span className="big-sub">Log exit time</span>
                        </button>
                    </div>

                    <div className="guard-secondary-actions">
                        <button className="btn-secondary" onClick={() => setView('details')}>📝 Update Readings</button>
                        <button className="btn-secondary" onClick={() => setView('report')}>📊 View Log</button>
                    </div>
                </div>
            )}

            {(view === 'in' || view === 'out') && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <h2>Log Bus {view === 'in' ? 'Arrival' : 'Departure'}</h2>
                        <div className="route-grid">
                            {buses.map(bus => (
                                <div key={bus.id} className="route-item-wrapper">
                                    <button
                                        className="route-button"
                                        disabled={view === 'in' ? bus.status === 'In' : bus.status !== 'In'}
                                        onClick={() => handleAction(bus, view === 'in' ? 'In' : 'Out')}
                                    >
                                        {bus.routeName}
                                    </button>
                                    <div className={`route-status-display ${bus.status === 'In' ? 'in' : ''}`}>
                                        {bus.status === 'In' ? '● In Campus' : ' '}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="modal-actions"><button className="modal-cancel-btn" onClick={()=>setView('menu')}>Back</button></div>
                    </div>
                </div>
            )}

            {view === 'details' && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <h2>{selBus ? `Edit ${selBus.routeName}` : 'Select Bus'}</h2>
                        {!selBus ? (
                            <div className="route-grid">
                                {buses.map(b => <button key={b.id} className="route-button" onClick={()=>{setSelBus(b); setDet({no:b.busNo||'', inR:b.inReading||'', outR:b.outReading||''})}}>{b.routeName}</button>)}
                            </div>
                        ) : (
                            <div className="details-form">
                                <div className="form-group"><label>Bus Number</label><input value={det.no} onChange={e=>setDet({...det, no:e.target.value.toUpperCase()})} placeholder="e.g. TS 07..." /></div>
                                <div className="form-group"><label>Input Reading (End/Higher)</label><input type="number" value={det.inR} onChange={e=>setDet({...det, inR:e.target.value})} placeholder="Reading when entering" /></div>
                                <div className="form-group"><label>Output Reading (Start/Lower)</label><input type="number" value={det.outR} onChange={e=>setDet({...det, outR:e.target.value})} placeholder="Reading when leaving" /></div>
                                <div style={{display:'flex',justifyContent:'space-between', marginTop:'10px'}}>
                                    <button className="modal-cancel-btn" onClick={()=>{setSelBus(null); }}>Back</button>
                                    <button className="modal-confirm-btn" onClick={saveDetails}>Save Details</button>
                                </div>
                            </div>
                        )}
                         {!selBus && <div className="modal-actions"><button className="modal-cancel-btn" onClick={()=>{setSelBus(null); setView('menu')}}>Back</button></div>}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- MAIN ADMIN WRAPPER ---
const AdminDashboard = (props) => {
    const { userRole, onBack } = props;
    const [tab, setTab] = useState('routes');
    if (userRole === 'guard') return <GuardDashboard {...props} />;
    
    return (
        <div className="admin-dashboard">
            <div className="admin-header with-actions">
                <div>
                    <h1>Transport Incharge</h1>
                    <p className="admin-subtitle">Manage routes, notifications &amp; daily reports</p>
                </div>
                <button className="header-logout-btn" onClick={onBack}>⬅ Logout</button>
            </div>
            <div className="faculty-tabs">
                <button className={tab==='routes'?'active':''} onClick={()=>setTab('routes')}>🚌 Manage Routes</button>
                <button className={tab==='alerts'?'active':''} onClick={()=>setTab('alerts')}>📢 Notifications</button>
                <button className={tab==='report'?'active':''} onClick={()=>setTab('report')}>📊 View Reports</button>
            </div>
            {tab === 'routes' && <RouteManager {...props} />}
            {tab === 'alerts' && <AlertManager {...props} />}
            {tab === 'report' && <ReportPage activityLog={props.activityLog} embedded />}
        </div>
    );
};

export default AdminDashboard;