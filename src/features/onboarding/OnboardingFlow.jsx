import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecoilState } from 'recoil';
import { userState } from '../../state/userState';
import { checkWebGPUSupport } from '../../utils/webgpu';

const steps = [
  {
    id: 'welcome',
    title: '🚀 Welcome to Neurolov Network',
    description: 'Join the decentralized AI revolution and earn while your device contributes to groundbreaking AI projects.',
    action: 'Get Started'
  },
  {
    id: 'device-check',
    title: '🖥️ Device Compatibility Check',
    description: 'Let\'s check if your device can participate in the network.',
    action: 'Check My Device'
  },
  {
    id: 'wallet-connect',
    title: '👛 Connect Your Wallet',
    description: 'Connect your Solana wallet to receive rewards.',
    action: 'Connect Wallet'
  },
  {
    id: 'preferences',
    title: '⚙️ Set Your Preferences',
    description: 'Configure how you want to participate in the network.',
    action: 'Configure'
  },
  {
    id: 'complete',
    title: '🎉 You\'re All Set!',
    description: 'Your device is now part of the Neurolov Network.',
    action: 'Start Earning'
  }
];

export const OnboardingFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [deviceScore, setDeviceScore] = useState(null);
  const [user, setUser] = useRecoilState(userState);

  const handleDeviceCheck = async () => {
    try {
      const { adapter, device } = await checkWebGPUSupport();
      const score = await calculateDeviceScore();
      setDeviceScore(score);
      
      // Show estimated earnings based on device score
      const estimatedDaily = calculateEstimatedEarnings(score);
      setUser(prev => ({
        ...prev,
        deviceScore: score,
        estimatedEarnings: estimatedDaily
      }));
      
      return true;
    } catch (error) {
      console.error('Device check failed:', error);
      return false;
    }
  };

  const handlePreferences = (preferences) => {
    setUser(prev => ({
      ...prev,
      preferences: {
        ...preferences,
        maxCpuUsage: preferences.maxCpuUsage || 70,
        maxGpuUsage: preferences.maxGpuUsage || 80,
        activeHours: preferences.activeHours || 'always',
        minBatteryLevel: preferences.minBatteryLevel || 20
      }
    }));
  };

  const calculateEstimatedEarnings = (score) => {
    const baseRate = 0.1; // $NEURO per TFLOP per day
    return score.tflops * baseRate * 24; // Daily estimate
  };

  const renderStep = () => {
    const step = steps[currentStep];
    
    return (
      <motion.div
        key={step.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="onboarding-step"
      >
        <h2>{step.title}</h2>
        <p>{step.description}</p>
        
        {step.id === 'device-check' && deviceScore && (
          <div className="device-score">
            <h3>Your Device Score</h3>
            <div className="score-details">
              <div className="score-item">
                <label>Computing Power</label>
                <value>{deviceScore.tflops} TFLOPS</value>
              </div>
              <div className="score-item">
                <label>Memory</label>
                <value>{deviceScore.vram}GB VRAM</value>
              </div>
              <div className="score-item">
                <label>Estimated Daily Earnings</label>
                <value>{user.estimatedEarnings.toFixed(2)} $NEURO</value>
              </div>
            </div>
          </div>
        )}
        
        {step.id === 'preferences' && (
          <div className="preferences-form">
            <PreferencesForm onSubmit={handlePreferences} />
          </div>
        )}
        
        <button
          className="next-step"
          onClick={() => {
            if (step.id === 'device-check') {
              handleDeviceCheck().then(success => {
                if (success) setCurrentStep(prev => prev + 1);
              });
            } else {
              setCurrentStep(prev => prev + 1);
            }
          }}
        >
          {step.action}
        </button>
      </motion.div>
    );
  };

  return (
    <div className="onboarding-flow">
      <div className="progress-bar">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`progress-step ${index <= currentStep ? 'completed' : ''}`}
          />
        ))}
      </div>
      
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </div>
  );
};

const PreferencesForm = ({ onSubmit }) => {
  const [preferences, setPreferences] = useState({
    maxCpuUsage: 70,
    maxGpuUsage: 80,
    activeHours: 'always',
    minBatteryLevel: 20
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit(preferences);
    }}>
      <div className="preference-item">
        <label>Maximum CPU Usage</label>
        <input
          type="range"
          min="10"
          max="90"
          value={preferences.maxCpuUsage}
          onChange={(e) => setPreferences(prev => ({
            ...prev,
            maxCpuUsage: parseInt(e.target.value)
          }))}
        />
        <span>{preferences.maxCpuUsage}%</span>
      </div>

      <div className="preference-item">
        <label>Maximum GPU Usage</label>
        <input
          type="range"
          min="10"
          max="90"
          value={preferences.maxGpuUsage}
          onChange={(e) => setPreferences(prev => ({
            ...prev,
            maxGpuUsage: parseInt(e.target.value)
          }))}
        />
        <span>{preferences.maxGpuUsage}%</span>
      </div>

      <div className="preference-item">
        <label>Active Hours</label>
        <select
          value={preferences.activeHours}
          onChange={(e) => setPreferences(prev => ({
            ...prev,
            activeHours: e.target.value
          }))}
        >
          <option value="always">Always</option>
          <option value="when-idle">When Device is Idle</option>
          <option value="custom">Custom Schedule</option>
        </select>
      </div>

      <div className="preference-item">
        <label>Minimum Battery Level (for laptops)</label>
        <input
          type="range"
          min="10"
          max="50"
          value={preferences.minBatteryLevel}
          onChange={(e) => setPreferences(prev => ({
            ...prev,
            minBatteryLevel: parseInt(e.target.value)
          }))}
        />
        <span>{preferences.minBatteryLevel}%</span>
      </div>

      <button type="submit">Save Preferences</button>
    </form>
  );
};
