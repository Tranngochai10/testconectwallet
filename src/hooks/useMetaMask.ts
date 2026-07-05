import { useState, useEffect } from 'react';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function useMetaMask() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [networkName, setNetworkName] = useState('Unknown Network');
  const [ethBalance, setEthBalance] = useState('0.0000');
  const [showSignaturePopup, setShowSignaturePopup] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      detectNetwork();
      
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          fetchBalance(accounts[0]);
        } else {
          handleDisconnect();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  const detectNetwork = async () => {
    if (!window.ethereum) return;
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId === '0xaa36a7') {
        setNetworkName('Sepolia Testnet');
      } else if (chainId === '0x1') {
        setNetworkName('Ethereum Mainnet');
      } else {
        setNetworkName(`Chain ID: ${parseInt(chainId, 16)}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBalance = async (address: string) => {
    if (!window.ethereum) return;
    try {
      const balanceHex = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      const ethVal = (parseInt(balanceHex, 16) / 1e18).toFixed(4);
      setEthBalance(ethVal);
    } catch (err) {
      console.error(err);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask extension not found! Please install MetaMask to use this application.');
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletAddress(accounts[0]);
      await fetchBalance(accounts[0]);
      await detectNetwork();
      setShowSignaturePopup(true);
    } catch (err) {
      console.error(err);
    }
  };

  const toHex = (str: string) => {
    let result = '';
    for (let i = 0; i < str.length; i++) {
      result += str.charCodeAt(i).toString(16);
    }
    return `0x${result}`;
  };

  const confirmSignature = async () => {
    if (!window.ethereum || !walletAddress) return;
    try {
      const message = `Welcome to AuraPay!\nNonce: 9f83a8c2d8e1c4e7\nVerify ownership of ${walletAddress}`;
      const msgHex = toHex(message);
      
      await window.ethereum.request({
        method: 'personal_sign',
        params: [msgHex, walletAddress]
      });

      setShowSignaturePopup(false);
      setIsSigned(true);
      setIsConnected(true);
      return true;
    } catch (err) {
      console.error(err);
      setShowSignaturePopup(false);
      return false;
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setIsSigned(false);
    setWalletAddress('');
  };

  return {
    isConnected,
    isSigned,
    walletAddress,
    networkName,
    ethBalance,
    showSignaturePopup,
    setShowSignaturePopup,
    connectWallet,
    confirmSignature,
    handleDisconnect,
    fetchBalance
  };
}
