import React, { useState } from "react";
import { NavLink } from "react-router-dom";

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

export default function MobileMenu({ open, onClose }) {
  const [openProducts, setOpenProducts] = useState(false);
  const [openServices, setOpenServices] = useState(false);
  const [openProductCat, setOpenProductCat] = useState("");
  const [openServiceCat, setOpenServiceCat] = useState("");

  if (!open) return null;

  return (
    <div className="mobile-menu-backdrop" onClick={onClose}>
      <div className="mobile-menu-panel" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Menu</h5>
          <button
            type="button"
            className="btn btn-link text-dark p-0 fs-4"
            aria-label="Close menu"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="mobile-menu-links">
          <NavLink className="mobile-menu-link" to="/" onClick={onClose}>
            Home
          </NavLink>

          <div className="mobile-menu-accordion">
            <button type="button" className="mobile-menu-toggle" onClick={() => setOpenProducts((p) => !p)}>
              <span>Products</span>
              <span className="mega-accordion-icon">{openProducts ? "-" : "+"}</span>
            </button>
            {openProducts && (
              <div className="mobile-menu-children">
                {productCategories.map((category) => {
                  const isOpen = openProductCat === category.id;
                  return (
                    <div key={category.id} className="mega-accordion-item">
                      <button
                        type="button"
                        className="mega-accordion-toggle"
                        onClick={() => setOpenProductCat(isOpen ? "" : category.id)}
                      >
                        <span>{category.label}</span>
                        <span className="mega-accordion-icon">{isOpen ? "-" : "+"}</span>
                      </button>
                      {isOpen && (
                        <div className="mega-accordion-body">
                          {category.items.map((item) => (
                            <NavLink
                              key={item.to}
                              className="mega-link text-decoration-none"
                              to={item.to}
                              onClick={onClose}
                            >
                              {item.label}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mobile-menu-accordion">
            <button type="button" className="mobile-menu-toggle" onClick={() => setOpenServices((p) => !p)}>
              <span>Services</span>
              <span className="mega-accordion-icon">{openServices ? "-" : "+"}</span>
            </button>
            {openServices && (
              <div className="mobile-menu-children">
                {serviceCategories.map((category) => {
                  const isOpen = openServiceCat === category.id;
                  return (
                    <div key={category.id} className="mega-accordion-item">
                      <button
                        type="button"
                        className="mega-accordion-toggle"
                        onClick={() => setOpenServiceCat(isOpen ? "" : category.id)}
                      >
                        <span>{category.label}</span>
                        <span className="mega-accordion-icon">{isOpen ? "-" : "+"}</span>
                      </button>
                      {isOpen && (
                        <div className="mega-accordion-body">
                          {category.items.map((item) => (
                            <NavLink
                              key={item.to}
                              className="mega-link text-decoration-none"
                              to={item.to}
                              onClick={onClose}
                            >
                              {item.label}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <NavLink className="mobile-menu-link" to="/about" onClick={onClose}>
            About
          </NavLink>
          <NavLink className="mobile-menu-link" to="/contact" onClick={onClose}>
            Contact
          </NavLink>
        </div>
      </div>
    </div>
  );
}
