import React from 'react';

const AcctInput = () => {
  let account = ''

  const openDialog = () => {
    document.getElementById('acctDialog').showModal()
  }

  const closeDialog = () => {
    document.getElementById('acctDialog').close()
  }

  const scan = (e) => {
    account = e.target.value
  }

  const submit = () => {
      alert(`\n\n Account #: ${account}`)
      document.getElementById('scannerInput').value = ''
      account = ''
  }

  return(
    <>
      <dialog id="acctDialog">
        <form method="dialog" onSubmit={submit}>
          <input id="scannerInput" type="text" autoFocus={true} onChange={scan}/>
        </form>
        <button onClick={() => {closeDialog()}}>Cancel</button>
      </dialog>
      <button onClick={() => {openDialog()}}>Scan Barcode</button>
    </>
  )
}

export default AcctInput;