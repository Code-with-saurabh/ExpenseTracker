import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import store from './store';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 2500,
            style: {
              fontFamily: '"JetBrains Mono", monospace',
              background: '#29231F',
              color: '#FAF8F3',
              fontSize: '13px',
              borderRadius: '10px',
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
