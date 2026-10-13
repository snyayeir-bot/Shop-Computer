import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [walletDetails, setWalletDetails] = useState({
    balance: 0,
    personalBalance: 0,
    shopBalance: 0,
    shopPendingBalance: 0,
  });
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchBalance = async () => {
    if (!user) {
      setBalance(0);
      setWalletDetails({ balance: 0, personalBalance: 0, shopBalance: 0, shopPendingBalance: 0 });
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/wallet/balance');
      if (res.data?.wallet) {
        const bal = Number(res.data.wallet.balance || 0);
        setBalance(bal);
        setWalletDetails({
          balance: bal,
          personalBalance: Number(res.data.wallet.personalBalance || 0),
          shopBalance: Number(res.data.wallet.shopBalance || 0),
          shopPendingBalance: Number(res.data.wallet.shopPendingBalance || 0),
        });
      }
    } catch (err) {
      console.error('Failed to fetch wallet balance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [user]);

  return (
    <WalletContext.Provider
      value={{
        balance,
        walletDetails,
        setBalance,
        fetchBalance,
        isTopUpOpen,
        setIsTopUpOpen,
        loading
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
