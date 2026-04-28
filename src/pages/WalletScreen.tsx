import { apiFetch } from '../api';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  ChevronRight,
  RefreshCcw,
  Clock,
  CircleDollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import './WalletScreen.css';

interface Transaction {
  id: number;
  amount: number;
  type: 'TOPUP' | 'SPEND' | 'REFUND';
  description: string;
  timestamp: string;
  referenceId?: string;
}

const WalletScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(user?.ritzTokenBalance || 0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      // Fetch balance
      const balRes = await apiFetch(`http://${window.location.hostname}:8080/api/wallet/balance/${user.id}`);
      const balData = await balRes.json();
      setBalance(balData.balance || 0);

      // Fetch transactions
      const transRes = await apiFetch(`http://${window.location.hostname}:8080/api/wallet/transactions/${user.id}`);
      const transData = await transRes.json();
      setTransactions(transData);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container wallet-page">
      <Header title="My Wallet" showCart={false} />

      <main className="safe-area-bottom">
        {/* Balance Card Section */}
        <section className="balance-section">
          <motion.div 
            className="ritz-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="card-top">
              <div className="card-branding">
                <span className="brand-name">Ritz Wallet</span>
                <span className="brand-tier">RIT Canteen</span>
                <div className="card-chip" />
              </div>
              <button className="refresh-btn" onClick={fetchData}>
                <RefreshCcw size={18} className={isLoading ? 'spinning' : ''} />
              </button>
            </div>
            
            <div className="token-balance-wrapper">
              <div className="token-balance">
                <span className="token-symbol">R</span>
                <span className="token-amount">{balance.toLocaleString()}</span>
              </div>
            </div>

            <div className="card-bottom">
              <div className="card-holder-info">
                <span className="card-holder-label">Card Holder</span>
                <span className="card-holder-name">{user?.name || 'Guest User'}</span>
              </div>
              <button className="topup-card-action" onClick={() => navigate('/topup')}>
                <Plus size={18} />
                <span>Top Up</span>
              </button>
            </div>
          </motion.div>
        </section>

        {/* Transactions Section */}
        <section className="transactions-section">
          <div className="section-header">
            <h3 className="section-title">Recent Transactions</h3>
            <span className="view-all">See All</span>
          </div>

          <div className="transactions-list">
            {isLoading && transactions.length === 0 ? (
              <div className="loading-state">
                <div className="loader-dots">
                  <span /> <span /> <span />
                </div>
              </div>
            ) : transactions.length > 0 ? (
              transactions.map((t, index) => (
                <motion.div 
                  key={t.id}
                  className="transaction-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className={`trans-icon ${t.type.toLowerCase()}`}>
                    {t.type === 'TOPUP' ? (
                      <ArrowUpRight size={20} />
                    ) : (
                      <ArrowDownLeft size={20} />
                    )}
                  </div>
                  <div className="trans-details">
                    <span className="trans-desc">{t.description}</span>
                    <span className="trans-time">
                      <Clock size={12} />
                      {formatDate(t.timestamp)}
                    </span>
                  </div>
                  <div className={`trans-amount ${t.type === 'TOPUP' ? 'credit' : 'debit'}`}>
                    {t.type === 'TOPUP' ? '+' : '-'}{t.amount}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="empty-transactions">
                <div className="empty-icon">
                  <Wallet size={48} />
                </div>
                <p>No transactions yet</p>
                <span>Tokens spent on food will appear here</span>
              </div>
            )}
          </div>
        </section>

        {/* Token Info Section */}
        <section className="token-perks">
          <div className="perk-card">
            <div className="perk-icon">💎</div>
            <div className="perk-info">
              <h4>Ritz Perks</h4>
              <p>Get exclusive discounts when paying with tokens.</p>
            </div>
            <ChevronRight size={20} />
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
};

export default WalletScreen;
