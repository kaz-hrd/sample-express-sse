import React from 'react';
import * as ReactDOMClient from 'react-dom/client';

// コンポーネント読み込み
import App from './components/App';

const container = document.getElementById('root');

// Create a root.
const root = ReactDOMClient.createRoot(container);
root.render(<App />);
