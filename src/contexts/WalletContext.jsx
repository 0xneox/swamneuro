import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, BackpackWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

const WalletContext = createContext({});

// Mock wallet for development
const mockWallet = {
  address: '0x1234567890abcdef1234567890abcdef12345678',
  connected: true,
  publicKey: {
    toString: () => '0x1234567890abcdef1234567890abcdef12345678'
  },
  signMessage: async (message) => {
    console.log('Mock signing message:', message);
    return new Uint8Array(32); // Mock signature
  },
  signTransaction: async (transaction) => {
    console.log('Mock signing transaction:', transaction);
    return transaction;
  }
};

export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const endpoint = clusterApiUrl('devnet');
  
  useEffect(() => {
    // Use mock wallet for development
    setWallet(mockWallet);
  }, []);

  const value = {
    wallet,
    connect: () => setWallet(mockWallet),
    disconnect: () => setWallet(null),
    isConnected: !!wallet
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletContext.Provider value={value}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletContext.Provider>
    </ConnectionProvider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
