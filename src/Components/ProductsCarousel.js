import React, { useEffect, useMemo, useRef, useState } from "react";
import "../css/ProductsCarousel.css";
import { useCart } from "./CartContext";

const normalizeProduct = (item, index) => ({
  id: item?.id || item?.product_id || item?.pid || index,
  name: item?.name || item?.product_name || item?.title || "Product",
  description: "",
  price: item?.price || item?.sale_price || item?.mrp || item?.cost || "",
  category: item?.category || item?.category_name || item?.main_category || "",
  subCategory: item?.subCategoryName || item?.subcategory_name || item?.subcategory || "",
  productPrice: item?.productPrice || item?.product_price || item?.pricing || null,
  image:
    item?.image ||
    item?.img ||
    item?.product_image ||
    item?.thumb ||
    item?.picture ||
    item?.image_url ||
    "https://via.placeholder.com/600x400?text=Product",
});

const toSlug = (str) =>
  str
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "";

export default function ProductsCarousel() {
  const { addToCart, cartProducts } = useCart();
  const scrollRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [products, setProducts] = useState([]);
  const [businessId, setBusinessId] = useState(() => localStorage.getItem("id"));
  const hasFetched = useRef(false);
  const [selectedIndexes, setSelectedIndexes] = useState({});
  const [modalProduct, setModalProduct] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const cardWidth = 260;
  const scrollAmount = useMemo(() => cardWidth * 2, [cardWidth]);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;

    const onScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setAtStart(scrollLeft <= 5);
      setAtEnd(scrollLeft + clientWidth >= scrollWidth - 5);
    };

    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const id = localStorage.getItem("id");
      if (id) {
        setBusinessId(id);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!businessId || hasFetched.current) return;
    hasFetched.current = true;

    const fetchProducts = async () => {
      try {
        const response = await fetch("https://topiko.com/prod/app/lt_getproducts.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bid: businessId,
            category_id: "",
            filter: "",
            limit: 20,
            maxPrice: "",
            minPrice: "",
            order: "DESC",
            page: 1,
            sort: "",
            subcategory_id: "",
            user_id: localStorage.getItem("user_id") || "",
          }),
        });

        const data = await response.json();
        const list = Array.isArray(data?.response) ? data.response : Array.isArray(data) ? data : [];
        setProducts(list.map((item, index) => normalizeProduct(item, index)));
      } catch (error) {
        console.error("Failed to fetch carousel products", error);
        setProducts([]);
      }
    };

    fetchProducts();
  }, [businessId]);

  const formatPrice = (value) => {
    if (value === null || value === undefined || value === "") return "Rs.0";
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    return `Rs.${num.toLocaleString("en-IN")}`;
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

  const handleAddToCartClick = async (product) => {
    const idx = selectedIndexes[product.id] || 0;
    const result = await addToCart(product, idx);
    if (result?.success) {
      setToast({ show: true, message: `${product.name} added to cart`, type: "success" });
    } else if (result?.requiresLogin) {
      setToast({ show: true, message: "Please sign in to add items to cart.", type: "error" });
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

  const handleOptionSelect = (productId, index) => {
    setSelectedIndexes((prev) => ({ ...prev, [productId]: index }));
  };

  const openModal = (product) => setModalProduct(product);
  const closeModal = () => setModalProduct(null);

  return (
    <>
     {products.length > 0 && (
    <section className="products-carousel-section py-5">
      <div className="container position-relative">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <p className="text-uppercase text-muted small mb-1">Browse</p>
            <h3 className="fw-bold mb-0">Featured products</h3>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="prod-nav-btn"
              aria-label="Previous products"
              onClick={() => handleScroll(-1)}
              disabled={atStart}
            >
              {"<"}
            </button>
            <button
              type="button"
              className="prod-nav-btn"
              aria-label="Next products"
              onClick={() => handleScroll(1)}
              disabled={atEnd}
            >
              {">"}
            </button>
          </div>
        </div>

        <div className="products-swiper" ref={scrollRef}>
          {products.map((item) => {
            return (
              <div key={item.id} className="product-shell">
                  <div className="product-card-outer">
                    <div className="product-card-inner">
                      <div className="product-image-card">
                        <div className="carousel-figure ratio ratio-1x1 rounded-4 overflow-hidden">
                          <a
                            href={`/product/${toSlug(item.category || "category")}/${toSlug(
                              item.subCategory || "subcategory"
                            )}/${toSlug(item.name)}`}
                            className="d-block h-100 w-100"
                          >
                            <img src={item.image} alt={item.name} className="w-100 h-100 object-fit-cover" />
                          </a>
                        </div>
                      </div>
                    </div>
                  <div className="product-meta-cream">
                    <h6 className="fw-bold mb-1 product-title text-dark">{item.name}</h6>
                    <p className="product-list-price mb-0">From {getSelectedPrice(item)}</p>
                  </div>
                  <button
                    type="button"
                    className="btn carousel-cta product-list-cta"
                    onClick={() => openModal(item)}
                  >
                    Choose options
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
          onClick={closeModal}
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
              onClick={closeModal}
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
             X
            </button>

            <div className="text-center mb-3">
              <div
                className="ratio ratio-1x1 rounded-4 overflow-hidden mb-3"
                style={{ width: "220px", margin: "0 auto" }}
              >
                <img
                  src={modalProduct.image}
                  alt={modalProduct.name}
                  className="w-100 h-100 object-fit-cover"
                />
              </div>
              <h5 className="fw-bold mb-1">{modalProduct.name}</h5>
              <p className="text-muted mb-2">{modalProduct.category || "Product"}</p>
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
              onClick={async () => {
                await handleAddToCartClick(modalProduct);
                closeModal();
              }}
            >
              {cartProducts.some((cartItem) => cartItem.id === modalProduct.id) ? "Added already" : "Add to cart"}
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
    </section>
     )}
    </>
  );
}
