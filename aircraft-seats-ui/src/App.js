import React from 'react';
import Aircraft from './components/Aircraft';
import Ping from './components/Ping';

function App() {
  return (
    <div>
      <div>
        <h1>Ping Test</h1>
        <Ping />
      </div>      
      <Aircraft />
    </div>
  );
}

export default App;