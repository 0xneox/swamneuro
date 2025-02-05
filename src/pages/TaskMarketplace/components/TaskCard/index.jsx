import React from 'react';
import { useRecoilValue } from 'recoil';
import { swarmState } from '../../../../services/swarmService';
import { Card, Header, Title, Reward, Stats, StatItem, AcceptButton } from './styles';

const TaskCard = ({ task, onAccept }) => {
  const swarm = useRecoilValue(swarmState);
  const canAccept = swarm.members.length > 0 && !swarm.activeTask;

  return (
    <Card>
      <Header>
        <Title>{task.title}</Title>
        <Reward>{task.reward} NEURO</Reward>
      </Header>

      <p>{task.description}</p>

      <Stats>
        <StatItem>
          <span>Difficulty</span>
          <strong>{task.difficulty}</strong>
        </StatItem>
        <StatItem>
          <span>Time Estimate</span>
          <strong>{task.estimatedTime}</strong>
        </StatItem>
        <StatItem>
          <span>Success Rate</span>
          <strong>{task.successRate}%</strong>
        </StatItem>
      </Stats>

      <AcceptButton 
        onClick={() => onAccept(task.id)}
        disabled={!canAccept}
      >
        {canAccept ? 'Accept Task' : 'Join Swarm First'}
      </AcceptButton>
    </Card>
  );
};

export default TaskCard;
