import styled from '@emotion/styled';

export const Card = styled.div`
  background: #111111;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #2a2a2a;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: #00ff94;
  }

  p {
    color: #a0a0a0;
    margin: 1rem 0;
    line-height: 1.6;
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

export const Title = styled.h3`
  font-size: 1.25rem;
  color: #ffffff;
`;

export const Reward = styled.div`
  background: #1a1a1a;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  color: #00ff94;
  font-weight: bold;
`;

export const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin: 1.5rem 0;
`;

export const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  span {
    font-size: 0.875rem;
    color: #a0a0a0;
  }

  strong {
    color: #ffffff;
  }
`;

export const AcceptButton = styled.button`
  width: 100%;
  background: ${props => props.disabled ? '#2a2a2a' : '#00ff94'};
  color: ${props => props.disabled ? '#a0a0a0' : '#000000'};
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: bold;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #00cc76;
  }
`;
