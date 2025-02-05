import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useSetRecoilState } from 'recoil';
import styled from 'styled-components';
import { walletState } from '../../state/atoms';
import theme from '../../theme';

const NavContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: linear-gradient(90deg, #7C3AED 0%, #6D28D9 100%);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  align-items: center;
  padding: 0 24px;
`;

const Logo = styled(Link)`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #ffffff;
  text-decoration: none;
  margin-right: ${theme.spacing.xl};
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
  margin-right: auto;
`;

const NavLink = styled(Link)`
  color: ${props => props.active ? '#ffffff' : 'rgba(255, 255, 255, 0.8)'};
  text-decoration: none;
  font-weight: ${props => props.active ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.normal};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.radii.base};
  transition: all ${theme.transitions.base};

  &:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const WalletButton = styled(WalletMultiButton)`
  background: rgba(255, 255, 255, 0.1) !important;
  transition: background ${theme.transitions.base} !important;

  &:hover {
    background: rgba(255, 255, 255, 0.2) !important;
  }
`;

const Navbar = () => {
  const location = useLocation();
  const { publicKey, connected } = useWallet();
  const setWallet = useSetRecoilState(walletState);

  useEffect(() => {
    if (connected && publicKey) {
      setWallet({
        address: publicKey.toString(),
        connected: true
      });
    } else {
      setWallet(null);
    }
  }, [connected, publicKey, setWallet]);

  return (
    <NavContainer>
      <Logo to="/">SwamNeuro</Logo>
      <NavLinks>
        <NavLink to="/dashboard" active={location.pathname === '/dashboard'}>
          Dashboard
        </NavLink>
        <NavLink to="/marketplace" active={location.pathname === '/marketplace'}>
          Tasks
        </NavLink>
        <NavLink to="/compute" active={location.pathname === '/compute'}>
          Compute
        </NavLink>
        <NavLink to="/earnings" active={location.pathname === '/earnings'}>
          Earnings
        </NavLink>
      </NavLinks>
      <WalletButton />
    </NavContainer>
  );
};

export default Navbar;
