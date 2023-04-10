import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
// コンポーネント読み込み
import App from './components/App';
var container = document.getElementById('root');
// Create a root.
var root = ReactDOMClient.createRoot(container);
root.render(React.createElement(App, null));
//# sourceMappingURL=index.js.map