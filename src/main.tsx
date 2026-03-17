import "./instrument";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from "@sentry/react";
import './index.css'
import App from './App.tsx'

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container, {
    onUncaughtError: Sentry.reactErrorHandler(),
    onCaughtError: Sentry.reactErrorHandler(),
    onRecoverableError: Sentry.reactErrorHandler(),
  });
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
