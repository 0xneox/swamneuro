import React from 'react';
import { useRecoilValue } from 'recoil';
import { taskStatsState } from '../../../../services/taskService';
import { Widget, Title, Amount, StatsGrid, StatItem } from './styles';

const EarningsWidget = () => {
  const stats = useRecoilValue(taskStatsState);

  return (
    <Widget>
      <Title>Total Earnings</Title>
      <Amount>{stats.totalEarnings.toFixed(2)} NEURO</Amount>
      
      <StatsGrid>
        <StatItem>
          <span>Tasks Completed</span>
          <strong>{stats.completed}</strong>
        </StatItem>
        <StatItem>
          <span>Active Tasks</span>
          <strong>{stats.active}</strong>
        </StatItem>
        <StatItem>
          <span>Success Rate</span>
          <strong>{stats.successRate}%</strong>
        </StatItem>
      </StatsGrid>
    </Widget>
  );
};

export default EarningsWidget;
