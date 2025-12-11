import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../../logo.svg";
import "./Header.css";
import MobileMenu from "./MobileMenu";

const productCategories = [
  {
    id: "devices",
    label: "Devices",
    items: [
      { label: "Laptops", to: "/products/laptops" },
      { label: "Tablets", to: "/products/tablets" },
      { label: "Smartphones", to: "/products/phones" },
      { label: "Wearables", to: "/products/wearables" },
    ],
  },
  {
    id: "accessories",
    label: "Accessories",
    items: [
      { label: "Audio & headsets", to: "/products/audio" },
      { label: "Keyboards & mice", to: "/products/keyboards" },
      { label: "Charging & cables", to: "/products/charging" },
      { label: "Cases & sleeves", to: "/products/cases" },
     
    ],
  },
  {
    id: "hometech",
    label: "Home tech",
    items: [
      { label: "Smart home", to: "/products/smart-home" },
      { label: "Routers & mesh", to: "/products/networking" },
      { label: "Monitors", to: "/products/monitors" },
      { label: "Clearance", to: "/products/clearance" },
    ],
  },
  {
    id: "work",
    label: "Work essentials",
    items: [
      { label: "Business laptops", to: "/products/business-laptops" },
      { label: "Docking stations", to: "/products/docks" },
      { label: "Projectors", to: "/products/projectors" },
      { label: "Conference gear", to: "/products/conference" },
    ],
  },
];

const serviceCategories = [
  {
    id: "consultation",
    label: "Consultation",
    items: [
      { label: "Strategy session", to: "/services/strategy" },
      { label: "Site assessment", to: "/services/assessment" },
      { label: "Solution architecture", to: "/services/architecture" },
    ],
  },
  {
    id: "delivery",
    label: "Delivery",
    items: [
      { label: "Installation & setup", to: "/services/installation" },
      { label: "Migration", to: "/services/migration" },
      { label: "Custom integration", to: "/services/custom" },
    ],
  },
  {
    id: "care",
    label: "Care",
    items: [
      { label: "Support plans", to: "/services/support" },
      { label: "Training & enablement", to: "/services/training" },
      { label: "Preventive maintenance", to: "/services/maintenance" },
    ],
  },
];

export default function Header() {
  const [activeProduct, setActiveProduct] = useState(productCategories[0].id);
  const [activeService, setActiveService] = useState(serviceCategories[0].id);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
      <div className="container">
        <NavLink className="navbar-brand d-flex align-items-center gap-2 flex-shrink-0" to="/">
          <img src={logo} alt="NovaRoute logo" width="36" height="36" />
          <span className="fw-semibold text-primary">NovaRoute</span>
        </NavLink>

        <button
          className="navbar-toggler d-lg-none"
          type="button"
          aria-label="Open menu"
          onClick={() => setShowMobileMenu(true)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse d-none d-lg-flex" id="primaryNav">
          <ul className="navbar-nav mx-auto mb-0 d-flex align-items-lg-center gap-lg-3">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">
                Home
              </NavLink>
            </li>
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
                        <NavLink key={item.to} className="mega-link text-decoration-none" to={item.to}>
                          {item.label}
                        </NavLink>
                      ))}
                  </div>
                </div>
              </div>
            </li>
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
                        <NavLink key={item.to} className="mega-link text-decoration-none" to={item.to}>
                          {item.label}
                        </NavLink>
                      ))}
                  </div>
                </div>
              </div>
            </li>
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
            <NavLink to="/account" className="btn btn-outline-primary d-flex align-items-center gap-2">
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
            </NavLink>

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
                3
                <span className="visually-hidden">items in cart</span>
              </span>
            </NavLink>
          </div>
        </div>
      </div>
      <MobileMenu open={showMobileMenu} onClose={() => setShowMobileMenu(false)} />
    </nav>
  );
}
