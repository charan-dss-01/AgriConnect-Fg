import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import toast from 'react-hot-toast';

const Cart = () => {
    const { cart, fetchCart, removeFromCart, clearCart, profile } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [address, setAddress] = useState('');
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);  // Track the item being ordered

    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                await fetchCart(profile._id);
            } catch (error) {
                toast.error('Failed to fetch cart items.');
            }
        };

        fetchCartItems();
    }, [profile._id, fetchCart]);

    useEffect(() => {
        setCartItems(cart);  // Update cartItems when cart changes
    }, [cart]);

    const handleRemove = async (item) => {
        try {
            await removeFromCart(item);
            toast.success('Product removed from cart!');
        } catch (error) {
            toast.error('Failed to remove product.');
        }
    };

    const handleClearCart = async () => {
        try {
            await clearCart();
            toast.success('Cart cleared!');
            setCartItems([]);  // Reset cartItems
        } catch (error) {
            toast.error('Failed to clear cart.');
        }
    };

    const handleBuyNow = async (item) => {
        if (!address) {
            toast.error('Please enter your address!');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/order/single-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: profile._id,
                    productId: item.product._id,
                    quantity: item.quantity,
                    address: address,
                }),
            });

            if (response.ok) {
                toast.success('Order placed successfully!');
                await removeFromCart(item);
                setShowAddressForm(false);
                setAddress('');
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || 'Failed to place order.');
            }
        } catch (error) {
            toast.error('An error occurred while placing the order.');
        }
    };

    const handleBuyAll = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/order/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: profile._id,
                    cartItems: cartItems.map(item => ({
                        productId: item.product._id,
                        quantity: item.quantity,
                        price: item.product.price,
                    })),
                }),
            });

            if (response.ok) {
                toast.success('Order placed successfully!');
                await clearCart();
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || 'Failed to place order.');
            }
        } catch (error) {
            toast.error('An error occurred while placing the order.');
        }
    };

    if (!cartItems.length) {
        return <div>Your cart is empty.</div>;
    }

    const totalAmount = cartItems.reduce((total, item) => total + (item.product?.price || item.price) * item.quantity, 0);

    return (
        <div className="container mx-auto my-10 p-6 bg-white">
            <h1 className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-green-500 via-orange-500 to-white text-transparent bg-clip-text drop-shadow-lg animate__animated animate__fadeInDown">
                Your Cart
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cartItems.map(item => (
                    <div
                        key={item._id}
                        className="backdrop-blur-lg bg-white/30 shadow-2xl p-4 rounded-2xl border border-gray-200 hover:shadow-xl transform transition-all duration-300 flex"
                    >
                        <div className="w-1/2">
                            <img
                                src={item.product?.productImage?.url || 'default-image-url'}
                                alt={item.productName || 'Product'}
                                className="w-full h-full object-cover rounded-lg"
                            />
                        </div>

                        <div className="w-1/2 flex flex-col justify-between pl-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">{item.productName}</h2>
                                <p className="text-gray-500 mt-2">{item.product?.about}</p>
                                <p className="mt-3 text-lg font-semibold text-gray-900">
                                    ₹{(item.product?.price || item.price) * item.quantity}
                                </p>
                                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                            </div>

                            <div className="flex justify-between mt-4">
                                <button
                                    onClick={() => handleRemove(item)}
                                    className="text-red-500 hover:text-red-700 font-semibold bg-red-100 py-2 px-4 rounded-lg transition-all duration-300 hover:bg-red-200"
                                >
                                    Remove
                                </button>

                                <button
                                    onClick={() => {
                                        setCurrentItem(item);  // Set current item for ordering
                                        setShowAddressForm(true);
                                    }}
                                    className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-all duration-300"
                                >
                                    Buy Now
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {showAddressForm && currentItem && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 backdrop-blur-md">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                            <h3 className="text-xl font-bold text-gray-800">Enter Your Address</h3>
                            <input
                                type="text"
                                placeholder="Enter your address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="mt-4 p-2 w-full border border-gray-300 rounded-lg"
                            />
                            <div className="mt-4 flex justify-between">
                                <button
                                    onClick={() => setShowAddressForm(false)}
                                    className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-all duration-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleBuyNow(currentItem)}  // Pass the current item
                                    className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-all duration-300"
                                >
                                    Confirm Order
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 flex flex-col items-center space-y-6 lg:flex-row lg:justify-between lg:items-center">
                <button
                    onClick={handleClearCart}
                    className="bg-red-500 text-white py-3 px-8 rounded-lg hover:bg-red-600 transition-all duration-300 shadow-lg transform hover:scale-105"
                >
                    Clear Cart
                </button>

                <h2 className="text-3xl font-bold text-gray-800 animate__animated animate__pulse animate__infinite">
                    Total: ₹{totalAmount.toFixed(2)}
                </h2>

                {/* <button
                    onClick={handleBuyAll}
                    className="bg-green-500 text-white py-3 px-8 rounded-lg hover:bg-green-600 transition-all duration-300 shadow-lg transform hover:scale-105"
                >
                    Buy All
                </button> */}
            </div>
        </div>
    );
};

export default Cart;
