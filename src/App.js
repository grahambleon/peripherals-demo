import React, { useEffect } from 'react';
import './App.css';
import sha256 from 'js-sha256';
import AcctInput from './AcctInput.js'
const qz = require('qz-tray');

const App = () => {
  qz.api.setSha256Type(data => sha256(data));
  qz.api.setPromiseType(function promise(resolver) { return new Promise(resolver); });

  useEffect(() => {
    qz.websocket.connect()
  }, [])

  const listPrinters = () => {
    qz.printers.find().then(printers => console.log(printers)
    )
  }

  const openDrawer = () => {
    const config = qz.configs.create("EPSON TM-U675 Receipt")
    const data = [
      { type: 'raw', format: 'hex', data: 'x1Bx70x01xC8xFA' }
  ];
   qz.print(config, data).catch((e) => console.error(e));
  }

  const printReceipt = () => {
    const config = qz.configs.create("EPSON TM-U675 Receipt")
    const data = [
      '\x1B\x40',          // init
      '\x1B\x61\x31', // center align
      'This is a test\x0A',
      '\x0A',
      'Don\'t forget plenty of line breaks at the end.\x0A',
      '\x0A\x0A\x0A\x0A\x0A\x0A\x0A',
      '\x0A\x0A\x0A\x0A\x0A\x0A\x0A',
      '\x1B\x69', // cut
  ];
   qz.print(config, data).catch((e) => console.error(e));
  }

  const validateSlip = () => {
    const config = qz.configs.create("EPSON TM-U675 Slip")
    const data = [
      '\x1B\x63\x30\x04',
      '\x1B\x61\x31', // center align
      '\x0A\x0A\x0A\x0A\x0A\x0A\x0A',
      '\x0A\x0A\x0A\x0A\x0A\x0A\x0A',
      'This is a test\x0A',
      '\x0A',
      'Don\'t forget plenty of line breaks at the end.\x0A',
      '\x0A\x0A\x0A\x0A\x0A\x0A\x0A',
      '\x0A\x0A\x0A\x0A\x0A\x0A\x0A',
      '\x1B\x69', // cut
  ];
   qz.print(config, data).catch((e) => console.error(e));
  }


  return (
    <div className="App">
      <header className="App-header">
        <AcctInput />
        <button onClick={() => {openDrawer()}}>Open</button>
        <button onClick={() => {printReceipt()}}>Print</button>
        <button onClick={() => {validateSlip()}}>Validate</button>
        <button onClick={() => {listPrinters()}}>List Printers</button>
      </header>
    </div>
  );
}

export default App;