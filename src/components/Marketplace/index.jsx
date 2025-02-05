import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { taskListState } from '../../services/taskService';
import styled from '@emotion/styled';

const MarketplaceContainer = styled.div`
  padding: ${props => props.theme.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
`;

const TaskGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-top: ${props => props.theme.spacing.xl};
`;

const TaskCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 8px;
  padding: ${props => props.theme.spacing.lg};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const TaskType = styled.span`
  background: ${props => props.theme.colors.primary}20;
  color: ${props => props.theme.colors.primary};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.875rem;
`;

const TaskReward = styled.span`
  color: ${props => props.theme.colors.success};
  font-weight: 600;
`;

const TaskDetails = styled.div`
  margin-top: ${props => props.theme.spacing.md};
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text.secondary};
`;

const NoTasks = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.text.secondary};
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.error};
  background: ${props => props.theme.colors.error}10;
  border-radius: 8px;
  margin-top: ${props => props.theme.spacing.lg};
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.text.secondary};
`;

const RefreshButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  cursor: pointer;
  transition: background 0.2s;
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};

  &:hover {
    background: ${props => props.theme.colors.primaryDark};
  }

  &:disabled {
    background: ${props => props.theme.colors.text.disabled};
    cursor: not-allowed;
  }
`;

const formatTaskType = (type) => {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const Marketplace = () => {
  const [tasks, setTasks] = useRecoilState(taskListState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await fetch('http://localhost:8080/api/tasks', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.statusText}`);
      }
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 10000);
    return () => clearInterval(interval);
  }, [setTasks]);

  if (loading) {
    return (
      <MarketplaceContainer>
        <h1>Available Tasks</h1>
        <LoadingSpinner>Loading tasks...</LoadingSpinner>
      </MarketplaceContainer>
    );
  }

  if (error) {
    return (
      <MarketplaceContainer>
        <h1>Available Tasks</h1>
        <ErrorMessage>
          {error}
          <RefreshButton onClick={fetchTasks} disabled={refreshing}>
            Try Again
          </RefreshButton>
        </ErrorMessage>
      </MarketplaceContainer>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <MarketplaceContainer>
        <h1>Available Tasks</h1>
        <NoTasks>
          No tasks available at the moment. Please check back later.
          <RefreshButton onClick={fetchTasks} disabled={refreshing}>
            Refresh
          </RefreshButton>
        </NoTasks>
      </MarketplaceContainer>
    );
  }

  return (
    <MarketplaceContainer>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Available Tasks</h1>
        <RefreshButton onClick={fetchTasks} disabled={refreshing}>
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </RefreshButton>
      </div>
      <TaskGrid>
        {tasks.map(task => (
          <TaskCard key={task.id}>
            <TaskHeader>
              <TaskType>{formatTaskType(task.type)}</TaskType>
              <TaskReward>{task.reward} SOL</TaskReward>
            </TaskHeader>
            <TaskDetails>
              <div>Task ID: {task.id}</div>
              <div>Status: {task.status}</div>
              <div>Created: {new Date(task.createdAt).toLocaleString()}</div>
              {task.data && (
                <div>
                  {task.type === 'matrix_multiplication' && (
                    <div>Matrix Size: {task.data.matrixA.length}x{task.data.matrixA[0].length}</div>
                  )}
                  {task.type === 'neural_network' && (
                    <div>Network Size: {task.data.inputs.length} inputs</div>
                  )}
                  {task.type === 'image_processing' && (
                    <div>Image Size: {task.data.width}x{task.data.height}</div>
                  )}
                </div>
              )}
            </TaskDetails>
          </TaskCard>
        ))}
      </TaskGrid>
    </MarketplaceContainer>
  );
};

export default Marketplace;
