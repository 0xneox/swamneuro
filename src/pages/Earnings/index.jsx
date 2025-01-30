import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import styled from '@emotion/styled';

const EarningsContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: #1a1a1a;
  border-radius: 8px;
  padding: 1.5rem;
  
  h3 {
    color: #888;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
  
  strong {
    color: #fff;
    font-size: 1.8rem;
    display: block;
  }
`;

const HistoryTable = styled.div`
  background: #1a1a1a;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;

  h2 {
    color: #fff;
    margin-bottom: 1rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    
    th, td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #333;
    }

    th {
      color: #888;
      font-weight: normal;
    }

    td {
      color: #fff;
    }
  }
`;

const Earnings = () => {
  const { publicKey } = useWallet();
  const [earnings, setEarnings] = useState({
    today: 0,
    total: 0,
    multiplier: 1,
    history: []
  });

  const fetchEarnings = async () => {
    if (!publicKey) return;

    try {
      const response = await fetch(`/api/earnings/${publicKey.toString()}`);
      if (!response.ok) {
        throw new Error('HTTP error! status: ' + response.status);
      }
      const data = await response.json();
      setEarnings(data);
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
      // Set default state on error
      setEarnings({
        today: 0,
        total: 0,
        multiplier: 1,
        history: []
      });
    }
  };

  useEffect(() => {
    fetchEarnings();
    // Refresh data every minute
    const interval = setInterval(fetchEarnings, 60000);
    return () => clearInterval(interval);
  }, [publicKey]);

  return (
    <EarningsContainer>
      <StatsGrid>
        <StatCard>
          <h3>Today's Earnings</h3>
          <strong>{earnings.today.toFixed(2)} NEURO</strong>
        </StatCard>
        <StatCard>
          <h3>Total Earnings</h3>
          <strong>{earnings.total.toFixed(2)} NEURO</strong>
        </StatCard>
        <StatCard>
          <h3>Current Multiplier</h3>
          <strong>{earnings.multiplier}x</strong>
        </StatCard>
      </StatsGrid>

      <HistoryTable>
        <h2>Earnings History</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Task Type</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {earnings.history.map((item, index) => (
              <tr key={index}>
                <td>{new Date(item.timestamp).toLocaleDateString()}</td>
                <td>{item.taskType}</td>
                <td>{item.amount.toFixed(2)} NEURO</td>
                <td>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </HistoryTable>
    </EarningsContainer>
  );
};

export default Earnings;
