import React, { useEffect, useState } from 'react';
import './App.css';
import sha256 from 'js-sha256';
import ScannerInput from './ScannerInput.js'
import { KJUR, KEYUTIL, stob64, hextorstr } from 'jsrsasign';
import format from 'date-fns/format';
const qz = require('qz-tray');

const App = () => {
  // Information about qz API overrides at https://qz.io/wiki/api-overrides
  qz.api.setSha256Type(data => sha256(data));
  qz.api.setPromiseType(function promise(resolver) { return new Promise(resolver); });
  // Set up certificate and private key to enable silent printing
  qz.security.setCertificatePromise((resolve, reject) => {
    fetch("assets/digital-certificate.txt", {cache: 'no-store', headers: {'Content-Type': 'text/plain'}})
     .then(data => resolve(data.text()));
   });
  qz.security.setSignaturePromise(hash => {
    return (resolve, reject) => {
     fetch("assets/private-key.pem", {cache: 'no-store', headers: {'Content-Type': 'text/plain'}})
      .then(wrapped => wrapped.text())
      .then(data => {
        const pk = KEYUTIL.getKey(data);
        const sig = new KJUR.crypto.Signature({"alg": "SHA1withRSA"});
        sig.init(pk);
        sig.updateString(hash);
        const hex = sig.sign();

        resolve(stob64(hextorstr(hex)));
      })
      .catch(err => console.error(err));
     };
   });
   
  // Connect to the qzTray java app via websockets.  Raw commands are sent from the browser
  // via this connection and print jobs are created and processed on the other end by qz.
  const [printers, setPrinters] = useState([])
  const [printer, setPrinter] = useState('')
  useEffect(() => {
    (async () => {
      await qz.websocket.connect()
      await qz.printers.find()
        .then(printers => {
          setPrinters(
            printers.map((printer, i) => <option key={i} value={printer}>{printer}</option>)
          )
        })
      })();
    }, [])
    
  const config = qz.configs.create(printer)
  const selectPrinter = (event) => {
    // setPrinter(event.target.value)
    setPrinter(event.target.value)
  }
    // Printer commands are written as strings of hex codes. Remember to escape the 'x' to differentiate between 
    // command codes and actual characters to be printed.

  const openDrawer = () => {
    const data = [
      // Sends a pulse to a cash drawer to open it.  For printers with more than one drawer, the drawer is set by the middle code
      // 'x00' for drawer 1 or 'x01' for drawer 2.
      // 'ESC p' command from the epson APG (pg. 600)
      '\x1B\x70\x01\xC8\xFA'
  ];
   qz.print(config, data).catch((e) => console.error(e));
  }

  // Right now all values are expected to be strings except for 'ccInfo'.  This will have to be revisited when we look at what the actual 
  // data that will be passed in is gonna look like.
  const batchDataCash = {
    town: 'Johnston RI',
    transactionNumber: '44474',
    owner: 'WILLIAM SMITH',
    accountNumber: 'F19-25076-08',
    batchName: '0293734A0',
    datePosted: '03/11/18',
    ccInfo: false,
    cashAmount: '1443.76',
    checkAmount: 'N/A',
    principle: '27.60',
    interest: '0.38',
    total: '20.00'
  }

  const batchDataCC = {
    town: 'Johnston RI',
    transactionNumber: '44474',
    owner: 'WILLIAM SMITH',
    accountNumber: 'F19-25076-08',
    batchName: '0293734A0',
    datePosted: '03/11/18',
    ccInfo: {
      transactionNumber: 'P0123982347204',
      ccType: 'VISA',
      cardNumber: '**** **** **** 8864'
    },
    cashAmount: '1443.76',
    checkAmount: 'N/A',
    principle: '27.60',
    interest: '0.38',
    total: '20.00'
  }

  const printReceipt = (batch) => {

    const receiptItem = (item, value = ' ') => {
      // Here we insert an array of spaces into the middle of each line to give the appearance of justifying text to both the right and 
      // left sides of the page on the same line.  If you want to indent the lines further inward just lower the array length.
      return `${item}${Array.from({length: 32 - (item.length + value.length)}, () => ' ').join('')}${value}\x0A` // x0A is essentially the same as \n 
    }

    let paymentInfo, footer;
    if (batch.ccInfo){
      paymentInfo =
        receiptItem('CC Trans:', batch.ccInfo.transactionNumber) +
        receiptItem('Credit Card:', batch.ccInfo.ccType) +
        receiptItem('Card #:', batch.ccInfo.cardNumber)
      footer = 
        '\x1B\x64\x02' +
        receiptItem('I agree to pay the total') +
        receiptItem('amount indicated above in') + 
        receiptItem('accordance with my credit') +
        receiptItem('card agreement.') +
        '\x1B\x64\x02' +
        receiptItem('______________________________') +
        receiptItem('Signed')
    } else {
      paymentInfo =
        receiptItem('Checks:', batch.checkAmount) +
        receiptItem('Cash:', batch.cashAmount)
      footer = ''
    }
    
    const receipt = [
      '\x1B\x40',     // initialize printer in standard mode, 'ESC @' command (p. 591)
      '\x1B\x61\x31', // center align. Setting the alignment persists until a different one is set or the print job completes.
      `\x1B\x21\x08${batch.town}\x0ATaxpayer Receipt\x1B\x21\x00`, // The commands on either side of this line turn emphasis mode on and then off again
      '\x1B\x64\x03', // '\x1B\x64\x14' clears the print buffer and feeds a set number or lines determined by the third hex
      receiptItem('Transaction #:', batch.transactionNumber),
      receiptItem('Batch:', batch.batchName),
      receiptItem('Date Posted:', batch.datePosted), 
      '\x0A',
      paymentInfo,
      '\x0A',
      receiptItem('Account:', batch.accountNumber),
      receiptItem('', batch.owner),
      receiptItem('Principle:', batch.principle),
      receiptItem('Interest:', batch.interest),
      receiptItem('Total Due:', batch.total),
      footer,
      '\x1B\x64\x0F'
    ];

    qz.print(config, receipt).catch((e) => console.error(e));
  }

  const validateSlip = (batch) => {
    const slipItem = (item) => {
      return `${item}${Array.from({length: 22 - item.length}, () => ' ').join('')}\x0A`
    }
    const data = [
      '\x1B\x63\x30\x04', // Sets print mode to 'slip', the 'ESC c 0' command from the epson APG (p. 156)
      '\x1B\x61\x31', // center align
      '\x1B\x64\x02',
      '\x1B\x30',
      slipItem(batch.town),
      slipItem(format(new Date(), 'Pp')),
      slipItem('Transaction#: ' + batch.transactionNumber),
      slipItem('Batch: ' + batch.batchName),
      slipItem('For Deposit Only'),
      slipItem('Fleet 12-3456789'), // unsure where bank info will come from so this is hardcoded for now.
      '\x1B\x71', // Eject the slip. 
  ];
   qz.print(config, data).catch((e) => console.error(e));
  }


  return (
    <div className="App">
      <header className="App-header">
        <select onChange={(e) => {selectPrinter(e)}}>{printers}</select>
        <ScannerInput />
        <button onClick={() => {openDrawer()}}>Open</button>
        <button onClick={() => {printReceipt(batchDataCash)}}>Print Cash/Check Receipt</button>
        <button onClick={() => {printReceipt(batchDataCC)}}>Print CC Receipt</button>
        <button onClick={() => {validateSlip(batchDataCash)}}>Validate</button>
      </header>
    </div>
  );
}

export default App;