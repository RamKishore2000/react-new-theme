
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import Products from "./Components/Products";
import ProductList from "./Components/ProductList";
import ServicesList from "./Components/ServicesList";
import ServiceDetails from "./Components/ServiceDetails";
import ProductDetails from "./Components/ProductDetails";
import Profile from "./Components/Profile";
import { CartProvider } from "./Components/CartContext";
import Cart from "./Components/Cart";
import Contact from "./Components/Contact";
import About from "./Components/About";
import Checkout from "./Components/Checkout";
import PrivacyPolicy from "./Components/PrivacyPolicy";
import RefundPolicy from "./Components/RefundPolicy";
import ShippingPolicy from "./Components/ShippingPolicy";

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <div className="d-flex flex-column min-vh-100">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product-list" element={<ProductList />} />
            <Route path="/product-list/:categorySlug" element={<ProductList />} />
            <Route path="/product-list/:categorySlug/:subSlug" element={<ProductList />} />
            <Route path="/product/:categorySlug/:subSlug/:productSlug" element={<ProductDetails />} />
            <Route path="/service-list" element={<ServicesList />} />
            <Route path="/service-list/:categorySlug" element={<ServicesList />} />
            <Route path="/service-list/:categorySlug/:subSlug" element={<ServicesList />} />
            <Route path="/service/:categorySlug/:subSlug/:serviceSlug" element={<ServiceDetails />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/return-and-refund" element={<RefundPolicy />} />
            <Route path="/shipping" element={<ShippingPolicy />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
      
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}
export default App;
