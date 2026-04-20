import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  CircleDollarSign, 
  ShieldCheck, 
  Zap,
  Star,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import './TopUpScreen.css';

const TOKEN_PACKS = [
  { amount: 100, label: 'Starter Pack', icon: <Zap size={16} /> },
  { amount: 500, label: 'Standard Pack', icon: <Star size={16} />, popular: true },
  { amount: 1000, label: 'Premium Pack', icon: <ShieldCheck size={16} /> },
  { amount: 2000, label: 'Ritz Master', icon: <CircleDollarSign size={16} /> }
];

const TopUpScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleTopUp = async () => {
    if (!user || !amount || parseFloat(amount) <= 0) return;
    
    const currentBalance = user.ritzTokenBalance || 0;
    const topUpAmount = parseFloat(amount);
    
    if (currentBalance + topUpAmount > 5000) {
      alert(`Wallet limit exceeded. You can only add up to ${5000 - currentBalance} more tokens.`);
      return;
    }
    
    setIsProcessing(true);
    try {
      const response = await fetch(`http://${window.location.hostname}:8080/api/wallet/topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount: topUpAmount
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowSuccess(true);
        setTimeout(() => {
          navigate('/wallet');
        }, 2000);
      } else {
        alert(data.error || 'Failed to add tokens');
      }
    } catch (error) {
      console.error('Top up error:', error);
      alert('Error connecting to server');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container topup-page">
      <header className="topup-header">
        <button className="back-btn" onClick={() => navigate('/wallet')}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="header-title">Add Ritz Tokens</h1>
        <div style={{ width: 24 }} />
      </header>

      <main className="safe-area-bottom">
        <div className="topup-container">
          <div className="input-card">
            <span className="input-label">Enter Token Amount</span>
            <div className="amount-input-wrapper">
              <span className="currency-symbol">R</span>
              <input 
                type="number" 
                className="amount-input" 
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
            </div>
            <p className="input-hint">1 Ritz Token = R1.00</p>
          </div>

          <div className="packs-grid">
            {TOKEN_PACKS.map((pack) => (
              <button 
                key={pack.amount}
                className={`pack-card ${amount === pack.amount.toString() ? 'selected' : ''} ${pack.popular ? 'popular' : ''}`}
                onClick={() => setAmount(pack.amount.toString())}
              >
                {pack.popular && <span className="popular-badge">Popular</span>}
                <div className="pack-icon">{pack.icon}</div>
                <div className="pack-amount">R{pack.amount}</div>
                <div className="pack-label">{pack.label}</div>
              </button>
            ))}
          </div>

          <div className="security-info">
            <ShieldCheck size={16} />
            <span>Secure simulated transaction via Ritz Payments</span>
          </div>
        </div>
      </main>

      <div className="topup-footer">
        <button 
          className="confirm-btn"
          disabled={!amount || isProcessing}
          onClick={handleTopUp}
        >
          {isProcessing ? (
            <div className="loading-spinner" />
          ) : (
            `Add R${amount || '0'} to Wallet`
          )}
        </button>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            className="success-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="success-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="success-icon-wrapper">
                <CheckCircle2 size={64} className="success-check" />
              </div>
              <h2>Tokens Added!</h2>
              <p>R{amount} has been added to your Ritz Wallet.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TopUpScreen;
