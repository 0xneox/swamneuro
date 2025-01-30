import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { RecoilRoot, useSetRecoilState, useRecoilValue } from 'recoil';
import styled, { ThemeProvider } from 'styled-components';
import { walletState, deviceState } from './state/atoms';
import { getDeviceCapabilities } from './utils/deviceDetection';
import { registerDevice, updateDeviceStatus } from './services/api';
import theme from './theme';

// Components and Pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const TaskMarketplace = React.lazy(() => import('./pages/Tasks'));
const ComputeNode = React.lazy(() => import('./pages/ComputeNode'));
const Earnings = React.lazy(() => import('./pages/Earnings'));
const Layout = React.lazy(() => import('./components/Layout'));
const Marketplace = React.lazy(() => import('./components/Marketplace'));
const Navbar = React.lazy(() => import('./components/Navbar'));

// Default styles that can be overridden by your app
import '@solana/wallet-adapter-react-ui/styles.css';

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
`;

const ContentContainer = styled.div`
  padding-top: 64px;
`;

const DeviceRegistration = () => {
  const wallet = useRecoilValue(walletState);
  const setDevice = useSetRecoilState(deviceState);

  useEffect(() => {
    const registerDeviceAndStartHeartbeat = async () => {
      if (!wallet?.address) return;

      try {
        // Get device capabilities
        const capabilities = await getDeviceCapabilities();
        console.log('Device capabilities:', capabilities);

        // Register device
        const deviceInfo = {
          walletAddress: wallet.address,
          ...capabilities
        };

        const device = await registerDevice(deviceInfo);
        console.log('Device registered:', device);
        setDevice(device);

        // Start heartbeat
        const heartbeatInterval = setInterval(async () => {
          try {
            const updatedDevice = await updateDeviceStatus(device.id);
            setDevice(updatedDevice);
          } catch (error) {
            console.error('Error updating device status:', error);
          }
        }, 30000);

        return () => clearInterval(heartbeatInterval);
      } catch (error) {
        console.error('Error registering device:', error);
      }
    };

    registerDeviceAndStartHeartbeat();
  }, [wallet?.address, setDevice]);

  return null;
};

const App = () => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = 'https://api.devnet.solana.com';
  const wallets = [new PhantomWalletAdapter()];

  return (
    <RecoilRoot>
      <ThemeProvider theme={theme}>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <Router>
                <AppContainer>
                  <Navbar />
                  <DeviceRegistration />
                  <ContentContainer>
                    <Suspense fallback={<div>Loading...</div>}>
                      <Routes>
                        <Route path="/" element={<Layout />}>
                          <Route index element={<Navigate to="/dashboard" replace />} />
                          <Route path="dashboard" element={
                            <Suspense fallback={<div>Loading Dashboard...</div>}>
                              <Dashboard />
                            </Suspense>
                          } />
                          <Route path="marketplace" element={
                            <Suspense fallback={<div>Loading Marketplace...</div>}>
                              <TaskMarketplace />
                            </Suspense>
                          } />
                          <Route path="compute" element={
                            <Suspense fallback={<div>Loading Compute Node...</div>}>
                              <ComputeNode />
                            </Suspense>
                          } />
                          <Route path="earnings" element={
                            <Suspense fallback={<div>Loading Earnings...</div>}>
                              <Earnings />
                            </Suspense>
                          } />
                          <Route path="market" element={
                            <Suspense fallback={<div>Loading Market...</div>}>
                              <Marketplace />
                            </Suspense>
                          } />
                        </Route>
                      </Routes>
                    </Suspense>
                  </ContentContainer>
                </AppContainer>
              </Router>
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </ThemeProvider>
    </RecoilRoot>
  );
};

export default App;
