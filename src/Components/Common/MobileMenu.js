import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";

const extractSubmenus = (item) => {
  if (item && item[item.id] && Array.isArray(item[item.id])) {
    return item[item.id];
  }

  const candidates = [
    item?.sub_menus,
    item?.submenus,
    item?.children,
    item?.items,
    item?.subcategories,
    item?.sub_categories,
  ];

  const found = candidates.find((entry) => Array.isArray(entry));
  return Array.isArray(found) ? found : [];
};

const normalizeMenus = (items) =>
  (items || []).map((item, index) => {
    const id =
      item?.id ||
      item?.menu_id ||
      item?.category_id ||
      item?.slug ||
      item?.url ||
      item?.name ||
      item?.menu_name ||
      `cat-${index}`;
    const label =
      item?.label ||
      item?.title ||
      item?.name ||
      item?.menu_name ||
      item?.category_name ||
      item?.main_category ||
      `Category ${index + 1}`;

    const submenus = extractSubmenus(item).map((sub, subIndex) => ({
      id:
        sub?.id ||
        sub?.menu_id ||
        sub?.category_id ||
        sub?.slug ||
        sub?.url ||
        sub?.name ||
        sub?.subcategory_id ||
        `sub-${index}-${subIndex}`,
      label:
        sub?.label ||
        sub?.title ||
        sub?.name ||
        sub?.menu_name ||
        sub?.category_name ||
        sub?.sub_category_name ||
        sub?.subcategory_name ||
        `Item ${subIndex + 1}`,
      to: sub?.to || sub?.url || sub?.link || "#",
    }));

    return {
      id,
      label,
      items: submenus,
    };
  });

const toSlug = (str) =>
  str
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "";

export default function MobileMenu({ open, onClose }) {
  const [openProducts, setOpenProducts] = useState(false);
  const [openServices, setOpenServices] = useState(false);
  const [openProductCat, setOpenProductCat] = useState("");
  const [openServiceCat, setOpenServiceCat] = useState("");
  const [businessId, setBusinessId] = useState(() => localStorage.getItem("id") || "");
  const [productMenuItemsAPI, setProductMenuItemsAPI] = useState([]);
  const [serviceMenuItemsAPI, setServiceMenuItemsAPI] = useState([]);
  const hasFetchedProductMenus = useRef(false);
  const hasFetchedServiceMenus = useRef(false);

  const productCategories = useMemo(
    () => normalizeMenus(productMenuItemsAPI).filter((cat) => cat.items.length > 0),
    [productMenuItemsAPI]
  );
  const serviceCategories = useMemo(
    () => normalizeMenus(serviceMenuItemsAPI).filter((cat) => cat.items.length > 0),
    [serviceMenuItemsAPI]
  );

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
    if (!businessId || hasFetchedProductMenus.current) return;
    hasFetchedProductMenus.current = true;

    const fetchProductMenus = async () => {
      const cacheKey = `product_menus_${businessId}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setProductMenuItemsAPI(JSON.parse(cached));
        return;
      }
      try {
        const response = await axios.post("https://topiko.com/prod/app/wt_getProductMenus.php", {
          business_id: businessId,
        });
        if (response.data?.status === "success" && Array.isArray(response.data.response)) {
          localStorage.setItem(cacheKey, JSON.stringify(response.data.response));
          setProductMenuItemsAPI(response.data.response);
        }
      } catch (error) {
        console.error("Failed to fetch product menu items", error);
      }
    };

    fetchProductMenus();
  }, [businessId]);

  useEffect(() => {
    if (!businessId || hasFetchedServiceMenus.current) return;
    hasFetchedServiceMenus.current = true;

    const fetchServiceMenus = async () => {
      const cacheKey = `service_menus_${businessId}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setServiceMenuItemsAPI(JSON.parse(cached));
        return;
      }
      try {
        const response = await axios.post("https://topiko.com/prod/app/wt_getServiceMenus.php", {
          business_id: businessId,
        });
        if (response.data?.status === "success" && Array.isArray(response.data.response)) {
          localStorage.setItem(cacheKey, JSON.stringify(response.data.response));
          setServiceMenuItemsAPI(response.data.response);
        }
      } catch (error) {
        console.error("Failed to fetch service menu items", error);
      }
    };

    fetchServiceMenus();
  }, [businessId]);

  if (!open) return null;

  return (
    <div className="mobile-menu-backdrop" onClick={onClose}>
      <div className="mobile-menu-panel" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Menu</h5>
          <button
            type="button"
            className="mobile-close-btn"
            aria-label="Close menu"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="mobile-menu-links">
          <NavLink className="mobile-menu-link" to="/" onClick={onClose}>
            Home
          </NavLink>

          {productCategories.length > 0 && (
            <div className="mobile-menu-accordion">
              <button type="button" className="mobile-menu-toggle" onClick={() => setOpenProducts((p) => !p)}>
                <span>Products</span>
                <span className="mega-accordion-icon">{openProducts ? "-" : "+"}</span>
              </button>
              {openProducts && (
                <div className="mobile-menu-children">
                  {productCategories.map((category) => {
                    const isOpen = openProductCat === category.id;
                    return (
                      <div key={category.id} className="mega-accordion-item">
                        <button
                          type="button"
                          className="mega-accordion-toggle"
                          onClick={() => setOpenProductCat(isOpen ? "" : category.id)}
                        >
                          <span>{category.label}</span>
                          <span className="mega-accordion-icon">{isOpen ? "-" : "+"}</span>
                        </button>
                        {isOpen && (
                          <div className="mega-accordion-body">
                            {category.items.map((item) => (
                              <NavLink
                                key={item.to}
                                className="mega-link text-decoration-none"
                                to={`/product-list/${toSlug(category.label)}/${toSlug(item.label)}`}
                                onClick={onClose}
                              >
                                {item.label}
                              </NavLink>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {serviceCategories.length > 0 && (
            <div className="mobile-menu-accordion">
              <button type="button" className="mobile-menu-toggle" onClick={() => setOpenServices((p) => !p)}>
                <span>Services</span>
                <span className="mega-accordion-icon">{openServices ? "-" : "+"}</span>
              </button>
              {openServices && (
                <div className="mobile-menu-children">
                  {serviceCategories.map((category) => {
                    const isOpen = openServiceCat === category.id;
                    return (
                      <div key={category.id} className="mega-accordion-item">
                        <button
                          type="button"
                          className="mega-accordion-toggle"
                          onClick={() => setOpenServiceCat(isOpen ? "" : category.id)}
                        >
                          <span>{category.label}</span>
                          <span className="mega-accordion-icon">{isOpen ? "-" : "+"}</span>
                        </button>
                        {isOpen && (
                          <div className="mega-accordion-body">
                            {category.items.map((item) => (
                              <NavLink
                                key={item.to}
                                className="mega-link text-decoration-none"
                                to={`/service-list/${toSlug(category.label)}/${toSlug(item.label)}`}
                                onClick={onClose}
                              >
                                {item.label}
                              </NavLink>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <NavLink className="mobile-menu-link" to="/about" onClick={onClose}>
            About
          </NavLink>
          <NavLink className="mobile-menu-link" to="/contact" onClick={onClose}>
            Contact
          </NavLink>
        </div>
      </div>
    </div>
  );
}

