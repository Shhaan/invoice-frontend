import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Adminheader from "../../Components/Adminheader/Adminheader";
import Categoryfetch from "../../Components/Categoryfetch/Categoryfetch";
import Footer from "../../Components/Footer/Footer";
import { axiosInstancemain } from "../../Functions/axios";
import style from "../../Main.module.css";
import { baseURL } from "../../Functions/axios";
import toast from "react-hot-toast";
import { PuffLoader } from "react-spinners";
import { FaSearch } from "react-icons/fa";

export const Categoryproduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState([]);
  const [nextpage, setNextPage] = useState(null);
  const [category, setCategory] = useState({});
  const variable = [{ All: 1 }, { Kg: 2 }, { Piece: 3 }];
  const [selected, setSelected] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isPiece, setIsPiece] = useState(null);

  const observerRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchValue = searchParams.get("search") || "";

  useEffect(() => {
    const fetchInitialData = async () => {
      setSelected(1);

      setIsPiece(null);

      try {
        setLoading(true);
        setProduct([]);

        const productResponse = await axiosInstancemain.get(
          `/products/?category=${id}`
        );
        setProduct(productResponse?.data?.results || []);
        setNextPage(productResponse?.data?.next);

        const categoryResponse = await axiosInstancemain.get(
          `/category/?name=${id}`
        );
        setCategory(categoryResponse?.data?.message);
      } catch (error) {
        handleError(error, navigate);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id, navigate]);

  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [viewportheight, setviewportheight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
      setviewportheight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const loadMoreProducts = async () => {
    if (!nextpage || loading) return;

    setLoading(true);

    try {
      const response = await axiosInstancemain.get(nextpage);
      setProduct((prevProducts) => [...prevProducts, ...response.data.results]);
      setNextPage(response.data.next);
    } catch (error) {
      toast.error(error?.response?.data || "Error loading more products", 2000);
    } finally {
      setLoading(false);
    }
  };

  // Handle category filtering based on piece type
  const handleClick = async (objValue) => {
    setSelected(Object.values(objValue)[0]);
    const key = Object.keys(objValue)[0];

    const isPieceValue = key === "Piece" ? true : key === "Kg" ? false : null;
    setIsPiece(isPieceValue);

    fetchProducts(isPieceValue);
  };

  // Fetch filtered products based on isPiece and searchValue
  const fetchProducts = async (isPieceFilter) => {
    try {
      setLoading(true);
      const url = `/products/?category=${id}&search=${searchValue}${
        isPieceFilter !== null ? `&is_piece=${isPieceFilter}` : ""
      }`;
      const productResponse = await axiosInstancemain.get(url);
      setProduct(productResponse?.data?.results || []);
      setNextPage(productResponse?.data?.next);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Search products based on searchValue and isPiece
  useEffect(() => {
    fetchProducts(isPiece);
  }, [id, searchValue, isPiece]);

  // IntersectionObserver to load more products
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextpage && !searchValue) {
          loadMoreProducts();
        }
      },
      { threshold: 1 }
    );

    if (observerRef.current) observer.observe(observerRef.current);

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [nextpage, loading, searchValue]);

  // Error handling
  const handleError = (error, navigateFn) => {
    if (error?.response?.status === 404) {
      setProduct([]);
      if (navigateFn) navigateFn("/");
    } else {
      toast.error(error?.response?.data?.message || "An error occurred", 2000);
    }
  };

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
          padding: "4px",
        }}
      >
        <form>
          <input
            className={style.searchinp}
            type={"search"}
            style={
              viewportWidth < 600
                ? { width: "95px", height: "30px", marginLeft: "4px" }
                : {}
            }
            value={searchValue}
            onChange={(e) => setSearchParams({ search: e.target.value })}
          />
          <FaSearch />
        </form>

        {category?.as_piece && (
          <div style={{ textAlign: "end" }}>
            {variable.map((obj, index) => (
              <button
                key={index}
                style={
                  viewportWidth < 600
                    ? { width: "50px", fontSize: "8px", padding: "4px 14px" }
                    : {}
                }
                className={`${style.filtercatbutton} ms-2 ${
                  selected === Object.values(obj)[0]
                    ? style.filtercatbuttonselect
                    : ""
                }`}
                onClick={() => handleClick(obj)}
              >
                {Object.keys(obj)[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div
          style={{ display: "flex", justifyContent: "center", height: "100vh" }}
        >
          <PuffLoader size={60} color="#b64d11" />
        </div>
      ) : (
        <div
          style={
            product.length <= 2 || product.length >= 1
              ? {
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  marginTop: "23px",
                  marginLeft: "25px",
                  gap: "50px",
                  marginBottom: "100px",
                }
              : {
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  marginTop: "23px",
                  marginLeft: "25px",
                  gap: "50px",
                  marginBottom: "200px",
                }
          }
        >
          <div className={style.shopbycategory} style={{ margin: "0" }}>
            <div className={style.categoryNavigation}>
              <div
                className={style.categoryRow}
                style={{ flexWrap: "wrap", gap: "48px" }}
              >
                {product.length > 0 ? (
                  product.map((deal, index) => (
                    <div
                      key={deal.id}
                      className={`${style.categorybestsellerImage} ${style.dealCard}`}
                      style={{
                        "--animation-order": index,
                        position: "relative",
                        cursor: "pointer",
                      }}
                      onClick={() => navigate(`/product/${deal.code}`)}
                    >
                      <img
                        className={`${style.categoryImage}`}
                        src={`${baseURL}${deal.image}`}
                        alt={deal.name}
                      />
                      <h2 className={style.DealNameday}>{deal.name}</h2>
                      <p className={style.bestpriceseller}>{deal.quantity}</p>

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
                  ))
                ) : (
                  <div style={{ margin: "auto", height: "100vh" }}>
                    No Item Found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={observerRef} style={{ height: "1px" }}></div>
      <Footer />
    </React.Fragment>
  );
};
