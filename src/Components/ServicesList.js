import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Header from "./Common/Header";
import Footer from "./Common/Footer";
import "../css/ProductsCarousel.css";

const normalizeService = (item, index) => ({
  id: item?.id || item?.service_id || index,
  title: item?.service_title || item?.title || "Service",
  category: item?.categoryName || item?.category || "",
  categoryId: item?.category_id || item?.categoryId || null,
  subcategory: item?.subCategoryName || item?.subcategory || "",
  image: item?.image || item?.thumb || item?.service_image || "",
  price: item?.totalPrice || item?.price || "",
});

const formatPrice = (value) => {
  if (value === null || value === undefined || value === "") return "Call for price";
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return `Rs.${num.toFixed(2)}`;
};

const toSlug = (str) =>
  str
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "";

export default function ServicesList() {
  const { categorySlug = "" } = useParams();
  const location = useLocation();
  const selectedCategoryName = location.state?.categoryName || categorySlug.replace(/-/g, " ");
  const selectedCategoryId = location.state?.categoryId || "";
  const [services, setServices] = useState([]);
  const [businessId, setBusinessId] = useState(() => localStorage.getItem("id"));
  const hasFetched = useRef(false);
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
    const userId = localStorage.getItem("user_id") || "";

    const fetchServices = async () => {
      try {
        const response = await fetch("https://topiko.com/prod/app/getserviceslist.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bid: businessId,
            url: fullUrl,
            minPrice: "",
            maxPrice: "",
            sort: "",
            order: "DESC",
            limit: 200,
            page: 1,
            filter: "",
            user_id: userId,
          }),
        });

        const data = await response.json();
        const dataArray = Array.isArray(data?.services)
          ? data.services
          : Array.isArray(data)
            ? data
            : Object.values(data || {});
        const list = Array.isArray(dataArray) ? dataArray : [];
        setServices(list.map((item, index) => normalizeService(item, index)));
      } catch (error) {
        console.error("Error fetching services:", error);
        setServices([]);
      }
    };

    fetchServices();
  }, [businessId, fullUrl]);

  const filteredServices = useMemo(() => {
    if (!selectedCategoryId) return services;
    return services.filter((svc) => String(svc.categoryId || "") === String(selectedCategoryId));
  }, [services, selectedCategoryId]);

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
    if (toast.show) {
      const timer = setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const openModal = (service) => {
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
      service_title: service.title || "",
      service_id: service.id || "",
    });
    setShowModal(true);
  };

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

  return (
    <>
      <Header />
      <main className="flex-grow-1 service-list-page" style={{ background: "#f7f1e7" }}>
        <div className="container py-5">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
              <p className="text-uppercase text-muted small mb-1">Services</p>
              <h3 className="fw-bold mb-0">
                {selectedCategoryName ? `${selectedCategoryName} services` : "All services"}
              </h3>
            </div>
          </div>

          {!filteredServices.length ? (
            <p className="text-muted mb-0">No services found for this selection.</p>
          ) : (
            <div className="row g-3 g-md-4">
              {filteredServices.map((svc) => (
                <div key={svc.id} className="col-6 col-sm-6 col-lg-4 col-xl-3">
                  <div className="product-shell h-100">
                    <div className="product-card-outer h-100">
                      <div className="product-card-inner">
                        <Link
                          to={`/service/${toSlug(svc.category || svc.categoryName || "category")}/${toSlug(
                            svc.subcategory || svc.subCategoryName || "sub"
                          )}/${toSlug(svc.title)}`}
                          className="product-image-card d-block"
                        >
                          <div className="carousel-figure ratio ratio-1x1 overflow-hidden">
                            <img
                              src={svc.image || "/images/placeholder.jpg"}
                              alt={svc.title}
                              className="w-100 h-100 object-fit-cover"
                            />
                          </div>
                        </Link>
                      </div>
                      <div className="product-meta-cream text-center">
                        <h6 className="fw-bold mb-1 product-title text-dark">{svc.title}</h6>
                        {(svc.category || svc.subcategory) && (
                          <p className="text-muted small mb-1">
                            {[svc.category, svc.subcategory].filter(Boolean).join(" / ")}
                          </p>
                        )}
                        <p className="product-list-price mb-0">{formatPrice(svc.price)}</p>
                      </div>
                      <button type="button" className="btn carousel-cta product-list-cta" onClick={() => openModal(svc)}>
                        Book now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
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
      <Footer />
    </>
  );
}
