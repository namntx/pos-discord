import { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, Plus, Minus, Trash2 } from 'lucide-react';
import { sendDiscordNotification } from './services/discordMain.js';
import { supabase } from './config/supabase.js';
import productsData from './data/products.json';

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState('menu');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    orderType: 'dine-in' // 'dine-in' hoặc 'takeaway'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState({});

  // Lấy danh sách sản phẩm và danh mục từ file JSON
  useEffect(() => {
    setProducts(productsData.products);
    setCategories(productsData.categories);
  }, []);

  // Lọc sản phẩm theo tìm kiếm và danh mục
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Lấy danh mục sản phẩm
  const categoriesData = ['all', ...new Set(products.map(product => product.category))];

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  const updateCartItemQuantity = (index, change) => {
    const newCart = [...cart];
    newCart[index].quantity = Math.max(1, newCart[index].quantity + change);
    setCart(newCart);
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  // Tính tổng tiền
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Xử lý đặt hàng
  const handleOrder = async () => {
    if (customerInfo.orderType === 'takeaway' && (!customerInfo.name || !customerInfo.phone || !customerInfo.address)) {
      alert('Vui lòng điền đầy đủ thông tin khách hàng');
      return;
    }

    try {
      const orderData = {
        items: cart,
        customer_info: customerInfo.orderType === 'takeaway' ? customerInfo : {
          name: 'Khách tại quán',
          phone: 'N/A',
          address: 'N/A',
          orderType: 'dine-in'
        },
        total: total,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (error) throw error;

      // Gửi thông báo đến Discord
      await sendDiscordNotification(data);

      // Reset giỏ hàng và thông tin khách hàng
      setCart([]);
      setCustomerInfo({ name: '', phone: '', address: '', orderType: 'dine-in' });
      alert('Đặt hàng thành công!');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Có lỗi xảy ra khi đặt hàng');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('menu')}
                  className={`flex items-center px-4 py-2 rounded-lg ${activeTab === 'menu'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  <Menu className="w-5 h-5 mr-2" />
                  Menu
                </button>
                <button
                  onClick={() => setActiveTab('cart')}
                  className={`flex items-center px-4 py-2 rounded-lg ${activeTab === 'cart'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Giỏ hàng ({cart.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'menu' ? (
          <div className="space-y-6">
            {/* Tìm kiếm và lọc */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
                <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
              >
                {categoriesData.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'Tất cả' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Danh sách sản phẩm */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer"
                  onClick={() => addToCart(product)}
                >
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-slate-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-slate-500 mb-2 line-clamp-2">{product.description}</p>
                    {/* <div className="flex flex-col items-center justify-between space-y-2">
                      <span className="text-xl font-medium text-slate-900">
                        {product.sizes[0].price.toLocaleString()}đ
                      </span>
                      <button
                        className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        Thêm
                      </button>
                    </div> */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Giỏ hàng */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">Giỏ hàng</h2>
                  {cart.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">Giỏ hàng trống</p>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-4 border-b border-slate-100">
                          <div className="flex-1">
                            <h3 className="font-medium text-slate-900">{item.name}</h3>
                            <p className="text-sm text-slate-500">
                              {item.sugar && `Đường: ${item.sugar}`}
                              {item.ice && ` • Đá: ${item.ice}`}
                              {item.toppings?.length > 0 && ` • Topping: ${item.toppings.map(t => t.name).join(', ')}`}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => updateCartItemQuantity(index, -1)}
                                className="p-1 text-slate-400 hover:text-slate-600"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateCartItemQuantity(index, 1)}
                                className="p-1 text-slate-400 hover:text-slate-600"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <span className="text-slate-900 font-medium">
                              {(item.price * item.quantity).toLocaleString()}đ
                            </span>
                            <button
                              onClick={() => removeFromCart(index)}
                              className="p-1 text-red-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="bg-slate-50 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-600">Tổng cộng:</span>
                    <span className="text-2xl font-semibold text-slate-900">
                      {total.toLocaleString()}đ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Thông tin khách hàng */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">Thông tin đơn hàng</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Hình thức đặt hàng
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="orderType"
                            value="dine-in"
                            checked={customerInfo.orderType === 'dine-in'}
                            onChange={(e) => setCustomerInfo({ ...customerInfo, orderType: e.target.value })}
                            className="rounded-full border-slate-300 text-slate-900 focus:ring-slate-500"
                          />
                          <span className="ml-2 text-slate-700">Tại quán</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="orderType"
                            value="takeaway"
                            checked={customerInfo.orderType === 'takeaway'}
                            onChange={(e) => setCustomerInfo({ ...customerInfo, orderType: e.target.value })}
                            className="rounded-full border-slate-300 text-slate-900 focus:ring-slate-500"
                          />
                          <span className="ml-2 text-slate-700">Mang về</span>
                        </label>
                      </div>
                    </div>

                    {customerInfo.orderType === 'takeaway' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Họ tên
                          </label>
                          <input
                            type="text"
                            value={customerInfo.name}
                            onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                            placeholder="Nhập họ tên"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Số điện thoại
                          </label>
                          <input
                            type="tel"
                            value={customerInfo.phone}
                            onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                            placeholder="Nhập số điện thoại"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Địa chỉ
                          </label>
                          <textarea
                            value={customerInfo.address}
                            onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                            rows="3"
                            placeholder="Nhập địa chỉ"
                          />
                        </div>
                      </>
                    )}
                    <button
                      onClick={handleOrder}
                      disabled={cart.length === 0 || (customerInfo.orderType === 'takeaway' && (!customerInfo.name || !customerInfo.phone || !customerInfo.address))}
                      className={`w-full py-3 rounded-lg text-white font-medium ${cart.length === 0 || (customerInfo.orderType === 'takeaway' && (!customerInfo.name || !customerInfo.phone || !customerInfo.address))
                        ? 'bg-slate-300 cursor-not-allowed'
                        : 'bg-slate-900 hover:bg-slate-800'
                        }`}
                    >
                      {customerInfo.orderType === 'dine-in' ? 'Xác nhận đơn hàng' : 'Đặt hàng'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal thêm sản phẩm */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Thêm {selectedProduct.name}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Kích thước
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                    onChange={(e) => {
                      const size = selectedProduct.sizes.find(s => s.name === e.target.value);
                      setSelectedProduct({ ...selectedProduct, selectedSize: size });
                    }}
                    value={selectedProduct.selectedSize?.name || selectedProduct.sizes[0].name}
                  >
                    {selectedProduct.sizes.map((size) => (
                      <option key={size.name} value={size.name}>
                        {size.name} - {size.price.toLocaleString()}đ
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Đường
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, sugar: e.target.value })}
                  >
                    <option value="100%">100%</option>
                    <option value="70%">70%</option>
                    <option value="50%">50%</option>
                    <option value="30%">30%</option>
                    <option value="0%">0%</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Đá
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, ice: e.target.value })}
                  >
                    <option value="100%">100%</option>
                    <option value="70%">70%</option>
                    <option value="50%">50%</option>
                    <option value="30%">30%</option>
                    <option value="0%">0%</option>
                  </select>
                </div>
                {selectedProduct.allowToppings && selectedProduct.toppings && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Topping
                    </label>
                    <div className="space-y-2">
                      {selectedProduct.toppings.map((topping) => (
                        <label key={topping.id} className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                            checked={selectedProduct.selectedToppings?.some(t => t.id === topping.id)}
                            onChange={(e) => {
                              const currentToppings = selectedProduct.selectedToppings || [];
                              if (e.target.checked) {
                                setSelectedProduct({
                                  ...selectedProduct,
                                  selectedToppings: [...currentToppings, topping]
                                });
                              } else {
                                setSelectedProduct({
                                  ...selectedProduct,
                                  selectedToppings: currentToppings.filter(t => t.id !== topping.id)
                                });
                              }
                            }}
                          />
                          <span className="ml-2 text-slate-700">{topping.name}</span>
                          <span className="ml-auto text-slate-500">+{topping.price.toLocaleString()}đ</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                    rows="2"
                    placeholder="Thêm ghi chú..."
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, note: e.target.value })}
                  />
                </div>
                <button
                  onClick={() => {
                    setCart([...cart, {
                      ...selectedProduct,
                      quantity: 1,
                      price: selectedProduct.selectedSize?.price || selectedProduct.sizes[0].price,
                      size: selectedProduct.selectedSize?.name || selectedProduct.sizes[0].name,
                      toppings: selectedProduct.selectedToppings || []
                    }]);
                    setIsModalOpen(false);
                    setSelectedProduct(null);
                  }}
                  className="w-full py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Thêm vào giỏ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;