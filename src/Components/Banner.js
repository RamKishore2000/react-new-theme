import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import "./Banner.css";

const mockFetchBanners = () =>
  new Promise((resolve) => {
    setTimeout(
      () =>
        resolve([
          {
            id: 1,
            title: "Fresh arrivals",
            subtitle: "Curated picks for work, play, and travel.",
            image:
              "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80",
            cta: "Shop now",
            to: "/products",
          },
          {
            id: 2,
            title: "Services that scale",
            subtitle: "Consulting, delivery, and support tailored to you.",
            image:
              "https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?auto=format&fit=crop&w=1600&q=80",
            cta: "View services",
            to: "/services",
          },
          {
            id: 3,
            title: "Member perks",
            subtitle: "Exclusive offers and early access for loyal customers.",
            image:
              "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1600&q=80",
            cta: "Join now",
            to: "/account",
          },
        ]),
      400
    );
  });

export default function Banner() {
  const [banners, setBanners] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    mockFetchBanners().then((data) => {
      if (mounted) {
        setBanners(data);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

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
      <div className="container-fluid px-0">
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
                    <img className="banner-image" src={slide.image} alt={slide.title} />
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
