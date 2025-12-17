import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../css/Footer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp, faInstagram, faTwitter, faLinkedin, faYoutube } from "@fortawesome/free-brands-svg-icons";

const icons = {
  location:
    "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 11.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z",
  email:
    "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.11 0 2-.9 2-2V6c0-1.1-.89-2-2-2Zm0 2-8 5-8-5h16Zm0 12H4V8l8 5 8-5v10Z",
  phone:
    "M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.3 21 3 13.7 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.24.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2Z",
  facebook:
    "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
  instagram:
    "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm10 3a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-5 2.5A4.5 4.5 0 1 0 12 16.5 4.5 4.5 0 0 0 12 7.5z",
  twitter:
    "M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 12 7.5v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3Z",
  linkedin:
    "M4 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM3 8h2v12H3zM9 8h2v1.6h.03A2.2 2.2 0 0 1 13 8c2.2 0 3 1.45 3 3.33V20h-2v-7.3c0-1.17-.42-1.97-1.48-1.97-.81 0-1.3.54-1.52 1.07-.08.2-.1.46-.1.73V20H9z",
  youtube:
    "M21.8 8s-.2-1.4-.8-2c-.7-.8-1.6-.8-2-.9C16.7 5 12 5 12 5s-4.7 0-7 .1c-.4 0-1.3 0-2 .9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.6C2 14.4 2.2 16 2.2 16s.2 1.4.8 2c.7.8 1.7.8 2.1.9C7.3 19 12 19 12 19s4.7 0 6.9-.1c.4-.1 1.3-.1 2-0.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.6C22 9.6 21.8 8 21.8 8zM10 14.7V9.3l4.7 2.7L10 14.7z",
  snapchat:
    "M12 2c1.2 0 2.3.7 2.7 1.8l.6 1.5c.3.7.9 1.2 1.6 1.3.5.1.9.6.9 1.1 0 .4-.2.8-.6 1l-.7.4c-.3.2-.3.7 0 .9.6.5 1.3.8 1.9 1 .4.1.6.5.6.9-.1.6-.6.8-1 .9-.3.1-.6.2-.8.2-.2.1-.3.3-.3.5v.1c0 .2.2.4.4.4h.1c.4 0 .6.3.6.6v.2c0 .4-.4.7-.8.7a4.3 4.3 0 0 0-1.4.1c-.7.2-1.3.8-1.9 1.3-.6.5-1.5.9-2.3.9-.8 0-1.6-.3-2.3-.9-.6-.5-1.2-1.1-2-1.3a4 4 0 0 0-1.4-.1.7.7 0 0 1-.8-.7v-.2c0-.3.2-.6.6-.6h.1c.2 0 .4-.2.4-.4v-.1c0-.2-.1-.4-.3-.5-.2 0-.5-.1-.8-.2-.4-.1-.9-.3-1-.9a.9.9 0 0 1 .6-.9c.6-.2 1.3-.5 1.9-1 .3-.2.3-.7 0-.9l-.7-.4a1.2 1.2 0 0 1-.6-1.1c0-.5.4-1 .9-1.1.7-.1 1.3-.6 1.6-1.3l.6-1.5A3 3 0 0 1 12 2z",
  whatsapp:
    "M16.5 3.5C14.8 2.5 13 2 11.1 2 6.2 2 2.1 6 2 10.8c0 1.7.4 3.3 1.3 4.8L2 22l6.6-1.7c1.4.4 2.5.6 3.7.6h.1c4.9 0 8.9-3.9 8.9-8.8 0-2-.7-3.9-1.8-5.4-1-1.3-1.7-2-2.9-2.7Zm-5.4 15.5c-1.1 0-2.2-.3-3.3-.7l-.2-.1-3.9 1 1.1-3.8-.1-.2c-.8-1.2-1.2-2.6-1.2-4 0-3.9 3.3-7 7.3-7 1.8 0 3.5.6 4.8 1.8 1.3 1.1 2.1 2.8 2.1 4.5 0 3.9-3.3 7-7.4 7Zm4-5.2c-.2-.1-1.4-.7-1.6-.8-.2-.1-.3-.1-.5.1l-.7.8c-.1.1-.2.1-.3.1-.1 0-.6-.2-1.2-.5-.7-.4-1.4-1.1-1.5-1.2-.2-.1-.2-.3-.1-.4l.3-.3c.1-.1.2-.2.3-.4.1-.1.1-.2.1-.3 0-.1-.1-.2-.1-.3-.1-.1-.5-1.2-.7-1.6-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2 0 1.2.8 2.4.9 2.6.1.2 1.5 2.3 3.6 3.2.5.2.9.4 1.2.5.5.2.9.1 1.2.1.4-.1 1.4-.6 1.6-1.1.2-.6.2-1 .2-1.1-.1-.1-.2-.2-.4-.3Z",
};

const Icon = ({ name }) => {
  const faMap = {
    whatsapp: faWhatsapp,
    instagram: faInstagram,
    twitter: faTwitter,
    linkedin: faLinkedin,
    youtube: faYoutube,
  };

  if (faMap[name]) {
    return <FontAwesomeIcon icon={faMap[name]} className="footer-icon" aria-hidden="true" />;
  }

  return (
    <svg className="footer-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={icons[name]} />
    </svg>
  );
};

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
            <div
              className="text-muted mb-0 footer-description"
              dangerouslySetInnerHTML={{ __html: footerData.description || "Welcome to our store." }}
            />
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
