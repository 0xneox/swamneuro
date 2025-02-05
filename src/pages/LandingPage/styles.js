import styled from '@emotion/styled';

export const Container = styled.div`
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 4rem;
  background-color: var(--primary-bg);
  color: var(--text-primary);
`;

export const Hero = styled.section`
  text-align: center;
  padding: 4rem 0;

  h1 {
    font-size: 3.5rem;
    margin-bottom: 1.5rem;
    background: linear-gradient(to right, var(--accent-green), var(--solana-purple));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  p {
    font-size: 1.5rem;
    color: var(--text-secondary);
    margin-bottom: 2rem;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
  }
`;

export const CTAButton = styled.button`
  background: var(--accent-green);
  color: var(--primary-bg);
  font-size: 1.2rem;
  padding: 1rem 2rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: bold;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 255, 148, 0.3);
    background: #00cc76;
  }
`;

export const Features = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

export const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: 2rem;
  border-radius: 12px;
  transition: transform 0.2s ease;

  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: var(--accent-green);
  }

  p {
    color: var(--text-secondary);
    line-height: 1.6;
  }

  &:hover {
    transform: translateY(-4px);
  }
`;
