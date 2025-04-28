import React, { useEffect, useState } from "react";
import Adminheader from "../../Components/Adminheader/Adminheader";
import Sidebar from "../../Components/Admin/Sidebar";
import style from "../../Main.module.css";
import {
  axiosInstancemain,
  createAxiosInstanceWithAuth,
} from "../../Functions/axios";
import SearchComponent from "../../Components/Adminheader/SearchComponent";
import routes from "../../Functions/routes";
import { FaEdit, FaSearch, FaTrash } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Input, Form } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { addvalue } from "../../redux/prfilter";

function Dashboard() {
  const value = useSelector((state) => state.prfilter); // Safe handling
  console.log("value:", value);

  const dispatch = useDispatch();

  const [side, setside] = useState(false);
  const [product, setproduct] = useState([]);

  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [category, setCategories] = useState([]);

  const [searchParams, setSearchParams] = useSearchParams();
  const nav = useNavigate();
  const [flag, setflag] = useState(false);
  const searchValue = searchParams.get("search") || "";
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

  const navigate = useNavigate();
  useEffect(() => {
    console.log(value);

    const fetchproduct = async () => {
      try {
        const productResponse = await axiosInstancemain.get(
          `/products/?category=${value.value} `,
          {
            headers: {
              Authorization: `Token ${localStorage.getItem("token")}`,
            },
          }
        );
        setproduct(productResponse?.data?.results);
        console.log(productResponse?.data);

        setTotalPages(Math.ceil(productResponse.data.count / 40));
      } catch (error) {
        console.log(error);
      }
    };
    fetchproduct();
  }, [value.value, flag]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstancemain.get("/category/", {
          headers: { Authorization: `Token ${localStorage.getItem("token")}` },
        });
        setCategories(response?.data?.message);
      } catch (error) {
        toast.error(error?.response?.data?.message);
      }
    };
    fetchCategories();
  }, []);

  const handleclick = async (page) => {
    try {
      const productResponse = await axiosInstancemain.get(
        `/products?page=${page}`,
        { headers: { Authorization: `Token ${localStorage.getItem("token")}` } }
      );

      setproduct(productResponse?.data?.results);
      setCurrentPage(page);
      setTotalPages(Math.ceil(productResponse.data.count / 40));
    } catch (error) {
      console.log(error);
    }
  };
  const handleDelete = async (id, available) => {
    const confirmDelete = window.confirm(
      `Do you want  to Change the product availablity to ${!available}?`
    );

    if (confirmDelete) {
      try {
        const axios = createAxiosInstanceWithAuth();

        const formData = new FormData();
        formData.append("id", id);

        const response = await axios.delete("main/products/", {
          data: formData,
        });

        if (response.status === 204 || response.status === 200) {
          setflag((e) => !e);

          setTotalPages(Math.ceil(response.data.count / 40));
          toast.success(`Product availablity Changed  to ${!available}`, 2000);
        }
      } catch (error) {
        toast.error(
          error.response
            ? error.response.data.error + "  Check the availablity of category"
            : error.message
        );
        return;
      }
    } else {
      toast("Deletion cancelled");
    }
  };

  const fetchsearch = async (e) => {
    dispatch(addvalue({ value: "" }));
    setSearchParams({ search: e.target.value });
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstancemain.get(
        `/products/?search=${searchValue}`,
        { headers: { Authorization: `Token ${token}` } }
      );
      if (response.status === 200) {
        setproduct(response?.data?.results);

        setTotalPages(Math.ceil(response.data.count / 40));
      }
    } catch (error) {
      setproduct([]);
      toast.error(error?.response?.data?.message || "An error occurred", {
        duration: 3000,
      });
    }
  };

  return (
    <div>
      <Adminheader isAdmin={true} side={side} setside={setside} />
      <div className={style.adminflexdiv}>
        <div
          className={`col-4 col-md-2 ${
            side ? style.adminsidebar : `${style.adminsidebar} ${style.closed}`
          }`}
        >
          <Sidebar side={side} props={routes} />
        </div>

        <div className={style.searchmaindiv}>
          <form>
            <input
              className={style.searchinp}
              value={searchValue}
              style={
                viewportWidth < 400 ? { width: "125px", height: "33px" } : {}
              }
              onChange={(e) => fetchsearch(e)}
            />
            <FaSearch />
          </form>
          <div>
            <button
              style={
                viewportWidth < 453
                  ? {
                      fontSize: "8px",
                      width: "105px",
                      height: "33px",
                      margin: 0,
                    }
                  : { margin: 0 }
              }
              onClick={() => nav(`/admin/product/add`)}
              className={style.orderNowButton}
            >
              Add Product
            </button>
          </div>
        </div>

        <div className={style.productfilters}>
          <select
            value={value.value} // Set the current value from Redux state
            onChange={(e) => dispatch(addvalue({ value: e.target.value }))} // Dispatch action on change
            className={style.customSelect}
          >
            <option value="">All product</option>
            {category.map((i) => (
              <option key={i.name} value={i.name}>
                {i.name}
              </option>
            ))}
          </select>
        </div>
        <div className={style.productListContainer}>
          {product.map((item) => (
            <div key={item.id} className={`col-12 ${style.productItem}`}>
              <span className={style.productName}>
                {item.name} ({item.code})
              </span>
              <div className={style.iconContainer}>
                <FaEdit
                  style={{ color: "blue", cursor: "pointer" }}
                  onClick={() =>
                    navigate(`/admin/product/edit/${item.product_id}`)
                  }
                />

                <Form.Item name="is_available" style={{ marginBottom: 0 }}>
                  <label className={style.switch}>
                    <Input
                      type="checkbox"
                      checked={item?.is_available}
                      value={item?.is_available}
                      onClick={() =>
                        handleDelete(item.product_id, item.is_available)
                      }
                    />
                    <span className={style.slider}></span>
                  </label>
                </Form.Item>
              </div>
            </div>
          ))}
        </div>
        <div className={style.pagination}>
          <button
            disabled={currentPage === 1}
            onClick={() => handleclick(currentPage - 1)}
            className={style.paginationButton}
          >
            Previous
          </button>
          <span
            className={style.pageInfo}
          >{`Page ${currentPage} of ${totalPages}`}</span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => handleclick(currentPage + 1)}
            className={style.paginationButton}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
