import React, { useState } from 'react';
import { Wallet, ChevronRight, Check, Copy, CheckCircle2 } from 'lucide-react';
import type { TokenBalance } from '../types';

interface WalletProfileProps {
  isConnected: boolean;
  isSigned: boolean;
  walletAddress: string;
  networkName: string;
  ethBalance: string;
  tokenBalances: TokenBalance[];
  connectWallet: () => void;
}

export const WalletProfile: React.FC<WalletProfileProps> = ({
  isConnected,
  isSigned,
  walletAddress,
  networkName,
  ethBalance,
  tokenBalances,
  connectWallet
}) => {
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 opacity-50"></div>
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-900">Wallet Profile</h2>
        {isConnected && isSigned && (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Wallet Connected</span>
          </span>
        )}
      </div>

      {!isConnected || !isSigned ? (
        <div className="text-center py-12 px-4 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-2">
            <Wallet className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800">No Wallet Connected</h3>
          <p className="text-sm text-slate-500 max-w-sm">
            Connect your MetaMask wallet to view address, balances, and perform token transfers on Sepolia network.
          </p>
          <button
            onClick={connectWallet}
            className="w-full max-w-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-2xl shadow-lg shadow-indigo-100 transition-all transform hover:-translate-y-0.5 duration-150 flex items-center justify-center space-x-2"
          >
            <span>Connect Wallet</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Wallet Address & Status Details */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 font-medium">Wallet Address</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-mono font-semibold text-slate-800">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
                <button 
                  onClick={copyAddress}
                  className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                  title="Copy Address"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <hr className="border-slate-200/60" />

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Network</span>
                <span className="font-semibold text-slate-700">{networkName}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Signature Status</span>
                <span className="font-semibold text-emerald-600 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </span>
              </div>
            </div>
          </div>

          {/* Balance Showcase */}
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400">Total ETH Balance</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{ethBalance}</span>
              <span className="text-lg font-bold text-indigo-600">ETH</span>
            </div>
            <p className="text-xs text-slate-400">≈ ${(parseFloat(ethBalance) * 3240).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} USD</p>
          </div>

          {/* ERC20 Tokens List */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">ERC20 Token Balances</h4>
            <div className="space-y-2">
              {tokenBalances.map((token, index) => (
                <div key={index} className="flex justify-between items-center p-3 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${token.iconColor}`}>
                      {token.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <span className="font-bold text-sm text-slate-800 block">{token.symbol}</span>
                      <span className="text-[10px] text-slate-400">{token.name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-sm text-slate-800 block">{token.balance}</span>
                    <span className="text-[10px] text-slate-400">${token.valueUsd} USD</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
