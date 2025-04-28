import React, { useEffect, useState } from "react";
import Adminheader from "../../Components/Adminheader/Adminheader";
import Sidebar from "../../Components/Admin/Sidebar";
import style from "../../Main.module.css";
import {
  axiosInstance,
  axiosInstancemain,
  createAxiosInstanceWithAuth,
} from "../../Functions/axios";
import SearchComponent from "../../Components/Adminheader/SearchComponent";
import routes from "../../Functions/routes";
import { FaEdit, FaEye, FaSearch, FaTrash } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Input, Form } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { addvalue } from "../../redux/prfilter";
import axios from "axios";

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
    const fetchproduct = async () => {
      try {
        const productResponse = await axiosInstance.get(`/invoice/customer/ `, {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        });
        setproduct(productResponse?.data?.results);
        console.log(productResponse?.data);

        setTotalPages(Math.ceil(productResponse.data.count / 40));
      } catch (error) {
        console.log(error);
      }
    };
    fetchproduct();
  }, [value.value, flag]);

  const handleclick = async (page) => {
    try {
      const productResponse = await axiosInstance.get(
        `/invoice/customer/?page=${page}`,
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
      `Do you want   delete the customer the purchase item will be deleted?`
    );

    if (confirmDelete) {
      try {
        const axios = createAxiosInstanceWithAuth();

        const formData = new FormData();
        formData.append("id", id);

        const response = await axios.delete("/invoice/customer/", {
          data: formData,
        });

        if (response.status === 204 || response.status === 200) {
          setflag((e) => !e);

          setTotalPages(Math.ceil(response.data.count / 40));
          toast.success(`The customer is deleted  ${!available}`, 2000);
        }
      } catch (error) {
        toast.error(error.response ? error.response.data.error : error.message);
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
      const response = await axiosInstance.get(
        `/invoice/customer/?search=${searchValue}`,
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
              onClick={() => nav(`/admin/purchase/add`)}
              className={style.orderNowButton}
            >
              Add Purchase
            </button>
          </div>
        </div>

        <div className={style.productListContainer}>
          <div className={style.customerDetails}>
            <br />
            <div className={style.customerinfo}>
              <h2>
                <strong>
                  Credit:
                  {product.reduce((a, c) => {
                    return a + c.credit;
                  }, 0)}
                </strong>
              </h2>
              <h2>
                <strong>
                  Paid:
                  {product.reduce((a, c) => {
                    return a + c.paid;
                  }, 0)}
                </strong>
              </h2>
              <h2>
                <strong>
                  Total:
                  {product.reduce((a, c) => {
                    return a + c.total;
                  }, 0)}
                </strong>
              </h2>
            </div>
          </div>
          {product.map((item) => (
            <div key={item.id} className={`col-12 ${style.productItem}`}>
              <div className={`row w-50`}>
                <span className={`col-12 col-sm-3 ${style.productName}`}>
                  {item.name}
                </span>
                <span className={`col-12 col-sm-3 ${style.productName}`}>
                  Credit: {item.credit}
                </span>
                <span className={`col-12 col-sm-3 ${style.productName}`}>
                  Paid: {item.paid}
                </span>
                <span className={`col-12 col-sm-3 ${style.productName}`}>
                  Total: {item.total}
                </span>
              </div>

              <div className={style.iconContainer}>
                <FaEye
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/admin/purchase/view/${item.id}`)}
                />
                {/* <FaEdit
                  style={{ color: "blue", cursor: "pointer" }}
                  onClick={() => navigate(`/admin/purchase/item/${item.id}`)}
                /> */}
                <FaTrash
                  style={{ color: "red", cursor: "pointer" }}
                  onClick={() => handleDelete(item.id)}
                />
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
