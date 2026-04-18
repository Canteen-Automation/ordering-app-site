import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { FoodProvider } from './contexts/FoodContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomeScreen from './pages/HomeScreen';
import CategoryScreen from './pages/CategoryScreen';
import ItemDetailScreen from './pages/ItemDetailScreen';
import CartScreen from './pages/CartScreen';
import CheckoutScreen from './pages/CheckoutScreen';
import SuccessScreen from './pages/SuccessScreen';
import MyOrdersScreen from './pages/MyOrdersScreen';
import LoginScreen from './pages/LoginScreen';
import ProfileScreen from './pages/ProfileScreen';
import ChangePinScreen from './pages/ChangePinScreen';
import StallDetailScreen from './pages/StallDetailScreen';
import StockAlert from './components/StockAlert';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <FoodProvider>
        <CartProvider>
          <StockAlert />
          <Router>
            <Routes>
              <Route path="/login" element={<LoginScreen />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <HomeScreen />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute>
                  <MyOrdersScreen />
                </ProtectedRoute>
              } />
              <Route path="/category/:categoryId" element={
                <ProtectedRoute>
                  <CategoryScreen />
                </ProtectedRoute>
              } />
              <Route path="/item/:itemId" element={
                <ProtectedRoute>
                  <ItemDetailScreen />
                </ProtectedRoute>
              } />
              <Route path="/stall/:id" element={
                <ProtectedRoute>
                  <StallDetailScreen />
                </ProtectedRoute>
              } />
              
              <Route path="/cart" element={
                <ProtectedRoute>
                  <CartScreen />
                </ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <CheckoutScreen />
                </ProtectedRoute>
              } />
              <Route path="/success" element={
                <ProtectedRoute>
                  <SuccessScreen />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfileScreen />
                </ProtectedRoute>
              } />
              <Route path="/change-pin" element={
                <ProtectedRoute>
                  <ChangePinScreen />
                </ProtectedRoute>
              } />
            </Routes>
          </Router>
        </CartProvider>
      </FoodProvider>
    </AuthProvider>
  );
}

export default App;
