import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../css/Categories.css";

const normalizeCategory = (item, index) => ({
  id: item?.category_id || item?.id || item?.uuid || index,
  name: item?.category_name || item?.name || `Category ${index + 1}`,
  count:
    item?.items_count ||
    item?.product_count ||
    item?.total_items ||
    item?.count ||
    item?.items ||
    null,
  image:
    item?.category_img ||
    item?.image ||
    item?.img ||
    item?.picture ||
    item?.thumb ||
    item?.category_image ||
    item?.banner ||
    "https://via.placeholder.com/600x400?text=Category",
});

export default function Categories() {
  const scrollRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [categories, setCategories] = useState([]);
  const [businessId, setBusinessId] = useState(() => localStorage.getItem("id"));
  const formatter = useMemo(() => new Intl.NumberFormat("en-US"), []);

  const cardWidth = 240;
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

  useEffect(() => {
    const interval = setInterval(() => {
      const id = localStorage.getItem("id");
      if (id) {
        setBusinessId(id);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!businessId) return;

    const fetchCategories = async () => {
      try {
        const response = await fetch("https://topiko.com/prod/app/wt_getProductCategoryList.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ business_id: businessId }),
        });

        const data = await response.json();
        if (Array.isArray(data.response)) {
          setCategories(data.response.map((item, index) => normalizeCategory(item, index)));
        } else {
          setCategories([]);
        }
      } catch (error) {
        setCategories([]);
      }
    };

    fetchCategories();
  }, [businessId]);

  if (!categories.length) {
    return null;
  }

  const isCentered = categories.length <= 5;

  const formatCount = (value) => {
    if (value === null || value === undefined || value === "") return "Items";
    const num = Number(value);
    if (Number.isNaN(num)) return `${value} items`;
    return `${formatter.format(num)} items`;
  };

  return (
    <>
     {categories.length > 0 && (
    <section className="categories-section py-5">
      <div className="container position-relative">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <p className="text-uppercase text-muted small mb-1">Browse</p>
            <h3 className="fw-bold mb-0">Shop by category</h3>
          </div>
          {categories.length > 5 && (
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="cat-nav-btn"
                aria-label="Previous categories"
                onClick={() => handleScroll(-1)}
                disabled={atStart}
              >
                {"<"}
              </button>
              <button
                type="button"
                className="cat-nav-btn"
                aria-label="Next categories"
                onClick={() => handleScroll(1)}
                disabled={atEnd}
              >
                {">"}
              </button>
            </div>
          )}
        </div>

        <div className={`categories-swiper ${isCentered ? "is-centered" : ""}`} ref={scrollRef}>
          {categories.map((item) => {
            const slug = item.name
              .toLowerCase()
              .trim()
              .replace(/&/g, "")
              .replace(/[^\w\s-]/g, "")
              .replace(/\s+/g, "-")
              .replace(/-+$/, "");

            return (
              <Link
                key={item.id}
                to={`/product-list/${slug}`}
                state={{ ids: item.id }}
                className="category-card rounded-4 overflow-hidden text-decoration-none"
              >
                <div className="category-figure">
                  <img src={item.image} className="img-fluid w-100 h-100 object-fit-cover" alt={item.name} />
                  <div className="category-overlay" />
                  <div className="category-meta">
                    <h5 className="fw-bold text-white mb-1">{item.name}</h5>
                    <p className="mb-0 text-white-50">{formatCount(item.count)}</p>
                    <p className="category-explore mb-0">Explore -&gt;</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  )}
  </>
  );
}
