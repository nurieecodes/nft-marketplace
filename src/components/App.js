import { useState } from 'react'
import { ethers } from "ethers"
import { HashRouter, Routes, Route } from "react-router-dom";
import { Spinner } from 'react-bootstrap'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Components 
import Navigation from './Navigation';
import Home from './Home'
import Create from './Create'
import MyListedItem from './MyListedItem'
import MyPurchases from './MyPurchases'

// Contracts Data
import MarketplaceAbi from '../contractsData/Marketplace.json'
import MarketplaceAddress from '../contractsData/Marketplace-address.json'
import NFTAbi from '../contractsData/NFT.json'
import NFTAddress from '../contractsData/NFT-address.json'

function App() {

  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(null)
  const [nft, setNFT] = useState({})
  const [marketplace, setMarketplace] = useState({})

  // MetaMask Login/Connect
  const web3Handler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0])
    // Get provider from MetaMask
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    // Set signer
    const signer = provider.getSigner()

    loadContracts(signer)
  }

  const loadContracts = async (signer) => {
    // Get deployed copies of NFT & Marketplace contracts
    const marketplace = new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi.abi, signer)
    setMarketplace(marketplace)
    const nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer)
    setNFT(nft)
    setLoading(false)
  }
  return (
    <HashRouter>
      <div className="App" style={{ backgroundColor: '#ffe6e6', height: '5000px' }}
        >
        <Navigation web3Handler={web3Handler} account={account} />
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <Spinner animation="border" style={{ display: 'flex'}} variant="danger"/>
            <p className='mx-3 my-0'>Awaiting Metamask Connection...</p>
          </div>
        ) : (
        <Routes>
          <Route path="/" element={
            <Home marketplace={marketplace} nft={nft} />
          } />
          <Route path="/create" element={
            <Create marketplace={marketplace} nft={nft} />
          } />
          <Route path="/my-listed-item" element={
          <MyListedItem marketplace={marketplace} nft={nft} account={account} />
          } />
          <Route path="/my-purchases" element={
          <MyPurchases marketplace={marketplace} nft={nft} account={account} />
          } />
        </Routes>
      )}
      <ToastContainer />
      </div>
    </HashRouter>
  );
}

export default App;
