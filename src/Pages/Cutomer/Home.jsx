import React, { useEffect, useState, useRef, useContext } from "react";
import Adminheader from "../../Components/Adminheader/Adminheader";
import Footer from "../../Components/Footer/Footer";
import Categoryfetch from "../../Components/Categoryfetch/Categoryfetch";
import Carousel from "../../Components/Home/Carousel";
import style from "../../Main.module.css";
import { axiosInstancemain, baseURL } from "../../Functions/axios";
import toast from "react-hot-toast";

import { useNavigate } from "react-router-dom";
import { PuffLoader } from "react-spinners";
const Home = () => {
  const [categories, setCategories] = useState([]);
  const [deals, setDeals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const navigate = useNavigate();
  const [load, setload] = useState(false);
  const categoryRowRef = useRef(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResponse, dealsResponse, bestSellersResponse] =
          await Promise.all([
            axiosInstancemain.get("/category/"),
            axiosInstancemain.get("/deal/"),
            axiosInstancemain.get("/best-seller/"),
          ]);

        // Assuming no need to handle categories as you did not set them in state
        setCategories(categoriesResponse?.data?.message);

        setDeals(dealsResponse?.data?.message);
        setBestSellers(bestSellersResponse?.data?.message);

        setload(true); // Set loading state after all calls are successful
      } catch (error) {
        toast.error(error?.response?.data?.message);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <div className={style.mainheader}>
        <div style={{ position: "fixed", zIndex: 2, width: "100%" }}>
          <Adminheader isAdmin={false} />
          <Categoryfetch />
        </div>
      </div>
      <Carousel />

      {!load ? (
        <div
          style={{ display: "flex", justifyContent: "center", height: "100vh" }}
        >
          <PuffLoader size={60} color="#b64d11" />
        </div>
      ) : (
        <div>
          <div className={style.shopbycategory}>
            <h1 className={style.shopbycategoryheading}>Shop by Category</h1>
            <div className={style.categoryNavigation}>
              <div
                className={style.categoryRow}
                style={{ overflow: "auto" }}
                ref={categoryRowRef}
              >
                {categories.map((category, index) => (
                  <div
                    onClick={() => navigate(`/category/${category.name}`)}
                    key={category.id}
                    className={style.categoryCard}
                    style={{ "--animation-order": index, cursor: "pointer" }}
                  >
                    <img
                      className={style.categoryImage}
                      src={`${baseURL}${category.image}`}
                      alt={category.name}
                    />
                    <h2 className={style.categoryName}>{category.name}</h2>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {deals.length > 0 && (
            <div
              className={style.shopbycategory}
              style={{ marginBottom: "10px", background: "rgb(218 241 241)" }}
            >
              <h1 className={style.shopbycategoryheading}>Deals of the Day</h1>
              <div className={style.categoryNavigation}>
                <div
                  className={style.categoryRow}
                  style={{ overflow: "auto" }}
                  ref={categoryRowRef}
                >
                  {deals.map((deal, index) => (
                    <div
                      key={deal.id}
                      className={style.dealCard}
                      style={{
                        "--animation-order": index,
                        position: "relative",
                        cursor: "pointer",
                      }}
                      onClick={() => navigate(`/product/${deal.code}`)}
                    >
                      <img
                        className={style.categoryImage}
                        src={`${baseURL}${deal.image}`}
                        alt={deal.name}
                      />
                      <h2 className={style.DealNameday}>{deal.name}</h2>

                      <p className={style.bestpriceseller}>{deal.quantity}</p>
                      <div className={style.dealPrice}>
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
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {bestSellers.length > 0 && (
            <div
              className={style.shopbycategory}
              style={{ marginBottom: "100px" }}
            >
              <h1 className={style.shopbycategoryheading}>Best seller</h1>
              <div className={style.categoryNavigation}>
                <div
                  className={style.categoryRow}
                  style={{
                    flexWrap: "wrap",
                    gap: "45px",
                    justifyContent: "center",
                  }}
                  ref={categoryRowRef}
                >
                  {bestSellers.map((deal, index) => (
                    <div
                      key={deal.id}
                      className={` ${style.categorybestsellerImage} ${style.dealCard}`}
                      style={{
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
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <Footer />
    </>
  );
};

export default Home;
