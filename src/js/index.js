import React from 'react';
import { render } from 'react-dom';
import App from './components/router';

// Router
if (document.getElementById('react-main-root')) {
  render(<App />, document.getElementById('react-main-root'));
}
