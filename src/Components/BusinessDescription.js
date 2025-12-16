import React from "react";
import { Link } from "react-router-dom";
import "../css/BusinessDescription.css";

export default function BusinessDescription() {
  return (
    <section className="business-desc py-5">
      <div className="container">
        <div className="row g-4 align-items-center">
          <div className="col-lg-6">
            <p className="text-uppercase text-muted small mb-2">Our promise</p>
            <h3 className="fw-bold mb-3">Built for modern commerce</h3>
            <p className="text-secondary mb-3">
              We pair curated products with services that launch quickly, scale smoothly, and stay reliable. Swap this
              text with your own story to highlight what makes your business different.
            </p>
            <div className="d-grid gap-2 text-secondary small">
              <div className="d-flex gap-2">
                <span className="bullet">-</span>
                <span>Tailored bundles for teams, creators, and smart homes.</span>
              </div>
              <div className="d-flex gap-2">
                <span className="bullet">-</span>
                <span>End-to-end support - delivery, setup, and training.</span>
              </div>
              <div className="d-flex gap-2">
                <span className="bullet">-</span>
                <span>Trusted vendors, fast fulfillment, and transparent policies.</span>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="desc-card rounded-4 p-4">
              <div className="row g-3">
                <div className="col-sm-6">
                  <Link to="/about" className="tile-link">
                    <div className="mini-tile">
                      <h5 className="fw-bold mb-1">About Us</h5>
                      <p className="text-secondary small mb-0">Learn how we source and serve.</p>
                    </div>
                  </Link>
                </div>
                <div className="col-sm-6">
                  <Link to="/contact" className="tile-link">
                    <div className="mini-tile">
                      <h5 className="fw-bold mb-1">Contact Us</h5>
                      <p className="text-secondary small mb-0">Questions? Reach our team.</p>
                    </div>
                  </Link>
                </div>
                <div className="col-sm-6">
                  <Link to="/privacy-policy" className="tile-link">
                    <div className="mini-tile">
                      <h5 className="fw-bold mb-1">Privacy Policy</h5>
                      <p className="text-secondary small mb-0">How we handle your data.</p>
                    </div>
                  </Link>
                </div>
                <div className="col-sm-6">
                  <Link to="/shipping" className="tile-link">
                    <div className="mini-tile">
                      <h5 className="fw-bold mb-1">Shipping</h5>
                      <p className="text-secondary small mb-0">Delivery, returns, and timelines.</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
