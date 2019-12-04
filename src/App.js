import React, { useEffect } from 'react';
import './App.css';
import sha256 from 'js-sha256';
const qz = require('qz-tray');

const App = () => {
  useEffect(() => {
    qz.api.setPromiseType(function promise(resolver) { return new Promise(resolver); });
    qz.api.setSha256Type(data => sha256(data));

    qz.websocket.connect()
      .then(() => {
        qz.printers.find();
      })
      .then((printers) => {
        console.log(printers);
      })
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        Howdy
      </header>
    </div>
  );
}

export default App;
