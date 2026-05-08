import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Capture the install prompt BEFORE React mounts so it's never missed
window.deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredInstallPrompt = e;
  // Notify any listeners that the prompt is ready
  window.dispatchEvent(new Event('installpromptready'));
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
