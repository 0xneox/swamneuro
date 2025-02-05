import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Hero, CTAButton, Features, FeatureCard } from './styles';

const LandingPage = () => {
  console.log('LandingPage rendering');
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/onboarding');
  };

  const features = [
    {
      title: 'Earn While You Sleep',
      description: 'Your GPU mines AI tasks in the background, earning you NEURO tokens automatically.'
    },
    {
      title: 'Zero Setup Required',
      description: 'Just connect your wallet and start earning. No complex configuration needed.'
    },
    {
      title: 'Secure & Private',
      description: 'Your data stays local. All computation happens in your browser.'
    }
  ];

  return (
    <Container>
      <Hero>
        <h1>Turn Your Browser Into An AI Supercomputer</h1>
        <p>Join 50,000+ GPUs powering the future of AI. Earn crypto while you browse.</p>
        <CTAButton onClick={handleGetStarted}>
          Start Earning Now
        </CTAButton>
      </Hero>

      <Features>
        {features.map((feature, index) => (
          <FeatureCard key={index}>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </FeatureCard>
        ))}
      </Features>
    </Container>
  );
};

export default LandingPage;
