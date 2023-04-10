import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

import MessageSender from './MessageSender';
import SseListener from './SseListener';

import 'bootstrap/dist/css/bootstrap.min.css';

class App extends Component {
  render() {
    return (
      <>
        <div className="container-fluid px-10">
          <div>
            <MessageSender />
          </div>
          <div>
            <SseListener />
          </div>
        </div>
      </>
    );
  }
}

export default App;
