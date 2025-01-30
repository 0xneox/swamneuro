import styled from '@emotion/styled';

export const TasksCard = styled.div`
  background: #111111;
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid #2a2a2a;
`;

export const Title = styled.h2`
  font-size: 1.25rem;
  color: #a0a0a0;
  margin-bottom: 1.5rem;
`;

export const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .empty-state {
    color: #a0a0a0;
    text-align: center;
    padding: 2rem;
    border: 1px dashed #2a2a2a;
    border-radius: 8px;
  }
`;

export const TaskItem = styled.div`
  background: #1a1a1a;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
`;

export const TaskInfo = styled.div`
  flex: 1;

  h3 {
    color: #ffffff;
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: #a0a0a0;
    font-size: 0.875rem;
  }
`;

export const Status = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  min-width: 120px;

  span {
    color: #00ff94;
    font-size: 0.875rem;
    font-weight: bold;
  }
`;

export const Progress = styled.div`
  width: 100%;
  height: 4px;
  background: #2a2a2a;
  border-radius: 2px;
  overflow: hidden;

  div {
    height: 100%;
    background: #00ff94;
    transition: width 0.3s ease;
  }
`;
