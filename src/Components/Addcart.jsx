import React, { useState } from "react";
import { FaPlus, FaShoppingCart } from "react-icons/fa";
import styles from "../Main.module.css";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import toast from "react-hot-toast";

const AddToCartButton = ({ deal, option }) => {
  const dispatch = useDispatch();
  const { items: cartItems } = useSelector((state) => state.cart);

  const handleClick = async (e) => {
    e.stopPropagation();

    if (option) {
      const customizedDeal = {
        ...deal,
        customization: option?.name,
        count: 1,
      };
      dispatch(addToCart(customizedDeal));

      const updatedItem = cartItems.find(
        (item) =>
          item?.product_id === customizedDeal?.product_id &&
          item?.customization === option?.name
      );

      const count = updatedItem ? updatedItem.count + 1 : 1;
    } else {
      dispatch(addToCart({ ...deal, count: 1 }));
      const updatedItem = cartItems.find(
        (item) => item.product_id === deal.product_id
      );
      const count = updatedItem ? updatedItem.count + 1 : 1;
    }
  };

  return (
    <div className={styles.addToCartContainer}>
      <button onClick={handleClick} className={styles.addToCartButton}>
        <FaPlus className={styles.addToCartIcon} />
        <FaShoppingCart className={styles.addToCartIcon} />
      </button>
    </div>
  );
};

export default AddToCartButton;
