import React from 'react';
import ReactDOM from 'react-dom/client';
import { RecoilRoot } from 'recoil';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import App from './App';
import { theme } from './styles/theme';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import './styles/global.css';

const emotionCache = createCache({
  key: 'swamneuro',
  prepend: true,
});

// Error handling
const handleError = (error) => {
  console.error('React Error:', error);
};

const handleRejection = (event) => {
  console.error('Unhandled Rejection:', event.reason);
};

window.addEventListener('unhandledrejection', handleRejection);
window.onerror = handleError;

const root = ReactDOM.createRoot(document.getElementById('root'));

try {
  root.render(
    <React.StrictMode>
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={theme}>
          <RecoilRoot>
            <App />
          </RecoilRoot>
        </ThemeProvider>
      </CacheProvider>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to render app:', error);
}
