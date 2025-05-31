import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import productsData from '../data/products.json';

export default function Menu({ onAddToCart }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                if (!productsData || !productsData.products) {
                    throw new Error('Không thể tải dữ liệu sản phẩm');
                }
                setProducts(productsData.products);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-600 p-4 text-center">
                Có lỗi xảy ra: {error}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
                <div
                    key={product.id}
                    onClick={() => onAddToCart(product)}
                    className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                    {/* <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                    /> */}
                    <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                    <p className="text-slate-600 text-sm mb-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-900 font-medium">
                            {product.sizes && product.sizes.length > 0
                                ? product.sizes[0].price.toLocaleString('vi-VN') + 'đ'
                                : 'Liên hệ'}
                        </span>
                        {/* <button
                            onClick={() => onAddToCart(product)}
                            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            Thêm vào giỏ
                        </button> */}
                    </div>
                </div>
            ))}
        </div>
    );
}

Menu.propTypes = {
    onAddToCart: PropTypes.func.isRequired
}; 