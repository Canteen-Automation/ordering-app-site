import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ShoppingBag, UtensilsCrossed, AlertTriangle } from 'lucide-react';
import './NotFoundScreen.css';

const NotFoundScreen: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="container not-found-page">
            <div className="not-found-content">
                <div className="not-found-icon-wrapper">
                    <UtensilsCrossed size={80} className="not-found-icon" />
                    <div className="alert-badge">
                        <AlertTriangle size={24} />
                    </div>
                </div>
                
                <h1 className="not-found-title">Page Not Found</h1>
                <p className="not-found-subtitle">
                    Oops! Looks like this menu item doesn't exist. The link might be broken or the page has been moved.
                </p>
                
                <div className="not-found-visual">
                    <div className="error-code">404</div>
                    <div className="decoration-line"></div>
                </div>
                
                <div className="not-found-actions">
                    <button 
                        className="secondary-button"
                        onClick={() => navigate('/orders')}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                        <ShoppingBag size={18} /> My Orders
                    </button>
                    <button 
                        className="primary-button"
                        onClick={() => navigate('/')}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                        <Home size={18} /> Back to Home
                    </button>
                </div>

                <div className="not-found-footer">
                    <p>Need help? Contact the canteen staff</p>
                </div>
            </div>
        </div>
    );
};

export default NotFoundScreen;
