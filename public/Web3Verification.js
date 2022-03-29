var address, exitCode, signature, totalWin;



async function hashtext() {
  message = document.getElementById('exitcode').value;
  console.log(message);
  const hashMessage = web3.utils.sha3('message');
  signature = await web3.eth.personal.sign(hashMessage, account);
  showHash.innerHTML = signature;
}


async function verifyHash() {
    const hashMessage = web3.utils.sha3('message');
    verAddress = await PayContract.method.recover(hashMessage, signature).send({ from: account })
    console.log(verAddress)

}