import { useState, useRef } from 'react';
import { 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useMetaMask } from './hooks/useMetaMask';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { WalletProfile } from './components/WalletProfile';
import { TransferForm } from './components/TransferForm';
import { SignaturePad } from './components/SignaturePad';
import type { Transaction, TokenBalance } from './types';

export default function App() {
  const {
    isConnected,
    isSigned,
    walletAddress,
    networkName,
    ethBalance,
    tokenSymbol,
    providerName,
    rawChainId,
    showSignaturePopup,
    connectWallet,
    confirmSignature,
    handleDisconnect,
    fetchBalance,
    switchNetwork
  } = useMetaMask();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'wallet' | 'transactions' | 'explorer' | 'settings'>('dashboard');
  const [notifications, setNotifications] = useState<string[]>([
    'Welcome to AuraPay! Connected to MetaMask API.',
    'Switch your MetaMask network to Sepolia to transact.'
  ]);

  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([
    { symbol: 'USDC', name: 'USD Coin', balance: '120.50', valueUsd: '120.50', iconColor: 'bg-blue-100 text-blue-600' },
    { symbol: 'LINK', name: 'Chainlink', balance: '15.25', valueUsd: '210.45', iconColor: 'bg-indigo-100 text-indigo-600' },
    { symbol: 'UNI', name: 'Uniswap', balance: '8.00', valueUsd: '56.32', iconColor: 'bg-pink-100 text-pink-600' },
  ]);

  // Tx States
  const [showTxPopup, setShowTxPopup] = useState(false);
  const [txState, setTxState] = useState<'Waiting for Signature' | 'Pending' | 'Success' | 'Failed'>('Waiting for Signature');
  
  // Pending transfer context
  const [pendingTx, setPendingTx] = useState<{ recipient: string; amount: string; token: 'ETH' | 'USDC' | 'LINK' | 'UNI' } | null>(null);
  
  // Handwritten drawing states
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasSignedHandwritten, setHasSignedHandwritten] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      hash: '0x3a9b...7e21',
      recipient: '0x9f83...a8c2',
      amount: '0.5 ETH',
      token: 'ETH',
      status: 'Success',
      timestamp: '2 mins ago'
    }
  ]);

  const addNotification = (msg: string) => {
    setNotifications(prev => [msg, ...prev]);
  };

  const handleTransferInit = (recipient: string, amount: string, token: 'ETH' | 'USDC' | 'LINK' | 'UNI') => {
    setPendingTx({ recipient, amount, token });
    setTxState('Waiting for Signature');
    setHasSignedHandwritten(false);
    setShowTxPopup(true);
  };

  const confirmTransaction = async (shouldSucceed: boolean) => {
    if (!shouldSucceed || !pendingTx) {
      setTxState('Failed');
      addNotification('Transaction rejected by user.');
      setTimeout(() => setShowTxPopup(false), 1500);
      return;
    }

    let signatureDataUrl = '';
    if (canvasRef.current && hasSignedHandwritten) {
      signatureDataUrl = canvasRef.current.toDataURL();
    }

    setTxState('Pending');
    
    try {
      if (pendingTx.token === 'ETH' && !isDemoMode) {
        const valueWei = parseFloat(pendingTx.amount) * 1e18;
        const valueHex = `0x${valueWei.toString(16)}`;

        const provider = window.ethereum?.providers 
          ? window.ethereum.providers.find((p: any) => p.isMetaMask) || window.ethereum 
          : window.ethereum;

        const txHash = await provider.request({
          method: 'eth_sendTransaction',
          params: [
            {
              from: walletAddress,
              to: pendingTx.recipient,
              value: valueHex,
            },
          ],
        });

        setTxState('Success');
        
        const newTx: Transaction = {
          hash: `${txHash.slice(0, 6)}...${txHash.slice(-4)}`,
          recipient: `${pendingTx.recipient.slice(0, 6)}...${pendingTx.recipient.slice(-4)}`,
          amount: `${pendingTx.amount} ETH`,
          token: 'ETH',
          status: 'Success',
          timestamp: 'Just now',
          signatureImage: signatureDataUrl || undefined
        };
        setTransactions(prev => [newTx, ...prev]);
        fetchBalance(walletAddress);
        addNotification(`Transfer successful: Hash ${txHash.slice(0, 8)}...`);
      } else {
        // Mock ERC20
        setTimeout(() => {
          setTxState('Success');
          const newTx: Transaction = {
            hash: '0x' + Math.random().toString(16).substring(2, 10) + '...' + Math.random().toString(16).substring(2, 6),
            recipient: `${pendingTx.recipient.slice(0, 6)}...${pendingTx.recipient.slice(-4)}`,
            amount: `${pendingTx.amount} ${pendingTx.token}`,
            token: pendingTx.token,
            status: 'Success',
            timestamp: 'Just now',
            signatureImage: signatureDataUrl || undefined
          };
          setTransactions(prev => [newTx, ...prev]);

          setTokenBalances(prev => 
            prev.map(t => {
              if (t.symbol === pendingTx.token) {
                const bal = parseFloat(t.balance) - parseFloat(pendingTx.amount);
                return { ...t, balance: bal.toFixed(2) };
              }
              return t;
            })
          );
          addNotification(`Transferred ${pendingTx.amount} ${pendingTx.token} successfully.`);
        }, 1500);
      }
    } catch (err: any) {
      console.error(err);
      setTxState('Failed');
      addNotification(`Transaction failed: ${err.message || err}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      <Header 
        isConnected={isConnected}
        isSigned={isSigned}
        walletAddress={walletAddress}
        networkName={networkName}
        connectWallet={connectWallet}
        notifications={notifications}
        clearNotifications={() => setNotifications([])}
        switchNetwork={switchNetwork}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isConnected={isConnected}
          isSigned={isSigned}
          handleDisconnect={handleDisconnect}
          connectWallet={connectWallet}
        />

        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 lg:p-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <WalletProfile 
              isConnected={isConnected}
              isSigned={isSigned}
              walletAddress={walletAddress}
              networkName={networkName}
              ethBalance={ethBalance}
              tokenBalances={tokenBalances}
              connectWallet={connectWallet}
              tokenSymbol={tokenSymbol}
              providerName={providerName}
              rawChainId={rawChainId}
            />

            <TransferForm 
              isConnected={isConnected}
              isSigned={isSigned}
              ethBalance={ethBalance}
              tokenBalances={tokenBalances}
              onTransferInit={handleTransferInit}
              isDemoMode={isDemoMode}
              setIsDemoMode={setIsDemoMode}
            />

          </div>

          {/* RECENT TRANSACTIONS */}
          <div className="max-w-6xl mx-auto mt-8">
            <div className="bg-white rounded-3xl border border-slate-100 p-6 lg:p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Recent Transactions</h2>
                  <p className="text-xs text-slate-400">Transactions executed in the current session</p>
                </div>
                <button 
                  onClick={() => {
                    if (walletAddress) fetchBalance(walletAddress);
                    addNotification('Refreshed account balances');
                  }}
                  className="p-2 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 transition-all flex items-center space-x-1 text-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="pb-4 font-semibold">Transaction Hash</th>
                      <th className="pb-4 font-semibold">Recipient</th>
                      <th className="pb-4 font-semibold">Amount</th>
                      <th className="pb-4 font-semibold">Verification Chữ Ký</th>
                      <th className="pb-4 font-semibold">Status</th>
                      <th className="pb-4 font-semibold">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.map((tx, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 font-mono font-medium text-indigo-600 flex items-center space-x-1">
                          <span>{tx.hash}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400 hover:text-slate-600 cursor-pointer" />
                        </td>
                        <td className="py-4 font-mono text-slate-600">{tx.recipient}</td>
                        <td className="py-4 font-bold text-slate-800">{tx.amount}</td>
                        <td className="py-4">
                          {tx.signatureImage ? (
                            <img 
                              src={tx.signatureImage} 
                              alt="Handwritten Signature" 
                              className="h-8 max-w-[80px] bg-slate-50 rounded border border-slate-100 p-0.5 object-contain"
                            />
                          ) : (
                            <span className="text-slate-400 text-[10px] italic">No physical sign</span>
                          )}
                        </td>
                        <td className="py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${tx.status === 'Success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-4 text-slate-400">{tx.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* METAMASK SIGNATURE POPUP */}
      {showSignaturePopup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-sm w-full p-6 space-y-6 text-center animate-in zoom-in-95 duration-150">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-extrabold text-lg text-slate-900">Personal Signature Request</h3>
              <p className="text-xs text-slate-500">
                Verify ownership of this wallet address by signing this challenge message on MetaMask.
              </p>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-left font-mono text-[10px] text-slate-500 space-y-1">
                <p className="font-bold text-slate-700">Message to sign:</p>
                <p>Welcome to AuraPay Dashboard!</p>
                <p>Nonce: 9f83a8c2d8e1c4e7</p>
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <button
                onClick={confirmSignature}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md shadow-indigo-100"
              >
                Sign on MetaMask
              </button>
            </div>
          </div>
        </div>
      )}

      {/* METAMASK TRANSACTION CONFIRMATION POPUP */}
      {showTxPopup && pendingTx && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6 space-y-6 animate-in zoom-in-95 duration-150">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900">Confirm & Draw Signature</span>
              <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full font-mono">{txState}</span>
            </div>

            {txState === 'Waiting for Signature' && (
              <div className="space-y-4">
                <div className="space-y-1 text-center">
                  <h3 className="font-extrabold text-lg text-slate-900">Sign to Authorized Transfer</h3>
                  <p className="text-xs text-slate-500">
                    Draw your signature below to authorize the transfer.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block">Amount</span>
                    <span className="font-bold text-slate-800">{pendingTx.amount} {pendingTx.token}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">To</span>
                    <span className="font-mono font-medium text-slate-800">{pendingTx.recipient.slice(0, 6)}...{pendingTx.recipient.slice(-4)}</span>
                  </div>
                </div>

                <SignaturePad 
                  canvasRef={canvasRef}
                  hasSignedHandwritten={hasSignedHandwritten}
                  setHasSignedHandwritten={setHasSignedHandwritten}
                />

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => confirmTransaction(false)}
                    className="w-full hover:bg-red-50 border border-red-200 text-red-600 text-xs font-bold py-3 rounded-xl transition-all"
                  >
                    Reject Transfer
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmTransaction(true)}
                    disabled={!hasSignedHandwritten}
                    className={`w-full text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md ${!hasSignedHandwritten ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}
                  >
                    Approve & Sign
                  </button>
                </div>
              </div>
            )}

            {txState === 'Pending' && (
              <div className="text-center py-8 space-y-4">
                <div className="flex justify-center">
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Processing Transaction...</h4>
                  <p className="text-xs text-slate-500 mt-1">Please confirm gas fee on MetaMask extension window.</p>
                </div>
              </div>
            )}

            {txState === 'Success' && (
              <div className="space-y-4 text-center py-4">
                <div className="flex justify-center">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Transaction Confirmed!</h4>
                  <p className="text-xs text-slate-500 mt-1">Your assets have been successfully transferred.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTxPopup(false)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 rounded-xl transition-all"
                >
                  Back to Dashboard
                </button>
              </div>
            )}

            {txState === 'Failed' && (
              <div className="space-y-4 text-center py-4">
                <div className="flex justify-center">
                  <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Transaction Failed</h4>
                  <p className="text-xs text-slate-500 mt-1">The request was rejected by MetaMask or gas error occurred.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTxPopup(false)}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-3 rounded-xl transition-all"
                >
                  Close Window
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
