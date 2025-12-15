import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "./Common/Header";
import Footer from "./Common/Footer";
import "../css/Policy.css";

const renderContent = (data) => {
  if (!data || data.length === 0) return <p className="text-muted">No return/refund policy available.</p>;
  const html = data[0]?.policy || data[0]?.contents || "";
  return <div className="policy-body" dangerouslySetInnerHTML={{ __html: html }} />;
};

export default function RefundPolicy() {
  const [content, setContent] = useState(() => {
    const cached = localStorage.getItem("refund_policy_data");
    return cached ? JSON.parse(cached) : null;
  });

  useEffect(() => {
    if (content) return;
    const business_id = localStorage.getItem("id");
    const fetchPolicy = async () => {
      try {
        const res = await axios.post("https://topiko.com/prod/app/getBusinessPolicy.php", {
          business_id,
          type: "Refund",
        });
        if (res.data?.status === "success") {
          setContent(res.data.response);
          localStorage.setItem("refund_policy_data", JSON.stringify(res.data.response));
        }
      } catch (err) {
        console.error("Error fetching refund policy:", err);
      }
    };
    fetchPolicy();
  }, [content]);

  return (
    <>
      <Header />
      <section className="policy-page">
        <div className="container">
          <div className="policy-card">
            <p className="eyebrow text-uppercase mb-1">Policy</p>
            <h2 className="mb-3">Returns &amp; Refund Policy</h2>
            {renderContent(content)}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
