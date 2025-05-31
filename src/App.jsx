import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, Plus, Minus, Trash2, LogOut } from 'lucide-react';
import { sendDiscordNotification } from './services/discordMain.js';
import { supabase } from './config/supabase.js';
import productsData from './data/products.json';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import MenuComponent from './components/Menu';
import CartComponent from './components/Cart';
import ProductModal from './components/ProductModal';
import CheckoutModal from './components/CheckoutModal';
import LoadingSpinner from './components/LoadingSpinner';
import SuccessModal from './components/SuccessModal';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Discounts from './pages/admin/Discounts';
import Header from './components/Header';
import NavigationTabs from './components/NavigationTabs';
import CategoryFilter from './components/CategoryFilter';

// Component bảo vệ route cho staff
function StaffRoute({ children }) {
  const { user, isStaff, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!isStaff && !isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
}

// Component bảo vệ route cho admin
function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  console.log('AdminRoute - user:', user, 'isAdmin:', isAdmin, 'loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (!user) {
    console.log('AdminRoute - No user, redirecting to login');
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    console.log('AdminRoute - Not admin, redirecting to home');
    return <Navigate to="/" />;
  }

  console.log('AdminRoute - Rendering admin content');
  return <AdminLayout>{children}</AdminLayout>;
}

// Component chính cho trang staff
function StaffPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('menu');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [checkoutTotal, setCheckoutTotal] = useState(0);

  useEffect(() => {
    setProducts(productsData.products);
    setCategories(productsData.categories);
  }, []);

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(product => product.category_id === selectedCategory);

  const handleCheckout = (total) => {
    setCheckoutTotal(total);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Header />
        <NavigationTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          cartCount={cart.length}
        />

        {activeTab === 'menu' ? (
          <>
            <CategoryFilter
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} onClick={() => setSelectedProduct(product)}>
                  <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                    <p className="text-slate-600 text-sm mb-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-900 font-medium">
                        {product.sizes && product.sizes.length > 0
                          ? product.sizes[0].price.toLocaleString('vi-VN') + 'đ'
                          : 'Liên hệ'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <CartComponent
            cart={cart}
            onUpdateCart={(productId, quantity) => {
              setCart(prev => prev.map(item =>
                item.id === productId ? { ...item, quantity } : item
              ));
            }}
            onRemoveFromCart={(productId) => {
              setCart(prev => prev.filter(item => item.id !== productId));
            }}
            onCheckout={handleCheckout}
          />
        )}
      </div>

      <ProductModal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
        onAddToCart={(product) => {
          setCart(prev => [...prev, product]);
          setSelectedProduct(null);
        }}
      />
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        total={checkoutTotal}
        onPaymentComplete={async (total, discount, checkoutData) => {
          setIsLoading(true);
          try {
            // Tạo thông tin đơn hàng
            const orderInfo = {
              order_type: checkoutData.orderType,
              customer_info: checkoutData.customerInfo,
              items: cart.map(item => ({
                name: item.name,
                quantity: item.quantity,
                size: item.selectedSize?.name || 'Mặc định',
                price: (item.selectedSize?.price || 0) + (item.selectedToppings?.reduce((sum, t) => sum + t.price, 0) || 0),
                sugar: item.sugar || '100%',
                ice: item.ice || '100%',
                toppings: item.selectedToppings?.map(t => ({
                  name: t.name,
                  price: t.price
                })),
                note: item.note
              })),
              total: total,
              payment_method: checkoutData.paymentMethod
            };

            // Gửi thông báo đến Discord
            await sendDiscordNotification(orderInfo);

            // Xử lý thanh toán ở đây
            await new Promise(resolve => setTimeout(resolve, 1000)); // Giả lập xử lý
            setCart([]);
            setIsCheckoutOpen(false);
            setShowSuccess(true);
          } catch (error) {
            console.error('Error processing payment:', error);
            alert('Có lỗi xảy ra khi thanh toán');
          } finally {
            setIsLoading(false);
          }
        }}
      />
      <LoadingSpinner isOpen={isLoading} />
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin routes - đặt trước để ưu tiên */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/discounts"
          element={
            <AdminRoute>
              <Discounts />
            </AdminRoute>
          }
        />

        {/* Staff routes */}
        <Route
          path="/"
          element={
            <StaffRoute>
              <StaffPage />
            </StaffRoute>
          }
        />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;