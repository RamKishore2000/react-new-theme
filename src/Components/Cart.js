import React, { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "./Common/Header";
import Footer from "./Common/Footer";
import { useCart } from "./CartContext";
import "../css/Cart.css";

const QuantitySelect = ({ quantity, setQuantity }) => {
  const handleChange = (delta) => {
    const next = Math.max(1, (Number(quantity) || 1) + delta);
    setQuantity(next);
  };

  return (
    <div className="qty-control">
      <button type="button" className="qty-btn" onClick={() => handleChange(-1)} aria-label="Decrease quantity">
        −
      </button>
      <input
        type="text"
        value={quantity}
        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
        className="qty-input"
        aria-label="Quantity"
      />
      <button type="button" className="qty-btn" onClick={() => handleChange(1)} aria-label="Increase quantity">
        +
      </button>
    </div>
  );
};

const Cart = () => {
  const navigate = useNavigate();
  const { cartProducts, fetchCartProductsFromServer, updateQuantity, removeItem } = useCart();

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    const businessId = localStorage.getItem("id");
    if (!userId || !businessId) {
      window.dispatchEvent(new CustomEvent("openLoginModal"));
      navigate("/");
      return;
    }
    fetchCartProductsFromServer();
  }, [fetchCartProductsFromServer, navigate]);

  const totalPrice = useMemo(
    () =>
      cartProducts.reduce((sum, item) => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        return sum + qty * price;
      }, 0),
    [cartProducts]
  );

  return (
    <>
      <Header />
      <main className="flex-grow-1">
        <div className="cart-hero">
          <div className="container text-center py-5">
            <p className="text-uppercase text-muted fw-semibold small mb-1">Your Bag</p>
            <h2 className="fw-bold mb-2">Cart &amp; Summary</h2>
            <p className="text-muted mb-0">Review your picks, tweak quantities, and glide to checkout.</p>
          </div>
        </div>

        <div className="container cart-shell">
          <div className="row g-4">
            <div className="col-xl-8">
              <div className="card cart-card shadow-sm">
                <div className="card-body p-0">
                  <form className="form-cart" onSubmit={(e) => e.preventDefault()}>
                    {cartProducts.length ? (
                      <table className="table-page-cart">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {cartProducts.map((product, i) => (
                            <tr key={i} className="tf-cart-item file-delete">
                              <td className="tf-cart-item_product">
                                <Link to={`/product-detail/${product.id}`} className="img-box">
                                  <img alt="img-product" src={product.product_image} width={684} height={972} />
                                </Link>
                                <div className="cart-info">
                                  <Link to={`/product-detail/${product.id}`} className="name text-md link fw-medium">
                                    {product.title}
                                  </Link>
                                </div>
                              </td>
                              <td className="tf-cart-item_price text-center" data-label="Price">
                                <span className="cart-price price-on-sale text-md fw-medium">
                                  {Number(product.price || 0).toFixed(2)}
                                </span>
                              </td>
                              <td className="tf-cart-item_quantity" data-cart-title="Quantity" data-label="Quantity">
                                <QuantitySelect
                                  quantity={product.quantity}
                                  setQuantity={(qty) => updateQuantity(product.id, qty)}
                                />
                              </td>
                              <td className="tf-cart-item_total text-center" data-cart-title="Total" data-label="Total price">
                                <div className="cart-total total-price text-md fw-medium">
                                  {(Number(product.price || 0) * Number(product.quantity || 0)).toFixed(2)}
                                </div>
                              </td>
                              <td className="text-end">
                                <button
                                  type="button"
                                  className="btn btn-link text-danger p-0 remove-cart-btn"
                                  onClick={() => removeItem(product.cart_id)}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-4 text-center">
                        <div className="empty-cart-illustration mb-3">🛒</div>
                        <h6 className="fw-semibold mb-1">Your Cart is empty</h6>
                        <p className="text-muted mb-3">Add some favorites to see them here.</p>
                        <Link to="/" className="btn btn-primary">
                          Continue shopping
                        </Link>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
            {cartProducts.length > 0 && (
              <div className="col-xl-4">
                <div className="card cart-card shadow-sm sticky-top cart-summary-sticky">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">Order Summary</h5>
                      <span className="badge bg-primary-soft text-primary">{cartProducts.length} items</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                      <span className="text-muted">Subtotal</span>
                      <span className="fw-semibold">Rs.{totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center py-3">
                      <span className="fw-semibold">Total</span>
                      <span className="fw-bold fs-5 text-primary">Rs.{totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="d-grid gap-2">
                      <a href="/checkout" className="btn btn-primary btn-lg w-100">
                        Proceed to checkout
                      </a>
                      <Link to="/" className="btn btn-outline-secondary w-100">
                        Continue shopping
                      </Link>
                    </div>
                    <div className="cart-trust mt-4">
                      <p className="text-center text-sm text-muted mb-2">We accept</p>
                      <div className="cart-list-social d-flex justify-content-center gap-3">
                        <div className="payment-chip">Visa</div>
                        <div className="payment-chip">Mastercard</div>
                        <div className="payment-chip">UPI</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Cart;
