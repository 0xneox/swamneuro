import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { swarmState } from '../../services/swarmService';
import styled from '@emotion/styled';
import { calculateDeviceScore } from '../../utils/webgpu';

const ComputeContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const StatusPanel = styled.div`
  background: #1a1a1a;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  color: #fff;
  margin-bottom: 1rem;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const StatItem = styled.div`
  background: #2a2a2a;
  padding: 1rem;
  border-radius: 6px;
  
  h3 {
    color: #888;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
  
  strong {
    color: #fff;
    font-size: 1.2rem;
    display: block;
  }

  small {
    color: #666;
    font-size: 0.8rem;
    display: block;
    margin-top: 0.25rem;
  }
`;

const DetailPanel = styled.div`
  background: #1a1a1a;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1.5rem;

  h3 {
    color: #fff;
    margin-bottom: 1rem;
  }

  pre {
    background: #2a2a2a;
    padding: 1rem;
    border-radius: 4px;
    color: #fff;
    font-family: monospace;
    overflow-x: auto;
  }
`;

const GPUList = styled.div`
  margin-top: 1.5rem;
  
  h3 {
    color: #fff;
    margin-bottom: 1rem;
  }
`;

const GPUItem = styled.div`
  background: #2a2a2a;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  
  h4 {
    color: #fff;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #888;
    margin: 0.25rem 0;
  }
`;

const ComputeNode = () => {
  const swarm = useRecoilValue(swarmState);
  const [deviceInfo, setDeviceInfo] = useState({
    status: 'Initializing',
    gpu: 'Detecting...',
    vendor: 'Unknown',
    architecture: 'Unknown',
    computeScore: 0,
    vram: 0,
    capabilities: null,
    allGpus: []
  });

  useEffect(() => {
    const initDevice = async () => {
      try {
        const score = await calculateDeviceScore();
        setDeviceInfo({
          status: 'Ready',
          gpu: score.gpu,
          vendor: score.vendor,
          architecture: score.architecture,
          computeScore: score.tflops,
          vram: score.vram,
          capabilities: score.capabilities,
          allGpus: score.allGpus || []
        });
      } catch (error) {
        console.error('Failed to initialize device:', error);
        setDeviceInfo(prev => ({
          ...prev,
          status: 'Error',
          error: error.message
        }));
      }
    };

    initDevice();
  }, []);

  return (
    <ComputeContainer>
      <StatusPanel>
        <Title>Compute Node Status</Title>
        <Stats>
          <StatItem>
            <h3>Status</h3>
            <strong>{deviceInfo.status}</strong>
          </StatItem>
          <StatItem>
            <h3>Primary GPU</h3>
            <strong>{deviceInfo.gpu}</strong>
            <small>{deviceInfo.vendor}</small>
          </StatItem>
          <StatItem>
            <h3>Compute Score</h3>
            <strong>{deviceInfo.computeScore.toFixed(2)} TFLOPS</strong>
          </StatItem>
          <StatItem>
            <h3>VRAM</h3>
            <strong>{(deviceInfo.vram / (1024 * 1024 * 1024)).toFixed(2)} GB</strong>
          </StatItem>
        </Stats>
      </StatusPanel>

      {deviceInfo.allGpus && deviceInfo.allGpus.length > 0 && (
        <GPUList>
          <h3>Available GPUs</h3>
          {deviceInfo.allGpus.map((gpu, index) => (
            <GPUItem key={index}>
              <h4>{gpu.renderer}</h4>
              <p>Vendor: {gpu.vendor}</p>
            </GPUItem>
          ))}
        </GPUList>
      )}

      {deviceInfo.capabilities && (
        <DetailPanel>
          <h3>Device Capabilities</h3>
          <pre>
            {JSON.stringify({
              vendor: deviceInfo.vendor,
              architecture: deviceInfo.architecture,
              capabilities: deviceInfo.capabilities
            }, null, 2)}
          </pre>
        </DetailPanel>
      )}
    </ComputeContainer>
  );
};

export default ComputeNode;
