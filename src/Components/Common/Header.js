import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { Offcanvas } from "bootstrap";
import logo from "../../logo.svg";
import "../../css/Header.css";
import MobileMenu from "./MobileMenu";
import { useCart } from "../CartContext";

const extractSubmenus = (item) => {
  if (item && item[item.id] && Array.isArray(item[item.id])) {
    return item[item.id];
  }

  const candidates = [
    item?.sub_menus,
    item?.submenus,
    item?.children,
    item?.items,
    item?.subcategories,
    item?.sub_categories,
  ];

  const found = candidates.find((entry) => Array.isArray(entry));
  return Array.isArray(found) ? found : [];
};

const normalizeMenus = (items) =>
  (items || []).map((item, index) => {
    const id =
      item?.id ||
      item?.menu_id ||
      item?.category_id ||
      item?.slug ||
      item?.url ||
      item?.name ||
      `cat-${index}`;
    const label =
      item?.label ||
      item?.title ||
      item?.name ||
      item?.menu_name ||
      item?.category_name ||
      item?.main_category ||
      `Category ${index + 1}`;

    const submenus = extractSubmenus(item).map((sub, subIndex) => ({
      id:
        sub?.id ||
        sub?.menu_id ||
        sub?.category_id ||
        sub?.slug ||
        sub?.url ||
        sub?.name ||
        sub?.subcategory_id ||
        `sub-${index}-${subIndex}`,
      label:
        sub?.label ||
        sub?.title ||
        sub?.name ||
        sub?.menu_name ||
        sub?.category_name ||
        sub?.sub_category_name ||
        sub?.subcategory_name ||
        `Item ${subIndex + 1}`,
      to: sub?.to || sub?.url || sub?.link || "#",
    }));

    return {
      id,
      label,
      items: submenus,
    };
  });

const toSlug = (str) =>
  str
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "";

export default function Header() {
  const navigate = useNavigate();
  const { cartProducts } = useCart();
  const [activeProduct, setActiveProduct] = useState(null);
  const [activeService, setActiveService] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAccountToast, setShowAccountToast] = useState(false);
  const [accountView, setAccountView] = useState("signin");
  const [brandLogo, setBrandLogo] = useState(() => localStorage.getItem("business_logo") || "");
  const [brandName, setBrandName] = useState(() => localStorage.getItem("business_name") || "");
  const [businessId, setBusinessId] = useState(() => localStorage.getItem("id"));
  const [productMenuItemsAPI, setProductMenuItemsAPI] = useState([]);
  const [serviceMenuItemsAPI, setProductMenuItemsAPI1] = useState([]);
  const [loginMobile, setLoginMobile] = useState("");
  const [password, setPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regMobile, setRegMobile] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [mpin, setMpin] = useState("");
  const [confirmMpin, setConfirmMpin] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [userId, setUserId] = useState(() => localStorage.getItem("user_id"));
  const hasFetchedBusiness = useRef(false);
  const hasFetchedProductMenus = useRef(false);
  const hasFetchedServiceMenus = useRef(false);

  const productCategories = useMemo(
    () => normalizeMenus(productMenuItemsAPI).filter((cat) => cat.items.length > 0),
    [productMenuItemsAPI]
  );
  const serviceCategories = useMemo(
    () => normalizeMenus(serviceMenuItemsAPI).filter((cat) => cat.items.length > 0),
    [serviceMenuItemsAPI]
  );
  const accountMeta =
    {
      signin: {
        kicker: "Welcome back",
        title: "Sign in to your account",
        
      },
      signup: {
        kicker: "Join us",
        title: "Create your account",
        
      },
      otp: {
        kicker: "Verify number",
        title: "Enter the 4-digit OTP",
        description: "We sent an OTP to your mobile. Enter it below to continue.",
      },
      mpin: {
        kicker: "Secure access",
        title: "Create your password",
        description: "Set a password (MPIN) to finish creating your account.",
      },
      forgot: {
        kicker: "Reset access",
        title: "Forgot password",
        description: "Enter your registered email or mobile number and we'll send a reset link.",
      },
    }[accountView] || {};

  const handleAccountClick = (event) => {
    event.preventDefault();
    const storedUserId = localStorage.getItem("user_id");
    if (storedUserId) {
      setUserId(storedUserId);
      navigate("/profile");
      return;
    }
    setLoginMobile("");
    setRegMobile("");
    setRegName("");
    setOtpDigits(["", "", "", ""]);
    setMpin("");
    setConfirmMpin("");
    setPassword("");
    setMessage("");
    setIsSuccess(false);
    setShowToast(false);
    setAccountView("signin");
    setShowAccountToast(true);
  };

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setShowAccountToast(false);
      }
    };
    const handleOpenLogin = () => {
      setAccountView("signin");
      setShowAccountToast(true);
    };

    if (showAccountToast) {
      window.addEventListener("keydown", handleEsc);
    }
    window.addEventListener("openLoginModal", handleOpenLogin);

    return () => {
      window.removeEventListener("keydown", handleEsc);
      window.removeEventListener("openLoginModal", handleOpenLogin);
    };
  }, [showAccountToast]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSuccess(false);

    try {
      const response = await axios.post("https://topiko.com/prod/app/wt_login.php", {
        mobile: loginMobile,
        password,
      });

      if (response.data?.status === "success") {
        setIsSuccess(true);
        setMessage("✅ Login successful!");

        localStorage.setItem("user_id", response.data.response);
        localStorage.setItem("user_mobile", loginMobile);
        setUserId(response.data.response);

       

        const loginOffcanvasEl = document.getElementById("login");
        if (loginOffcanvasEl) {
          const bsOffcanvas = Offcanvas.getInstance(loginOffcanvasEl) || new Offcanvas(loginOffcanvasEl);
          bsOffcanvas.hide();
        }

        setShowAccountToast(false);
        setShowToast(true);
        navigate("/");
        
      } else {
        setMessage(response.data?.msg || "❌ Invalid login credentials.");
        setShowToast(true);
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("❌ Something went wrong.");
      setShowToast(true);
    }
  };

  const handleAccountSubmit = (event) => {
    event.preventDefault();
  };

  useEffect(() => {
    setMessage("");
    setIsSuccess(false);
  }, [accountView]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSuccess(false);

    try {
      const response = await axios.post("https://topiko.com/prod/app/wt_register.php", {
        name: regName,
        mobile: regMobile,
      });

      if (response.data?.status === "success") {
        setIsSuccess(true);
        setMessage("✅ Registration successful! Enter the OTP to continue.");
        setShowToast(true);
        setAccountView("otp");
      } else {
        setMessage(response.data?.msg || "❌ Registration failed.");
        setShowToast(true);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setMessage("❌ Something went wrong. Please try again.");
      setShowToast(true);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...otpDigits];
    next[index] = value;
    setOtpDigits(next);
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otpDigits.join("");
    if (enteredOtp.length !== 4) {
      setMessage("❌ Please enter all 4 digits of the OTP.");
      setShowToast(true);
      setIsSuccess(false);
      return;
    }

    try {
      const response = await axios.post("https://topiko.com/prod/app/wt_registerMobileOtpVerify.php", {
        mobile: regMobile,
        otp: enteredOtp,
      });

      if (response.data?.status === "success") {
        setIsSuccess(true);
        setMessage("✅ OTP verified successfully!");
        setShowToast(true);
        setAccountView("mpin");
      } else {
        setIsSuccess(false);
        setMessage(response.data?.msg || "❌ OTP verification failed.");
        setShowToast(true);
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setIsSuccess(false);
      setMessage("❌ Something went wrong. Please try again.");
      setShowToast(true);
    }
  };

  const handleCreatePassword = async (e) => {
    e.preventDefault();
    if (!mpin || mpin !== confirmMpin) {
      setIsSuccess(false);
      setMessage("❌ Password and confirm password must match.");
      setShowToast(true);
      return;
    }

    try {
      const response = await axios.post("https://topiko.com/prod/app/wt_registerCreatePassword.php", {
        mobile: regMobile,
        password: mpin,
      });

      if (response.data?.status === "success") {
        setIsSuccess(true);
        setMessage("✅ Password created successfully! You can now sign in.");
        setShowToast(true);
        setAccountView("signin");
        setLoginMobile(regMobile);
        setPassword("");
      } else {
        setIsSuccess(false);
        setMessage(response.data?.msg || "❌ Password creation failed.");
        setShowToast(true);
      }
    } catch (error) {
      console.error("Password creation error:", error);
      setIsSuccess(false);
      setMessage("❌ Something went wrong. Please try again.");
      setShowToast(true);
    }
  };

  useEffect(() => {
    if (showToast && message) {
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast, message]);

  useEffect(() => {
    if (!activeProduct && productCategories.length) {
      setActiveProduct(productCategories[0].id);
    }
  }, [productCategories, activeProduct]);

  useEffect(() => {
    if (!activeService && serviceCategories.length) {
      setActiveService(serviceCategories[0].id);
    }
  }, [serviceCategories, activeService]);

  useEffect(() => {
    if (hasFetchedBusiness.current) return;
    hasFetchedBusiness.current = true;

    const hostname = "mkfruits";
    // const hostname="ssvfashions"
    // const hostname="suntechagrisciencepvtltd"
    // const hostname="iceberg"

    const fetchBusinessInfo = async () => {
      try {
        const res = await fetch(
          `https://topiko.com/prod/app/getBusinessDetailsBySubdomainUrl.php?url=${hostname}`
        );
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          const businessId = data[0].business_id;
          localStorage.setItem("id", businessId);
          setBusinessId(businessId);

          const detailsResponse = await fetch("https://topiko.com/prod/app/wt_getBusinessDetails.php", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ bid: businessId }),
          });

          const detailsData = await detailsResponse.json();
          const details = detailsData && detailsData.response;

          if (details) {
            const metaTitle = details.metaTitle || details.business_name || document.title;
            const metaDescription = details.meta_description || "";
            const metaKeywords = details.meta_keywords || "";
            const faviconUrl = details.logo;

            document.title = metaTitle;

            const setMetaTag = (name, content) => {
              if (!content) return;
              let tag = document.querySelector(`meta[name='${name}']`);
              if (!tag) {
                tag = document.createElement("meta");
                tag.setAttribute("name", name);
                document.head.appendChild(tag);
              }
              tag.setAttribute("content", content);
            };

            setMetaTag("description", metaDescription);
            setMetaTag("keywords", metaKeywords);

            if (faviconUrl) {
              let link = document.querySelector("link[rel*='icon']") || document.createElement("link");
              link.type = "image/x-icon";
              link.rel = "shortcut icon";
              link.href = faviconUrl;
              document.head.appendChild(link);
            }

            if (details.logo) {
              setBrandLogo(details.logo);
              localStorage.setItem("business_logo", details.logo);
            }

            if (details.business_name) {
              setBrandName(details.business_name);
              localStorage.setItem("business_name", details.business_name);
            }

            localStorage.setItem("primarycontact", details.primary_contact || "");
            localStorage.setItem("email", details.email || "");
            localStorage.setItem("businessadrees", details.business_address || "");
            localStorage.setItem("city", details.city || "");
            console.log("Storing city in localStorage:", details.city || "");
            localStorage.setItem("state", details.state || "");
            localStorage.setItem("facebook", details.facebook || "");
            localStorage.setItem("twitter", details.twitter || "");
            localStorage.setItem("instagram", details.instagram || "");
            localStorage.setItem("snapchat", details.snapchat || "");
            localStorage.setItem("youtube", details.youtube || "");
            localStorage.setItem("linkedin", details.linkedin || "");
            localStorage.setItem("WhatsApp", details.whatsApp || "");
            localStorage.setItem("latitude", details.latitude || "");
            localStorage.setItem("longitude", details.longitude || "");
            localStorage.setItem("pincode", details.pincode || "");
            localStorage.setItem("subdomain", details.subdomain || "");
            localStorage.setItem("catlog1", details.catalogue_file || "");
            localStorage.setItem("catlog2", details.catalogue_file2 || "");
            localStorage.setItem("catlog3", details.catalogue_file3 || "");
            localStorage.setItem("shodesc", details.shopdesc || "");
            localStorage.setItem("logo1", details.logo1 || "");

            window.dispatchEvent(new Event("socialDataUpdated"));
          }
        }
      } catch (err) {
        console.error("Error fetching business info:", err);
      }
    };

    fetchBusinessInfo();
  }, []);

  useEffect(() => {
    if (!businessId || hasFetchedProductMenus.current) return;
    hasFetchedProductMenus.current = true;

    const fetchProductMenus = async () => {
      const cacheKey = `product_menus_${businessId}`;
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        setProductMenuItemsAPI(JSON.parse(cached));
        return;
      }

      try {
        const response = await axios.post("https://topiko.com/prod/app/wt_getProductMenus.php", { business_id: businessId });

        if (response.data?.status === "success" && Array.isArray(response.data.response)) {
          localStorage.setItem(cacheKey, JSON.stringify(response.data.response));
          setProductMenuItemsAPI(response.data.response);
        }
      } catch (error) {
        console.error("Failed to fetch product menu items", error);
      }
    };

    fetchProductMenus();
  }, [businessId]);

  useEffect(() => {
    if (!businessId || hasFetchedServiceMenus.current) return;
    hasFetchedServiceMenus.current = true;

    const fetchServiceMenus = async () => {
      const cacheKey = `service_menus_${businessId}`;
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        setProductMenuItemsAPI1(JSON.parse(cached));
        return;
      }

      try {
        const response = await axios.post("https://topiko.com/prod/app/wt_getServiceMenus.php", { business_id: businessId });

        if (response.data?.status === "success" && Array.isArray(response.data.response)) {
          localStorage.setItem(cacheKey, JSON.stringify(response.data.response));
          setProductMenuItemsAPI1(response.data.response);
        }
      } catch (error) {
        console.error("Failed to fetch service menu items", error);
      }
    };

    fetchServiceMenus();
  }, [businessId]);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
      <div className="container">
        {/* Mobile bar */}
        <div className="d-flex d-lg-none align-items-center justify-content-between w-100 py-2">
          <button
            className="btn btn-link text-dark p-0"
            type="button"
            aria-label="Open menu"
            onClick={() => setShowMobileMenu(true)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <NavLink className="navbar-brand d-flex align-items-center gap-2 m-0" to="/">
            <div className="brand-avatar d-inline-flex align-items-center justify-content-center bg-light rounded-circle">
              <img src={brandLogo} alt={`${brandName} logo`} width="48" height="48" />
            </div>
            <span className="fw-semibold text-primary">{brandName}</span>
          </NavLink>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-outline-primary d-flex align-items-center gap-2"
              onClick={handleAccountClick}
              aria-label="Account"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2.936 1.09A4.998 4.998 0 0 1 13 13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1c0-1.355.56-2.577 1.464-3.444A4.982 4.982 0 0 1 8 8c1.29 0 2.47.488 3.349 1.29l.587-.2Z" />
              </svg>
            </button>
            <NavLink
              to="/cart"
              className="btn btn-light border position-relative d-flex align-items-center"
              aria-label="Cart"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <path d="M0 1a1 1 0 0 1 1-1h1.5a1 1 0 0 1 .97.757L3.89 3H15a1 1 0 0 1 .96 1.273l-1.5 5A1 1 0 0 1 13.5 10H5a1 1 0 0 1-.97-.757L2.01 2H1a1 1 0 0 1-1-1Zm4.102 9h9.398l1.2-4H4.102l1 4ZM5.5 12a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
              </svg>
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {cartProducts.length}
                <span className="visually-hidden">items in cart</span>
              </span>
            </NavLink>
          </div>
        </div>

        {/* Desktop brand */}
        <NavLink className="navbar-brand d-none d-lg-flex align-items-center gap-2 flex-shrink-0" to="/">
          <div className="brand-avatar d-inline-flex align-items-center justify-content-center bg-light rounded-circle">
            <img src={brandLogo} alt={`${brandName} logo`} width="60" height="60" />
          </div>
          <span className="fw-semibold text-primary">{brandName}</span>
        </NavLink>

        <div className="collapse navbar-collapse d-none d-lg-flex" id="primaryNav">
          <ul className="navbar-nav mx-auto mb-0 d-flex align-items-lg-center gap-lg-3">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">
                Home
              </NavLink>
            </li>
            {productCategories.length > 0 && (
              <li className="nav-item dropdown">
                <NavLink
                  className="nav-link dropdown-toggle"
                  to="/products"
                  role="button"
                  data-bs-toggle="dropdown"
                  data-bs-auto-close="outside"
                  aria-expanded="false"
                >
                  Products
                </NavLink>
                <div className="dropdown-menu p-4 border-0 shadow-sm mega-dropdown" role="menu">
                  <div className="mega-panel">
                    <div className="mega-categories">
                      {productCategories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          className={`mega-category-btn ${activeProduct === category.id ? "active" : ""}`}
                          onMouseEnter={() => setActiveProduct(category.id)}
                          onFocus={() => setActiveProduct(category.id)}
                          onClick={() => setActiveProduct(category.id)}
                        >
                          {category.label}
                        </button>
                      ))}
                    </div>
                  <div className="mega-subcategories">
                    {productCategories
                      .find((category) => category.id === activeProduct)
                      ?.items.map((item) => (
                        <NavLink
                          key={item.id || item.to}
                          className="mega-link text-decoration-none"
                          to={`/product-list/${toSlug(
                            productCategories.find((category) => category.id === activeProduct)?.label
                          )}/${toSlug(item.label)}`}
                        >
                          {item.label}
                        </NavLink>
                      ))}
                  </div>
                </div>
                </div>
              </li>
            )}
            {serviceCategories.length > 0 && (
              <li className="nav-item dropdown">
                <NavLink
                  className="nav-link dropdown-toggle"
                  to="/services"
                  role="button"
                  data-bs-toggle="dropdown"
                  data-bs-auto-close="outside"
                  aria-expanded="false"
                >
                  Services
                </NavLink>
                <div className="dropdown-menu p-4 border-0 shadow-sm mega-dropdown" role="menu">
                  <div className="mega-panel">
                    <div className="mega-categories">
                      {serviceCategories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          className={`mega-category-btn ${activeService === category.id ? "active" : ""}`}
                          onMouseEnter={() => setActiveService(category.id)}
                          onFocus={() => setActiveService(category.id)}
                          onClick={() => setActiveService(category.id)}
                        >
                          {category.label}
                        </button>
                      ))}
                    </div>
                    <div className="mega-subcategories">
                      {serviceCategories
                        .find((category) => category.id === activeService)
                        ?.items.map((item) => (
                          <NavLink
                            key={item.id || item.to}
                            className="mega-link text-decoration-none"
                            to={`/service-list/${toSlug(
                              serviceCategories.find((category) => category.id === activeService)?.label
                            )}/${toSlug(item.label)}`}
                          >
                            {item.label}
                          </NavLink>
                        ))}
                    </div>
                  </div>
                </div>
              </li>
            )}
            <li className="nav-item">
              <NavLink className="nav-link" to="/about">
                About
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/contact">
                Contact
              </NavLink>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3 flex-shrink-0">
            <button
              type="button"
              className="btn btn-outline-primary d-flex align-items-center gap-2"
              onClick={handleAccountClick}
            >
              <span className="d-inline-flex">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2.936 1.09A4.998 4.998 0 0 1 13 13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1c0-1.355.56-2.577 1.464-3.444A4.982 4.982 0 0 1 8 8c1.29 0 2.47.488 3.349 1.29l.587-.2Z" />
                </svg>
              </span>
              <span className="d-none d-lg-inline">Account</span>
            </button>

            <NavLink to="/cart" className="btn btn-light border position-relative d-flex align-items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <path d="M0 1a1 1 0 0 1 1-1h1.5a1 1 0 0 1 .97.757L3.89 3H15a1 1 0 0 1 .96 1.273l-1.5 5A1 1 0 0 1 13.5 10H5a1 1 0 0 1-.97-.757L2.01 2H1a1 1 0 0 1-1-1Zm4.102 9h9.398l1.2-4H4.102l1 4ZM5.5 12a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
              </svg>
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {cartProducts.length}
                <span className="visually-hidden">items in cart</span>
              </span>
            </NavLink>
          </div>
        </div>
      </div>
      <MobileMenu open={showMobileMenu} onClose={() => setShowMobileMenu(false)} />
      {showAccountToast && (
        <div className="account-toast-backdrop active" onClick={() => setShowAccountToast(false)}>
          <div className="account-toast-shell" onClick={(event) => event.stopPropagation()}>
            <div
              className="account-toast active"
              role="dialog"
              aria-modal="true"
              aria-labelledby="accountToastTitle"
            >
              <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                <div>
                  <p className="text-uppercase text-muted fw-semibold small mb-1">{accountMeta.kicker}</p>
                  <h6 className="mb-0" id="accountToastTitle">
                    {accountMeta.title}
                  </h6>
                  <p className="small text-muted mb-0">{accountMeta.description}</p>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-light rounded-circle lh-1 px-2"
                  aria-label="Close sign in panel"
                  onClick={() => setShowAccountToast(false)}
                >
                  &times;
                </button>
              </div>

              {accountView === "signin" && (
                <form className="d-flex flex-column gap-2" onSubmit={handleLogin}>
                  <div className="form-floating">
                    <input
                      type="tel"
                      className="form-control"
                      id="accountMobile"
                      placeholder="Mobile number"
                      inputMode="tel"
                      value={loginMobile}
                      onChange={(event) => setLoginMobile(event.target.value)}
                      required
                    />
                    <label htmlFor="accountMobile">Mobile number</label>
                  </div>

                  <div className="form-floating">
                    <input
                      type="password"
                      className="form-control"
                      id="accountPassword"
                      placeholder="Password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                    <label htmlFor="accountPassword">Password</label>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="rememberMe" />
                      <label className="form-check-label" htmlFor="rememberMe">
                        Remember me
                      </label>
                    </div>
                    <button
                      type="button"
                      className="btn btn-link p-0 small"
                      onClick={() => setAccountView("forgot")}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button type="submit" className="btn btn-primary w-100">
                    Continue
                  </button>

                  {message && (
                    <div className={`alert ${isSuccess ? "alert-success" : "alert-danger"} small mb-0 py-2`} role="alert">
                      {message}
                    </div>
                  )}

                  <div className="text-center mt-1">
                    <span className="small text-muted me-1">New here?</span>
                    <button
                      type="button"
                      className="btn btn-link p-0 small"
                      onClick={() => setAccountView("signup")}
                    >
                      Create account
                    </button>
                  </div>
                </form>
              )}

              {accountView === "otp" && (
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex justify-content-between gap-2">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        className="form-control text-center fs-5"
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                      />
                    ))}
                  </div>
                  <button type="button" className="btn btn-primary w-100" onClick={handleVerifyOtp}>
                    Verify OTP
                  </button>
                  {message && (
                    <div className={`alert ${isSuccess ? "alert-success" : "alert-danger"} small mb-0 py-2`} role="alert">
                      {message}
                    </div>
                  )}
                  <div className="text-center mt-1">
                    <button type="button" className="btn btn-link p-0 small" onClick={() => setAccountView("signin")}>
                      Back to sign in
                    </button>
                  </div>
                </div>
              )}

              {accountView === "mpin" && (
                <form className="d-flex flex-column gap-2" onSubmit={handleCreatePassword}>
                  <div className="form-floating">
                    <input
                      type="password"
                      className="form-control"
                      id="mpinPassword"
                      placeholder="Create password"
                      value={mpin}
                      onChange={(event) => setMpin(event.target.value)}
                      required
                    />
                    <label htmlFor="mpinPassword">Create password</label>
                  </div>

                  <div className="form-floating">
                    <input
                      type="password"
                      className="form-control"
                      id="mpinConfirm"
                      placeholder="Confirm password"
                      value={confirmMpin}
                      onChange={(event) => setConfirmMpin(event.target.value)}
                      required
                    />
                    <label htmlFor="mpinConfirm">Confirm password</label>
                  </div>

                  <button type="submit" className="btn btn-primary w-100">
                    Save password
                  </button>

                  {message && (
                    <div className={`alert ${isSuccess ? "alert-success" : "alert-danger"} small mb-0 py-2`} role="alert">
                      {message}
                    </div>
                  )}

                  <div className="text-center mt-1">
                    <button
                      type="button"
                      className="btn btn-link p-0 small"
                      onClick={() => setAccountView("signin")}
                    >
                      Back to sign in
                    </button>
                  </div>
                </form>
              )}

              {accountView === "signup" && (
                <form className="d-flex flex-column gap-2" onSubmit={handleRegister}>
                  <div className="form-floating">
                    <input
                      type="text"
                      className="form-control"
                      id="signupName"
                      placeholder="Full name"
                      value={regName}
                      onChange={(event) => setRegName(event.target.value)}
                      required
                    />
                    <label htmlFor="signupName">Full name</label>
                  </div>

                  <div className="form-floating">
                    <input
                      type="tel"
                      className="form-control"
                      id="signupMobile"
                      placeholder="Mobile number"
                      inputMode="tel"
                      value={regMobile}
                      onChange={(event) => setRegMobile(event.target.value)}
                      required
                    />
                    <label htmlFor="signupMobile">Mobile number</label>
                  </div>

                  <button type="submit" className="btn btn-primary w-100">
                    Create account
                  </button>

                  {message && (
                    <div className={`alert ${isSuccess ? "alert-success" : "alert-danger"} small mb-0 py-2`} role="alert">
                      {message}
                    </div>
                  )}

                  <div className="text-center mt-1">
                    <span className="small text-muted me-1">Already have an account?</span>
                    <button
                      type="button"
                      className="btn btn-link p-0 small"
                      onClick={() => setAccountView("signin")}
                    >
                      Sign in
                    </button>
                  </div>
                </form>
              )}

              {accountView === "forgot" && (
                <form className="d-flex flex-column gap-2" onSubmit={handleAccountSubmit}>
                  <div className="form-floating">
                    <input
                      type="text"
                      className="form-control"
                      id="forgotContact"
                      placeholder="Email or mobile number"
                    />
                    <label htmlFor="forgotContact">Email or mobile number</label>
                  </div>

                  <button type="submit" className="btn btn-primary w-100">
                    Send reset link
                  </button>

                  <div className="text-center mt-1">
                    <button
                      type="button"
                      className="btn btn-link p-0 small"
                      onClick={() => setAccountView("signin")}
                    >
                      Back to sign in
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      {showToast && message && (
        <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1100 }}>
          <div
            className={`toast align-items-center text-white ${isSuccess ? "bg-success" : "bg-danger"} show`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="d-flex">
              <div className="toast-body">{message}</div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                aria-label="Close"
                onClick={() => setShowToast(false)}
              ></button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
