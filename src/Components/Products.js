import React, { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import "./Products.css";

export const productData = [
  {
    id: 1,
    name: "Atlas Pro Laptop",
    description: "Slim aluminum body, 14” QHD display, 12-core performance.",
    price: "$1,299",
    category: "Laptops",
    image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=900&q=80",
    badge: "New",
  },
  {
    id: 2,
    name: "Nebula Ultrabook",
    description: "Featherweight mobility with all-day battery and fast charge.",
    price: "$1,099",
    category: "Laptops",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80",
    badge: "Bestseller",
  },
  {
    id: 3,
    name: "Pulse Wireless Headset",
    description: "Active noise cancelation, spatial audio, and 40-hour battery.",
    price: "$299",
    category: "Audio",
    image: "https://images.unsplash.com/photo-1471357674240-e1a485acb3e1?auto=format&fit=crop&w=900&q=80",
    badge: "Trending",
  },
  {
    id: 4,
    name: "Flux Smartwatch",
    description: "AMOLED display, GPS, fitness insights, and contactless pay.",
    price: "$249",
    category: "Wearables",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 5,
    name: "Aero True Wireless",
    description: "Featherlight buds with adaptive EQ and wireless charging.",
    price: "$149",
    category: "Audio",
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 6,
    name: "Helix Router + Mesh",
    description: "Wi‑Fi 6 coverage for every room with auto-optimizing mesh.",
    price: "$329",
    category: "Smart Home",
    image: "https://images.unsplash.com/photo-1527430253228-e93688616381?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 7,
    name: "Orbit Phone",
    description: "Flagship camera system, 120Hz display, and fast charging.",
    price: "$899",
    category: "Smartphones",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 8,
    name: "Kinetic Keyboard",
    description: "Low-profile mechanical switches with per-key RGB and USB-C.",
    price: "$179",
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1516383607781-913a19294fd1?auto=format&fit=crop&w=900&q=80",
  },
];

export default function Products() {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(() => ["All", ...new Set(productData.map((p) => p.category))], []);

  const visible = useMemo(
    () => (activeCategory === "All" ? productData : productData.filter((p) => p.category === activeCategory)),
    [activeCategory]
  );

  return (
    <div className="products-page">
      <section className="products-hero text-white">
        <div className="container py-5">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <p className="text-uppercase small fw-semibold text-white-50 mb-2">NovaRoute collections</p>
              <h1 className="fw-bold display-5 mb-3">Powerful gear, curated for every workflow.</h1>
              <p className="lead text-white-75 mb-4">
                Laptops, audio, accessories, and smart tech selected to help you build, create, and stay connected.
              </p>
              <div className="d-flex flex-wrap gap-2">
                <NavLink to="/services" className="btn btn-light text-primary fw-semibold">
                  Explore services
                </NavLink>
                <NavLink to="/contact" className="btn btn-outline-light">
                  Talk to an expert
                </NavLink>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="hero-card text-dark bg-white rounded-4 shadow-lg p-4">
                <h5 className="fw-semibold mb-2">Need recommendations?</h5>
                <p className="text-secondary mb-3">Tell us your workflow and budget—get a tailored bundle in minutes.</p>
                <ul className="list-unstyled d-grid gap-2 text-secondary small mb-4">
                  <li>• Remote-ready laptop + audio + webcam bundles</li>
                  <li>• Creator kits with calibrated displays and fast storage</li>
                  <li>• Smart home + networking sets for whole-home coverage</li>
                </ul>
                <NavLink to="/contact" className="btn btn-primary w-100 fw-semibold">
                  Get my bundle
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
              <p className="text-uppercase text-muted small mb-1">Catalog</p>
              <h3 className="fw-bold mb-0">Featured products</h3>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`pill ${activeCategory === cat ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="row g-4">
            {visible.map((item) => (
              <div key={item.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                <div className="product-card h-100 rounded-4 overflow-hidden">
                  <div className="product-image ratio ratio-4x3">
                    <img src={item.image} alt={item.name} className="w-100 h-100" />
                  </div>
                  <div className="p-3 d-grid gap-2">
                    <div className="d-flex justify-content-between align-items-start gap-2">
                      <h6 className="fw-semibold mb-0 product-title">{item.name}</h6>
                      <span className="text-primary fw-semibold">{item.price}</span>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="badge bg-light text-dark border">{item.category}</span>
                      <NavLink className="stretched-link text-decoration-none fw-semibold" to={`/products/${item.id}`}>
                        View
                      </NavLink>
                    </div>
                    <button type="button" className="btn btn-primary btn-sm w-100">
                      Add to cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <div className="support-card rounded-4 p-4">
                <h4 className="fw-bold mb-2">White-glove setup & care</h4>
                <p className="text-secondary mb-3">
                  Delivery, installation, migration, and training—scheduled around your team, bundled with support plans.
                </p>
                <div className="d-flex flex-wrap gap-3">
                  <div>
                    <h5 className="fw-bold mb-1">4.8★</h5>
                    <span className="text-secondary small">Service satisfaction</span>
                  </div>
                  <div>
                    <h5 className="fw-bold mb-1">24/7</h5>
                    <span className="text-secondary small">Priority assistance</span>
                  </div>
                  <div>
                    <h5 className="fw-bold mb-1">72h</h5>
                    <span className="text-secondary small">Avg. install window</span>
                  </div>
                </div>
                <div className="mt-4 d-flex gap-2">
                  <NavLink to="/services" className="btn btn-primary fw-semibold">
                    Explore services
                  </NavLink>
                  <NavLink to="/contact" className="btn btn-outline-primary">
                    Schedule a call
                  </NavLink>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="grid-gallery rounded-4 overflow-hidden">
                <div className="gallery-item tall">
                  <img
                    src="https://images.unsplash.com/photo-1527443224154-d3035c1c9cc3?auto=format&fit=crop&w=900&q=80"
                    alt="Workspace"
                  />
                </div>
                <div className="gallery-item">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80"
                    alt="Audio"
                  />
                </div>
                <div className="gallery-item">
                  <img
                    src="https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=900&q=80"
                    alt="Notebook"
                  />
                </div>
                <div className="gallery-item wide">
                  <img
                    src="https://images.unsplash.com/photo-1508873696983-2dfd5898f08b?auto=format&fit=crop&w=900&q=80"
                    alt="Desk"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
