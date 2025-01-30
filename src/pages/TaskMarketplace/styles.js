import styled from '@emotion/styled';

export const MarketplaceContainer = styled.div`
  padding: 2rem;
  min-height: 100vh;
  background-color: #0a0a0a;
  color: #ffffff;
`;

export const TaskGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;

  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 4rem;
    color: #a0a0a0;
    border: 1px dashed #2a2a2a;
    border-radius: 12px;
  }
`;

export const Header = styled.div`
  margin-bottom: 2rem;

  h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #ffffff;
  }

  p {
    color: #a0a0a0;
    font-size: 1.1rem;
  }
`;

export const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  width: 100%;
  color: #a0a0a0;
`;

export const ErrorState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #ff4444;
  background: rgba(255, 68, 68, 0.1);
  border-radius: 12px;
  margin: 2rem 0;

  h3 {
    margin-bottom: 1rem;
  }

  button {
    background: #ff4444;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 1rem;

    &:hover {
      background: #ff2222;
    }
  }
`;
