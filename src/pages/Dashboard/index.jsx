import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useWallet } from '@solana/wallet-adapter-react';
import { taskStatsState } from '../../services/taskService';
import { swarmState } from '../../services/swarmService';
import EarningsWidget from './components/EarningsWidget';
import SwarmStatus from './components/SwarmStatus';
import ActiveTasks from './components/ActiveTasks';
import { DashboardContainer, StatsGrid, ActionPanel } from './styles';

const Dashboard = () => {
  const wallet = useWallet();
  const taskStats = useRecoilValue(taskStatsState);
  const swarm = useRecoilValue(swarmState);
  const [earnings, setEarnings] = useState({
    today: 0,
    total: 0,
    multiplier: 1
  });

  useEffect(() => {
    // Initialize dashboard data
    if (wallet.publicKey) {
      fetchDashboardData();
    }
  }, [wallet.publicKey]);

  const fetchDashboardData = async () => {
    if (!wallet.publicKey) return;
    
    try {
      const response = await fetch(`/api/dashboard/${wallet.publicKey.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setEarnings(data.earnings || { today: 0, total: 0, multiplier: 1 });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Set default values on error
      setEarnings({ today: 0, total: 0, multiplier: 1 });
    }
  };

  return (
    <DashboardContainer>
      <StatsGrid>
        <EarningsWidget 
          earnings={earnings}
          onWithdraw={() => {/* Implement withdrawal */}}
        />
        <SwarmStatus 
          swarm={swarm}
          totalPower={swarm.totalPower}
        />
        <ActiveTasks 
          tasks={taskStats}
          onTaskAction={(taskId, action) => {/* Handle task actions */}}
        />
      </StatsGrid>
      <ActionPanel>
        {/* Add action buttons here */}
      </ActionPanel>
    </DashboardContainer>
  );
};

export default Dashboard;
