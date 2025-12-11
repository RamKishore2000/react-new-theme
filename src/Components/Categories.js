import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Categories.css";

const categories = [
  {
    id: 1,
    name: "Laptops",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    name: "Smartphones",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    name: "Accessories",
    image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    name: "Smart Home",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    name: "Audio",
    image: "https://images.unsplash.com/photo-1510227272981-87123e259b17?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 6,
    name: "Wearables",
    image: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 7,
    name: "Gaming",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 8,
    name: "Cameras",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
  },
];

export default function Categories() {
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
    <section className="categories-section py-5">
      <div className="container-fluid position-relative px-0">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <p className="text-uppercase text-muted small mb-1">Browse</p>
            <h3 className="fw-bold mb-0">Shop by category</h3>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="cat-nav-btn"
              aria-label="Previous categories"
              onClick={() => handleScroll(-1)}
              disabled={atStart}
            >
              ‹
            </button>
            <button
              type="button"
              className="cat-nav-btn"
              aria-label="Next categories"
              onClick={() => handleScroll(1)}
              disabled={atEnd}
            >
              ›
            </button>
          </div>
        </div>

        <div className="categories-swiper" ref={scrollRef}>
          {categories.map((item) => (
            <div key={item.id} className="category-card rounded-4 overflow-hidden shadow-sm">
              <div className="ratio ratio-4x3">
                <img src={item.image} className="img-fluid w-100 h-100 object-fit-cover" alt={item.name} />
              </div>
              <div className="p-3">
                <h6 className="fw-semibold mb-0">{item.name}</h6>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
