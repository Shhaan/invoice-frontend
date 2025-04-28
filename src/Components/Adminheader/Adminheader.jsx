import React, { useContext, useEffect, useState } from "react";
import style from "./Adminheader.module.css";
import logo from "../../Asset/Image/bg.png";
import H2l from "../../Asset/Image/h2.png";

import { useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { CartContext } from "../../App";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { BsList } from "react-icons/bs";
import { MdOutlineCancel } from "react-icons/md";

function Adminheader({
  isAdmin = false,
  whiteIcon = false,
  setside = false,
  side,
}) {
  const navigate = useNavigate();
  const { isCart, setIsCart } = useContext(CartContext);
  const { totalItemsCount } = useSelector((state) => state.cart);

  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [cartEffect, setCartEffect] = useState(false); // State for cart effect
  const [prevCount, setPrevCount] = useState(totalItemsCount); // Track previous count

  const handleClick = () => {
    if (totalItemsCount === 0) {
      return toast("Cart is empty", { duration: 3000 });
    }
    setIsCart((prev) => !prev);
    navigate("/cart");
  };

  // Track viewport resizing
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Trigger effect when totalItemsCount increases
  useEffect(() => {
    if (totalItemsCount > prevCount) {
      setCartEffect(true);
      const timeout = setTimeout(() => setCartEffect(false), 300); // Reset effect after 300ms
    }
    setPrevCount(totalItemsCount); // Update previous count
  }, [totalItemsCount, prevCount]);

  return (
    <header
      style={isAdmin ? { position: "fixed", width: "100%", zIndex: 10 } : {}}
    >
      <div
        style={
          isAdmin
            ? {
                background: "#8b4513",
              }
            : {}
        }
        className={`${style.maindiv} align-items-center`}
      >
        <div
          className={
            isAdmin
              ? `${style.subdiv1} col-4 col-md-5 text-center text-md-start`
              : `${style.subdiv1} col-8 col-md-6 text-center text-md-start`
          }
          onClick={() => setIsCart(false)}
        >
          {!isAdmin ? (
            <>
              <img
                style={
                  viewportWidth < 400 ? { width: "100%", height: "73px" } : {}
                }
                onClick={() => navigate("/")}
                className={`${style.logoimg} `}
                src={logo}
                alt="logo"
              />
              <img
                style={
                  viewportWidth < 400 ? { width: "83%", height: "63px" } : {}
                }
                onClick={() => navigate("/")}
                className={`${style.logoimg} `}
                src={H2l}
                alt="logo"
              />
            </>
          ) : side ? (
            <MdOutlineCancel
              style={{ color: "white", height: "27px", width: "24px" }}
              onClick={() => setside((e) => !e)}
            />
          ) : (
            <BsList
              style={{ color: "white", height: "27px", width: "24px" }}
              onClick={() => setside((e) => !e)}
            />
          )}
        </div>
        <div
          className={
            isAdmin
              ? `${style.subdiv2} col-8 col-md-7 text-center text-md-start`
              : `${style.subdiv2} col-4 col-md-6 text-center text-md-start`
          }
        >
          {isAdmin && (
            <h3
              onClick={() => {
                navigate("/");
                setIsCart(false);
              }}
              className={style.heading}
              style={
                viewportWidth < 400
                  ? {
                      fontSize: "15px",
                      margin: 0,
                      fontWeight: "600",
                    }
                  : {}
              }
            >
              SSS FRESH CHICKEN & MEAT
            </h3>
          )}
          {!isAdmin && (
            <React.Fragment>
              <div className={style.cartButton}>
                <button
                  onClick={handleClick}
                  className={`${style.cartButtonog} ${
                    cartEffect ? style.cartEffect : ""
                  }`} // Apply effect class
                >
                  <FaShoppingCart
                    style={
                      viewportWidth < 400
                        ? { height: "20px", width: "20px", color: "#ffffff" }
                        : { height: "20px", width: "20px", color: "#ffffff" }
                    }
                    className={`${style.icon}  `}
                  />

                  <span
                    style={
                      viewportWidth < 400
                        ? { fontSize: "16px", color: "white" }
                        : { color: "white" }
                    }
                  >
                    {" "}
                    {totalItemsCount}
                  </span>
                </button>
              </div>
            </React.Fragment>
          )}
        </div>
      </div>
    </header>
  );
}

export default Adminheader;
