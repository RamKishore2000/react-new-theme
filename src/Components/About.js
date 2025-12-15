import React, { useMemo } from "react";
import Header from "./Common/Header";
import Footer from "./Common/Footer";
import "../css/About.css";

const sanitizeHtml = (html) => {
  if (!html) return "";
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  doc.querySelectorAll("script, style").forEach((node) => node.remove());
  return doc.body.innerHTML;
};

export default function About() {
  const businessName = localStorage.getItem("business_name") || "Our Store";
  const shopDesc = localStorage.getItem("shodesc") || "";
  const logo1 = localStorage.getItem("logo1");
  const catalogue1 = localStorage.getItem("catlog1");
  const catalogue2 = localStorage.getItem("catlog2");
  const catalogue3 = localStorage.getItem("catlog3");

  const sanitizedDesc = useMemo(() => sanitizeHtml(shopDesc), [shopDesc]);
  const catalogues = [
    { url: catalogue1, label: "Catalogue 1" },
    { url: catalogue2, label: "Catalogue 2" },
    { url: catalogue3, label: "Catalogue 3" },
  ].filter((c) => c.url);

  return (
    <>
      <Header />
      <section className="about-hero-shell">
        <div className="container">
          <div className="about-hero-card">
            <div className="hero-text">
              <p className="eyebrow text-uppercase mb-1">About</p>
              <h2 className="mb-2">Welcome to {businessName}</h2>
              <p className="text-muted mb-0">
                Discover our story, values, and catalogue downloads—all in one place.
              </p>
            </div>
            {logo1 && (
              <div className="hero-logo">
                <img src={logo1} alt="Business logo" />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="about-body pb-5">
        <div className="container">
          <div className="about-content-card">
            <div
              className="about-description"
              dangerouslySetInnerHTML={{ __html: sanitizedDesc || "<p>No description available.</p>" }}
            />
          </div>

          {catalogues.length > 0 && (
            <div className="catalogue-card mt-4">
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-md-between gap-3">
                <div>
                  <h5 className="mb-1">Download our catalogue</h5>
                  <p className="text-muted mb-0">Learn more about what we offer.</p>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {catalogues.map((item, idx) => (
                    <a key={idx} href={item.url} download className="catalogue-btn">
                      <span>Download {item.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
