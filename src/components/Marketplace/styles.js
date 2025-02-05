import styled from '@emotion/styled';

export const PageContainer = styled.div`
  padding: ${props => props.theme.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

export const Title = styled.h1`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
`;

export const RefreshButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: ${props => `${props.theme.spacing.sm} ${props.theme.spacing.md}`};
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: ${props => props.theme.colors.primaryDark};
  }
`;

export const TasksContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

export const TaskCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 8px;
  padding: ${props => props.theme.spacing.lg};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

export const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.md};
`;

export const TaskType = styled.span`
  background: ${props => props.theme.colors.primary}20;
  color: ${props => props.theme.colors.primary};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.875rem;
`;

export const TaskReward = styled.span`
  color: ${props => props.theme.colors.success};
  font-weight: 600;
`;

export const TaskDetails = styled.div`
  margin-top: ${props => props.theme.spacing.md};
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text.secondary};

  > div {
    margin-bottom: ${props => props.theme.spacing.xs};
  }
`;

export const NoTasks = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.text.secondary};
  grid-column: 1 / -1;
`;
