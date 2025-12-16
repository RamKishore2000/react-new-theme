import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import "../css/Banner.css";

const normalizeBanner = (item, index) => {
  const image =
    item?.image ||
    item?.banner_image ||
    item?.banner ||
    item?.img ||
    item?.img_url ||
    item?.picture ||
    item?.url ||
    item?.src ||
    "";
  const to = item?.link || item?.to || item?.url || "#";
  return {
    id: item?.id || item?.banner_id || item?.uuid || index,
    title: item?.title || item?.heading || "",
    subtitle: item?.subtitle || item?.subheading || "",
    image,
    to,
    alt: item?.alt || item?.title || "slider image",
  };
};

export default function Banner() {
  const [banners, setBanners] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState(() => localStorage.getItem("id"));

  useEffect(() => {
    const interval = setInterval(() => {
      const id = localStorage.getItem("id");
      if (id) {
        clearInterval(interval);
        setBusinessId(id);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!businessId) return;

    const fetchBanners = async () => {
      try {
        const response = await fetch("https://topiko.com/prod/app/getSubdomainHomeBanners.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ business_id: businessId }),
        });

        const data = await response.json();
        if (Array.isArray(data)) {
          const normalized = data
            .map((item, index) => normalizeBanner(item, index))
            .filter((item) => item.image);
          setBanners(normalized);
        } else {
          setBanners([]);
        }
      } catch (error) {
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [businessId]);

  const hasSlides = banners.length > 0;

  useEffect(() => {
    if (!hasSlides) return undefined;
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(id);
  }, [hasSlides, banners.length]);

  const slidesStyle = useMemo(
    () => ({
      transform: `translateX(-${activeIndex * 100}%)`,
    }),
    [activeIndex]
  );

  const goTo = (index) => {
    if (!hasSlides) return;
    setActiveIndex((index + banners.length) % banners.length);
  };

  return (
    <section className="banner-swiper bg-light mt-4">
      <div className="container">
        <div className="swiper-frame position-relative overflow-hidden rounded-4">
          {loading && (
            <div className="banner-loading d-flex align-items-center justify-content-center">
              <div className="spinner-border text-primary" role="status" aria-label="Loading banners" />
            </div>
          )}

          {hasSlides && (
            <>
            <div className="swiper-track d-flex" style={slidesStyle}>
              {banners.map((slide) => (
                <div key={slide.id} className="swiper-slide w-100 flex-shrink-0 position-relative">
                  <NavLink to={slide.to} aria-label={slide.title}>
                    <img className="banner-image" src={slide.image} alt={slide.alt || slide.title} />
                  </NavLink>
                </div>
              ))}
            </div>

              <div className="swiper-dots d-flex gap-2">
                {banners.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    className={`dot ${idx === activeIndex ? "active" : ""}`}
                    aria-label={`Go to banner ${idx + 1}`}
                    onClick={() => goTo(idx)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
