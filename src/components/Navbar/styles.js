import styled from '@emotion/styled';
import { Link } from 'react-router-dom';

export const NavbarContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: ${props => props.theme.colors.navbar};
  display: flex;
  align-items: center;
  padding: 0 ${props => props.theme.spacing.xl};
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

export const NavLinks = styled.ul`
  display: flex;
  gap: ${props => props.theme.spacing.lg};
  list-style: none;
  margin: 0;
  padding: 0;
`;

export const NavItem = styled.li`
  display: flex;
  align-items: center;
`;

export const StyledNavLink = styled(Link)`
  color: ${props => props.$active ? props.theme.colors.text.inverse : 'rgba(255, 255, 255, 0.8)'};
  text-decoration: none;
  font-size: ${props => props.theme.typography.body1.fontSize};
  font-weight: ${props => props.$active ? 600 : 400};
  padding: ${props => `${props.theme.spacing.xs} ${props.theme.spacing.md}`};
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    color: ${props => props.theme.colors.text.inverse};
    background: rgba(255, 255, 255, 0.1);
  }

  ${props => props.$active && `
    background: rgba(255, 255, 255, 0.15);
  `}
`;

export const Logo = styled(Link)`
  font-size: ${props => props.theme.typography.h3.fontSize};
  font-weight: 700;
  color: ${props => props.theme.colors.text.inverse};
  text-decoration: none;
  margin-right: auto;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};

  &:hover {
    opacity: 0.9;
  }
`;

export const WalletButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  color: ${props => props.theme.colors.text.inverse};
  border: none;
  padding: ${props => `${props.theme.spacing.xs} ${props.theme.spacing.md}`};
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;
