import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, BarChart2, MapPin, Settings } from 'lucide-react';

const tabs = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/cycle', icon: Calendar, label: 'Cycle' },
  { to: '/checkin', icon: '✦', label: 'Check-in' },
  { to: '/insights', icon: BarChart2, label: 'Insights' },
  { to: '/nearby', icon: MapPin, label: 'Nearby' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {tabs.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
          aria-label={tab.label}
        >
          {({ isActive }) => (
            <>
              <span style={{ fontSize: 20, lineHeight: 1 }}>
                {typeof tab.icon === 'string' ? (
                  <span>{tab.icon}</span>
                ) : (
                  <tab.icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                )}
              </span>
              <span>{tab.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
