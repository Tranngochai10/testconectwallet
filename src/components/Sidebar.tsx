import React from 'react';
import { Layers, Wallet, Activity, Compass, Settings } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isConnected: boolean;
  isSigned: boolean;
  handleDisconnect: () => void;
  connectWallet: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isConnected,
  isSigned,
  handleDisconnect,
  connectWallet
}) => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        <div className="space-y-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Layers className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('wallet')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${activeTab === 'wallet' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Wallet className="w-5 h-5" />
            <span>Wallet</span>
          </button>
          <button 
            onClick={() => setActiveTab('transactions')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${activeTab === 'transactions' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Activity className="w-5 h-5" />
            <span>Transactions</span>
          </button>
          <button 
            onClick={() => setActiveTab('explorer')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${activeTab === 'explorer' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Compass className="w-5 h-5" />
            <span>Explorer</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-6">
        {isConnected && isSigned ? (
          <div className="flex items-center justify-between bg-slate-50 border border-slate-100 p-3 rounded-xl">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                ID
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">Connected</p>
                <p className="text-[10px] text-slate-400">Signature Verified</p>
              </div>
            </div>
            <button 
              onClick={handleDisconnect}
              className="text-[10px] text-red-500 hover:text-red-700 font-semibold uppercase hover:underline"
            >
              Exit
            </button>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center">
            <p className="text-xs text-slate-500 mb-2">Manage your assets securely</p>
            <button 
              onClick={connectWallet}
              className="w-full text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-lg transition-colors"
            >
              Start Session
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
