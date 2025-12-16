import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../css/TrendingServices.css";

export default function TrendingServices() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    address: "",
    date: "",
    time: "",
    service_title: "",
    service_id: "",
  });
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const scrollRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const formatPrice = useMemo(() => {
    return (value) => {
      if (value === null || value === undefined || value === "") return "Call for price";
      const num = Number(value);
      if (Number.isNaN(num)) return value;
      return `Rs.${num.toFixed(2)}`;
    };
  }, []);

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
    if (!showModal) return undefined;

    const initAutocomplete = () => {
      if (!inputRef.current || !window.google?.maps?.places) return;

      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ["geocode"],
        componentRestrictions: { country: "in" },
      });

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();
        setFormData((prev) => ({
          ...prev,
          address: place.formatted_address || inputRef.current.value,
        }));
      });
    };

    const loadScript = () => {
      if (window.google?.maps?.places) {
        initAutocomplete();
        return;
      }

      const existing = document.getElementById("google-maps");
      if (existing) {
        existing.addEventListener("load", initAutocomplete, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://maps.googleapis.com/maps/api/js?key=AIzaSyBeeIWUhRhc2ZW9oKxUugzu8y9JQgFVcvA&libraries=places";
      script.async = true;
      script.defer = true;
      script.id = "google-maps";
      script.onload = initAutocomplete;
      document.body.appendChild(script);
    };

    const ensurePacZIndex = () => {
      const styleId = "google-pac-zfix";
      if (document.getElementById(styleId)) return;
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = ".pac-container{z-index:2001!important;}";
      document.head.appendChild(style);
    };

    loadScript();
    ensurePacZIndex();

    const focusTimer = setTimeout(() => inputRef.current?.focus(), 150);

    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
      clearTimeout(focusTimer);
    };
  }, [showModal]);

  useEffect(() => {
    const interval = setInterval(() => {
      const business_id = localStorage.getItem("id");
      if (business_id) {
        const fetchProducts = async () => {
          try {
            const response = await fetch("https://topiko.com/prod/app/lt_getbusiness_services_gst_new.php", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ bid: business_id }),
            });
            const data = await response.json();
            setProducts(Array.isArray(data) ? data : []);
          } catch (error) {
            console.error("Error fetching products:", error);
          }
        };
        fetchProducts();
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const openModal = (e, product) => {
    e.preventDefault();
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      setToast({ show: true, message: "Please login to book a service.", type: "error" });
      window.dispatchEvent(new Event("openLoginModal"));
      return;
    }
    setFormData({
      address: "",
      date: "",
      time: "",
      service_title: product.service_title || "",
      service_id: product.id || "",
    });
    setShowModal(true);
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const handleSubmitBooking = async () => {
    const user_id = localStorage.getItem("user_id");
    const business_id = localStorage.getItem("id");
    if (!user_id || !business_id) {
      setToast({ show: true, message: "Please login to book a service.", type: "error" });
      window.dispatchEvent(new Event("openLoginModal"));
      return;
    }
    if (!formData.address?.trim()) {
      setToast({ show: true, message: "Please enter your address.", type: "error" });
      return;
    }
    if (!formData.date?.trim()) {
      setToast({ show: true, message: "Please select a service date.", type: "error" });
      return;
    }
    if (!formData.time?.trim()) {
      setToast({ show: true, message: "Please select a service time.", type: "error" });
      return;
    }

    const payload = {
      user_id,
      business_id,
      service_title: formData.service_title,
      service_id: formData.service_id,
      serviceDate: formData.date,
      serviceTime: formData.time,
      serviceAddress: formData.address,
    };

    try {
      const response = await fetch("https://topiko.com/prod/app/createNewServiceRequestByUser.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result?.status === "success") {
        setToast({ show: true, message: "Request submitted successfully!", type: "success" });
        setFormData({
          address: "",
          date: "",
          time: "",
          service_title: "",
          service_id: "",
        });
        setShowModal(false);
      } else {
        setToast({ show: true, message: result?.msg || "Failed to submit request.", type: "error" });
      }
    } catch (error) {
      console.error("Submit error:", error);
      setToast({ show: true, message: "An error occurred while submitting.", type: "error" });
    }
  };

  const handleContactForPrice = (e) => {
    e.preventDefault();
    const phone = localStorage.getItem("primarycontact") || localStorage.getItem("primary_contact");
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      setToast({ show: true, message: "Contact number not available.", type: "error" });
    }
  };

  if (!products?.length) return null;

  return (
    <>
    {products.length > 0 && (
    <section className="trending-services " style={{ marginBottom: "50px",backgroundColor:"#f7f1e7" }}>
      <div className="container">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
          <div className="d-flex justify-content-center align-items-center" style={{ textAlign: "center" }}>
            <h4 className="mb-0 fw-bold" style={{ fontSize: "22px" }}>
              Trending Services
            </h4>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="prod-nav-btn"
              aria-label="Previous services"
              onClick={() => handleScroll(-1)}
              disabled={atStart}
            >
              {"<"}
            </button>
            <button
              type="button"
              className="prod-nav-btn"
              aria-label="Next services"
              onClick={() => handleScroll(1)}
              disabled={atEnd}
            >
              {">"}
            </button>
          </div>
        </div>

        <div className="products-swiper" ref={scrollRef}>
          {products.map((product, index) => {
            const totalPrice = Number(product.totalPrice);
            const isPriceValid = totalPrice > 0;

            const serviceUrl = `/service/${product.categoryName
              ?.toLowerCase()
              .trim()
              .replace(/\s+/g, "-")
              .replace(/-+$/, "")}/${product.subCategoryName
              ?.toLowerCase()
              .trim()
              .replace(/\s+/g, "-")
              .replace(/-+$/, "")}/${product.service_title
              ?.toLowerCase()
              .trim()
              .replace(/\s+/g, "-")
              .replace(/-+$/, "")}`;

            return (
              <div key={index} className="product-shell h-100">
                <div className="product-card-outer h-100">
                  <div className="product-card-inner">
                    <div className="product-image-card">
                      <div className="carousel-figure ratio ratio-1x1 overflow-hidden">
                        <Link to={serviceUrl} className="d-block h-100 w-100">
                          <img
                            src={product.image || "/images/placeholder.jpg"}
                            alt={product.title || "Product"}
                            className="w-100 h-100 object-fit-cover"
                          />
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="product-meta-cream ">
                    <h6 className="fw-bold mb-1 product-title text-dark">{product.service_title}</h6>
                    <p className="product-list-price mb-0">
                      {isPriceValid ? formatPrice(totalPrice) : "Call for price"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn carousel-cta product-list-cta"
                    onClick={(e) => (isPriceValid ? openModal(e, product) : handleContactForPrice(e))}
                  >
                    {isPriceValid ? "Book now" : "Ask for price"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "30px",
              borderRadius: "10px",
              width: "100%",
              maxWidth: "400px",
              position: "relative",
            }}
          >
            <button
              onClick={() => {
                setFormData({
                  address: "",
                  date: "",
                  time: "",
                  service_title: "",
                  service_id: "",
                });
                setShowModal(false);
              }}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                width: "30px",
                height: "30px",
                lineHeight: "30px",
                textAlign: "center",
                border: "none",
                backgroundColor: "red",
                color: "#fff",
                borderRadius: "50%",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                padding: 0,
              }}
            >
              &times;
            </button>

            <h5 className="mb-3" style={{ fontSize: "16px" }}>
              Book Service: {formData.service_title}
            </h5>

            <div className="mb-3">
              <label htmlFor="date" className="form-label">
                Select Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                className="form-control"
                value={formData.date || ""}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="time" className="form-label">
                Select Time
              </label>
              <input
                type="time"
                id="time"
                name="time"
                className="form-control"
                value={formData.time || ""}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="address" className="form-label">
                Address
              </label>
              <input
                type="text"
                ref={inputRef}
                id="address"
                name="service-address"
                className="form-control"
                placeholder="Enter your service address"
                autoComplete="off"
                spellCheck={false}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="d-flex justify-content-between mt-4">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setFormData({
                    address: "",
                    date: "",
                    time: "",
                    service_title: "",
                    service_id: "",
                  });
                  setShowModal(false);
                }}
              >
                Cancel
              </button>
              <button className="btn btn-success" onClick={handleSubmitBooking}>
                Submit
              </button>
            </div>
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
