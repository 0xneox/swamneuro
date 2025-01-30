import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { checkWebGPUSupport, calculateDeviceScore } from '../../utils/webgpu';
import {
  OnboardingContainer,
  StepContainer,
  ProgressBar,
  StepContent,
  NextButton,
  ErrorMessage
} from './styles';

const OnboardingSteps = {
  BROWSER_CHECK: 0,
  DEVICE_SCAN: 1,
  WALLET_CONNECT: 2
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { connected } = useWallet();
  const [currentStep, setCurrentStep] = useState(OnboardingSteps.BROWSER_CHECK);
  const [deviceSupport, setDeviceSupport] = useState(null);
  const [deviceScore, setDeviceScore] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkBrowserSupport();
  }, []);

  useEffect(() => {
    if (connected && currentStep === OnboardingSteps.WALLET_CONNECT) {
      navigate('/dashboard');
    }
  }, [connected, currentStep, navigate]);

  const checkBrowserSupport = async () => {
    try {
      await checkWebGPUSupport();
      setDeviceSupport(true);
      setError(null);
    } catch (error) {
      setDeviceSupport(false);
      setError(error.message);
    }
  };

  const scanDevice = async () => {
    try {
      const score = await calculateDeviceScore();
      if (score.error) {
        throw new Error(score.error);
      }
      setDeviceScore(score);
      setCurrentStep(OnboardingSteps.WALLET_CONNECT);
      setError(null);
    } catch (error) {
      console.error('Failed to scan device:', error);
      setError(error.message);
    }
  };

  const handleNext = async () => {
    setError(null);
    switch (currentStep) {
      case OnboardingSteps.BROWSER_CHECK:
        if (deviceSupport) {
          setCurrentStep(OnboardingSteps.DEVICE_SCAN);
        }
        break;
      case OnboardingSteps.DEVICE_SCAN:
        await scanDevice();
        break;
      case OnboardingSteps.WALLET_CONNECT:
        // Wallet connection is handled by the wallet adapter
        break;
      default:
        break;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case OnboardingSteps.BROWSER_CHECK:
        return (
          <StepContent>
            <h2>Browser Compatibility Check</h2>
            <p>Checking if your browser supports WebGPU...</p>
            {deviceSupport === true && <p>✅ Your browser is compatible!</p>}
            {deviceSupport === false && (
              <ErrorMessage>
                ❌ Your browser doesn't support WebGPU. Please use Chrome Canary or Edge Canary.
              </ErrorMessage>
            )}
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </StepContent>
        );
      case OnboardingSteps.DEVICE_SCAN:
        return (
          <StepContent>
            <h2>Device Scan</h2>
            <p>Scanning your GPU capabilities...</p>
            {deviceScore && (
              <>
                <p>✅ Device scan complete!</p>
                <p>Estimated Performance: {deviceScore.tflops} TFLOPS</p>
                <p>Available Features: {deviceScore.features.length}</p>
              </>
            )}
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </StepContent>
        );
      case OnboardingSteps.WALLET_CONNECT:
        return (
          <StepContent>
            <h2>Connect Your Wallet</h2>
            <p>Connect your Solana wallet to start earning.</p>
            {connected && <p>✅ Wallet connected!</p>}
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </StepContent>
        );
      default:
        return null;
    }
  };

  return (
    <OnboardingContainer>
      <ProgressBar progress={(currentStep / 2) * 100} />
      <StepContainer>
        {renderStepContent()}
        <NextButton
          onClick={handleNext}
          disabled={
            (currentStep === OnboardingSteps.BROWSER_CHECK && !deviceSupport) ||
            (currentStep === OnboardingSteps.WALLET_CONNECT && !connected)
          }
        >
          {currentStep === OnboardingSteps.WALLET_CONNECT ? 'Finish' : 'Next'}
        </NextButton>
      </StepContainer>
    </OnboardingContainer>
  );
};

export default Onboarding;
