import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import type { TokenBalance } from '../types';

interface TransferFormProps {
  isConnected: boolean;
  isSigned: boolean;
  ethBalance: string;
  tokenBalances: TokenBalance[];
  onTransferInit: (recipient: string, amount: string, token: 'ETH' | 'USDC' | 'LINK' | 'UNI') => void;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
}

export const TransferForm: React.FC<TransferFormProps> = ({
  isConnected,
  isSigned,
  ethBalance,
  tokenBalances,
  onTransferInit,
  isDemoMode,
  setIsDemoMode
}) => {
  const [selectedToken, setSelectedToken] = useState<'ETH' | 'USDC' | 'LINK' | 'UNI'>('ETH');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [gasFee, setGasFee] = useState('0.000105 ETH ($0.35)');

  useEffect(() => {
    if (selectedToken === 'ETH') {
      setGasFee('0.000105 ETH ($0.35)');
    } else {
      setGasFee('0.000245 ETH ($0.82)');
    }
  }, [selectedToken]);

  const handleClearForm = () => {
    setRecipient('');
    setAmount('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !amount) {
      alert('Please fill in all fields');
      return;
    }
    onTransferInit(recipient, amount, selectedToken);
  };

  return (
    <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-900">Transfer Assets</h2>
        
        {/* Demo Mode Toggle */}
        <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Demo Mode</span>
          <button
            type="button"
            onClick={() => setIsDemoMode(!isDemoMode)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isDemoMode ? 'bg-indigo-600' : 'bg-slate-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                isDemoMode ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Select Token */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Asset</label>
          <div className="grid grid-cols-4 gap-2">
            {(['ETH', 'USDC', 'LINK', 'UNI'] as const).map((token) => (
              <button
                key={token}
                type="button"
                onClick={() => setSelectedToken(token)}
                className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${selectedToken === token ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {token}
              </button>
            ))}
          </div>
        </div>

        {/* Recipient Wallet Address */}
        <div>
          <label htmlFor="recipient" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Recipient Wallet Address</label>
          <input
            id="recipient"
            type="text"
            placeholder="e.g. 0x9f83...a8c2"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400"
            required
          />
        </div>

        {/* Amount */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="amount" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount to Send</label>
            {isConnected && isSigned && (
              <button 
                type="button"
                onClick={() => {
                  if (selectedToken === 'ETH') {
                    setAmount((parseFloat(ethBalance) - 0.001).toFixed(4));
                  } else {
                    const b = tokenBalances.find(t => t.symbol === selectedToken);
                    if (b) setAmount(b.balance);
                  }
                }}
                className="text-[10px] font-bold text-indigo-600 hover:underline"
              >
                Send Max
              </button>
            )}
          </div>
          <div className="relative">
            <input
              id="amount"
              type="number"
              step="any"
              min="0"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 pr-16 text-sm text-slate-800 outline-none transition-all"
              required
            />
            <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-400">{selectedToken}</span>
          </div>
        </div>

        {/* Estimated Gas Fee */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Estimated Gas Fee</label>
          <input
            type="text"
            value={gasFee}
            disabled
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-500 cursor-not-allowed"
          />
        </div>

        {/* Form Actions */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClearForm}
            className="w-1/3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold py-3 px-4 rounded-xl text-xs transition-colors"
          >
            Clear Form
          </button>
          <button
            type="submit"
            disabled={!isConnected || !isSigned}
            className={`w-2/3 text-xs font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center justify-center space-x-2 ${(!isConnected || !isSigned) ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isDemoMode ? 'Simulate Transfer' : 'Transfer Asset'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
