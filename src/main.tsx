import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import RouteLoader from './components/RouteLoader';
import './styles.css';
import './theme.css';
import './interactions.css';
import './glass.css';
import './features/reports/workspace-layout.css';
import './features/profile/profile.css';
import './features/onboarding/directory.css';
import './features/reports/workspace-rounded.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <RouteLoader />
  </StrictMode>,
);

// Fade out the first-load splash from index.html once the app has painted.
const boot = document.getElementById('boot');
if (boot)
  requestAnimationFrame(() => {
    boot.classList.add('is-done');
    window.setTimeout(() => boot.remove(), 300);
  });
