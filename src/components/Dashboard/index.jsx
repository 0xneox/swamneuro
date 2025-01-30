import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { walletState, deviceState } from '../../state/atoms';
import { getWalletStats } from '../../services/api';
import { formatNumber } from '../../utils/format';

const DashboardContainer = styled.div`
  padding: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.card.background};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;

  h3 {
    color: ${props => props.theme.colors.text.secondary};
    font-size: 1rem;
    margin: 0;
  }

  .value {
    color: ${props => props.theme.colors.text.primary};
    font-size: 1.5rem;
    font-weight: bold;
    margin: 0;
  }

  .subtitle {
    color: ${props => props.theme.colors.text.tertiary};
    font-size: 0.875rem;
    margin: 0;
  }
`;

const TasksContainer = styled.div`
  grid-column: 1 / -1;
  background: ${props => props.theme.colors.card.background};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  h2 {
    color: ${props => props.theme.colors.text.primary};
    margin: 0 0 1rem 0;
  }

  .empty-state {
    color: ${props => props.theme.colors.text.tertiary};
    text-align: center;
    padding: 2rem;
  }
`;

const Dashboard = () => {
  const wallet = useRecoilValue(walletState);
  const device = useRecoilValue(deviceState);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!wallet?.address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getWalletStats(wallet.address);
        console.log('Fetched wallet stats:', data);
        setStats(data);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [wallet?.address]);

  if (!wallet?.address) {
    return (
      <DashboardContainer>
        <TasksContainer>
          <div className="empty-state">
            Please connect your wallet to view your dashboard
          </div>
        </TasksContainer>
      </DashboardContainer>
    );
  }

  if (loading && !stats) {
    return (
      <DashboardContainer>
        <TasksContainer>
          <div className="empty-state">Loading dashboard stats...</div>
        </TasksContainer>
      </DashboardContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer>
        <TasksContainer>
          <div className="empty-state">{error}</div>
        </TasksContainer>
      </DashboardContainer>
    );
  }

  if (!stats) {
    return (
      <DashboardContainer>
        <TasksContainer>
          <div className="empty-state">No stats available</div>
        </TasksContainer>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <StatCard>
        <h3>Total Earnings</h3>
        <div className="value">{formatNumber(stats.earnings.total)} NEURO</div>
        <div className="subtitle">
          Last 24h: {formatNumber(stats.earnings.last24h)} NEURO
        </div>
      </StatCard>

      <StatCard>
        <h3>Tasks</h3>
        <div className="value">{stats.tasks.completed}</div>
        <div className="subtitle">
          Active: {stats.tasks.active} | Success Rate: {formatNumber(stats.tasks.successRate)}%
        </div>
      </StatCard>

      <StatCard>
        <h3>Swarm Status</h3>
        <div className="value">
          {stats.devices.active > 0 ? 'Active' : 'Inactive'}
        </div>
        <div className="subtitle">
          {stats.devices.active} of {stats.devices.total} devices online
        </div>
      </StatCard>

      <StatCard>
        <h3>Computing Power</h3>
        <div className="value">{formatNumber(stats.performance.totalTFLOPS)} TFLOPS</div>
        <div className="subtitle">
          Network Share: {formatNumber(stats.performance.powerShare)}%
        </div>
      </StatCard>

      <TasksContainer>
        <h2>Active Tasks</h2>
        {stats.tasks.active > 0 ? (
          <div>Tasks will be displayed here</div>
        ) : (
          <div className="empty-state">
            No active tasks. Visit the marketplace to find new tasks.
          </div>
        )}
      </TasksContainer>
    </DashboardContainer>
  );
};

export default Dashboard;
