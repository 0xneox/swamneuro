import styled from '@emotion/styled';

export const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
`;

export const MainContent = styled.main`
  flex: 1;
  padding: ${props => props.theme.spacing.xl};
  margin-top: 60px; // Account for fixed navbar
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing.md};
  }
`;
