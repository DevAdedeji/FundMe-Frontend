import { ethers, providers } from "./ethers.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectBtn = document.getElementById("connectBtn");
const fundBtn = document.getElementById("fundBtn");
const balanceBtn = document.getElementById("balanceBtn");
const withdrawBtn = document.getElementById("withdrawBtn");
const amount = document.getElementById("amount");

connectBtn.addEventListener("click", connect);
fundBtn.addEventListener("click", fund);
balanceBtn.addEventListener("click", getBalance);
withdrawBtn.addEventListener("click", withdraw);

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      connectBtn.textContent = "Connected";
    } catch (err) {
      console.log("Unable to connect");
    }
  } else {
    console.log("No metamask");
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    document.getElementById(
      "balance"
    ).textContent = `${ethers.utils.formatEther(balance)} ETH`;
  }
}

// fund function
async function fund(ethAmount) {
  ethAmount = amount.value;
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      fundBtn.textContent = "Funding...";
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      await listenForTransactionMine(transactionResponse, provider);
      alert("Done!");
      amount.value = 0;
    } catch (err) {
      console.log(err);
    } finally {
      fundBtn.textContent = "Fund";
    }
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`);
  //   Listen and wait for the transaction to finish
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations`
      );
      resolve();
    });
  });
}

// withdraw function
async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.cheaperWithdraw();
      await listenForTransactionMine(transactionResponse, provider);
      alert("Done!");
    } catch (err) {}
  }
}
