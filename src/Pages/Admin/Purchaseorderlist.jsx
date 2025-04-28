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
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Input, Form, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { addvalue } from "../../redux/prfilter";
import axios from "axios";

function Dashboard() {
  const value = useSelector((state) => state.prfilter); // Safe handling

  const [side, setside] = useState(false);
  const [product, setproduct] = useState([]);

  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchParams, setSearchParams] = useSearchParams();
  const nav = useNavigate();
  const searchValue = searchParams.get("search") || "";
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState(null); // Holds the invoice data
  const [loading, setLoading] = useState(true); // Loading state

  const { id } = useParams();

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axiosInstance.get(
          "/invoice/customer-mainitem/",
          {
            headers: { Authorization: `Token ${token}` },
            params: { id },
          }
        );
        setproduct(response?.data?.results);
        if (response?.data?.count == 0) {
          toast.error("No item available for customer");
          navigate("/admin/purchase");
        }

        console.log(response);

        setTotalPages(Math.ceil(response.data.count / 40));
      } catch (error) {
        console.error(error);
        message.error("Failed to fetch invoice data");
      } finally {
        setLoading(false); // Set loading to false once data fetching is complete
      }
    };

    fetchCategory();

    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [id]);

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
              onChange={(e) => e}
            />
            <FaSearch />
          </form>
        </div>

        <div className={style.productListContainer}>
          {product.map((item) => (
            <div key={item.id} className={`col-12 ${style.productItem}`}>
              <div>
                <span className={`me-4 ${style.productName}`}>{item.name}</span>
                <span className={`me-4 ${style.productName}`}>
                  {item.created_at}
                </span>
                <span className={`me-4 ${style.productName}`}>
                  Total: {item.total}
                </span>
                <span className={`me-4 ${style.productName}`}>
                  credit: {item.credit}
                </span>
              </div>
              <div className={style.iconContainer}>
                <FaEdit
                  style={{ color: "blue", cursor: "pointer" }}
                  onClick={() => navigate(`/admin/purchase/edit/${item.id}`)}
                />
                <FaTrash style={{ color: "red", cursor: "pointer" }} />
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
