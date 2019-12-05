import React, { useEffect } from 'react';
import './App.css';
import sha256 from 'js-sha256';
const qz = require('qz-tray');

const App = () => {
  qz.api.setSha256Type(data => sha256(data));
  qz.api.setPromiseType(function promise(resolver) { return new Promise(resolver); });

  useEffect(() => {
    qz.websocket.connect()
    // const findPrinters = () => {
    //   qz.printers.find().then(data => console.log(data))
    // }
  }, [])

  const openDrawer = () => {
    const config = qz.configs.create("EPSON TM-U675 Receipt")
    const data = [
      { type: 'raw', format: 'hex', data: 'x1Bx70x01xC8xFA' }
  ];
   qz.print(config, data).catch((e) => console.error(e));
  }

  const printSomething = () => {
    const config = qz.configs.create("EPSON TM-U675 Receipt")
    const data = [
      { type: 'raw', data: 'Print me pls \n\n\n\n\n\n\n\n', options: { language: 'ESCPOS', dotDensity: 'single' }},
  ];
   qz.print(config, data).catch((e) => console.error(e));
  }

  const validateSlip = () => {
    const config = qz.configs.create("EPSON TM-U675 Slip")
    const data = [
      { type: 'raw', format: 'hex', data: 'x1Bx57'},
  ];
   qz.print(config, data).catch((e) => console.error(e));
  }

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={() => {openDrawer()}}>Open</button>
        <button onClick={() => {printSomething()}}>Print</button>
        <button onClick={() => {validateSlip()}}>Validate</button>
      </header>
    </div>
  );
}

export default App;