import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import "../css/Products.css";

const normalizeProduct = (item, index) => ({
  id: item?.id || item?.product_id || item?.pid || index,
  name: item?.name || item?.product_name || item?.title || "Product",
  description: item?.description || item?.product_desc || item?.short_desc || "",
  price: item?.price || item?.sale_price || item?.mrp || item?.cost || "",
  category: item?.category || item?.category_name || item?.main_category || "",
  productPrice: item?.productPrice || item?.product_price || item?.pricing || null,
  image:
    item?.image ||
    item?.img ||
    item?.product_image ||
    item?.thumb ||
    item?.picture ||
    item?.image_url ||
    "https://via.placeholder.com/600x400?text=Product",
  badge: item?.badge || item?.tagline || item?.label || null,
});

export default function Products() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [businessId, setBusinessId] = useState(() => localStorage.getItem("id"));
  const userId = useMemo(() => localStorage.getItem("user_id") || "", []);
  const hasFetched = useRef(false);
  const [selectedIndexes, setSelectedIndexes] = useState({});

  const categories = useMemo(() => ["All", ...new Set(products.map((p) => p.category))], [products]);

  const visible = useMemo(
    () => (activeCategory === "All" ? products : products.filter((p) => p.category === activeCategory)),
    [activeCategory, products]
  );

  const formatPrice = (value) => {
    if (value === null || value === undefined || value === "") return "—";
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  const handleChange = (productId) => (event) => {
    const value = Number(event.target.value) || 0;
    setSelectedIndexes((prev) => ({ ...prev, [productId]: value }));
  };

  const getSelectedPrice = (product) => {
    const idx = selectedIndexes[product.id] || 0;
    const priceItem = product?.productPrice?.[idx];
    if (!priceItem) return formatPrice(product.price);
    const value = priceItem.discount_price !== "0.00" && priceItem.discount_price !== ""
      ? priceItem.discount_price
      : priceItem.mrp;
    return formatPrice(value);
  };

  const handleAddToCartClick = (product) => {
    console.log("Add to cart clicked", product);
  };

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
    if (!businessId || hasFetched.current) return;
    hasFetched.current = true;

    const fetchProducts = async () => {
      try {
        const response = await fetch("https://topiko.com/prod/app/lt_getproducts.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bid: businessId,
            category_id: "",
            filter: "",
            limit: 20,
            maxPrice: "",
            minPrice: "",
            order: "DESC",
            page: 1,
            sort: "",
            subcategory_id: "",
            user_id: userId,
          }),
        });

        const data = await response.json();
        const list = Array.isArray(data?.response) ? data.response : Array.isArray(data) ? data : [];
        setProducts(list.map((item, index) => normalizeProduct(item, index)));
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      }
    };

    fetchProducts();
  }, [businessId, userId]);

  return (
    <div className="products-page">
      <section className="py-5 bg-light">
        <div className="container">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
              <p className="text-uppercase text-muted small mb-1">Catalog</p>
              <h3 className="fw-bold mb-0">Trending products</h3>
            </div>
           
          </div>

          
        </div>
      </section>
    </div>
  );
}
