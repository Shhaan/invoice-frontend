import React, { useEffect, useState } from "react";
import style from "../../Main.module.css";
import { FaSearch } from "react-icons/fa";
import { axiosInstancemain } from "../../Functions/axios";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";

function SearchComponent({
  setitem,
  name,
  navigate,
  api,
  setcount,
  setcurrent,
  type,
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const nav = useNavigate();

  const searchValue = searchParams.get("search") || "";
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
  useEffect(() => {
    const fetchsearch = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axiosInstancemain.get(
          `${api}/?search=${searchValue}`,
          { headers: { Authorization: `Token ${token}` } }
        );
        if (response.status === 200) {
          setitem(response.data.results);
          setcount(Math.ceil(response.data.count / 40));
          setcurrent(1);
        }
      } catch (error) {
        setitem([]);
        toast.error(error?.response?.data?.message || "An error occurred", {
          duration: 3000,
        });
      }
    };
    fetchsearch();
  }, [searchValue]);

  return (
    <div className={style.searchmaindiv}>
      <form>
        <input
          className={style.searchinp}
          type={type ? type : "search"}
          value={searchValue}
          style={viewportWidth < 400 ? { width: "125px", height: "33px" } : {}}
          onChange={(e) => setSearchParams({ search: e.target.value })}
        />
        <FaSearch />
      </form>
      <div>
        <button
          style={
            viewportWidth < 453
              ? { fontSize: "8px", width: "105px", height: "33px", margin: 0 }
              : { margin: 0 }
          }
          onClick={() => nav(`${navigate}`)}
          className={style.orderNowButton}
        >
          Add {name}
        </button>
      </div>
    </div>
  );
}

export default SearchComponent;
