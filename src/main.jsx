import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './design-system/tokens.css'

console.log('── MAIN.JSX EXECUTING ──');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('ROOT ELEMENT NOT FOUND');
    document.body.innerHTML = '<h1 style="color:red">ERROR: Root element not found</h1>';
  } else {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
    console.log('── RENDER INITIATED ──');
  }
} catch (e) {
  console.error('── RENDER CRASHED ──', e);
  document.body.innerHTML = `<h1 style="color:red">CRITICAL RENDER ERROR</h1><pre>${e.stack}</pre>`;
}
