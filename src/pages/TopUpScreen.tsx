import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  CircleDollarSign, 
  ShieldCheck, 
  Zap,
  Star,
  CheckCircle2,
  AlertCircle
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
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validate = (val: string) => {
    if (!val) {
      setError(null);
      return;
    }
    const num = parseFloat(val);
    if (num < 100) {
      setError('Minimum amount is 100 Ritz');
    } else if (num > 5000) {
      setError('Maximum limit is 5,000 Ritz per transaction');
    } else {
      setError(null);
    }
  };

  const handleAmountChange = (val: string) => {
    setAmount(val);
    validate(val);
  };

  const handleTopUp = async () => {
    if (!user || !amount || parseFloat(amount) <= 0) return;
    
    const topUpAmount = parseFloat(amount);
    if (topUpAmount < 100 || topUpAmount > 5000) {
      validate(amount); // Ensure error is shown
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
        setError(data.error || 'Failed to add tokens');
      }
    } catch (error) {
      console.error('Top up error:', error);
      setError('Error connecting to server. Please try again.');
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
                style={{ color: parseFloat(amount) > 5000 ? '#ef4444' : '#6366f1' }}
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                autoFocus
              />
            </div>
            {error ? (
              <div className="error-message">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            ) : (
              <p className="input-hint">1 Ritz Token = R1.00</p>
            )}
          </div>

          <div className="packs-grid">
            {TOKEN_PACKS.map((pack) => (
              <button 
                key={pack.amount}
                className={`pack-card ${amount === pack.amount.toString() ? 'selected' : ''} ${pack.popular ? 'popular' : ''}`}
                onClick={() => handleAmountChange(pack.amount.toString())}
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
          disabled={!amount || !!error || isProcessing}
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
