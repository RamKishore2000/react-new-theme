import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "./Common/Header";
import Footer from "./Common/Footer";
import "../css/Profile.css";

const TABS = {
  PROFILE: "profile",
  ORDERS: "orders",
  SERVICES: "services",
  LOGOUT: "logout",
};

const ITEMS_PER_PAGE = 5;
const SERVICES_PER_PAGE = 10;

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    return Object.values(TABS).includes(tab) ? tab : TABS.PROFILE;
  });

  const [orders, setOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrderInfo, setSelectedOrderInfo] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [orderError, setOrderError] = useState("");
  const hasFetchedOrders = useRef(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [serviceError, setServiceError] = useState("");
  const hasFetchedServices = useRef(false);
  const [servicePage, setServicePage] = useState(1);
  const [user, setUser] = useState(null);
  const userFetched = useRef(false);
  const detailRef = useRef(null);

  const userId = localStorage.getItem("user_id");
  const userMobile = localStorage.getItem("user_mobile");
  const displayName = user?.name || userMobile || "there";

  useEffect(() => {
    if (!userId) {
      navigate("/");
    }
  }, [userId, navigate]);

  useEffect(() => {
    const userIdLocal = localStorage.getItem("user_id");
    if (!userIdLocal || userFetched.current) return;

    userFetched.current = true;

    const fetchUserDetails = async () => {
      try {
        const res = await axios.post("https://topiko.com/prod/app/wt_getuser.php", { id: userIdLocal });
        if (res.data?.response) {
          setUser(res.data.response);
        }
      } catch (err) {
        console.error("Failed to fetch user info:", err);
      }
    };

    fetchUserDetails();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatCurrency = (value) => {
    const num = Number(value);
    if (Number.isNaN(num)) return "₹0";
    return `₹${num.toFixed(2)}`;
  };

  const fetchOrders = async () => {
    const uid = localStorage.getItem("user_id");
    if (!uid || hasFetchedOrders.current) {
      setLoadingOrders(false);
      return;
    }

    setLoadingOrders(true);
    setOrderError("");

    try {
      const response = await axios.post("https://topiko.com/prod/app/getMyOrders.php", { user_id: uid });

      if (response.data?.status === "success") {
        const list = response.data.response || [];
        setOrders(list);
        setCurrentPage(1);

        if (list.length) {
          const initial = list[0];
          fetchOrderDetails(initial.order_id, initial);
        } else {
          setSelectedOrderId(null);
          setSelectedOrderInfo(null);
          setOrderDetails([]);
        }
      } else {
        setOrders([]);
        setOrderError("No orders found yet.");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
      setOrderError("Unable to load orders right now.");
    } finally {
      setLoadingOrders(false);
      hasFetchedOrders.current = true;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchServices = async (force = false) => {
    const user_id = localStorage.getItem("user_id");
    const business_id = localStorage.getItem("id");

    if (!user_id || !business_id) {
      setLoadingServices(false);
      setServiceError("Login required to view services.");
      return;
    }

    if (hasFetchedServices.current && !force) {
      setLoadingServices(false);
      return;
    }

    setLoadingServices(true);
    setServiceError("");

    try {
      const response = await axios.post("https://topiko.com/prod/app/wt_getServiceRequestedList.php", {
        user_id,
        bussiness_id: business_id,
      });

      if (response.data?.status === "success") {
        setServices(response.data.response || []);
        setServicePage(1);
      } else {
        setServices([]);
        setServiceError("No service requests yet.");
      }
    } catch (err) {
      console.error("Error fetching services:", err);
      setServices([]);
      setServiceError("Unable to load services right now.");
    } finally {
      setLoadingServices(false);
      hasFetchedServices.current = true;
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const totalPages = Math.max(1, Math.ceil(orders.length / ITEMS_PER_PAGE));
  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = orders.slice(pageStart, pageStart + ITEMS_PER_PAGE);

  const totalServicePages = Math.max(1, Math.ceil(services.length / SERVICES_PER_PAGE));
  const servicePageStart = (servicePage - 1) * SERVICES_PER_PAGE;
  const paginatedServices = services.slice(servicePageStart, servicePageStart + SERVICES_PER_PAGE);

  useEffect(() => {
    if (selectedOrderId && !loadingDetails && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedOrderId, loadingDetails]);

  const fetchOrderDetails = async (orderIdRaw, basicInfo = null) => {
    const orderId = orderIdRaw || basicInfo?.order_id || basicInfo?.orderId;
    if (!orderId) return;

    setSelectedOrderId(orderId);
    setLoadingDetails(true);

    if (basicInfo) {
      setSelectedOrderInfo({
        orderNumber: basicInfo.orderNumber,
        created: basicInfo.created,
        orderStatus: basicInfo.orderStatus,
        noOfQty: basicInfo.total_quantity || basicInfo.noOfQty,
        subTotalAmnt: basicInfo.subTotalAmnt || basicInfo.orderTotalAmount,
      });
    }

    try {
      const res = await axios.post(
        "https://topiko.com/prod/app/lt_getUserOrderDetails.php",
        { orderId, order_id: orderId },
        { headers: { "Content-Type": "application/json" } }
      );

      const data = res.data;
      if (data?.status === "success") {
        const order = data.response?.[0];
        setOrderDetails(order?.cartList || []);
        setSelectedOrderInfo({
          orderNumber: order?.orderNumber || basicInfo?.orderNumber,
          created: order?.created || basicInfo?.created,
          orderStatus: order?.orderStatus || basicInfo?.orderStatus,
          noOfQty: order?.noOfQty || basicInfo?.total_quantity || basicInfo?.noOfQty,
          subTotalAmnt: order?.subTotalAmnt || order?.orderTotalAmount || basicInfo?.orderTotalAmount,
        });
      } else {
        setOrderDetails([]);
        setSelectedOrderInfo(basicInfo || null);
      }
    } catch (err) {
      console.error("Error loading order details:", err);
      setOrderDetails([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_mobile");
    navigate("/");
  };

  const statusClass = (status) => {
    if (!status) return "status-pill";
    const safe = status.toLowerCase().replace(/\s+/g, "-");
    return `status-pill status-${safe}`;
  };

  const renderProfileTab = () => (
    <section className="profile-card">
      <header className="card-head">
        <div>
          <p className="eyebrow text-uppercase">Profile</p>
          <h5 className="mb-0">Your Details</h5>
        </div>
      </header>
      <div className="profile-grid">
        <div className="profile-field">
          <p className="field-label">User ID</p>
          <p className="field-value">{userId || "Not available yet"}</p>
        </div>
        <div className="profile-field">
          <p className="field-label">Mobile</p>
          <p className="field-value">{userMobile || "Pending login"}</p>
        </div>
        <div className="profile-field full-row">
          <p className="field-label">Profile status</p>
          <div className="field-callout">
            <p className="mb-1 fw-semibold">Hello, {displayName}</p>
            <p className="mb-0 text-muted small">
              Your profile data is synced from your account. Keep your details up to date for faster checkout.
            </p>
          </div>
        </div>
        <div className="profile-field full-row">
          <p className="field-label">Contact & Location</p>
          <div className="contact-grid">
            <div className="contact-chip">
              <p className="chip-label">Email</p>
              <p className="chip-value">{user?.email || "-"}</p>
            </div>
            <div className="contact-chip">
              <p className="chip-label">Phone</p>
              <p className="chip-value">{user?.mobile || userMobile || "-"}</p>
            </div>
            <div className="contact-chip">
              <p className="chip-label">Name</p>
              <p className="chip-value">{user?.name || "-"}</p>
            </div>
            <div className="contact-chip">
              <p className="chip-label">City</p>
              <p className="chip-value">{user?.city || "-"}</p>
            </div>
            <div className="contact-chip">
              <p className="chip-label">Latitude</p>
              <p className="chip-value">{user?.latitude || "-"}</p>
            </div>
            <div className="contact-chip">
              <p className="chip-label">Longitude</p>
              <p className="chip-value">{user?.longitude || "-"}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const renderOrdersTab = () => (
    <section className="profile-card">
      <header className="card-head">
        <div>
          <p className="eyebrow text-uppercase">Orders</p>
          <h5 className="mb-0">Order history</h5>
        </div>
        <button type="button" className="btn btn-outline-dark btn-sm" onClick={fetchOrders} disabled={loadingOrders}>
          {loadingOrders ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      {loadingOrders ? (
        <div className="order-skeleton">
          <div className="skeleton-line w-75" />
          <div className="skeleton-line w-50" />
          <div className="skeleton-line w-100" />
        </div>
      ) : orderError ? (
        <div className="empty-card">
          <p className="mb-1 fw-semibold">No orders yet</p>
          <p className="mb-0 text-muted">{orderError}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-card">
          <p className="mb-1 fw-semibold">You haven’t placed an order yet.</p>
          <p className="mb-0 text-muted">Browse services to place your first order.</p>
        </div>
      ) : (
        <div className="orders-layout">
          <div className="order-list">
            {paginatedOrders.map((order) => (
              <article
                key={order.order_id}
                className={`order-row ${selectedOrderId === order.order_id ? "is-active" : ""}`}
              >
                <div className="order-row-body">
                  <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                    <div>
                      <p className="eyebrow mb-1">#{order.orderNumber}</p>
                      <h6 className="mb-0">
                        {formatCurrency(order.orderTotalAmount)} / {order.total_quantity} items
                      </h6>
                    </div>
                    <span className={statusClass(order.orderStatus)}>{order.orderStatus || "Status"}</span>
                  </div>
                  <div className="order-row-meta">
                    <span>{formatDate(order.created)}</span>
                    <span>Payment: {order.payment_status || "Pending"}</span>
                  </div>
                </div>
                <div className="order-row-actions">
                  <button
                    type="button"
                    className="btn btn-dark btn-sm"
                    onClick={() => fetchOrderDetails(order.order_id, order)}
                    disabled={loadingDetails && selectedOrderId === order.order_id}
                  >
                    {loadingDetails && selectedOrderId === order.order_id ? "Loading..." : "View details"}
                  </button>
                </div>
              </article>
            ))}
            {orders.length > ITEMS_PER_PAGE && (
              <div className="d-flex align-items-center justify-content-between mt-1">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className="small text-muted">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>

          <div className="order-detail-card" ref={detailRef}>
            {selectedOrderId ? (
              <>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <p className="eyebrow mb-1">Order detail</p>
                    <h6 className="mb-1">#{selectedOrderInfo?.orderNumber}</h6>
                    <p className="text-muted mb-0">{formatDate(selectedOrderInfo?.created)}</p>
                  </div>
                  <span className={statusClass(selectedOrderInfo?.orderStatus)}>{selectedOrderInfo?.orderStatus}</span>
                </div>

                <div className="detail-meta mb-3">
                  <div>
                    <p className="field-label">Items</p>
                    <p className="field-value mb-0">{selectedOrderInfo?.noOfQty || 0}</p>
                  </div>
                  <div>
                    <p className="field-label">Subtotal</p>
                    <p className="field-value mb-0">{formatCurrency(selectedOrderInfo?.subTotalAmnt)}</p>
                  </div>
                </div>

                {loadingDetails ? (
                  <div className="order-skeleton">
                    <div className="skeleton-line w-100" />
                    <div className="skeleton-line w-75" />
                  </div>
                ) : orderDetails.length === 0 ? (
                  <div className="empty-card">
                    <p className="mb-1 fw-semibold">No line items</p>
                    <p className="mb-0 text-muted">Select another order or try refreshing.</p>
                  </div>
                ) : (
                  <div className="order-items">
                    {orderDetails.map((item, idx) => {
                      const name = item.product_name || item.service_title || item.title || "Item";
                      const qty = item.quantity || item.noOfQty || item.qty || 1;
                      const price =
                        item.totalPrice ??
                        item.sellingPrice ??
                        item.total_price ??
                        item.price ??
                        item.amount ??
                        0;

                      return (
                        <div key={`${item.product_id || idx}-${idx}`} className="order-item">
                          <div className="order-item-thumb">
                            <img src={item.product_image || "/images/placeholder.jpg"} alt={name} />
                          </div>
                          <div className="order-item-body">
                            <div className="order-item-row">
                              <p className="fw-semibold mb-0">{name}</p>
                              <p className="fw-semibold mb-0">{formatCurrency(price)}</p>
                            </div>
                            <p className="order-item-qty mb-0">Qty: {qty}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="empty-card">
                <p className="mb-1 fw-semibold">Select an order to see details</p>
                <p className="mb-0 text-muted">Your most recent order will appear here.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );

  const renderServicesTab = () => (
    <section className="profile-card">
      <header className="card-head">
        <div>
          <p className="eyebrow text-uppercase">My services</p>
          <h5 className="mb-0">Service history</h5>
        </div>
        <button
          type="button"
          className="btn btn-outline-dark btn-sm"
          onClick={() => fetchServices(true)}
          disabled={loadingServices}
        >
          {loadingServices ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      {loadingServices ? (
        <div className="order-skeleton">
          <div className="skeleton-line w-75" />
          <div className="skeleton-line w-50" />
          <div className="skeleton-line w-100" />
        </div>
      ) : serviceError ? (
        <div className="empty-card">
          <p className="mb-1 fw-semibold">No services found</p>
          <p className="mb-0 text-muted">{serviceError}</p>
        </div>
      ) : services.length === 0 ? (
        <div className="empty-card">
          <p className="mb-1 fw-semibold">You haven’t requested any service yet.</p>
          <p className="mb-0 text-muted">Book a service to see it listed here.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-sm align-middle mb-0">
            <thead>
              <tr>
                <th scope="col" className="nowrap">No.</th>
                <th scope="col" className="nowrap">Service No.</th>
                <th scope="col">Service Name</th>
                <th scope="col">Date</th>
                <th scope="col">Time</th>
                <th scope="col">Address</th>
                <th scope="col">Created</th>
              </tr>
            </thead>
            <tbody>
              {paginatedServices.map((svc, idx) => (
                <tr key={`${svc.serviceRequestNumber || idx}-${idx}`}>
                  <td className="nowrap">{servicePageStart + idx + 1}</td>
                  <td className="nowrap">{svc.serviceRequestNumber}</td>
                  <td>{svc.servicename}</td>
                  <td>{svc.requestDate ? formatDate(svc.requestDate) : "-"}</td>
                  <td>{svc.requestTime || "-"}</td>
                  <td>{svc.requestAddress || "-"}</td>
                  <td>{svc.created ? formatDate(svc.created) : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {services.length > SERVICES_PER_PAGE && (
            <div className="d-flex align-items-center justify-content-between mt-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setServicePage((p) => Math.max(1, p - 1))}
                disabled={servicePage === 1}
              >
                Previous
              </button>
              <span className="small text-muted">
                Page {servicePage} of {totalServicePages}
              </span>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setServicePage((p) => Math.min(totalServicePages, p + 1))}
                disabled={servicePage >= totalServicePages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );

  const renderLogoutTab = () => (
    <section className="profile-card">
      <header className="card-head">
        <div>
          <p className="eyebrow text-uppercase">Logout</p>
          <h5 className="mb-0">Ready to sign out?</h5>
        </div>
      </header>
      <div className="logout-card">
        <p className="mb-2">
          You are logged in as <span className="fw-semibold">{userMobile || userId}</span>.
        </p>
        <p className="text-muted mb-4">Logging out will clear your session on this device.</p>
        <div className="d-flex gap-3">
          <button type="button" className="btn btn-outline-secondary" onClick={() => setActiveTab(TABS.PROFILE)}>
            Back to profile
          </button>
          <button type="button" className="btn btn-danger" onClick={handleLogout}>
            Logout now
          </button>
        </div>
      </div>
    </section>
  );

  const tabContent = {
    [TABS.PROFILE]: renderProfileTab(),
    [TABS.ORDERS]: renderOrdersTab(),
    [TABS.SERVICES]: renderServicesTab(),
    [TABS.LOGOUT]: renderLogoutTab(),
  };

  return (
    <>
      <Header />
      <main className="profile-page py-5">
        <div className="container">
          <div className="profile-hero">
            <div>
              <p className="eyebrow text-uppercase mb-1">Account</p>
              <h3 className="mb-1">Hello, {displayName}</h3>
              <p className="text-muted mb-0">Manage your profile, orders, and services from one place.</p>
            </div>
          </div>

          <div className="profile-tabs">
            {Object.values(TABS).map((tab) => (
              <button
                key={tab}
                type="button"
                className={`tab-button ${activeTab === tab ? "is-active" : ""}`}
                onClick={() => setActiveTab(tab === TABS.LOGOUT ? TABS.LOGOUT : tab)}
              >
                {tab === TABS.PROFILE && "Profile"}
                {tab === TABS.ORDERS && "My Orders"}
                {tab === TABS.SERVICES && "My Services"}
                {tab === TABS.LOGOUT && "Logout"}
              </button>
            ))}
          </div>

          <div className="tab-content">{tabContent[activeTab]}</div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Profile;
