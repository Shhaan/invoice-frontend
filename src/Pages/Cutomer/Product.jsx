import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstancemain, baseURL } from "../../Functions/axios";
import style from "../../Main.module.css";
import Adminheader from "../../Components/Adminheader/Adminheader";
import Categoryfetch from "../../Components/Categoryfetch/Categoryfetch";
import Footer from "../../Components/Footer/Footer";
import { PuffLoader } from "react-spinners";
import toast from "react-hot-toast";
import AddToCartButton from "../../Components/Addcart";
import { FaPlus, FaMinus, FaTrash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  Decreasecount,
  Increasecount,
  RemoveItem,
} from "../../redux/cartSlice";
function Product() {
  const dispatch = useDispatch();

  const { items: cartItems } = useSelector((state) => state.cart);
  const { code } = useParams();
  const [product, setProduct] = useState([]);
  const [releatedproduct, setreleatedproduct] = useState([]);

  const [loading, setLoading] = useState(true);
  const [cus, setCutomization] = useState([]);
  const observerRef = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        // Fetch product by code
        const response = await axiosInstancemain.get(`/products/`, {
          params: { code },
        });
        console.log("Product response:", response);

        const fetchedProduct = response?.data?.message;
        setProduct(fetchedProduct);

        // Fetch related products if category exists
        if (fetchedProduct?.category) {
          try {
            const productResponse = await axiosInstancemain.get(`/products/`, {
              params: { category: fetchedProduct.category },
            });
            const data = productResponse?.data?.results || [];
            const relatedProducts = data
              .filter((i) => i.product_id !== fetchedProduct.product_id)
              .slice(0, 4);
            if (relatedProducts.length > 0) {
              setreleatedproduct(relatedProducts);
            } else {
              setreleatedproduct([]);
            }
            console.log("Related products:", relatedProducts);
          } catch (error) {
            console.error("Error fetching related products:", error);
          }
        }

        // Fetch customization if product_id exists
        if (fetchedProduct?.product_id) {
          try {
            const customizationResponse = await axiosInstancemain.get(
              `/customize/${fetchedProduct.product_id}/`
            );

            const customizationData =
              customizationResponse?.data?.message || [];
            if (customizationData.length > 0) {
              setCutomization(customizationData);
            } else {
              setCutomization([]);
            }
          } catch (error) {
            console.error("Error fetching customization:", error);
          }
        }
      } catch (err) {
        if (err.response?.status === 404) {
          navigate("/");
          toast.error("Product not found with the given code", {
            duration: 1500,
          });
          return;
        }
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [code]); // Dependency array

  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const handleCart = () => {};
  return (
    <React.Fragment>
      <div className={style.mainheader}>
        <div style={{ position: "fixed", zIndex: 2, width: "100%" }}>
          <Adminheader isAdmin={false} />
          <Categoryfetch />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "22px",
          alignItems: "center",
        }}
      ></div>
      {loading ? (
        <div
          style={{ display: "flex", justifyContent: "center", height: "100vh" }}
        >
          <PuffLoader size={60} color="#b64d11" />
        </div>
      ) : (
        <div>
          {product ? (
            <div className="container-fluid p-3 ">
              <div className="row p-4">
                <div className="col-12 col-md-6">
                  <div className="text-center  ">
                    <img
                      style={
                        viewportWidth > 900
                          ? {
                              width: "51%",
                              height: "200px",
                              borderRadius: "10px",
                            }
                          : {
                              width: "51%",
                              height: "122px",
                              borderRadius: "10px",
                            }
                      }
                      src={product?.image ? baseURL + product?.image : null}
                      alt={product?.name || "Product image"}
                    />

                    {cus.length > 0 && (
                      <>
                        <h4 className={style.DealNameday}>{product?.name}</h4>
                        <div className={style.dealPrice}>
                          {product.original_price ? (
                            <div className={style.dealPrice}>
                              <span className={style.originalPrice}>
                                QR {product.original_price}
                              </span>
                              <span className={style.discountedPrice}>
                                QR {product.price}
                              </span>
                            </div>
                          ) : (
                            <div className={style.dealPrice}>
                              <span className={style.discountedPrice}>
                                QR {product.price}
                              </span>
                            </div>
                          )}
                        </div>
                        <h4 className={style.dealPrice}>{product?.quantity}</h4>
                        {product.discription &&
                          product.discription !== "undefined" && (
                            <div
                              style={{ textAlign: "left" }}
                              className={style.dealPrice}
                              dangerouslySetInnerHTML={{
                                __html: product.discription
                                  .replace(/\r\n/g, "<br />")
                                  .replace(/\n/g, "<br />"),
                              }}
                            />
                          )}
                      </>
                    )}
                  </div>
                </div>

                <div
                  style={
                    viewportWidth < 768
                      ? { border: "none", paddingLeft: "0 !important" }
                      : {}
                  }
                  className={`${style.productcatomize} col-12 col-md-6 ps-4 mb-5`}
                >
                  {cus.length > 0 ? (
                    <>
                      <h3
                        style={{ textAlign: "center" }}
                        className={style.shopbycategoryheading}
                      >
                        Cutting size
                      </h3>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                        }}
                      >
                        {cus.map((i) => (
                          <>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                gap: "10px",
                              }}
                            >
                              <img
                                style={
                                  viewportWidth > 500
                                    ? {
                                        width: "17%",
                                        height: "100px",
                                        borderRadius: "6px",
                                      }
                                    : {
                                        width: "22%",
                                        height: "70px",
                                        borderRadius: "6px",
                                      }
                                }
                                src={i.image ? baseURL + i?.image : i.image}
                                alt=""
                              />
                              <div style={{ width: "100%" }}>
                                <h6
                                  style={
                                    viewportWidth < 450
                                      ? { fontSize: "12px" }
                                      : {}
                                  }
                                >
                                  {i.name}
                                </h6>
                                <div
                                  style={{
                                    textAlign: "-webkit-right",
                                  }}
                                >
                                  {cartItems.length > 0 &&
                                  cartItems.some(
                                    (item) =>
                                      item?.product_id ===
                                        product?.product_id &&
                                      item?.customization === i?.name
                                  ) ? (
                                    cartItems.map((item) => {
                                      if (
                                        item?.product_id ===
                                          product?.product_id &&
                                        item?.customization === i?.name
                                      ) {
                                        return (
                                          <div
                                            style={{
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "end",
                                              gap: "9px",
                                            }}
                                          >
                                            <div
                                              key={item.product_id}
                                              style={
                                                viewportWidth < 500
                                                  ? {
                                                      display: "flex",
                                                      alignItems: "center",
                                                      justifyContent: "center",
                                                      gap: "10px",
                                                      padding: "7px",
                                                      border: "1px solid #ccc",
                                                      borderRadius: "8px",
                                                      backgroundColor: "ffff",
                                                      boxShadow:
                                                        "0 4px 6px rgba(0, 0, 0, 0.1)",
                                                      width: "80px",
                                                    }
                                                  : {
                                                      display: "flex",
                                                      alignItems: "center",
                                                      justifyContent: "center",
                                                      gap: "10px",
                                                      padding: "10px",
                                                      border: "1px solid #ccc",
                                                      borderRadius: "8px",
                                                      backgroundColor: "ffff",
                                                      boxShadow:
                                                        "0 4px 6px rgba(0, 0, 0, 0.1)",
                                                      width: "90px",
                                                    }
                                              }
                                            >
                                              <FaMinus
                                                onClick={() =>
                                                  dispatch(Decreasecount(item))
                                                }
                                                style={{
                                                  fontSize: "18px",
                                                  color: "#ff5e57",
                                                  background: "white",
                                                  cursor: "pointer",
                                                  border: "1px solid #ff5e57",
                                                  borderRadius: "50%",
                                                  padding: "3px",
                                                }}
                                              />
                                              <span
                                                style={{
                                                  fontSize: "16px",
                                                  fontWeight: "bold",
                                                  color: "#333",
                                                }}
                                              >
                                                {item.count}
                                              </span>
                                              <FaPlus
                                                onClick={() =>
                                                  dispatch(Increasecount(item))
                                                }
                                                style={{
                                                  background: "#65c3db",
                                                  fontSize: "18px",
                                                  color: "#fff",
                                                  cursor: "pointer",
                                                  border: "1px solid #65c3db",
                                                  borderRadius: "50%",
                                                  padding: "3px",
                                                }}
                                              />
                                            </div>
                                            <FaTrash
                                              onClick={() =>
                                                dispatch(
                                                  RemoveItem({
                                                    ...product,
                                                    customization:
                                                      item.customization,
                                                  })
                                                )
                                              }
                                              style={{ color: "red" }}
                                            />
                                          </div>
                                        );
                                      }
                                      return null;
                                    })
                                  ) : (
                                    // Render AddToCartButton if the item doesn't exist in the cart
                                    <AddToCartButton
                                      deal={product}
                                      option={i}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          </>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <h4 className={style.DealNameday}>{product?.name}</h4>

                      <div className={style.dealPrice}>
                        {product.original_price ? (
                          <div className={style.dealPrice}>
                            <span className={style.originalPrice}>
                              QR {product.original_price}
                            </span>
                            <span className={style.discountedPrice}>
                              QR {product.price}
                            </span>
                          </div>
                        ) : (
                          <div className={style.dealPrice}>
                            <span className={style.discountedPrice}>
                              QR {product.price}
                            </span>
                          </div>
                        )}
                      </div>
                      <h4 className={style.dealPrice}>{product?.quantity}</h4>
                      {product.discription &&
                        product.discription !== "undefined" && (
                          <div
                            style={{ textAlign: "left" }}
                            className={style.dealPrice}
                            dangerouslySetInnerHTML={{
                              __html: product.discription
                                .replace(/\r\n/g, "<br />")
                                .replace(/\n/g, "<br />"),
                            }}
                          />
                        )}

                      <div style={{ width: "100%" }}>
                        <div>
                          {cartItems.length > 0 &&
                          cartItems.some(
                            (item) => item?.product_id === product?.product_id
                          ) ? (
                            cartItems.map((item) => {
                              if (item?.product_id === product?.product_id) {
                                return (
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",

                                      gap: "9px",
                                    }}
                                  >
                                    <div
                                      key={item.product_id}
                                      style={
                                        viewportWidth < 500
                                          ? {
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              gap: "10px",
                                              padding: "7px",
                                              border: "1px solid #ccc",
                                              borderRadius: "8px",
                                              backgroundColor: "ffff",
                                              boxShadow:
                                                "0 4px 6px rgba(0, 0, 0, 0.1)",
                                              width: "80px",
                                            }
                                          : {
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              gap: "10px",
                                              padding: "10px",
                                              border: "1px solid #ccc",
                                              borderRadius: "8px",
                                              backgroundColor: "ffff",
                                              boxShadow:
                                                "0 4px 6px rgba(0, 0, 0, 0.1)",
                                              width: "90px",
                                            }
                                      }
                                    >
                                      <FaMinus
                                        onClick={() =>
                                          dispatch(Decreasecount(item))
                                        }
                                        style={{
                                          fontSize: "18px",
                                          color: "#ff5e57",
                                          background: "white",
                                          cursor: "pointer",
                                          border: "1px solid #ff5e57",
                                          borderRadius: "50%",
                                          padding: "3px",
                                        }}
                                      />
                                      <span
                                        style={{
                                          fontSize: "16px",
                                          fontWeight: "bold",
                                          color: "#333",
                                        }}
                                      >
                                        {item.count}
                                      </span>
                                      <FaPlus
                                        onClick={() =>
                                          dispatch(Increasecount(item))
                                        }
                                        style={{
                                          background: "#65c3db",
                                          fontSize: "18px",
                                          color: "#fff",
                                          cursor: "pointer",
                                          border: "1px solid #65c3db",
                                          borderRadius: "50%",
                                          padding: "3px",
                                        }}
                                      />
                                    </div>
                                    <FaTrash
                                      onClick={() =>
                                        dispatch(RemoveItem(product))
                                      }
                                      style={{ color: "red" }}
                                    />
                                  </div>
                                );
                              }
                              return null;
                            })
                          ) : (
                            // Render AddToCartButton if the item doesn't exist in the cart
                            <AddToCartButton deal={product} option={null} />
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="col-12">
                  {releatedproduct.length > 0 && (
                    <div
                      className={style.shopbycategory}
                      style={{ marginBottom: "100px" }}
                    >
                      <h3 className={style.shopbycategoryheading}>
                        Releated products
                      </h3>
                      <div className={style.categoryNavigation}>
                        <div
                          className={style.categoryRow}
                          style={{
                            flexWrap: "wrap",
                          }}
                        >
                          {releatedproduct.map((deal, index) => (
                            <div
                              key={deal.id}
                              className={` ${style.categorybestsellerImage} ${style.dealCard}`}
                              style={{
                                height: "inherit",
                                "--animation-order": index,
                                position: "relative",
                                cursor: "pointer",
                              }}
                              onClick={() => navigate(`/product/${deal.code}`)}
                            >
                              <img
                                className={`${style.categoryImage} `}
                                src={`${baseURL}${deal.image}`}
                                alt={deal.name}
                              />
                              <h2 className={style.DealNameday}>{deal.name}</h2>

                              {deal.original_price ? (
                                <div className={style.dealPrice}>
                                  <span className={style.originalPrice}>
                                    QR {deal.original_price}
                                  </span>
                                  <span className={style.discountedPrice}>
                                    QR {deal.price}
                                  </span>
                                </div>
                              ) : (
                                <div className={style.dealPrice}>
                                  <span className={style.discountedPrice}>
                                    QR {deal.price}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div></div>
                </div>
              </div>
            </div>
          ) : (
            <p>Product not found.</p>
          )}
        </div>
      )}
      <div ref={observerRef} style={{ height: "1px" }}></div>
      <Footer />
    </React.Fragment>
  );
}

export default Product;
