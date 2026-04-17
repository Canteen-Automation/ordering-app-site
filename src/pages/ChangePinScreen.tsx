import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import './ChangePinScreen.css';

const ChangePinScreen: React.FC = () => {
  const navigate = useNavigate();
  const { changePin } = useAuth();
  
  const [step, setStep] = useState<'current' | 'new' | 'success'>('current');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerifyCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPin.length !== 6) {
      setError('PIN must be 6 digits');
      return;
    }
    setError(null);
    setStep('new');
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPin.length !== 6) {
      setError('New PIN must be 6 digits');
      return;
    }
    if (newPin !== confirmPin) {
      setError('New PINs do not match');
      return;
    }
    if (newPin === currentPin) {
      setError('New PIN cannot be the same as current PIN');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    const result = await changePin(currentPin, newPin);
    setIsLoading(false);

    if (result.success) {
      setStep('success');
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } else {
      setError(result.message);
      // If "incorrect current PIN", go back to step 1
      if (result.message.toLowerCase().includes('current pin')) {
        setStep('current');
        setCurrentPin('');
      }
    }
  };

  return (
    <div className="container change-pin-page">
      <Header title="Change Security PIN" onBack={() => navigate('/profile')} showCart={false} />
      
      <main className="change-pin-content">
        <div className="change-pin-card animate-slideUp">
          {step === 'current' && (
            <>
              <div className="step-indicator">Step 1 of 2</div>
              <h2 className="step-title">Verify Identity</h2>
              <p className="step-desc">Please enter your current 6-digit PIN to continue.</p>
              
              <form onSubmit={handleVerifyCurrent} className="pin-form">
                <div className="form-group">
                  <div className="input-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input 
                      type="password" 
                      placeholder="Current PIN" 
                      value={currentPin}
                      onChange={(e) => setCurrentPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                      autoFocus
                    />
                  </div>
                </div>
                {error && <div className="error-message">{error}</div>}
                <button 
                  className="primary-button" 
                  type="submit" 
                  disabled={currentPin.length !== 6}
                >
                  Verify PIN
                </button>
              </form>
            </>
          )}

          {step === 'new' && (
            <>
              <button className="back-link" onClick={() => setStep('current')}>
                <ChevronLeft size={16} /> Back
              </button>
              <div className="step-indicator">Step 2 of 2</div>
              <h2 className="step-title">Set New PIN</h2>
              <p className="step-desc">Create a new 6-digit security PIN for your account.</p>
              
              <form onSubmit={handleChangePin} className="pin-form">
                <div className="form-group">
                  <label>New PIN</label>
                  <div className="input-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input 
                      type="password" 
                      placeholder="Enter new 6-digit PIN" 
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                      autoFocus
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Confirm New PIN</label>
                  <div className="input-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input 
                      type="password" 
                      placeholder="Confirm new PIN" 
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    />
                  </div>
                </div>

                {error && <div className="error-message">{error}</div>}
                
                <button 
                  className="primary-button" 
                  type="submit" 
                  disabled={isLoading || newPin.length !== 6 || confirmPin.length !== 6}
                >
                  {isLoading ? 'Updating...' : 'Update Security PIN'}
                </button>
              </form>
            </>
          )}

          {step === 'success' && (
            <div className="success-state">
              <CheckCircle2 size={64} className="success-check" />
              <h2 className="step-title">PIN Updated!</h2>
              <p className="step-desc">Your security PIN has been changed successfully. Redirecting you to profile...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ChangePinScreen;
