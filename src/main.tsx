import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import './styles/global.css';
import App from './App';
import PageTimeTracker from './components/Analytics/PageTimeTracker';
import VisitorSessionTracker from './components/Analytics/VisitorSessionTracker';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Analytics />
    <PageTimeTracker />
    <VisitorSessionTracker />
  </StrictMode>
);
