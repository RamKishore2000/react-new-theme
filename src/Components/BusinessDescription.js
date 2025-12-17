import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../css/BusinessDescription.css";

export default function BusinessDescription() {
  const [shopDesc, setShopDesc] = useState("");

  useEffect(() => {
    const desc = localStorage.getItem("shodesc") || "";
    setShopDesc(desc);
  }, []);

  return (
    <section className="business-desc py-5">
      <div className="container">
        <div className="row g-4 align-items-center">
          <div className="col-lg-6">
            <h3 className="fw-bold mb-3">About our store</h3>
            <div className="desc-card rounded-4 p-4">
              <div
                className="text-secondary mb-0"
                style={{ maxHeight: "240px", overflowY: "auto" }}
                dangerouslySetInnerHTML={{
                  __html: shopDesc || "Store description will appear here once provided.",
                }}
              ></div>
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
