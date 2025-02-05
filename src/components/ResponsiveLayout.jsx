import React from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { SwarmStats } from './SwarmStats';
import { TaskList } from './TaskList';
import { ReferralDashboard } from './ReferralDashboard';

export const ResponsiveLayout = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  return (
    <div className={`layout ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`}>
      <header className="app-header">
        <h1>Neurolov Network</h1>
        <div className="device-stats">
          {/* Show device compute score and status */}
          <DeviceStats />
        </div>
      </header>

      <main>
        {isMobile ? (
          // Mobile layout: Stack components vertically
          <>
            <SwarmStats compact={true} />
            <TaskList compact={true} />
            <ReferralDashboard compact={true} />
          </>
        ) : (
          // Desktop/Tablet layout: Grid layout
          <div className="dashboard-grid">
            <SwarmStats />
            <TaskList />
            <ReferralDashboard />
          </div>
        )}
      </main>

      <footer>
        <PowerControls />
        <NetworkStats />
      </footer>
    </div>
  );
};

const DeviceStats = () => {
  const { tflops, vram, status } = useDeviceStats();
  
  return (
    <div className="device-stats-panel">
      <div className="stat">
        <label>Computing Power:</label>
        <value>{tflops} TFLOPS</value>
      </div>
      <div className="stat">
        <label>VRAM:</label>
        <value>{vram} GB</value>
      </div>
      <div className={`status ${status}`}>
        {status === 'active' ? '⚡ Contributing' : '💤 Idle'}
      </div>
    </div>
  );
};
