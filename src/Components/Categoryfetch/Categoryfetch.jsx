import React, { useState, useEffect, useContext } from "react";
import { axiosInstancemain } from "../../Functions/axios";
import style from "../../Main.module.css";
import { baseURL } from "../../Functions/axios";
import toast from "react-hot-toast";
import { CartContext } from "../../App";
import { useNavigate, useParams } from "react-router-dom";
import { FaHome } from "react-icons/fa";
const Categoryfetch = () => {
  const [categories, setCategories] = useState([]);
  const { isCart, setIsCart } = useContext(CartContext);
  const { id } = useParams();

  const navigate = useNavigate();
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstancemain.get("/category/");
        setCategories(response?.data?.message);
        console.log(response?.data?.message);
      } catch (error) {
        toast.error(error?.response?.data?.message);
      }
    };
    fetchCategories();
  }, []);

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
  return (
    <div onClick={() => setIsCart(false)} className={style.categorylistmaindiv}>
      <div
        onClick={() => navigate(`/`)}
        style={{ color: "white", marginRight: "10px" }}
        className={style.categoryfetchsubdiv}
      >
        <FaHome />
      </div>
      {categories.map((category, index) => (
        <React.Fragment key={category._id}>
          <div
            onClick={() => navigate(`/category/${category.name}`)}
            className={style.categoryfetchsubdiv}
            style={
              category.name === id
                ? {
                    backgroundColor: "rgb(118, 197, 217)",
                    borderRadius: "10px",
                  }
                : {}
            }
          >
            <div
              style={viewportWidth < 400 ? { fontSize: "13px" } : {}}
              className={style.categoryfetchname}
            >
              {category.name}
            </div>
            <div>
              <img
                style={
                  viewportWidth < 400 ? { width: "34px", height: "35px" } : {}
                }
                className={style.categorylistimg}
                src={`${baseURL}${category.image}`}
                alt={category.name}
              />
            </div>
          </div>
          {index < categories.length - 1 && (
            <hr
              style={{
                border: "2px solid #ffffff",
                width: "2px",
                margin: "15px",
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Categoryfetch;
