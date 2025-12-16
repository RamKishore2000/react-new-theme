import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "./Common/Header";
import Footer from "./Common/Footer";
import "../css/ServiceDetails.css";

const toSlug = (str) =>
  str
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "";

const normalizeService = (item) => ({
  id: item?.id || item?.service_id || "",
  title: item?.service_title || item?.title || "Service",
  description: item?.description || "",
  categoryName: item?.categoryName || item?.category || "",
  subCategoryName: item?.subCategoryName || item?.subcategory || "",
  price: item?.discount_price || item?.totalPrice || item?.mrp || "",
  mrp: item?.mrp || "",
  productPrice: item?.productPrice || item?.pricing || [],
  image: item?.image || item?.service_image || item?.product_image || "",
  imgs: item?.imgs || [],
});

  const formatPrice = (value) => {
    if (value === null || value === undefined || value === "" || value === "0" || value === "0.00") {
      return "Ask for price";
    }
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    return `Rs.${num.toLocaleString("en-IN")}`;
  };

export default function ServiceDetails() {
  const { serviceSlug = "" } = useParams();
  const [service, setService] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [selectedIndexes, setSelectedIndexes] = useState({});
  const [businessId, setBusinessId] = useState(() => localStorage.getItem("id") || "");
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

  useEffect(() => {
    const interval = setInterval(() => {
      const bid = localStorage.getItem("id");
      if (bid) {
        setBusinessId(bid);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const path = window.location.pathname;
  const businessName = localStorage.getItem("subdomain");
  const userId = localStorage.getItem("user_id") || "";

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
    const fetchServiceDetails = async () => {
      try {
        const response = await axios.post("https://topiko.com/prod/app/getserviceslist.php", {
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

        const raw = response?.data?.services;
        const list = Array.isArray(raw)
          ? raw
          : raw && typeof raw === "object"
            ? [raw]
            : [];
        const normalized = list.map((item) => normalizeService(item));
        const found = normalized.find((svc) => toSlug(svc.title) === serviceSlug);
        setService(found || null);
        if (found) {
          const gallery = [
            found.image,
            found?.imgs?.[0]?.img1,
            found?.imgs?.[0]?.img2,
            found?.imgs?.[0]?.img3,
          ].filter(Boolean);
          setActiveImage(gallery[0] || found.image || "");
        }
      } catch (error) {
        console.error("Error fetching service details:", error);
        setService(null);
      }
    };

    if (!hasFetched.current && businessId && fullUrl) {
      fetchServiceDetails();
      hasFetched.current = true;
    }
  }, [businessId, fullUrl, userId, serviceSlug]);

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

  const openModal = () => {
    const userIdLocal = localStorage.getItem("user_id");
    if (!userIdLocal) {
      setToast({ show: true, message: "Please login to book a service.", type: "error" });
      window.dispatchEvent(new Event("openLoginModal"));
      return;
    }
    setFormData({
      address: "",
      date: "",
      time: "",
      service_title: service?.title || "",
      service_id: service?.id || "",
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

  if (!service) {
    return (
      <>
        <Header />
        <main className="flex-grow-1 service-details-bg">
          <div className="container py-5">
            <p className="text-muted mb-0">Service not found.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const slideItems = [
    { imgSrc: service?.image },
    { imgSrc: service?.imgs?.[0]?.img1 },
    { imgSrc: service?.imgs?.[0]?.img2 },
    { imgSrc: service?.imgs?.[0]?.img3 },
  ].filter((img) => img?.imgSrc);

  const currentIdx = selectedIndexes[service.id] || 0;
  const getSelectedPriceValue = () => {
    const priceItem = service?.productPrice?.[currentIdx];
    if (!priceItem) return service?.price || service?.mrp;
    const value =
      priceItem.discount_price !== "0.00" && priceItem.discount_price !== ""
        ? priceItem.discount_price
        : priceItem.mrp;
    return value;
  };

  const selectedPriceValue = getSelectedPriceValue();
  const isPriceValid = Number(selectedPriceValue) > 0;
  const displayPrice = formatPrice(selectedPriceValue);

  return (
    <>
      <Header />
      <main className="flex-grow-1 service-details-bg">
        <section className="service-details-shell">
          <div className="container">
            <div className="service-details-card">
              <div className="row g-4 align-items-start">
                <div className="col-12 col-md-5">
                  <div className="service-image-card">
                    <div className="service-figure ratio ratio-1x1 overflow-hidden">
                      <img src={activeImage || service.image} alt={service.title} className="w-100 h-100 object-fit-cover" />
                    </div>
                  </div>
                  {slideItems.length > 1 && (
                    <div className="sd-thumb-row mt-3">
                      {slideItems.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className={`sd-thumb ${item.imgSrc === activeImage ? "active" : ""}`}
                          onClick={() => setActiveImage(item.imgSrc)}
                        >
                          <img src={item.imgSrc} alt={`${service.title} thumb ${idx + 1}`} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="col-12 col-md-7">
                  <div className="service-info">
                    <p className="text-uppercase text-muted small mb-1">
                      {[service.categoryName, service.subCategoryName].filter(Boolean).join(" / ")}
                    </p>
                    <h3 className="fw-bold mb-2">{service.title}</h3>
                    {service.description && (
                      <div
                        className="text-muted mb-3"
                        dangerouslySetInnerHTML={{ __html: service.description }}
                      />
                    )}

                    {service.productPrice && service.productPrice.length > 0 && (
                      <div className="mb-3">
                        <label className="form-label fw-semibold small mb-2">Choose option</label>
                        <div className="d-flex flex-wrap gap-2">
                          {service.productPrice.map((priceItem, idx) => (
                            <button
                              key={idx}
                              type="button"
                              className={`btn btn-sm ${currentIdx === idx ? "btn-primary" : "btn-outline-secondary"}`}
                              onClick={() =>
                                setSelectedIndexes((prev) => ({
                                  ...prev,
                                  [service.id]: idx,
                                }))
                              }
                              style={{ minWidth: "90px", textAlign: "center" }}
                            >
                              {priceItem.meassuring_details} {priceItem.meassuring_type}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="fw-bold text-dark">Price</span>
                      <span className="fs-5 fw-bold text-primary">{displayPrice}</span>
                    </div>

                    <div className="d-flex flex-column flex-sm-row gap-2">
                      {isPriceValid ? (
                        <button type="button" className="btn btn-primary flex-fill" onClick={openModal}>
                          Book now
                        </button>
                      ) : (
                        <a
                          className="btn btn-primary flex-fill"
                          href={`tel:${localStorage.getItem("primarycontact") || ""}`}
                        >
                          Ask for price
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
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
