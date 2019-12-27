import React from 'react';

const scannerInput = (props) => {

  const openDialog = () => {
    document.getElementById('dialog').showModal()
  }

  const closeDialog = () => {
    document.getElementById('dialog').close()
  }

  const clear = () => {
    document.getElementById('scannerInput').value = ''
  }

  return(
    <>
      <dialog id="dialog">
        <form method="dialog">
          <input id="scannerInput" type="text" autoFocus={true}/>
        </form>
        <button onClick={() => {clear()}}>Clear</button>
        <button onClick={() => {closeDialog()}}>Cancel</button>
      </dialog>
      <button onClick={() => {openDialog()}}>Scan</button>
    </>
  )
}

export default scannerInput;