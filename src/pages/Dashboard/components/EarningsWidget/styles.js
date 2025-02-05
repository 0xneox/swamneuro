import styled from '@emotion/styled';

export const Widget = styled.div`
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

export const Amount = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #00ff94;
  margin-bottom: 2rem;
`;

export const StatsGrid = styled.div`
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
