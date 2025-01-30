import styled from '@emotion/styled';

export const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: #0a0a0a;
  color: #ffffff;
`;

export const Card = styled.div`
  background: #111111;
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 600px;
  border: 1px solid #2a2a2a;
`;

export const OnboardingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: var(--primary-bg);
  color: var(--text-primary);
`;

export const StepContainer = styled.div`
  max-width: 600px;
  width: 100%;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

export const ProgressBar = styled.div`
  width: 100%;
  max-width: 600px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.progress}%;
    background: var(--accent-green);
    transition: width 0.3s ease;
  }
`;

export const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

export const Step = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.active ? '#00ff94' : '#2a2a2a'};
  transition: background 0.2s ease;
`;

export const StepTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #ffffff;
`;

export const StepContent = styled.div`
  margin: 2rem 0;

  h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    background: linear-gradient(to right, var(--accent-green), var(--solana-purple));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  p {
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 1rem 0;

    li {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #a0a0a0;
      margin-bottom: 0.5rem;

      &:before {
        content: "•";
        color: #00ff94;
      }
    }
  }
`;

export const NextButton = styled.button`
  background: var(--accent-green);
  color: var(--primary-bg);
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  width: 100%;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 255, 148, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: var(--text-secondary);
  }
`;

export const ErrorMessage = styled.div`
  color: #ff4d4d;
  background: rgba(255, 77, 77, 0.1);
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  border: 1px solid rgba(255, 77, 77, 0.2);
  font-size: 0.9rem;
`;
