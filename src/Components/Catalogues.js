import React, { useEffect, useState } from "react";

export default function Catalogues() {
  const [links, setLinks] = useState([]);

  useEffect(() => {
    const collected = ["catlog1", "catlog2", "catlog3"]
      .map((key) => localStorage.getItem(key))
      .filter(Boolean);
    setLinks(collected);
  }, []);

  if (!links.length) return null;

  return (
    <section className="py-5" style={{ background: "linear-gradient(135deg, #f6f8fb 0%, #edf2ff 100%)" }}>
      <div className="container">
        <div
          className="rounded-4 shadow-sm p-4 p-md-5"
          style={{ backgroundColor: "#fff", border: "1px solid #eef2f7" }}
        >
          <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-3">
            <div>
              <p className="text-uppercase text-muted small mb-1">Download catalogues</p>
             
            </div>
           
          </div>

          <div className="row g-2">
            {links.map((href, idx) => (
              <div className="col-12 col-sm-6 col-md-4" key={href || idx}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn w-100 d-flex justify-content-between align-items-center border rounded-3 py-2 px-3"
                  style={{ backgroundColor: "#f8fbff", borderColor: "#e1e8f0" }}
                >
                  <span className="fw-semibold">Catalogue {idx + 1}</span>
                  <span className="text-primary small d-flex align-items-center gap-1">
                    Download
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M1.5 14a.5.5 0 0 0 0 1h13a.5.5 0 0 0 0-1h-13ZM8.354 12.354a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 .708-.708L7.5 10.793V1.5a.5.5 0 0 1 1 0v9.293l2.146-2.147a.5.5 0 0 1 .708.708l-3 3Z" />
                    </svg>
                  </span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
