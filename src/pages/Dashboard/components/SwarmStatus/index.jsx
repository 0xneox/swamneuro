import React from 'react';
import { useRecoilValue } from 'recoil';
import { swarmState } from '../../../../services/swarmService';
import { StatusCard, Title, StatusIndicator, Info, Stats, StatItem } from './styles';

const SwarmStatus = () => {
  const swarm = useRecoilValue(swarmState) || { members: [], totalPower: 0, userShare: 0 };

  return (
    <StatusCard>
      <Title>Swarm Status</Title>
      
      <StatusIndicator $isActive={swarm.members.length > 0}>
        {swarm.members.length > 0 ? 'Active' : 'Inactive'}
      </StatusIndicator>

      <Info>
        <Stats>
          <StatItem>
            <span>Members</span>
            <strong>{swarm.members.length}</strong>
          </StatItem>
          <StatItem>
            <span>Total Power</span>
            <strong>{swarm.totalPower?.toFixed(2) || '0.00'} TFLOPS</strong>
          </StatItem>
          <StatItem>
            <span>Your Share</span>
            <strong>{swarm.userShare?.toFixed(2) || '0.00'}%</strong>
          </StatItem>
        </Stats>
      </Info>
    </StatusCard>
  );
};

export default SwarmStatus;
