import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartProducts, setCartProducts] = useState([]);

  const fetchCartProductsFromServer = useCallback(async () => {
    const userId = localStorage.getItem("user_id");
    const businessId = localStorage.getItem("id");

    if (!userId || !businessId) {
      console.error("User ID or Business ID missing in local storage");
      return;
    }

    const payload = {
      business_id: businessId,
      user_id: userId,
    };

    try {
      const response = await axios.post("https://topiko.com/prod/app/lt_getCartDetails.php", payload);
      if (response.data?.status === "success" && Array.isArray(response.data.response)) {
        const serverCartItems = response.data.response;

        const mappedItems = serverCartItems.map((item) => ({
          id: item.product_id,
          cart_id: item.id,
          title: item.title,
          price: parseFloat(item.price),
          quantity: parseInt(item.qty, 10),
          gstAmount: parseFloat(item.gstAmount),
          gstPercent: parseFloat(item.gstPercent),
          gstType: item.gstType,
          netPrice: parseFloat(item.netPrice),
          total: parseFloat(item.total),
          totalPrice: parseFloat(item.totalPrice),
          weight: parseFloat(item.weight),
          product_image: item.product_image,
        }));

        setCartProducts(mappedItems);
      } else {
        setCartProducts([]);
      }
    } catch (error) {
      console.error("❌ Error fetching cart products from server:", error.response || error.message);
    }
  }, []);

  const removeItem = useCallback(async (cartItemId) => {
    const userId = localStorage.getItem("user_id");
    try {
      await axios.post("https://topiko.com/prod/app/wt_removeCartItem.php", {
        cartId: cartItemId,
        user_id: userId,
      });
      setCartProducts((prev) => prev.filter((item) => item.cart_id !== cartItemId));
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  }, []);

  const updateQuantity = useCallback(
    async (productId, qty) => {
      const userId = localStorage.getItem("user_id");
      const businessId = localStorage.getItem("id");

      if (!userId || !businessId) {
        window.dispatchEvent(new CustomEvent("openLoginModal"));
        return;
      }

      try {
        const payload = {
          business_id: businessId,
          user_id: userId,
        };

        const response = await axios.post("https://topiko.com/prod/app/lt_getCartDetails.php", payload);
        const cartItems = response.data?.response || [];

        const cartItem = cartItems.find((item) => item.id == productId || item.product_id == productId);
        if (!cartItem) {
          console.error("❌ Item not found in cart with id or product_id:", productId);
          return;
        }

        const cartPayload = {
          cart_id: cartItem.id,
          gstAmount: cartItem.gstAmount,
          gstPercent: cartItem.gstPercent,
          gstType: cartItem.gstType,
          netPrice: cartItem.netPrice,
          price: cartItem.price,
          price_id: cartItem.price_id,
          qty: String(qty),
          total: "",
          user_id: userId,
          weight: cartItem.weight,
        };

        const updateResponse = await axios.post(
          "https://topiko.com/prod/app/lt_updateCartDetails_pp.php",
          cartPayload
        );

        if (updateResponse?.data?.status === "success") {
          setCartProducts((prev) =>
            prev.map((item) =>
              item.id == productId
                ? {
                    ...item,
                    quantity: parseInt(qty, 10),
                  }
                : item
            )
          );
        } else if (updateResponse?.data?.msg === "Product is already added into cart") {
          alert("⚠️ Product is already in your cart!");
        }
      } catch (error) {
        console.error("❌ Error in updateQuantity flow:", error.response || error.message);
      }
    },
    []
  );

  const addToCart = useCallback(
    async (product, selectedIndex = 0) => {
      const userId = localStorage.getItem("user_id");
      const businessId = localStorage.getItem("id");

      if (!userId || !businessId) {
        window.dispatchEvent(new CustomEvent("openLoginModal"));
        return { requiresLogin: true };
      }

      const priceIndex = selectedIndex;
      const selectedPrice = product?.productPrice?.[priceIndex];

      if (!selectedPrice) {
        alert("Please select a variant.");
        return { error: "variant_missing" };
      }

      const unitPrice =
        selectedPrice.discount_price !== "0.00" && selectedPrice.discount_price !== ""
          ? selectedPrice.discount_price
          : selectedPrice.mrp;

      const totalPrice = (parseFloat(unitPrice) * 1).toFixed(2);

      const payload = {
        business_id: businessId,
        discounted_price: totalPrice,
        gstAmount: selectedPrice.gstAmount || "0.00",
        gstPercent: selectedPrice.gstPercent || "0.00",
        gstType: selectedPrice.gstType || "inclusive",
        netPrice: totalPrice,
        price: unitPrice,
        price_id: selectedPrice.price_id || selectedPrice.id,
        product_id: product.id,
        qty: "1",
        user_id: userId,
        weight: selectedPrice.weight || product.weight || "0.5",
      };

      try {
        await axios.post("https://topiko.com/prod/app/wt_removeCartItem.php", {
          CartId: product.id,
          user_id: userId,
          business_id: businessId,
        });

        const addRes = await axios.post("https://topiko.com/prod/app/lt_addToCart_pp.php", payload);

        if (addRes.data.status === "success") {
          setCartProducts((prev) =>
            prev.filter((item) => !(item.id === product.id && item.cart_id?.toString().startsWith("temp-")))
          );
          await fetchCartProductsFromServer();
          return { success: true };
        }

        alert(addRes.data.msg || "Add failed");
        return { error: "add_failed" };
      } catch (err) {
        console.error("❌ Cart operation failed:", err);
        alert("Something went wrong");
        return { error: "exception" };
      }
    },
    [fetchCartProductsFromServer]
  );

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    const businessId = localStorage.getItem("id");
    if (userId && businessId) {
      fetchCartProductsFromServer();
    }
  }, [fetchCartProductsFromServer]);

  return (
    <CartContext.Provider
      value={{
        cartProducts,
        setCartProducts,
        fetchCartProductsFromServer,
        addToCart,
        updateQuantity,
        removeItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
