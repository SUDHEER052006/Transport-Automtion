import React from 'react';
import styles from './MyRoutes.module.css';

// An array of unique colors and icons for the routes
const routeVisuals = [
  { color: '#4a90e2', icon: '🚌' }, // Blue
  { color: '#f5a623', icon: '🚍' }, // Orange
  { color: '#7ed321', icon: '🚐' }, // Green
  { color: '#bd10e0', icon: '🚎' }, // Purple
  { color: '#d0021b', icon: '🚑' }, // Red (Example)
  { color: '#50e3c2', icon: '🚔' }, // Teal (Example)
];

// This function assigns a consistent color/icon based on the route's ID
const getVisualsForRoute = (routeId) => {
  const index = routeId % routeVisuals.length; // Ensure we always get a valid index
  return routeVisuals[index];
};


function MyRoutes({ routes }) {
  if (!routes || routes.length === 0) {
    return (
      <div className={`${styles.myRoutesContainer} ${styles.emptyState}`}>
        <h2>No Routes Saved</h2>
        <p>Please go to the "Bus Schedule" page to add your frequently used routes.</p>
      </div>
    );
  }

  return (
    <div className={styles.myRoutesContainer}>
      <h1 className={styles.title}>My Saved Routes</h1>
      <div className={styles.routeGrid}>
        {routes.map((route) => {
          const visuals = getVisualsForRoute(route.id);
          return (
            <div 
              key={route.id} 
              className={styles.routeCard}
              style={{ borderLeftColor: visuals.color }} // Dynamically set the unique color
            >
              <div className={styles.routeIcon}>{visuals.icon}</div>
              <div className={styles.routeInfo}>
                <h3 className={styles.routeName}>{route.routeName}</h3>
                {/* Assuming your route object might have these details */}
                <p className={styles.routeDetails}>
                  {route.startPoint || 'Main Campus'} to {route.endPoint || 'City Center'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MyRoutes;
