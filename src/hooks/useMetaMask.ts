import { useState, useEffect } from 'react';

declare global {
  interface Window {
    ethereum?: any;
  }
}

// Helper to get the specific MetaMask provider if multiple wallets are installed
function getMetaMaskProvider() {
  if (typeof window === 'undefined' || !window.ethereum) return null;
  if (window.ethereum.providers) {
    return window.ethereum.providers.find((p: any) => p.isMetaMask) || window.ethereum;
  }
  return window.ethereum.isMetaMask ? window.ethereum : window.ethereum;
}

export function useMetaMask() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [networkName, setNetworkName] = useState('Unknown Network');
  const [ethBalance, setEthBalance] = useState('0.0000');
  const [showSignaturePopup, setShowSignaturePopup] = useState(false);
  const [providerName, setProviderName] = useState('None');
  const [rawChainId, setRawChainId] = useState('0x0');

  const tokenSymbol = networkName === 'Sepolia Testnet' ? 'SepoliaETH' : 'ETH';

  useEffect(() => {
    const provider = getMetaMaskProvider();
    if (provider) {
      // Detect provider name
      if (provider.isOKXWallet) setProviderName('OKX Wallet');
      else if (provider.isPhantom) setProviderName('Phantom');
      else if (provider.isCoinbaseWallet) setProviderName('Coinbase Wallet');
      else if (provider.isMetaMask) setProviderName('MetaMask');
      else setProviderName('Other Wallet');

      detectNetwork();
      
      // Auto-connect if already authorized in MetaMask
      provider.request({ method: 'eth_accounts' }).then(async (accounts: string[]) => {
        if (accounts.length > 0) {
          const address = accounts[0];
          setWalletAddress(address);
          await fetchBalance(address);
          
          const wasSigned = sessionStorage.getItem(`isSigned_${address.toLowerCase()}`) === 'true';
          if (wasSigned) {
            setIsSigned(true);
            setIsConnected(true);
          } else {
            setShowSignaturePopup(true);
          }
        }
      }).catch(console.error);
      
      const handleAccounts = (accounts: string[]) => {
        if (accounts.length > 0) {
          const address = accounts[0];
          setWalletAddress(address);
          fetchBalance(address);
          detectNetwork();
          
          const wasSigned = sessionStorage.getItem(`isSigned_${address.toLowerCase()}`) === 'true';
          if (wasSigned) {
            setIsSigned(true);
            setIsConnected(true);
          } else {
            setIsSigned(false);
            setIsConnected(false);
            setShowSignaturePopup(true);
          }
        } else {
          handleDisconnect();
        }
      };

      const handleChain = () => {
        detectNetwork();
        if (walletAddress) {
          fetchBalance(walletAddress);
        }
      };

      provider.on('accountsChanged', handleAccounts);
      provider.on('chainChanged', handleChain);

      // Polling fallback: checking network and balance every 1.5s to ensure live synchronization
      const interval = setInterval(() => {
        detectNetwork();
        provider.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
          if (accounts.length > 0) {
            const currentAddress = accounts[0];
            if (currentAddress.toLowerCase() !== walletAddress.toLowerCase()) {
              setWalletAddress(currentAddress);
              fetchBalance(currentAddress);
              
              const wasSigned = sessionStorage.getItem(`isSigned_${currentAddress.toLowerCase()}`) === 'true';
              if (wasSigned) {
                setIsSigned(true);
                setIsConnected(true);
              } else {
                setIsSigned(false);
                setIsConnected(false);
                setShowSignaturePopup(true);
              }
            } else {
              fetchBalance(currentAddress);
            }
          }
        }).catch(console.error);
      }, 1500);

      return () => {
        if (provider.removeListener) {
          provider.removeListener('accountsChanged', handleAccounts);
          provider.removeListener('chainChanged', handleChain);
        }
        clearInterval(interval);
      };
    }
  }, [walletAddress]);

  const detectNetwork = async () => {
    const provider = getMetaMaskProvider();
    if (!provider) return;
    try {
      const chainIdRaw = await provider.request({ method: 'eth_chainId' });
      setRawChainId(chainIdRaw || '0x0');
      console.log('Raw Chain ID from MetaMask:', chainIdRaw);
      
      let chainIdNum: number;
      if (typeof chainIdRaw === 'number') {
        chainIdNum = chainIdRaw;
      } else if (typeof chainIdRaw === 'string') {
        if (chainIdRaw.startsWith('0x')) {
          chainIdNum = parseInt(chainIdRaw, 16);
        } else {
          chainIdNum = parseInt(chainIdRaw, 10);
        }
      } else {
        chainIdNum = parseInt(chainIdRaw);
      }

      console.log('Parsed Chain ID:', chainIdNum);

      if (chainIdNum === 11155111) {
        setNetworkName('Sepolia Testnet');
      } else if (chainIdNum === 1) {
        setNetworkName('Ethereum Mainnet');
      } else {
        setNetworkName(`Chain ID: ${chainIdNum}`);
      }
    } catch (err) {
      console.error('Error detecting network:', err);
    }
  };

  const fetchBalance = async (address: string) => {
    const provider = getMetaMaskProvider();
    if (!provider) return;
    try {
      const balanceHex = await provider.request({
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
    const provider = getMetaMaskProvider();
    if (!provider) {
      alert('MetaMask extension not found! Please install MetaMask to use this application.');
      return;
    }
    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      setWalletAddress(address);
      await fetchBalance(address);
      await detectNetwork();
      
      const wasSigned = sessionStorage.getItem(`isSigned_${address.toLowerCase()}`) === 'true';
      if (wasSigned) {
        setIsSigned(true);
        setIsConnected(true);
      } else {
        setShowSignaturePopup(true);
      }
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
    const provider = getMetaMaskProvider();
    if (!provider || !walletAddress) return;
    try {
      const message = `Welcome to AuraPay!\nNonce: 9f83a8c2d8e1c4e7\nVerify ownership of ${walletAddress}`;
      const msgHex = toHex(message);
      
      await provider.request({
        method: 'personal_sign',
        params: [msgHex, walletAddress]
      });

      sessionStorage.setItem(`isSigned_${walletAddress.toLowerCase()}`, 'true');
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
    if (walletAddress) {
      sessionStorage.removeItem(`isSigned_${walletAddress.toLowerCase()}`);
    }
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
    tokenSymbol,
    providerName,
    rawChainId,
    showSignaturePopup,
    setShowSignaturePopup,
    connectWallet,
    confirmSignature,
    handleDisconnect,
    fetchBalance
  };
}
