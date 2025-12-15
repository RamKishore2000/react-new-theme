import React, { useState } from "react";
import axios from "axios";
import Header from "./Common/Header";
import Footer from "./Common/Footer";
import "../css/Contact.css";

const randomMobile = () => {
  const start = Math.floor(Math.random() * 4) + 6; // 6-9
  let mobile = start.toString();
  for (let i = 0; i < 9; i += 1) {
    mobile += Math.floor(Math.random() * 10);
  }
  return mobile;
};

export default function Contact() {
  const [formData, setFormData] = useState({ username: "", email: "", message: "" });
  const [formStatus, setFormStatus] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", success: true });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const businessId = localStorage.getItem("id") || "64512";

    try {
      const response = await axios.post("https://topiko.com/prod/app/wt_contactUs.php", {
        business_id: businessId,
        fullName: formData.username,
        mobile: randomMobile(),
        emailid: formData.email,
        comments: formData.message,
      });

      if (response.data === 1) {
        setFormStatus("success");
        setToast({ show: true, message: "Submitted successfully", success: true });
        setFormData({ username: "", email: "", message: "" });
      } else {
        setFormStatus("error");
        setToast({ show: true, message: "Submission failed. Try again.", success: false });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setFormStatus("error");
      setToast({ show: true, message: "Something went wrong. Please retry.", success: false });
    }
  };

  return (
    <>
      <Header />
      <section className="contact-page">
        <div className="container">
          <div className="contact-hero">
            <div>
              <p className="eyebrow text-uppercase mb-1">Contact</p>
              <h2 className="mb-2">Get in touch</h2>
              <p className="text-muted mb-0">Reach us via form, phone, or visit our store location.</p>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-6">
              <div className="contact-card h-100">
                <div className="map-shell">
                  <iframe
                    src={`https://maps.google.com/maps?q=${localStorage.getItem("latitude") || ""},${
                      localStorage.getItem("longitude") || ""
                    }&z=15&output=embed`}
                    className="map"
                    title="location-map"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div className="contact-meta">
                  <h5 className="mb-2">Contact Us</h5>
                  <p className="text-muted mb-3">
                    Have a question? Reach out via the details below or drop us a message.
                  </p>
                  <ul className="list-unstyled contact-list">
                    <li>
                      <span className="label">Address</span>
                      <a
                        className="link"
                        href={`https://www.google.com/maps?q=${encodeURIComponent(
                          localStorage.getItem("businessadrees") || ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {localStorage.getItem("businessadrees") || "Not available"}
                      </a>
                    </li>
                    <li>
                      <span className="label">Phone</span>
                      <a className="link" href={`tel:${localStorage.getItem("primarycontact") || ""}`}>
                        {localStorage.getItem("primarycontact") || "Not available"}
                      </a>
                    </li>
                    <li>
                      <span className="label">Email</span>
                      <a className="link" href={`mailto:${localStorage.getItem("email") || ""}`}>
                        {localStorage.getItem("email") || "Not available"}
                      </a>
                    </li>
                  </ul>

                  <div className="socials">
                    {["facebook", "instagram", "linkedin", "twitter"].map((key) => {
                      const url = localStorage.getItem(key);
                      const href = url ? (url.startsWith("http") ? url : `https://${url}`) : "#";
                      const blocked = !url;
                      const label = key.charAt(0).toUpperCase() + key.slice(1);
                      return (
                        <a
                          key={key}
                          href={href}
                          className="social-btn"
                          onClick={(e) => {
                            if (blocked) {
                              e.preventDefault();
                              setToast({ show: true, message: `${label} link is not added.`, success: false });
                            }
                          }}
                        >
                          {label}
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="contact-card h-100">
                <h5 className="mb-2">Get In Touch</h5>
                <p className="text-muted mb-3">Submit your enquiry and we will get back to you shortly.</p>
                <form className="form-default" onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="username" className="form-label">
                        Your name*
                      </label>
                      <input
                        id="username"
                        type="text"
                        name="username"
                        className="form-control"
                        required
                        value={formData.username}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="email" className="form-label">
                        Your email*
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        className="form-control"
                        required
                        value={formData.email}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="col-12">
                      <label htmlFor="mess" className="form-label">
                        Message
                      </label>
                      <textarea
                        id="mess"
                        name="message"
                        className="form-control"
                        rows="4"
                        required
                        value={formData.message}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="col-12 d-flex justify-content-between align-items-center">
                      <div className="small text-muted">
                        {formStatus === "success" && "Thanks! We received your message."}
                        {formStatus === "error" && "Unable to send. Please try again."}
                      </div>
                      <button className="tf-btn animate-btn btn-primary" type="submit">
                        Send
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {toast.show && (
        <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1200 }}>
          <div
            className={`toast align-items-center text-white ${toast.success ? "bg-success" : "bg-danger"} show`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="d-flex">
              <div className="toast-body">{toast.message}</div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                aria-label="Close"
                onClick={() => setToast((prev) => ({ ...prev, show: false }))}
              ></button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}
