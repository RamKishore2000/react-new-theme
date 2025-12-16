import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import QRCode from "react-qr-code";
import Swal from "sweetalert2";
import Header from "./Common/Header";
import Footer from "./Common/Footer";
import { useCart } from "./CartContext";
import "../css/Checkout.css";
import codIcon from "../assets/payimages/cod.svg";
import razorpayIcon from "../assets/payimages/razorpay.svg";
import upiIcon from "../assets/payimages/UPI.svg";

const currency = (value = 0) => `Rs.${Number(value || 0).toFixed(2)}`;

const Checkout = () => {
  const navigate = useNavigate();
  const { cartProducts, setCartProducts, fetchCartProductsFromServer } = useCart();

  const [formData, setFormData] = useState({
    country: "",
    city: "",
    state: "",
    zipcode: "",
    address: "",
  });
  const [redeemChecked, setRedeemChecked] = useState(false);
  const [totalGst, setTotalGst] = useState(0);
  const [totalWithoutGst, setTotalWithoutGst] = useState(0);
  const subtotal = parseFloat(totalWithoutGst);
  const hasFetched = useRef(false);
  const fetchedOnce = useRef(false);
  const profileFetchedRef = useRef(false);
  const couponFetchedRef = useRef(false);

  const [showModal, setShowModal] = useState(false);
  const [paymentGateways, setPaymentGateways] = useState([]);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [selectedUpi, setSelectedUpi] = useState(null);
  const [msg, setMsg] = useState("");
  const [confirmCloseModal, setConfirmCloseModal] = useState(false);

  const [finalTotal, setFinalTotal] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [totalWeight, setTotalWeight] = useState("");
  const [businessPincode, setBusinessPincode] = useState("");
  const [userPincode, setUserPincode] = useState("");
  const [discountedTotal, setDiscountedTotal] = useState(null);
  const [rewardsData, setRewardsData] = useState(null);
  const [selectedCourierId, setSelectedCourierId] = useState(null);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [fastShipping, setFastShipping] = useState(null);
  const [normalShipping, setNormalShipping] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [selectedCouponId, setSelectedCouponId] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [profileMobile, setProfileMobile] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileName, setProfileName] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");

  const totalPrice = useMemo(
    () =>
      cartProducts.reduce((sum, item) => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        return sum + qty * price;
      }, 0),
    [cartProducts]
  );

  const handleApply = (e) => {
    e.preventDefault();

    const selected = coupons.find((coupon) => coupon.id === selectedCouponId);
    if (!selected || !selected.discount) return;

    const discountPercent = parseFloat(selected.discount);
    const baseTotal = finalTotal !== null ? finalTotal : subtotal;

    const discountAmount = (baseTotal * discountPercent) / 100;
    const discounted = baseTotal - discountAmount;

    setAppliedCoupon({
      ...selected,
      discount_price: discountAmount.toFixed(2),
    });

    setFinalTotal(discounted > 0 ? discounted : 0);
    setDiscountedTotal(discounted > 0 ? discounted : 0);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountedTotal(null);
  };

  useEffect(() => {
    const baseTotal = discountedTotal !== null ? discountedTotal : subtotal;

    const redeemAmount =
      redeemChecked && rewardsData?.pointsConsumedInRupee
        ? parseFloat(rewardsData.pointsConsumedInRupee)
        : 0;

    let shippingRate = 0;

    if (selectedShipping === "normal" && normalShipping) {
      shippingRate = parseFloat(normalShipping.rate);
    } else if (selectedShipping === "fast" && fastShipping) {
      shippingRate = parseFloat(fastShipping.rate);
    }

    const gstAmount = parseFloat(totalGst || 0);

    const updatedTotal = baseTotal - redeemAmount + shippingRate + gstAmount;

    setFinalTotal(updatedTotal > 0 ? updatedTotal : 0);
  }, [redeemChecked, discountedTotal, rewardsData, subtotal, selectedShipping, normalShipping, fastShipping, totalGst]);

  useEffect(() => {
    if (fetchedOnce.current) return;
    fetchedOnce.current = true;

    const fetchAddresses = async () => {
      const userId = localStorage.getItem("user_id");
      const bid = localStorage.getItem("id");
      if (!userId || !bid) return;

      try {
        const response = await axios.post("https://topiko.com/prod/app/wt_getUserAddressList.php", { bid, id: userId });
        if (response.data?.status === "success" && Array.isArray(response.data.response)) {
          setAddresses(response.data.response);
        }
      } catch (error) {
        console.error("Error fetching address list:", error);
      }
    };

    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    const userId = localStorage.getItem("user_id");
    const bid = localStorage.getItem("id");

    if (!userId || !bid) return;

    try {
      const response = await axios.post("https://topiko.com/prod/app/wt_getUserAddressList.php", { bid, id: userId });

      if (response.data?.status === "success" && Array.isArray(response.data.response)) {
        setAddresses(response.data.response);
      }
    } catch (error) {
      console.error("Error fetching address list:", error);
    }
  };

  useEffect(() => {
    if (!profileMobile || !totalPrice) return;

    const fetchRewardsPoints = async () => {
      const businessUserId = localStorage.getItem("user_id");
      const businessId = localStorage.getItem("id");

      try {
        const response = await fetch("https://topiko.com/prod/app/checkUserRewardsPoints.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessUserId,
            businessId,
            mobileNo: profileMobile,
            purchaseAmount: parseFloat(totalPrice.toFixed(2)),
          }),
        });

        const data = await response.json();
        if (data.response) {
          setRewardsData(data.response);
        }
      } catch (error) {
        console.error("Error fetching rewards points:", error);
      }
    };

    fetchRewardsPoints();
  }, [profileMobile, totalPrice]);

  const handleSelect = (addr) => {
    setSelectedAddress(addr);
    setSelectedAddressId(addr.id);
    setDropdownOpen(false);
    setFormData({
      firstname: "",
      lastname: "",
      country: "",
      address: "",
      area: "",
      email: "",
      landmark: "",
      city: "",
      state: "",
      zipcode: "",
      phone: "",
    });

    if (addr?.pincode && totalWeight && businessPincode) {
      handlePincodeChange(addr.pincode, totalWeight, businessPincode);
    }
  };

  useEffect(() => {
    if (
      addresses.length > 0 &&
      !selectedAddress &&
      totalWeight &&
      businessPincode
    ) {
      const firstAddress = addresses[0];
      setSelectedAddress(firstAddress);
      setSelectedAddressId(firstAddress.id);
      handlePincodeChange(firstAddress.pincode, totalWeight, businessPincode);
    }
  }, [addresses, totalWeight, businessPincode, selectedAddress]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const firstname = document.getElementById("firstname").value;
    const lastname = document.getElementById("lastname").value;
    const country = document.getElementById("country").value;
    const address = document.getElementById("address").value;
    const area = document.getElementById("area").value;
    const email = document.getElementById("Email").value;
    const landmark = document.getElementById("LandMark").value;
    const city = document.getElementById("city").value;
    const state = document.getElementById("state").value;
    const zipcode = document.getElementById("code").value;
    const phone = document.getElementById("phone").value;

    const user_id = localStorage.getItem("user_id");
    const business_id = localStorage.getItem("id");

    const payload = {
      user_id,
      full_name: firstname,
      door: lastname,
      country,
      address,
      area,
      email,
      landmark,
      city,
      state,
      pincode: zipcode,
      contact_no: phone,
    };

    try {
      const response = await axios.post("https://topiko.com/prod/app/create_userAddressBook.php", payload);

      if (response.data.status === "success") {
        alert("Address added successfully!");
        fetchAddresses();

        document.getElementById("firstname").value = "";
        document.getElementById("lastname").value = "";
        document.getElementById("country").value = "";
        document.getElementById("address").value = "";
        document.getElementById("area").value = "";
        document.getElementById("Email").value = "";
        document.getElementById("LandMark").value = "";
        document.getElementById("city").value = "";
        document.getElementById("state").value = "";
        document.getElementById("code").value = "";
        document.getElementById("phone").value = "";
      } else {
        alert("Failed to add address.");
      }
    } catch (error) {
      console.error("API Error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    const pincode = localStorage.getItem("pincode");
    if (pincode) {
      setBusinessPincode(pincode);
    }
  }, []);

  useEffect(() => {
    const fetchCartDetails = async () => {
      const business_id = localStorage.getItem("id");
      const user_id = localStorage.getItem("user_id");

      if (!business_id || !user_id) return;

      try {
        const response = await axios.post("https://topiko.com/prod/app/lt_getCartDetails.php", { business_id, user_id });

        const apiCart = response.data?.response || [];

        let gstSum = 0;
        let subtotalWithout = 0;
        let weightSum = 0;

        apiCart.forEach((item) => {
          const qty = parseInt(item.qty, 10) || 0;
          const gstPercent = parseFloat(item.gstPercent) || 0;
          const gstType = item.gstType?.toLowerCase() || "inclusive";
          const total = parseFloat(item.total) || 0;
          const weight = parseFloat(item.weight) || 0;

          let basePrice = total;
          let gstAmount = 0;

          if (gstType === "inclusive" && gstPercent > 0) {
            basePrice = total / (1 + gstPercent / 100);
            gstAmount = total - basePrice;
          } else if (gstType === "exclusive" && gstPercent > 0) {
            basePrice = total;
            gstAmount = total * (gstPercent / 100);
          }

          subtotalWithout += basePrice;
          gstSum += gstAmount;
          weightSum += qty * weight;
        });

        setTotalWithoutGst(subtotalWithout);
        setTotalGst(gstSum);
        setTotalWeight(weightSum);
      } catch (error) {
        console.error("Error fetching cart details:", error);
      }
    };

    if (!hasFetched.current) {
      fetchCartDetails();
      hasFetched.current = true;
    }
  }, [cartProducts]);

  useEffect(() => {
    if (!selectedAddress && addresses.length > 0) {
      const defaultAddress = addresses[0];
      setSelectedAddress(defaultAddress);
      setSelectedAddressId(defaultAddress.id);
      setUserPincode(defaultAddress.pincode);
    }
  }, [addresses, selectedAddress]);

  useEffect(() => {
    if (selectedAddress && totalWeight && businessPincode) {
      handlePincodeChange(selectedAddress.pincode, totalWeight, businessPincode);
    }
  }, [selectedAddress, totalWeight, businessPincode]);

  useEffect(() => {
    if (couponFetchedRef.current) return;
    couponFetchedRef.current = true;

    const fetchCoupons = async () => {
      const business_id = localStorage.getItem("id");

      try {
        const response = await fetch("https://topiko.com/prod/app/getBookOrderOfferList.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bid: business_id }),
        });

        const data = await response.json();

        if (Array.isArray(data.response)) {
          setCoupons(data.response);
        }
      } catch (error) {
        console.error("Error fetching coupons:", error);
      }
    };

    fetchCoupons();
  }, []);

  const handlePincodeChange = async (userpincode, weight, pickupPincode) => {
    const user_id = localStorage.getItem("user_id");
    const business_id = localStorage.getItem("id");
    setUserPincode(userpincode);
    setMsg("");

    try {
      const response = await axios.post("https://topiko.com/prod/app/lt_getShipmetCharges.php", {
        business_id,
        user_id,
        delivery_pincode: userpincode,
        pickup_pincode: pickupPincode,
        weight,
      });

      if (response.data?.status === "success" && Array.isArray(response.data.response)) {
        const shippingData = response.data.response;

        const parsedData = shippingData.map((item) => ({
          ...item,
          etdDate: new Date(item.etd),
        }));

        const fastest = parsedData.reduce((earliest, current) =>
          current.etdDate < earliest.etdDate ? current : earliest
        );
        setFastShipping(fastest);

        const normalCandidates = parsedData
          .filter((item) => item.etdDate > fastest.etdDate && item.rate < fastest.rate)
          .sort((a, b) => b.etdDate - a.etdDate);

        const bestNormal = normalCandidates[0];
        setNormalShipping(bestNormal || null);
        setMsg("");
      } else {
        setFastShipping(null);
        setNormalShipping(null);
        setMsg(response.data?.msg || "Delivery not available");
      }
    } catch (error) {
      setFastShipping(null);
      setNormalShipping(null);
      setMsg("Something went wrong while fetching shipping info.");
    }
  };

  useEffect(() => {
    if (profileFetchedRef.current) return;
    profileFetchedRef.current = true;

    const fetchProfile = async () => {
      const user_id = localStorage.getItem("user_id");

      try {
        const response = await fetch(`https://topiko.com/prod/app/profile.php?user_id=${user_id}`);
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0 && data[0].mobile) {
          setProfileMobile(data[0].mobile);
          setProfileEmail(data[0].email);
          setProfileName(data[0].name);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const handlePlaceOrder = async () => {
    const isNormalShippingValid = normalShipping && normalShipping?.rate > 0;
    const isFastShippingValid = fastShipping && fastShipping?.rate > 0;
    const hasShippingOptions = isNormalShippingValid || isFastShippingValid;

    if (!selectedShipping && hasShippingOptions) {
      alert("Please select a shipping method: Normal Delivery or Fast Delivery.");
      return;
    }

    const user_id = localStorage.getItem("user_id");
    const business_id = localStorage.getItem("id");

    try {
      const response = await fetch("https://topiko.com/prod/app/lt_getBusinessPaymentGatewayList.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, business_id }),
      });

      const data = await response.json();
      setPaymentGateways(data.response || []);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching payment gateway list:", error);
    }
  };

  const razorPay = async (gate) => {
    const user_id = localStorage.getItem("user_id");
    const business_id = localStorage.getItem("id");
    const totalAmount = finalTotal !== null ? finalTotal : subtotal;

    try {
      const payload = {
        userId: user_id,
        userName: profileName,
        amount: parseFloat(totalAmount) * 100,
        currency: "INR",
        description: "user order",
        businessId: business_id,
        mobile: profileMobile,
        email: profileEmail,
        gateway_id: gate.gateway_id,
      };

      const response = await axios.post("https://topiko.com/prod/app/lt_razorpay_generateOrderId.php", payload);

      const razorPayResponse = response.data;
      const orderId = razorPayResponse.transactionId;
      const id = razorPayResponse.id;

      if (!orderId) {
        alert("Payment failed. Please try again.");
        return;
      }

      const options = {
        key: razorPayResponse.apiKeyId,
        amount: razorPayResponse.amount,
        description: razorPayResponse.description,
        image: razorpayIcon,
        order_id: orderId,
        currency: "INR",
        name: razorPayResponse.name,
        prefill: {
          email: razorPayResponse.email,
          contact: razorPayResponse.mobile,
        },
        theme: { color: "#871178" },
        handler: function (response) {
          const transactionId = response.razorpay_payment_id;
          const signature = response.razorpay_signature;
          submitRequest(orderId, id, transactionId, signature);
        },
        modal: {
          ondismiss: function () {
            alert("Payment Cancelled");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      alert("Razorpay failed to initialize");
      console.error("Razorpay Error:", error);
    }
  };

  const submitRequest = async (transaction_id, id, transctionid, sig) => {
    try {
      const user_id = localStorage.getItem("user_id");
      const business_id = localStorage.getItem("id");

      const reward_id = redeemChecked ? rewardsData?.reward_id : null;
      const reward_points = redeemChecked ? rewardsData?.pointsConsumed : 0;
      const reward_amnt = redeemChecked ? rewardsData?.pointsConsumedInRupee : 0;

      const selectedShippingData =
        selectedShipping === "normal" ? normalShipping : selectedShipping === "fast" ? fastShipping : null;

      const shipping_etd = selectedShippingData?.etd || "";
      const shipping_rate = selectedShippingData?.rate || 0;

      const payload = {
        user_id,
        business_id,
        coupon_offer_id: selectedCouponId,
        coupon_code: appliedCoupon?.offer || "",
        couponDiscount: appliedCoupon?.discount_price || 0,
        orderTotalAmnt: finalTotal,
        subTotalAmnt: finalTotal,
        gst: totalGst,
        reward_id,
        reward_points,
        reward_amnt,
        netPayableAmount: finalTotal,
        userAddressBookId: selectedAddressId,
        signature: sig,
        transaction_id: transctionid,
        online_payment_id: id,
        order_id: transaction_id,
        payment_status: "success",
        courier_id: selectedCourierId,
        shipping_etd,
        shipping_rate,
        pickup_pincode: businessPincode,
        delivery_pincode: userPincode,
      };

      const res = await axios.post("https://topiko.com/prod/app/lt_createOrder.php", payload);

      if (res.data?.status === "success") {
        setShowModal(false);
        setCartProducts([]);
        Swal.fire({
          icon: "success",
          title: "Order submitted",
          text: "Payment received. View your orders.",
          confirmButtonText: "Go to My Orders",
        }).then(() => navigate("/profile?tab=orders"));
      } else {
        Swal.fire({ icon: "error", title: "Order failed", text: res.data?.msg || "Please try again." });
      }
    } catch (error) {
      console.error("Order Submit Failed:", error);
      Swal.fire({ icon: "error", title: "Order failed", text: "Failed to submit order. Please try again." });
    }
  };

  const submitUpiRequest = async () => {
    try {
      const user_id = localStorage.getItem("user_id");
      const business_id = localStorage.getItem("id");

      const reward_id = redeemChecked ? rewardsData?.reward_id : null;
      const reward_points = redeemChecked ? rewardsData?.pointsConsumed : 0;
      const reward_amnt = redeemChecked ? rewardsData?.pointsConsumedInRupee : 0;

      const selectedShippingData =
        selectedShipping === "normal" ? normalShipping : selectedShipping === "fast" ? fastShipping : null;

      const shipping_etd = selectedShippingData?.etd || "";
      const shipping_rate = selectedShippingData?.rate || 0;

      const payload = {
        user_id,
        business_id,
        coupon_offer_id: selectedCouponId,
        coupon_code: appliedCoupon?.offer || "",
        couponDiscount: appliedCoupon?.discount_price || 0,
        orderTotalAmnt: finalTotal,
        subTotalAmnt: finalTotal,
        gst: totalGst,
        reward_id,
        reward_points,
        reward_amnt,
        netPayableAmount: finalTotal,
        userAddressBookId: selectedAddressId,
        signature: "",
        transaction_id: "",
        online_payment_id: "",
        order_id: "",
        payment_status: "success",
        courier_id: selectedCourierId,
        shipping_etd,
        shipping_rate,
        pickup_pincode: businessPincode,
        delivery_pincode: userPincode,
      };

      const response = await axios.post("https://topiko.com/prod/app/lt_createOrderUPI.php", payload);

      const data = response?.data;

      if (data?.status === "success" && data?.msg === "Order submitted successfully") {
        setShowUpiModal(false);
        setConfirmCloseModal(false);
        setShowModal(false);
        setCartProducts([]);
        Swal.fire({
          icon: "success",
          title: "Payment received",
          text: "Your UPI payment is confirmed.",
          confirmButtonText: "Go to My Orders",
        }).then(() => navigate("/profile?tab=orders"));
      } else {
        Swal.fire({ icon: "error", title: "Failed", text: data?.msg || "Unknown error occurred." });
      }
    } catch (error) {
      console.error("Order failed:", error);
      Swal.fire({
        icon: "error",
        title: "Order failed",
        text: "Network or unexpected error while placing the order.",
      });
    }
  };

  const submitNoPaymentRequest = async () => {
    try {
      const user_id = localStorage.getItem("user_id");
      const business_id = localStorage.getItem("id");

      const reward_id = redeemChecked ? rewardsData?.reward_id : null;
      const reward_points = redeemChecked ? rewardsData?.pointsConsumed : 0;
      const reward_amnt = redeemChecked ? rewardsData?.pointsConsumedInRupee : 0;

      const selectedShippingData =
        selectedShipping === "normal" ? normalShipping : selectedShipping === "fast" ? fastShipping : null;

      const shipping_etd = selectedShippingData?.etd || "";
      const shipping_rate = selectedShippingData?.rate || 0;

      const payload = {
        user_id,
        business_id,
        coupon_offer_id: selectedCouponId,
        coupon_code: appliedCoupon?.offer || "",
        couponDiscount: appliedCoupon?.discount_price || 0,
        orderTotalAmnt: finalTotal,
        subTotalAmnt: finalTotal,
        gst: totalGst,
        reward_id,
        reward_points,
        reward_amnt,
        netPayableAmount: finalTotal,
        userAddressBookId: selectedAddressId,
        signature: "",
        transaction_id: "",
        online_payment_id: "",
        order_id: "",
        payment_status: "offline",
        courier_id: selectedCourierId,
        shipping_etd,
        shipping_rate,
        pickup_pincode: businessPincode,
        delivery_pincode: userPincode,
      };

      const response = await axios.post("https://topiko.com/prod/app/createOrder.php", payload);

      const data = response?.data;

      if (data?.status === "success" && data?.msg === "Order submitted successfully") {
        setShowModal(false);
        setCartProducts([]);
        Swal.fire({
          icon: "success",
          title: "Order placed",
          text: "Cash on delivery selected.",
          confirmButtonText: "Go to My Orders",
        }).then(() => navigate("/profile?tab=orders"));
      } else {
        Swal.fire({ icon: "error", title: "Failed", text: data?.msg || "Unknown error occurred." });
      }
    } catch (error) {
      console.error("Order failed:", error);
      Swal.fire({
        icon: "error",
        title: "Order failed",
        text: "Network or unexpected error while placing the order.",
      });
    }
  };

  const getCurrentPositionAndFillAddress = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const address = data.address || {};

          const fullAddress = [
            address.house_number,
            address.road,
            address.neighbourhood,
            address.suburb,
            address.locality,
            address.city_district,
          ]
            .filter(Boolean)
            .join(", ");

          setFormData((prev) => ({
            ...prev,
            country: address.country || "",
            city:
              address.city ||
              address.town ||
              address.village ||
              address.locality ||
              address.city_district ||
              "",
            state: address.state || "",
            zipcode: address.postcode || "",
            address: fullAddress || data.display_name || "",
          }));
        } catch (error) {
          console.error("Error getting location details:", error);
          alert("Failed to fetch address from location.");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Failed to get your location.");
      }
    );
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "denied") {
          alert("Location access is blocked in your browser settings.\nPlease enable it to autofill your address.");
          return;
        }
        getCurrentPositionAndFillAddress();
      });
    } else {
      getCurrentPositionAndFillAddress();
    }
  };

  const demo = async (e) => {
    if (e) e.preventDefault();
    try {
      const response = await axios.post("https://topiko.com/prod/app/checkoutProcess.php");
      const data = response?.data;

      if (data?.status === "success") {
        handlePlaceOrder();
      } else {
        alert(data?.msg);
      }
    } catch (error) {
      console.error("Order failed:", error);
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    const businessId = localStorage.getItem("id");
    if (!userId || !businessId) {
      window.dispatchEvent(new CustomEvent("openLoginModal"));
      navigate("/");
      return;
    }
    fetchCartProductsFromServer();
  }, [fetchCartProductsFromServer, navigate]);

  return (
    <>
      <Header />
      <main className="checkout-page flex-grow-1">
        <div className="checkout-hero soft-card">
          <div className="container text-center py-5">
            <p className="text-uppercase text-muted fw-semibold small mb-1">Checkout</p>
            <h2 className="fw-bold mb-2">Secure Payment &amp; Delivery</h2>
            <p className="text-muted mb-0">
              Confirm your address, apply offers, and pick a payment method to wrap up your order.
            </p>
          </div>
        </div>

        <div className="container checkout-shell">
          <div className="row g-4">
            <div className="col-xl-8">
              <div className="checkout-card shadow-sm soft-card">
                <div className="card-body">
                  <div className="address-picker">
                    <div className="d-flex align-items-center justify-content-between">
                      <h5 className="mb-0">Select Shipping Address</h5>
                      <button type="button" className="location-btn" onClick={handleUseCurrentLocation}>
                        <span className="icon" aria-hidden="true">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 11.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"
                              fill="currentColor"
                            />
                          </svg>
                        </span>
                        Use Current Location
                      </button>
                    </div>

                    <div
                      className="selected-address"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      role="button"
                      tabIndex={0}
                    >
                      <div>
                        <strong>{selectedAddress?.full_name || "Add an address"}</strong>
                        <div>{selectedAddress?.contact_no}</div>
                        <div>
                          {selectedAddress?.address} {selectedAddress?.pincode && `- ${selectedAddress?.pincode}`}
                        </div>
                      </div>
                    </div>

                    {dropdownOpen && (
                      <div className="address-dropdown">
                        {addresses.map((addr) => (
                          <div key={addr.id} className="address-item" onClick={() => handleSelect(addr)}>
                            <strong>{addr.full_name}</strong>
                            <div>{addr.contact_no}</div>
                            <div>
                              {addr.address} - {addr.pincode}
                            </div>
                          </div>
                        ))}
                        {addresses.length === 0 && <div className="text-muted">No addresses found.</div>}
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="section-heading">
                      <div>
                        <p className="eyebrow">Shipping details</p>
                        <h5 className="mb-1">Add New Address</h5>
                        <p className="text-muted small mb-0">Save a new address for delivery.</p>
                      </div>
                    </div>
                    <form className="address-form" onSubmit={handleSubmit}>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">Name</label>
                          <input className="form-control" id="firstname" type="text" name="firstname" />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Door</label>
                          <input className="form-control" id="lastname" type="text" name="lastname" />
                        </div>
                        <div className="col-md-12">
                          <label className="form-label">Country</label>
                          <input
                            className="form-control"
                            id="country"
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          />
                        </div>
                        <div className="col-md-12">
                          <label className="form-label">Address</label>
                          <input
                            className="form-control"
                            id="address"
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          />
                        </div>
                        <div className="col-md-12">
                          <label className="form-label">Area</label>
                          <input className="form-control" id="area" type="text" name="area" />
                        </div>
                        <div className="col-md-12">
                          <label className="form-label">Email</label>
                          <input className="form-control" id="Email" type="text" name="Email" />
                        </div>
                        <div className="col-md-12">
                          <label className="form-label">Landmark</label>
                          <input className="form-control" id="LandMark" type="text" name="Landmark" />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">City</label>
                          <input
                            className="form-control"
                            id="city"
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">State</label>
                          <input
                            className="form-control"
                            id="state"
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Zipcode/Postal</label>
                          <input
                            className="form-control"
                            id="code"
                            type="text"
                            name="zipcode"
                            value={formData.zipcode}
                            onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
                          />
                        </div>
                        <div className="col-md-12">
                          <label className="form-label">Phone</label>
                          <input className="form-control" id="phone" type="text" name="phone" />
                        </div>
                      </div>

                  <div className="text-end mt-3">
                    <button type="submit" className="btn btn-primary btn-pill">
                      Save Address
                    </button>
                  </div>
                </form>
              </div>

                  {(normalShipping || fastShipping) && (
                    <div className="box-shipping mt-4">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <h5 className="mb-0">Shipping Method</h5>
                        {msg && <span className="text-danger small">{msg}</span>}
                      </div>
                      {normalShipping && (
                        <label className="shipping-option">
                          <input
                            type="radio"
                            name="shipping"
                            onChange={() => {
                              setSelectedShipping("normal");
                              setSelectedCourierId(normalShipping.courier_id);
                            }}
                            checked={selectedShipping === "normal"}
                          />
                          <div>
                            <div className="fw-semibold">Normal Delivery</div>
                            <div className="text-muted small">Estimate: {normalShipping.etd}</div>
                          </div>
                          <span className="fw-semibold">{currency(normalShipping.rate)}</span>
                        </label>
                      )}
                      {fastShipping && (
                        <label className="shipping-option">
                          <input
                            type="radio"
                            name="shipping"
                            onChange={() => {
                              setSelectedShipping("fast");
                              setSelectedCourierId(fastShipping.courier_id);
                            }}
                            checked={selectedShipping === "fast"}
                          />
                          <div>
                            <div className="fw-semibold">Fast Delivery</div>
                            <div className="text-muted small">Estimate: {fastShipping.etd}</div>
                          </div>
                          <span className="fw-semibold">{currency(fastShipping.rate)}</span>
                        </label>
                      )}
                    </div>
                  )}

                  {coupons.length > 0 && (
                    <div className="coupon-box mt-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0">Apply Coupon</h6>
                        {appliedCoupon && (
                          <button type="button" className="btn btn-link p-0" onClick={handleRemoveCoupon}>
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="d-flex gap-2">
                        <select
                          value={selectedCouponId}
                          onChange={(e) => setSelectedCouponId(e.target.value)}
                          className="form-select"
                        >
                          <option value="">-- Select a coupon --</option>
                          {coupons.map((coupon) => (
                            <option key={coupon.id} value={coupon.id}>
                              {coupon.offer}
                            </option>
                          ))}
                        </select>
                        <button type="button" className="btn btn-outline-primary" onClick={handleApply}>
                          Apply
                        </button>
                      </div>
                      {appliedCoupon && (
                        <div className="applied-coupon mt-2">
                          <div>
                            <strong>{appliedCoupon.offer}</strong>
                            <div className="text-muted small">Discount: {currency(appliedCoupon.discount_price)}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {rewardsData?.pointsConsumedInRupee && rewardsData.pointsConsumedInRupee !== "0.00" && (
                    <div className="redeem-box mt-4">
                      <label className="d-flex align-items-center gap-2">
                        <input
                          type="checkbox"
                          checked={redeemChecked}
                          onChange={(e) => setRedeemChecked(e.target.checked)}
                        />
                        <span>
                          Redeem {currency(rewardsData.pointsConsumedInRupee)} from your points
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-xl-4">
              <div className="checkout-card shadow-sm sticky-top summary-card soft-card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">In your cart</h5>
                    <span className="badge bg-primary-soft text-primary">{cartProducts.length} items</span>
                  </div>

                  {cartProducts.length ? (
                    <ul className="list-order-product">
                      {cartProducts.map((product, i) => (
                        <li key={i} className="order-item">
                          <figure className="img-product">
                            <img alt="product" src={product.product_image} width={144} height={188} />
                            <span className="quantity">{product.quantity}</span>
                          </figure>
                          <div className="content">
                            <div className="info">
                              <p className="name text-sm fw-semibold text-dark mb-1">{product.title}</p>
                              <span className="variant text-muted small">Qty: {product.quantity}</span>
                            </div>
                            <span className="price text-sm fw-semibold text-dark">
                              {currency(product.price * product.quantity)}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-3 text-center">
                      Your Cart is empty.{" "}
                      <Link className="tf-btn btn-dark2 animate-btn mt-3" to="/shop-default">
                        Explore Products
                      </Link>
                    </div>
                  )}

                  <ul className="list-total mt-3">
                    <li className="total-item d-flex justify-content-between">
                      <span>Subtotal (without GST)</span>
                      <span className="fw-semibold">{currency(totalWithoutGst)}</span>
                    </li>
                    <li className="total-item d-flex justify-content-between">
                      <span>Shipping</span>
                      <span className="fw-semibold">
                        {selectedShipping === "normal" && normalShipping
                          ? currency(normalShipping.rate)
                          : selectedShipping === "fast" && fastShipping
                          ? currency(fastShipping.rate)
                          : currency(0)}
                      </span>
                    </li>
                    {appliedCoupon && (
                      <li className="total-item d-flex justify-content-between">
                        <span>Coupon Discount</span>
                        <span className="fw-semibold text-success">- {currency(appliedCoupon.discount_price)}</span>
                      </li>
                    )}
                    {redeemChecked && parseFloat(rewardsData?.pointsConsumedInRupee || "0.00") > 0 && (
                      <li className="total-item d-flex justify-content-between">
                        <span>Redeemed Points</span>
                        <span className="fw-semibold text-success">
                          - {currency(parseFloat(rewardsData.pointsConsumedInRupee))}
                        </span>
                      </li>
                    )}
                    <li className="total-item d-flex justify-content-between">
                      <span>GST</span>
                      <span className="fw-semibold">{currency(totalGst)}</span>
                    </li>
                    <li className="total-item d-flex justify-content-between">
                      <span>Net Payable</span>
                      <span className="fw-bold">
                        {currency(finalTotal !== null ? finalTotal : subtotal)}
                      </span>
                    </li>
                  </ul>

                  <button type="button" className="btn btn-dark btn-pill w-100 mt-3" onClick={demo}>
                    Place order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="payment-modal" onClick={() => setShowModal(false)}>
          <div className="payment-modal__body" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Select Your Payment Method</h6>
              <button type="button" className="btn-close" onClick={() => setShowModal(false)} aria-label="Close" />
            </div>
            <div className="payment-grid">
              {paymentGateways?.length > 0 &&
                paymentGateways.map((gateway, index) => {
                  const gatewayName = gateway.gatewayName.toLowerCase();
                  const iconSrc = gatewayName === "razorpay" ? razorpayIcon : upiIcon;
                  return (
                    <div
                      key={index}
                      className="payment-tile"
                      onClick={() => {
                        if (gatewayName === "upi") {
                          setSelectedUpi(gateway);
                          setShowUpiModal(true);
                        } else if (gatewayName === "razorpay") {
                          razorPay(gateway);
                        }
                      }}
                    >
                      <img src={iconSrc} alt={gateway.gatewayName} />
                      <span>{gateway.gatewayName}</span>
                    </div>
                  );
                })}

              <div className="payment-tile" onClick={submitNoPaymentRequest}>
                <img src={codIcon} alt="Cash On Delivery" />
                <span>Cash on Delivery</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUpiModal && selectedUpi && (
        <div className="payment-modal" onClick={() => setShowUpiModal(false)}>
          <div className="payment-modal__body" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-2">
                <img src={upiIcon} alt={selectedUpi.gatewayName} className="upi-icon" />
                <div>
                  <h6 className="mb-0">{selectedUpi.gatewayName} Payment</h6>
                  <small className="text-muted">Scan and pay with any UPI app</small>
                </div>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => setConfirmCloseModal(true)}
                aria-label="Close"
              />
            </div>

            <div className="upi-qr">
              <QRCode value={selectedUpi?.merchant_key || "upi"} size={200} />
            </div>

            <div className="d-flex justify-content-center gap-2 mt-3">
              <button type="button" className="btn btn-success" onClick={() => setConfirmCloseModal(true)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmCloseModal && (
        <div className="payment-modal" onClick={() => setConfirmCloseModal(false)}>
          <div className="payment-modal__body" onClick={(e) => e.stopPropagation()}>
            <h6 className="mb-3 text-center">Is your UPI payment successful?</h6>
            <div className="d-flex justify-content-center gap-3">
              <button type="button" className="btn btn-success" onClick={submitUpiRequest}>
                Yes
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  setShowUpiModal(false);
                  setConfirmCloseModal(false);
                }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default Checkout;
