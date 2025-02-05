import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import styled from '@emotion/styled';
import taskService from '../../services/taskService';

const TasksContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const TaskGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const TaskCard = styled.div`
  background: #1a1a1a;
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }

  h3 {
    color: #fff;
    margin-bottom: 1rem;
  }

  p {
    color: #888;
    margin-bottom: 1rem;
  }
`;

const Stats = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #333;

  span {
    color: #666;
    font-size: 0.9rem;
  }

  strong {
    color: #fff;
    display: block;
    margin-top: 0.25rem;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const FilterButton = styled.button`
  background: ${props => props.active ? '#333' : '#1a1a1a'};
  color: ${props => props.active ? '#fff' : '#888'};
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #333;
    color: #fff;
  }
`;

const Tasks = () => {
  const { publicKey } = useWallet();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const availableTasks = await taskService.fetchAvailableTasks();
        setTasks(availableTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    };

    loadTasks();
  }, []);

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.type === filter;
  });

  return (
    <TasksContainer>
      <FilterBar>
        <FilterButton 
          active={filter === 'all'} 
          onClick={() => setFilter('all')}
        >
          All Tasks
        </FilterButton>
        <FilterButton 
          active={filter === 'compute'} 
          onClick={() => setFilter('compute')}
        >
          Compute Tasks
        </FilterButton>
        <FilterButton 
          active={filter === 'storage'} 
          onClick={() => setFilter('storage')}
        >
          Storage Tasks
        </FilterButton>
      </FilterBar>

      <TaskGrid>
        {filteredTasks.map(task => (
          <TaskCard key={task.id}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <Stats>
              <div>
                <span>Reward</span>
                <strong>{task.reward} NEURO</strong>
              </div>
              <div>
                <span>Difficulty</span>
                <strong>{task.difficulty}</strong>
              </div>
              <div>
                <span>Time</span>
                <strong>{task.estimatedTime}m</strong>
              </div>
            </Stats>
          </TaskCard>
        ))}
      </TaskGrid>
    </TasksContainer>
  );
};

export default Tasks;
