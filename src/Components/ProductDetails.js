import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Header from "./Common/Header";
import Footer from "./Common/Footer";
import "../css/ProductDetails.css";
import { useCart } from "./CartContext";

export default function ProductDetails() {
  const { addToCart, cartProducts } = useCart();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [selectedIndexes, setSelectedIndexes] = useState({});
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const hasFetched = useRef(false);

  const path = window.location.pathname;
  const businessName = localStorage.getItem("subdomain");
  const userId = localStorage.getItem("user_id") || "";
  const businessId = localStorage.getItem("id");

  let fullUrl = "";
  if (window.location.hostname.includes("topiko.com")) {
    fullUrl = `${window.location.origin}${path}`;
  } else if (businessName) {
    fullUrl = `http://${businessName}.topiko.com${path}`;
  }

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.post("https://topiko.com/prod/app/getproductlist.php", {
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
        });

        const raw = response?.data?.products;
        if (raw) {
          if (Array.isArray(raw) && raw.length > 0) {
            setProduct(raw[0]);
          } else if (typeof raw === "object") {
            setProduct(raw);
          }
        } else {
          console.warn("⚠️ No product details found.");
        }
      } catch (error) {
        console.error("❌ Error fetching product details:", error);
      }
    };

    if (!hasFetched.current && businessId && fullUrl) {
      fetchProductDetails();
      hasFetched.current = true;
    }
  }, [businessId, fullUrl, userId]);

  useEffect(() => {
    if (product) {
      const images = [
        product?.product_image,
        product?.imgs?.[0]?.img1,
        product?.imgs?.[0]?.img2,
        product?.imgs?.[0]?.img3,
      ].filter(Boolean);
      setActiveImage(images[0] || "");
    }
  }, [product]);

  const slideItems = [
    { imgSrc: product?.product_image },
    { imgSrc: product?.imgs?.[0]?.img1 },
    { imgSrc: product?.imgs?.[0]?.img2 },
    { imgSrc: product?.imgs?.[0]?.img3 },
  ].filter((img) => img?.imgSrc);

  const imgSrc = activeImage || slideItems[0]?.imgSrc || "";

  const formatPrice = (value) => {
    if (value === null || value === undefined || value === "") return "Rs.0";
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    return `Rs.${num.toLocaleString("en-IN")}`;
  };

  const getSelectedPrice = () => {
    const idx = selectedIndexes[product?.id] || 0;
    const priceItem = product?.productPrice?.[idx];
    if (!priceItem) return formatPrice(product?.discount_price || product?.mrp);
    const value =
      priceItem.discount_price !== "0.00" && priceItem.discount_price !== ""
        ? priceItem.discount_price
        : priceItem.mrp;
    return formatPrice(value);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    const idx = selectedIndexes[product.id] || 0;
    const result = await addToCart(product, idx);
    if (result?.success) {
      setToast({ show: true, message: `${product.title || "Item"} added to cart`, type: "success" });
    } else if (result?.requiresLogin) {
      setToast({ show: true, message: "Please sign in to add items to cart.", type: "error" });
      setActiveImage((prev) => prev); // no-op to keep UI stable
    } else {
      setToast({ show: true, message: "Could not add to cart. Try again.", type: "error" });
    }
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
      <main className="flex-grow-1 product-list-bg">
        <div className="container py-5">
          {!imgSrc && <p className="text-muted">Product not found.</p>}
          {imgSrc && (
            <div className="row g-4 align-items-start">
              <div className="col-12 col-md-5">
                <div className="product-image-card pd-main-card">
                  <div className="carousel-figure ratio ratio-1x1 overflow-hidden">
                    <img src={imgSrc} alt={product?.title || "Product"} className="w-100 h-100 object-fit-cover" />
                  </div>
                </div>
                {slideItems.length > 1 && (
                  <div className="pd-thumb-row mt-3">
                    {slideItems.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`pd-thumb ${item.imgSrc === imgSrc ? "active" : ""}`}
                        onClick={() => setActiveImage(item.imgSrc)}
                      >
                        <img src={item.imgSrc} alt={`${product?.title || "Product"} thumb ${idx + 1}`} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="col-12 col-md-7 d-flex flex-column gap-3">
                <div>
                  <p className="text-uppercase text-muted small mb-1">
                    {[product?.categoryName, product?.subCategoryName].filter(Boolean).join(" / ")}
                  </p>
                  <h3 className="fw-bold mb-2">{product?.title}</h3>
                  {product?.description && <p className="text-muted mb-3">{product.description}</p>}
                </div>

                {product?.productPrice && product.productPrice.length > 0 && (() => {
                  const currentIdx = selectedIndexes[product.id] || 0;
                  return (
                    <div className="mb-1">
                      <label className="form-label fw-semibold small mb-2">Choose option</label>
                      <div className="d-flex flex-wrap gap-2">
                        {product.productPrice.map((priceItem, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className={`btn btn-sm ${currentIdx === idx ? "btn-primary" : "btn-outline-secondary"}`}
                            onClick={() =>
                              setSelectedIndexes((prev) => ({
                                ...prev,
                                [product.id]: idx,
                              }))
                            }
                            style={{ minWidth: "90px", textAlign: "center" }}
                          >
                            {priceItem.meassuring_details} {priceItem.meassuring_type}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold text-dark">Price</span>
                  <span className="fs-5 fw-bold text-primary">{getSelectedPrice()}</span>
                </div>

                <div className="d-flex flex-column gap-2">
                  <button type="button" className="btn btn-primary" onClick={handleAddToCart}>
                    {cartProducts.some((item) => item.id === product?.id) ? "Added already" : "Add to cart"}
                  </button>
                  <button type="button" className="btn btn-outline-secondary">
                    Buy now
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
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
