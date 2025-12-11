import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { productData } from "./Products";
import "./ProductsCarousel.css";

export default function ProductsCarousel() {
  const scrollRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const cardWidth = 260;
  const scrollAmount = useMemo(() => cardWidth * 2, [cardWidth]);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;

    const onScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setAtStart(scrollLeft <= 5);
      setAtEnd(scrollLeft + clientWidth >= scrollWidth - 5);
    };

    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="products-carousel-section py-5">
      <div className="container-fluid position-relative px-0">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <p className="text-uppercase text-muted small mb-1">Browse</p>
            <h3 className="fw-bold mb-0">Featured products</h3>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="prod-nav-btn"
              aria-label="Previous products"
              onClick={() => handleScroll(-1)}
              disabled={atStart}
            >
              ‹
            </button>
            <button
              type="button"
              className="prod-nav-btn"
              aria-label="Next products"
              onClick={() => handleScroll(1)}
              disabled={atEnd}
            >
              ›
            </button>
          </div>
        </div>

        <div className="products-swiper" ref={scrollRef}>
          {productData.map((item) => (
            <div key={item.id} className="product-tile rounded-4 overflow-hidden shadow-sm">
              <div className="ratio ratio-4x3">
                <img src={item.image} alt={item.name} className="w-100 h-100 object-fit-cover" />
              </div>
              <div className="p-3 d-grid gap-2">
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <h6 className="fw-semibold mb-0 product-title">{item.name}</h6>
                  <span className="fw-bold text-primary">{item.price}</span>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <span className="badge bg-light text-dark border">{item.category}</span>
                  <NavLink className="text-decoration-none fw-semibold small" to={`/products/${item.id}`}>
                    View
                  </NavLink>
                </div>
                <button type="button" className="btn btn-primary btn-sm w-100">
                  Add to cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
