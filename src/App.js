import "./App.css";
import jsPDF from "jspdf";
import Web3 from "web3";
import SignContract from "./abis/SignContract.json";
import React, { useState } from "react";
import { Buffer } from "buffer";
import html2canvas from "html2canvas";
import { Table } from "react-bootstrap";
import * as IPFS from "ipfs-core";

function App() {
  let contract, accounts;

  const [ipfsHash, setIpfsHash] = useState(null);
  const [buffer, setBuffer] = useState("");
  const [ethAddress, setEthAddress] = useState("");
  const [storeHashTransaction, setStoreHashTransaction] = useState("");
  const [blockNumber, setBlockNumber] = useState("");

  async function loadweb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
    const web3 = window.web3;
    accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    console.log(accounts);
    const contractAddress = "0x90Ea0DC9147c30F7d78A4F5c1a233Fe1D8bbbC8A";
    setEthAddress(contractAddress);
    if (contractAddress) {
      contract = new web3.eth.Contract(SignContract.abi, contractAddress);
      console.log(contract);
    } else {
      window.alert("Smart contract not deployed to detected network.");
    }
  }

  const [formData, setFormData] = useState({
    name: "",
    contractId: "",
    projectName: "",
    projectedAmount: "",
    officeAddress: "",
    formSubmitDate: "",
    zip: "",
    signerName: "",
  });

  const onChangeHandle = (event) => {
    setFormData(() => ({
      ...formData,
      [event.target.name]: event.target.value,
    }));
  };

  const printPDF = () => {
    let data = document.getElementById("divToprint");
    html2canvas(data).then((canvas) => {
      let fileWidth = 208;
      let fileHeight = (canvas.height * fileWidth) / canvas.width;
      const FILEURI = canvas.toDataURL("image/png");
      let pdf = new jsPDF("p", "mm", "a4");
      let position = 0;
      pdf.addImage(FILEURI, "PNG", 0, position, fileWidth, fileHeight);
      pdf.save("contract.pdf");
    });
  };

  const captureFile = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = async () => {
      const bufferIs = await Buffer(reader.result);
      await setBuffer(bufferIs);
    };
  };

  const submitPdfToIPFS = async (event) => {
    event.preventDefault();
    const ipfs = await IPFS.create({ repo: "ok" + Math.random() });
    console.log("This is buffer", buffer);
    const ipfsHash = await ipfs.add(buffer);
    console.log("ipfsHash after ipfs.add:", ipfsHash.path);
    setIpfsHash(ipfsHash.path);
    await loadweb3();
    const receipt = await contract.methods
      .storeContract(formData.contractId, ipfsHash.path, formData.name)
      .send({ from: accounts[0] });
    setStoreHashTransaction(receipt.transactionHash);
    setBlockNumber(receipt.blockNumber);
    console.log("receipt as returned by smart contract:", receipt);
  };

  const signedContractToIPFS = async (event) => {
    event.preventDefault();
    const ipfs = await IPFS.create({ repo: "ok" + Math.random() });
    console.log("This is buffer", buffer);
    const ipfsHash = await ipfs.add(buffer);
    console.log("ipfsHash after ipfs.add:", ipfsHash.path);
    setIpfsHash(ipfsHash.path);
    await loadweb3();
    const receipt = await contract.methods
      .storeSignedContract(
        formData.contractId,
        formData.signerName,
        ipfsHash.path
      )
      .send({ from: accounts[0] });
    setStoreHashTransaction(receipt.transactionHash);
    setBlockNumber(receipt.blockNumber);
    console.log("receipt as returned by smart contract:", receipt);
  };

  return (
    <div className="contianer">
      {" "}
      <div className="App">
        <div>
          <div className="container">
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
              <div className="container-fluid">
                <a className="navbar-brand" href="/">
                  Sign Contract DApp
                </a>
                <button
                  className="navbar-toggler"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#navbarSupportedContent"
                  aria-controls="navbarSupportedContent"
                  aria-expanded="false"
                  aria-label="Toggle navigation"
                >
                  <span className="navbar-toggler-icon"></span>
                </button>
                <div
                  className="collapse navbar-collapse"
                  id="navbarSupportedContent"
                >
                  <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    <li className="nav-item">
                      <a
                        className="nav-link active"
                        aria-current="page"
                        href="/"
                      >
                        Home
                      </a>
                    </li>
                    <li className="nav-item dropdown">
                      <a
                        className="nav-link dropdown-toggle"
                        href="/"
                        id="navbarDropdown"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        Dropdown
                      </a>
                      <ul
                        className="dropdown-menu"
                        aria-labelledby="navbarDropdown"
                      >
                        <li>
                          <hr className="dropdown-divider" />
                        </li>
                      </ul>
                    </li>
                  </ul>
                  <form className="d-flex">
                    <input
                      className="form-control me-2"
                      type="search"
                      placeholder="Search"
                      aria-label="Search"
                    />
                    <button className="badge bg-secondary" type="submit">
                      Search
                    </button>
                  </form>
                </div>
              </div>
            </nav>
          </div>
          <div className="centered">
            {" "}
            <p>&nbsp;</p>
            <h2>Fill Contract Form</h2>
          </div>
          <p>&nbsp;</p>
          <span className="badge bg-secondary">
            <p>&nbsp;</p>
            <div className="contianer my-3">
              <form className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="name" className="form-label">
                    Contractor Name
                  </label>
                  <input
                    type="name"
                    className="form-control"
                    name="name"
                    onChange={onChangeHandle}
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="contractId" className="form-label">
                    Contract Id
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="contractId"
                    onChange={onChangeHandle}
                  />
                </div>
                <p>&nbsp;</p>
                <div className="col-12">
                  <label htmlFor="projectName" className="form-label">
                    Project Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="projectName"
                    onChange={onChangeHandle}
                    placeholder="ABC Project....."
                  />
                </div>
                <p>&nbsp;</p>
                <div className="col-12">
                  <label htmlFor="projectedAmount" className="form-label">
                    Amount to Sing Contract
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="projectedAmount"
                    onChange={onChangeHandle}
                    placeholder="3000$"
                  />
                </div>
                <p>&nbsp;</p>
                <div className="col-md-6">
                  <label htmlFor="officeAddress" className="form-label">
                    Office Address
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="officeAddress"
                    onChange={onChangeHandle}
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="formSubmitDate" className="form-label">
                    Date
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="formSubmitDate"
                    onChange={onChangeHandle}
                  />
                </div>
                <p>&nbsp;</p>
                <div className="col-12">
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={printPDF}
                  >
                    Create Contract
                  </button>
                </div>
                <p>&nbsp;</p>
                <div className="col-md-4">
                  <label htmlFor="signerName" className="form-label">
                    Signer Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="signerName"
                    onChange={onChangeHandle}
                  />
                </div>
                <div className="col-md-4">
                  <button
                    className="btn btn-primary"
                    type="button"
                    id="print"
                    onClick={printPDF}
                  >
                    Sign Contract
                  </button>
                </div>
                <p>&nbsp;</p>
              </form>
            </div>
          </span>
        </div>
        <p>&nbsp;</p>
        <h4>Submit Created Contract to IPFS </h4>
        <form onSubmit={submitPdfToIPFS}>
          <input type="file" onChange={captureFile} />
          <input type="submit" />
        </form>
        <p>&nbsp;</p>
        <div>
          <h4>Submit Signed Contract to IPFS </h4>
          <form onSubmit={signedContractToIPFS}>
            <input type="file" onChange={captureFile} />
            <input type="submit" />
          </form>
        </div>
      </div>
      <p>&nbsp;</p>
      <div id="divToprint" className="contianer">
        <h2> Created Contract Details </h2>
        <hr />
        <h4> Information Store in Contract</h4>
        <Table size="sm" bordered responsive>
          <thead>
            <tr>
              <th>Items</th>
              <th> </th>
              <th>Values</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Contractor Name</td>
              <td> : </td>
              <td>{formData.name}</td>
            </tr>
            <tr>
              <td>Contract Id</td>
              <td> : </td>
              <td>{formData.contractId}</td>
            </tr>
            <tr>
              <td>Project Name</td>
              <td> : </td>
              <td>{formData.projectName}</td>
            </tr>
            <tr>
              <td>Amount to Sign Contract</td>
              <td> : </td>
              <td>{formData.projectedAmount}</td>
            </tr>
            <tr>
              <td>Office Address</td>
              <td> : </td>
              <td>{formData.officeAddress}</td>
            </tr>
            <tr>
              <td>Date</td>
              <td> : </td>
              <td>{formData.formSubmitDate}</td>
            </tr>
            <tr>
              <td>Signer Name</td>
              <td> : </td>
              <td>{formData.signerName}</td>
            </tr>
          </tbody>
        </Table>
      </div>
      <a href="https://goerli.arbiscan.io/address/0x90Ea0DC9147c30F7d78A4F5c1a233Fe1D8bbbC8A#readContract" target="_blank" rel="noopener noreferrer">
        <button>Check Stored Details On Arbiscan</button>
      </a>
      <p>&nbsp;</p>
      <h3> Get Transaction Details </h3>
      <hr />
      <h4> Values read from blockchain </h4>
      <Table size="sm" bordered responsive>
        <thead>
          <tr>
            <th>Items</th>
            <th> </th>
            <th>Values</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Smart Contract address storing IPFS hash</td>
            <td> : </td>
            <td>{ethAddress}</td>
          </tr>
          <tr>
            <td>IPFS Hash to store on Arbitrum</td>
            <td> : </td>
            <td>{ipfsHash}</td>
          </tr>
          <tr>
            <td>transaction's BlockNumber on Arbitrum</td>
            <td> : </td>
            <td>{blockNumber}</td>
          </tr>
          <tr>
            <td>transaction's Hash on Arbitrum</td>
            <td> : </td>
            <td>{storeHashTransaction}</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
}

export default App;
