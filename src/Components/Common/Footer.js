import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../css/Footer.css";

const icons = {
  location:
    "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 11.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z",
  email:
    "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.11 0 2-.9 2-2V6c0-1.1-.89-2-2-2Zm0 2-8 5-8-5h16Zm0 12H4V8l8 5 8-5v10Z",
  phone:
    "M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.3 21 3 13.7 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.24.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2Z",
  instagram:
    "M7 2h10c2.76 0 5 2.24 5 5v10c0 2.76-2.24 5-5 5H7c-2.76 0-5-2.24-5-5V7c0-2.76 2.24-5 5-5Zm0 2c-1.65 0-3 1.35-3 3v10c0 1.65 1.35 3 3 3h10c1.65 0 3-1.35 3-3V7c0-1.65-1.35-3-3-3H7Zm10.25 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7.5A4.5 4.5 0 1 1 12 16.5 4.5 4.5 0 0 1 12 7.5Zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z",
  facebook:
    "M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.12 8.44 9.88v-6.99H8.9v-2.89h1.54V9.41c0-1.52.9-2.35 2.28-2.35.66 0 1.35.12 1.35.12v1.48h-.76c-.75 0-.99.47-.99.95v1.15h1.69l-.27 2.89h-1.42v6.99C18.34 21.12 22 16.99 22 12Z",
  youtube:
    "M21.8 8.3a2.5 2.5 0 0 0-1.76-1.76C18.35 6 12 6 12 6s-6.35 0-8.04.54A2.5 2.5 0 0 0 2.2 8.3 26.6 26.6 0 0 0 2 12a26.6 26.6 0 0 0 .2 3.7c.2.83.92 1.48 1.76 1.76C5.65 18 12 18 12 18s6.35 0 8.04-.54c.84-.28 1.56-.93 1.76-1.76.14-.82.2-1.65.2-3.7 0-2.05-.06-2.88-.2-3.7ZM10 14.7V9.3l4.67 2.7L10 14.7Z",
  whatsapp:
    "M4.05 19.55 5 16.2A8 8 0 1 1 16.2 19.5l-3.34.95A8 8 0 0 1 4.05 19.55ZM12 4a6 6 0 0 0-6 6c0 1.2.35 2.33 1 3.3l-.6 2.22 2.27-.59A6 6 0 1 0 12 4Zm-2.55 3.7c.1-.23.3-.23.4-.23h.35c.12 0 .3-.05.47.35.16.4.54 1.33.6 1.43.05.1.08.22-.05.35-.14.14-.22.24-.33.38-.1.1-.22.22-.09.43.14.22.63 1.05 1.35 1.7.93.83 1.7 1.1 1.92 1.23.23.12.36.1.49-.05.12-.14.56-.66.71-.89.16-.22.3-.19.5-.1.2.1 1.28.61 1.5.72.22.1.37.16.43.25.05.1.05.53-.12 1.04-.16.5-.94.95-1.3 1-.33.05-.73.1-1.18-.07-.27-.1-.62-.2-1.07-.4-1.88-.82-3.1-2.73-3.2-2.86-.1-.14-.76-1.01-.76-1.93 0-.92.48-1.36.65-1.54.16-.18.35-.2.46-.2Z",
};

const Icon = ({ name }) => (
  <svg className="footer-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d={icons[name]} />
  </svg>
);

const readFooterData = () => {
  const businessName = localStorage.getItem("business_name") || "Our Business";
  const address =
    localStorage.getItem("businessadrees") ||
    localStorage.getItem("business_address") ||
    "";
  const city = localStorage.getItem("city") || "";
  const state = localStorage.getItem("state") || "";
  const pincode = localStorage.getItem("pincode") || "";
  const email = localStorage.getItem("email") || "";
  const phone =
    localStorage.getItem("primarycontact") ||
    localStorage.getItem("primary_contact") ||
    "";
  const description = localStorage.getItem("shodesc") || "";

  const socials = [
    { name: "facebook", href: localStorage.getItem("facebook") },
    { name: "instagram", href: localStorage.getItem("instagram") },
    { name: "twitter", href: localStorage.getItem("twitter") },
    { name: "snapchat", href: localStorage.getItem("snapchat") },
    { name: "youtube", href: localStorage.getItem("youtube") },
    { name: "linkedin", href: localStorage.getItem("linkedin") },
    { name: "whatsapp", href: localStorage.getItem("WhatsApp") },
  ].filter((item) => item.href);

  return {
    businessName,
    address,
    city,
    state,
    pincode,
    email,
    phone,
    description,
    socials,
  };
};

export default function Footer() {
  const navigate = useNavigate();
  const [footerData, setFooterData] = useState(() => readFooterData());

  useEffect(() => {
    let intervalId;
    let fetched = false;
    let cancelled = false;

    const fetchFooterBusinessDetails = async (business_id) => {
      try {
        const res = await fetch("https://topiko.com/prod/app/wt_getBusinessDetails.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bid: business_id }),
        });
        const data = await res.json();
        const details = data && data.response;

        if (!cancelled && details) {
          setFooterData({
            businessName: details.business_name || "Our Business",
            address: details.business_address || "",
            city: details.city || "",
            state: details.state || "",
            pincode: details.pincode || "",
            email: details.email || "",
            phone: details.primary_contact || "",
            description: details.shopdesc || "",
            socials: [
              { name: "facebook", href: details.facebook },
              { name: "instagram", href: details.instagram },
              { name: "twitter", href: details.twitter },
              { name: "snapchat", href: details.snapchat },
              { name: "youtube", href: details.youtube },
              { name: "linkedin", href: details.linkedin },
              { name: "whatsapp", href: details.whatsApp },
            ].filter((item) => item.href),
          });
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Footer: error fetching business details", err);
        }
      }
    };

    const tryFetch = () => {
      const business_id = localStorage.getItem("id");
      if (business_id && !fetched) {
        fetched = true;
        fetchFooterBusinessDetails(business_id);
        return true;
      }
      return false;
    };

    if (!tryFetch()) {
      intervalId = setInterval(() => {
        if (tryFetch()) {
          clearInterval(intervalId);
        }
      }, 300);
    }

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const fullAddress = [
    footerData.address,
    footerData.city,
    footerData.state,
    footerData.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const fetchAndGo = async (type, storageKey, path) => {
    const business_id = localStorage.getItem("id");
    try {
      const res = await axios.post("https://topiko.com/prod/app/getBusinessPolicy.php", { business_id, type });
      if (res.data?.status === "success") {
        localStorage.setItem(storageKey, JSON.stringify(res.data.response));
      }
    } catch (err) {
      console.error(`Error fetching ${type} policy:`, err);
    } finally {
      navigate(path);
    }
  };

  return (
    <footer className="footer bg-white text-dark mt-auto pt-5 pb-4">
      <div className="container">
        <div className="row gy-4">
          <div className="col-md-4">
            <h5 className="fw-bold mb-3 text-dark">{footerData.businessName}</h5>
            <ul className="list-unstyled footer-list">
              {fullAddress && (
                <li className="d-flex align-items-start gap-2">
                  <Icon name="location" />
                  <span className="text-muted">{fullAddress}</span>
                </li>
              )}
              {footerData.email && (
                <li className="d-flex align-items-start gap-2">
                  <Icon name="email" />
                  <a className="text-muted text-decoration-none" href={`mailto:${footerData.email}`}>
                    {footerData.email}
                  </a>
                </li>
              )}
              {footerData.phone && (
                <li className="d-flex align-items-start gap-2">
                  <Icon name="phone" />
                  <a className="text-muted text-decoration-none" href={`tel:${footerData.phone}`}>
                    {footerData.phone}
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div className="col-6 col-md-2">
            <h6 className="text-uppercase small fw-semibold mb-3 text-dark">Navigate</h6>
            <ul className="list-unstyled footer-list">
              <li>
                <NavLink className="text-decoration-none text-muted" to="/about">
                  About
                </NavLink>
              </li>
              <li>
                <NavLink className="text-decoration-none text-muted" to="/contact">
                  Contact
                </NavLink>
              </li>
              <li>
                <button
                  type="button"
                  className="link-button text-muted"
                  onClick={() => fetchAndGo("Privacy", "privacy_policy_data", "/privacy-policy")}
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="link-button text-muted"
                  onClick={() => fetchAndGo("Refund", "refund_policy_data", "/return-and-refund")}
                >
                  Refunds &amp; Returns
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="link-button text-muted"
                  onClick={() => fetchAndGo("Shipping", "shipping_policy_data", "/shipping")}
                >
                  Shipping
                </button>
              </li>
            </ul>
          </div>

          <div className="col-6 col-md-3">
            <h6 className="text-uppercase small fw-semibold mb-3 text-dark">Follow Us</h6>
            {footerData.socials.length > 0 ? (
              <ul className="list-unstyled footer-list">
                {footerData.socials.map((item) => (
                  <li key={item.name} className="d-flex align-items-center gap-2">
                    <Icon name={item.name.toLowerCase()} />
                    <a className="text-muted text-decoration-none" href={item.href} target="_blank" rel="noreferrer">
                      {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted mb-0">No social links available.</p>
            )}
          </div>

          <div className="col-md-3">
            <h6 className="text-uppercase small fw-semibold mb-3 text-dark">Description</h6>
            <p className="text-muted mb-0 footer-description">
              {footerData.description || "Welcome to our store."}
            </p>
          </div>
        </div>

        <div className="border-top border-light mt-4 pt-3 d-flex flex-column flex-sm-row justify-content-between text-muted small">
          <span>&copy; {new Date().getFullYear()} NovaRoute</span>
          <span className="mt-2 mt-sm-0">Built with React Router + Bootstrap</span>
        </div>
      </div>
    </footer>
  );
}
