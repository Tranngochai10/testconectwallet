import React, { useState } from 'react';
import { Wallet, Bell } from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
  isSigned: boolean;
  walletAddress: string;
  networkName: string;
  connectWallet: () => void;
  notifications: string[];
  clearNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isConnected,
  isSigned,
  walletAddress,
  networkName,
  connectWallet,
  notifications,
  clearNotifications
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
          <Wallet className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 m-0 p-0 leading-none">AuraPay</h1>
          <span className="text-[10px] text-indigo-600 font-semibold tracking-wider uppercase">Web3 Portal</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Network Badge */}
        <div className="flex items-center space-x-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3.5 py-1.5 rounded-full text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
          <span>{networkName}</span>
        </div>

        {/* Connected Wallet Indicator */}
        {isConnected && isSigned ? (
          <div className="flex items-center space-x-2 bg-slate-100 border border-slate-200 pl-3 pr-4 py-1.5 rounded-full text-xs font-medium text-slate-700">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
          </div>
        ) : (
          <button 
            onClick={connectWallet}
            className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-full shadow-sm transition-colors duration-150"
          >
            Connect Wallet
          </button>
        )}

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors duration-150 relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 pb-2 border-b border-slate-100 flex justify-between items-center">
                <span className="font-semibold text-sm text-slate-900">Notifications</span>
                <button 
                  onClick={clearNotifications}
                  className="text-[11px] text-indigo-600 hover:underline"
                >
                  Clear All
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto px-2 py-1 mt-1 space-y-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No new notifications</p>
                ) : (
                  notifications.map((notif, index) => (
                    <div key={index} className="p-2.5 rounded-xl hover:bg-slate-50 text-xs text-slate-600 transition-colors">
                      {notif}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
