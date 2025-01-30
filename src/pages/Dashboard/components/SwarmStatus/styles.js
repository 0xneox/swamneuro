import styled from '@emotion/styled';

export const StatusCard = styled.div`
  background: #111111;
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid #2a2a2a;
`;

export const Title = styled.h2`
  font-size: 1.25rem;
  color: #a0a0a0;
  margin-bottom: 1rem;
`;

export const StatusIndicator = styled.div`
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background: ${props => props.active ? '#00ff94' : '#2a2a2a'};
  color: ${props => props.active ? '#000000' : '#a0a0a0'};
  font-weight: bold;
  margin-bottom: 1.5rem;
`;

export const Info = styled.div`
  margin-top: 1.5rem;
`;

export const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
`;

export const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  span {
    font-size: 0.875rem;
    color: #a0a0a0;
  }

  strong {
    font-size: 1.25rem;
    color: #ffffff;
  }
`;
