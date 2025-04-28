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
import { FaEdit } from "react-icons/fa";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Input, Form } from "antd";

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
          `/category-pagignated/ `,
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );
        console.log(productResponse);

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
        `/category-pagignated/?page=${page} `,
        { headers: { Authorization: `Token ${localStorage.getItem("token")}` } }
      );

      setdeal(Response?.data?.results);
      setCurrentPage(page);
      setTotalPages(Math.ceil(Response.data.count / 40));
    } catch (error) {
      console.log(error);
    }
  };
  const handleDelete = async (id, status) => {
    let confirmDelete;
    if (status == true) {
      confirmDelete = window.confirm(
        "Are you sure to change the availablity to false the product status will be changed?"
      );
    } else {
      confirmDelete = window.confirm(
        "Are you sure to change availablity to true?"
      );
    }

    if (confirmDelete) {
      try {
        const axios = createAxiosInstanceWithAuth();

        const formData = new FormData();
        formData.append("id", id);

        const response = await axios.delete("main/category/", {
          data: formData,
        });

        if (response.status === 204 || response.status === 200) {
          setdeal(response?.data?.results);
          setTotalPages(Math.ceil(response.data.count / 40));
          toast.success("category  availablity changed successfully!");
        }
      } catch (error) {
        console.error(error.response ? error.response.data : error.message);
      }
    } else {
      toast("Deletion cancelled");
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
          name={"Category"}
          api={"/category-pagignated"}
          navigate={"/admin/category/add"}
          setcount={setTotalPages}
          setcurrent={setCurrentPage}
        />
        <div className={style.productListContainer}>
          {deal.map((item) => (
            <div key={item.id} className={`col-12 ${style.productItem}`}>
              <span className={style.productName}>{item?.name}</span>

              <div className={style.iconContainer}>
                <FaEdit
                  style={{ color: "blue", cursor: "pointer" }}
                  onClick={() => navigate(`/admin/category/edit/${item.id}`)}
                />

                <Form.Item name="is_available" style={{ marginBottom: 0 }}>
                  <label className={style.switch}>
                    <Input
                      type="checkbox"
                      checked={item?.is_available}
                      value={item?.is_available || false}
                      onClick={() => handleDelete(item.id, item.is_available)}
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
