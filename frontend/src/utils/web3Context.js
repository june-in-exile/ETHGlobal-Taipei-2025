import { createContext, useContext, useState, useEffect } from 'react';
import Web3 from 'web3';

// Create Context
const Web3Context = createContext();


// Provider Component
export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [chainId, setChainId] = useState('');
  const [chainName, setChainName] = useState('');
  const [balance, setBalance] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if MetaMask is installed
  const isMetaMaskInstalled = typeof window !== 'undefined' && window.ethereum;

  // Initialize web3 when provider is available
  useEffect(() => {
    if (isMetaMaskInstalled) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      checkConnection();

      // Setup event listeners
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // Check if user is already connected
  const checkConnection = async () => {
    if (!isMetaMaskInstalled) return;
    
    try {
      const web3Instance = new Web3(window.ethereum);
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length > 0) {
        handleAccountsChanged(accounts);
        updateChainInfo();
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  // Handle account changes
  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      // User disconnected
      setIsConnected(false);
      setAccount('');
      setBalance('');
    } else {
      // User connected or switched accounts
      setAccount(accounts[0]);
      setIsConnected(true);
      updateBalance(accounts[0]);
      updateChainInfo();
    }
  };

  // Handle chain changes
  const handleChainChanged = () => {
    // MetaMask recommends reloading the page on chain changes
    window.location.reload();
  };

  // Update balance
  const updateBalance = async (address) => {
    if (!web3 || !address) return;
    
    try {
      const balanceWei = await web3.eth.getBalance(address);
      const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
      setBalance(parseFloat(balanceEth).toFixed(4));
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  // Update chain information
  const updateChainInfo = async () => {
    if (!isMetaMaskInstalled) return;
    
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(chainId);
      
      // Map chainId to name
      const chainNames = {
        '0x1': 'Ethereum Mainnet',
        '0x5': 'Goerli Testnet',
        '0xaa36a7': 'Sepolia Testnet',
        '0x89': 'Polygon Mainnet',
        '0x13881': 'Mumbai Testnet',
        '0xa4b1': 'Arbitrum One',
        '0xa': 'Optimism',
        '0xa86a': 'Avalanche C-Chain',
      };
      
      setChainName(chainNames[chainId] || `Chain ID: ${chainId}`);
    } catch (error) {
      console.error('Error getting chain info:', error);
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    if (!isMetaMaskInstalled) {
      setError('MetaMask is not installed. Please install MetaMask to use this feature.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      handleAccountsChanged(accounts);
    } catch (error) {
      if (error.code === 4001) {
        setError('Please connect to MetaMask.');
      } else {
        console.error('Error connecting wallet:', error);
        setError('Error connecting to wallet. Check console for details.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const value = {
    web3,
    account,
    chainId,
    chainName,
    balance,
    isConnected,
    isLoading,
    error,
    isMetaMaskInstalled,
    connectWallet,
    formatAddress
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

// Custom hook to use the Web3 context
export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export default Web3Context;



export const chainId2Name = {
  // Ethereum networks
  1: 'Ethereum Mainnet',
  3: 'Ropsten Testnet (deprecated)',
  4: 'Rinkeby Testnet (deprecated)',
  5: 'Goerli Testnet',
  42: 'Kovan Testnet (deprecated)',
  11155111: 'Sepolia Testnet',

  // Layer 2 networks
  10: 'Optimism',
  42161: 'Arbitrum One',
  42170: 'Arbitrum Nova',
  421614: 'Arbitrum Sepolia', // 新增的 Arbitrum Sepolia 測試網
  421613: 'Arbitrum Goerli',
  59144: 'Linea Mainnet',
  59140: 'Linea Goerli',
  534352: 'Scroll Mainnet',
  534353: 'Scroll Sepolia',

  // Polygon networks
  137: 'Polygon Mainnet',
  80001: 'Mumbai Testnet',

  // Binance Smart Chain networks
  56: 'BSC Mainnet',
  97: 'BSC Testnet',

  // Avalanche networks
  43114: 'Avalanche C-Chain',
  43113: 'Avalanche Fuji Testnet',

  // Fantom networks
  250: 'Fantom Opera',
  4002: 'Fantom Testnet',

  // Gnosis Chain (xDai)
  100: 'Gnosis Chain',

  // Celo networks
  42220: 'Celo Mainnet',
  44787: 'Celo Alfajores Testnet',

  // Base networks
  8453: 'Base Mainnet',
  84531: 'Base Goerli',

  // Other networks
  1337: 'Localhost (Hardhat)',
  31337: 'Localhost (Anvil)',
};
