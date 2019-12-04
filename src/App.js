import React, { useEffect } from 'react';
import './App.css';
import sha256 from 'js-sha256';
const qz = require('qz-tray');

const App = () => {
  qz.api.setSha256Type(function(data) { return sha256(data); });
  qz.api.setPromiseType(function promise(resolver) { return new Promise(resolver); });

  useEffect(() => {
    qz.websocket.connect()
    .then(qz.printers.find)
    .then((printers) => {
       console.log(printers);
    })
  }, [])

  const findPrinters = () => {
    qz.printers.find().then(data => console.log(data))
  }

  const printAndOpen = () => {
    const config = qz.configs.create("EPSON TM-U675 Receipt")
    const data = [ '27,112,0,25,250' ];
   qz.print(config, data).catch(function(e) { console.error(e); });
  }

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={() => {printAndOpen()}}>~~~*Click Here*~~~</button>
      </header>
    </div>
  );
}

export default App;
// EPSON TM-U675 Receipt