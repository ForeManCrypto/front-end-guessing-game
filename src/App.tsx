import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { connectWallet, config } from './client';
import Header from './components/Header';
import HomePage from './components/HomePage';
import GuessingGamePage from './components/GuessingGamePage';
import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';

const App: React.FC = () => {
  const [client, setClient] = useState<SigningCosmWasmClient | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleConnectWallet = async () => {
    setLoading(true);
    try {
      const { client, address } = await connectWallet();
      setClient(client);
      setAddress(address);
    } catch (error) {
      console.error('Connect wallet error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectWallet = () => {
    setClient(null);
    setAddress(null);
  };

  // Poll Keplr address to detect wallet changes
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (window.keplr && client && address) {
      interval = setInterval(async () => {
        try {
          await window.keplr.enable(config.chainId);
          const offlineSigner = window.keplr.getOfflineSigner(config.chainId);
          const accounts = await offlineSigner.getAccounts();
          const currentAddress = accounts[0].address;
          console.log('Polling Keplr address:', currentAddress);
          if (currentAddress !== address) {
            console.log('Keplr wallet address changed:', currentAddress);
            handleDisconnectWallet();
          }
        } catch (error) {
          console.error('Error polling Keplr address:', error);
        }
      }, 3000); // Poll every 3 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [client, address]);

  // Keplr keystore change event listener
  useEffect(() => {
    if (window.keplr) {
      const handleKeplrChange = () => {
        console.log('Keplr keystore change event triggered');
        handleDisconnectWallet();
      };
      window.addEventListener('keplr_keystore_change', handleKeplrChange);
      return () => {
        window.removeEventListener('keplr_keystore_change', handleKeplrChange);
      };
    }
  }, []);

  return (
    <Router>
      <Header address={address} loading={loading} onConnect={handleConnectWallet} onDisconnect={handleDisconnectWallet} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game1" element={<GuessingGamePage client={client} address={address} />} />
      </Routes>
    </Router>
  );
};

export default App;