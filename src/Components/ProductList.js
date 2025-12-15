import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Header from "./Common/Header";
import Footer from "./Common/Footer";
import "../css/ProductList.css";
import { useCart } from "./CartContext";

const normalizeProduct = (item, index) => ({
  id: item?.id || index,
  title: item?.title || item?.name || "Product",
  subCategoryName: item?.subCategoryName || "",
  categoryName: item?.categoryName || "",
  price: Number(item?.discount_price || item?.discount_priceCreatation || item?.mrp) || 0,
  oldPrice: Number(item?.mrp) || 0,
  imgSrc: item?.product_image || "",
  imgHover: item?.product_image || "",
  inStock: item?.status === "1",
  gstType: item?.gstType,
  gstPercent: parseFloat(item?.gstPercent || 0),
  gstAmount: parseFloat(item?.gstAmount || 0),
  netPrice: parseFloat(item?.netPrice || 0),
  totalPrice: parseFloat(item?.totalPrice || 0),
  weight: parseFloat(item?.weight || 0),
  measuringType: item?.meassuring_type || "",
  measuringDetails: item?.meassuring_details || "",
  productPrice: item?.productPrice || [],
});

const formatPrice = (value) => {
  if (value === null || value === undefined || value === "") return "Rs.0";
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return `Rs.${num.toLocaleString("en-IN")}`;
};

const toSlug = (str) =>
  str
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "";

export default function ProductList() {
  const { addToCart, cartProducts } = useCart();
  const { categorySlug = "", subSlug = "" } = useParams();
  const location = useLocation();
  const subcategoryId = location.state?.id || location.state?.ids || null;
  const [apiProducts, setApiProducts] = useState([]);
  const [selectedIndexes, setSelectedIndexes] = useState({});
  const [modalProduct, setModalProduct] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const path = window.location.pathname;
  const businessName = localStorage.getItem("subdomain");

  const fullUrl = useMemo(() => {
    if (window.location.hostname.includes("topiko.com")) {
      return `${window.location.origin}${path}`;
    }
    if (businessName) {
      return `http://${businessName}.topiko.com${path}`;
    }
    return `${window.location.origin}${path}`;
  }, [path, businessName]);

  useEffect(() => {
    const userId = localStorage.getItem("user_id") || "";

    const fetchProducts = async (businessId) => {
      try {
        const response = await fetch("https://topiko.com/prod/app/getproductlist.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bid: businessId,
            url: fullUrl,
            minPrice: "",
            maxPrice: "",
            sort: "",
            order: "DESC",
            limit: 100,
            page: 1,
            filter: "",
            user_id: userId,
          }),
        });

        const data = await response.json();
        const dataArray = Array.isArray(data?.products) ? data.products : [];
        const products = dataArray.map((item, idx) => normalizeProduct(item, idx));
        setApiProducts(products);
      } catch (error) {
        console.error("❌ Fetch error:", error);
        setApiProducts([]);
      }
    };

    const interval = setInterval(() => {
      const id = localStorage.getItem("id");
      if (id) {
        clearInterval(interval);
        fetchProducts(id);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [fullUrl, categorySlug, subSlug]);

  const handleChange = (productId) => (event) => {
    const value = Number(event.target.value) || 0;
    setSelectedIndexes((prev) => ({ ...prev, [productId]: value }));
  };

  const handleOptionSelect = (productId, index) => {
    setSelectedIndexes((prev) => ({ ...prev, [productId]: index }));
  };

  const handleAddToCart = async (product) => {
    const idx = selectedIndexes[product.id] || 0;
    const result = await addToCart(product, idx);
    if (result?.success) {
      setToast({ show: true, message: `${product.title} added to cart`, type: "success" });
      setModalProduct(null);
    } else if (result?.requiresLogin) {
      setToast({ show: true, message: "Please sign in to add items to cart.", type: "error" });
      setModalProduct(null);
    } else {
      setToast({ show: true, message: "Could not add to cart. Try again.", type: "error" });
    }
  };

  const getSelectedPrice = (product) => {
    const idx = selectedIndexes[product.id] || 0;
    const priceItem = product?.productPrice?.[idx];
    if (!priceItem) return formatPrice(product.price);
    const value =
      priceItem.discount_price !== "0.00" && priceItem.discount_price !== ""
        ? priceItem.discount_price
        : priceItem.mrp;
    return formatPrice(value);
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  return (
    <>
      <Header />
      <main className="flex-grow-1 product-list-bg" style={{ minHeight: "50vh" }}>
        <div className="container py-5 product-list-page">
          <h3 className="fw-bold mb-4" style={{ color: "#a25d3c" }}>Product List</h3>

          {!apiProducts.length && (
            <p className="text-muted">No products found for this selection.</p>
          )}

          <div className="row g-3">
            {apiProducts.map((product) => (
              <div key={product.id} className="col-6 col-md-4 col-lg-3">
                <div className="product-shell h-100">
                  <div className="product-card-outer h-100">
                    <div className="product-card-inner">
                    <Link
                      to={`/product/${toSlug(product.categoryName || "category")}/${toSlug(
                        product.subCategoryName || "sub"
                      )}/${toSlug(product.title)}`}
                      className="product-image-card d-block"
                    >
                      <div className="carousel-figure ratio ratio-1x1 rounded-4 overflow-hidden">
                        <img src={product.imgSrc} alt={product.title} className="w-100 h-100 object-fit-cover" />
                      </div>
                    </Link>


                   
                    </div>
                    <div className="product-meta-cream">
                      <h6 className="fw-bold mb-1 product-title text-dark">{product.title}</h6>
                      <p className="product-list-price mb-0">From {getSelectedPrice(product)}</p>
                    </div>
                       <div className="mt-2 px-50">
                        <button
                          type="button"
                          style={{ width: "-webkit-fill-available" }}
                          className="btn carousel-cta product-list-cta"
                          onClick={() => setModalProduct(product)}
                        >
                          Choose Options
                        </button>
                      </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      {modalProduct && (
        <div
          className="pc-modal-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050,
            padding: "16px",
          }}
          onClick={() => setModalProduct(null)}
        >
          <div
            className="pc-modal-card"
            style={{
              background: "#fff",
              borderRadius: "16px",
              maxWidth: "420px",
              width: "100%",
              padding: "20px",
              position: "relative",
              boxShadow: "0 12px 36px rgba(0,0,0,0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setModalProduct(null)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                border: "none",
                background: "#eee",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              ×
            </button>

            <div className="text-center mb-3">
              <div
                className="ratio ratio-1x1 rounded-4 overflow-hidden mb-3"
                style={{ width: "220px", margin: "0 auto" }}
              >
                <img
                  src={modalProduct.imgSrc}
                  alt={modalProduct.title}
                  className="w-100 h-100 object-fit-cover"
                />
              </div>
              <h5 className="fw-bold mb-1">{modalProduct.title}</h5>
              <p className="text-muted mb-2">{modalProduct.categoryName || "Product"}</p>
            </div>

            {modalProduct.productPrice && modalProduct.productPrice.length > 0 && (() => {
              const currentIdx = selectedIndexes[modalProduct.id] || 0;
              return (
                <div className="mb-3">
                  <label className="form-label fw-semibold small mb-2">Choose option</label>
                  <div className="d-flex flex-wrap gap-2">
                    {modalProduct.productPrice.map((priceItem, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`btn btn-sm ${currentIdx === idx ? "btn-primary" : "btn-outline-secondary"}`}
                        onClick={() => handleOptionSelect(modalProduct.id, idx)}
                        style={{ minWidth: "90px", textAlign: "center" }}
                      >
                        {priceItem.meassuring_details} {priceItem.meassuring_type}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="fw-bold text-dark">Price</span>
              <span className="fs-5 fw-bold text-primary">{getSelectedPrice(modalProduct)}</span>
            </div>

            <button
              type="button"
              className="btn btn-primary w-100"
              onClick={() => handleAddToCart(modalProduct)}
            >
              {cartProducts.some((item) => item.id === modalProduct?.id) ? "Added already" : "Add to cart"}
            </button>
          </div>
        </div>
      )}
      {toast.show && (
        <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1200 }}>
          <div
            className={`toast align-items-center text-white ${toast.type === "success" ? "bg-success" : "bg-danger"} show`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="d-flex">
              <div className="toast-body">{toast.message}</div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                aria-label="Close"
                onClick={() => setToast({ ...toast, show: false })}
              ></button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}
