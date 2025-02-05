import React from 'react';
import { useRecoilValue } from 'recoil';
import { taskStatsState } from '../../../../services/taskService';
import { TasksCard, Title, TaskList, TaskItem, TaskInfo, Status, Progress } from './styles';

const ActiveTasks = () => {
  const stats = useRecoilValue(taskStatsState) || { activeTasks: [] };

  return (
    <TasksCard>
      <Title>Active Tasks</Title>
      
      <TaskList>
        {stats.activeTasks?.length > 0 ? (
          stats.activeTasks.map(task => (
            <TaskItem key={task.id}>
              <TaskInfo>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
              </TaskInfo>
              
              <Status>
                <span>{task.status}</span>
                <Progress value={task.progress || 0}>
                  <div style={{ width: `${task.progress || 0}%` }} />
                </Progress>
              </Status>
            </TaskItem>
          ))
        ) : (
          <p className="empty-state">No active tasks. Visit the marketplace to find new tasks.</p>
        )}
      </TaskList>
    </TasksCard>
  );
};

export default ActiveTasks;
