import React, { useEffect, useState } from "react";
import Adminheader from "../../Components/Adminheader/Adminheader";
import Sidebar from "../../Components/Admin/Sidebar";
import style from "../../Main.module.css";
import routes from "../../Functions/routes";
import SearchComponent from "../../Components/Adminheader/SearchComponent";
import {
  axiosInstancemain,
  createAxiosInstanceWithAuth,
} from "../../Functions/axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Form, Input } from "antd";
function Dashboard() {
  const [side, setside] = useState(false);

  const [deal, setdeal] = useState([]);
  const navigate = useNavigate();
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchdeal = async () => {
      const token = localStorage.getItem("token");
      try {
        const productResponse = await axiosInstancemain.get(
          `/dealofday-pagignated/ `,
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );
        setdeal(productResponse?.data?.results);
        console.log(productResponse);

        setTotalPages(Math.ceil(productResponse.data.count / 40));
      } catch (error) {
        console.log(error);
      }
    };
    fetchdeal();
  }, []);
  const handleclick = async (page) => {
    try {
      const Response = await axiosInstancemain.get(
        `/dealofday-pagignated/?page=${page} `,
        { headers: { Authorization: `Token ${localStorage.getItem("token")}` } }
      );
      setdeal(Response?.data?.results);
      setCurrentPage(page);
      setTotalPages(Math.ceil(Response.data.count / 40));
    } catch (error) {
      console.log(error);
    }
  };
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this Deal?"
    );

    if (confirmDelete) {
      try {
        const axios = createAxiosInstanceWithAuth();

        const formData = new FormData();
        formData.append("id", id);

        const response = await axios.delete("main/deal/", {
          data: formData,
        });

        if (response.status === 204 || response.status === 200) {
          setdeal(response?.data?.results);
          setTotalPages(Math.ceil(response.data.count / 40));
          toast.success("Deal  deleted successfully!");
        }
      } catch (error) {
        console.error(error.response ? error.response.data : error.message);
      }
    } else {
      toast("Deletion cancelled");
    }
  };

  const handleavailablity = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure to change  the availablity of  Deal?"
    );

    if (confirmDelete) {
      try {
        const axios = createAxiosInstanceWithAuth();

        const formData = new FormData();

        const response = await axios.patch("main/deal/", {
          data: { id },
        });

        if (response.status === 204 || response.status === 200) {
          setdeal(response?.data?.results);
          setTotalPages(Math.ceil(response.data.count / 40));
          toast.success("Deal status changed successfully!");
        }
      } catch (error) {
        console.error(error.response ? error.response.data : error.message);
      }
    } else {
      toast("cancelled");
    }
  };

  return (
    <div>
      <Adminheader isAdmin={true} side={side} setside={setside} />

      <div className={style.adminflexdiv}>
        {" "}
        <div
          className={`col-4 col-md-2 ${
            side ? style.adminsidebar : `${style.adminsidebar} ${style.closed}`
          }`}
        >
          <Sidebar side={side} props={routes} />
        </div>
        <SearchComponent
          setitem={setdeal}
          name={"Deal  "}
          api={"/dealofday-pagignated"}
          navigate={"/admin/deal-of-day/add"}
          setcount={setTotalPages}
          setcurrent={setCurrentPage}
        />
        <div className={style.productListContainer}>
          {deal?.map((item) => (
            <div key={item.id} className={`col-12 ${style.productItem}`}>
              <span className={style.productName}>
                {item?.name} ({item?.code})
              </span>

              {item?.original_price ? (
                <div style={{ padding: 0 }} className={style.bestpriceseller}>
                  <span
                    style={{ marginRight: "6px" }}
                    className={style.originalPrice}
                  >
                    QR{item?.original_price}
                  </span>
                  <span className={style.discountedPrice}>QR{item?.price}</span>
                </div>
              ) : (
                <span id={style.bestpricesellerog}>QR{item?.price}</span>
              )}

              <div className={style.iconContainer}>
                <Form.Item name="is_available" style={{ marginBottom: 0 }}>
                  <label className={style.switch}>
                    <Input
                      type="checkbox"
                      checked={item?.is_available}
                      value={item?.is_available}
                      onClick={() => handleavailablity(item.id)}
                    />
                    <span className={style.slider}></span>
                  </label>
                </Form.Item>
                <FaEdit
                  style={{ color: "blue", cursor: "pointer" }}
                  onClick={() => navigate(`/admin/deal-of-day/edit/${item.id}`)}
                />
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
