import React, { useEffect, useState } from "react";
import Adminheader from "../../Components/Adminheader/Adminheader";
import Sidebar from "../../Components/Admin/Sidebar";
import style from "../../Main.module.css";
import {
  axiosInstancemain,
  baseURL,
  createAxiosInstanceWithAuth,
} from "../../Functions/axios";
import SearchComponent from "../../Components/Adminheader/SearchComponent";
import routes from "../../Functions/routes";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Input, Form } from "antd";
function Dashboard() {
  const [side, setside] = useState(false);
  const [product, setproduct] = useState([]);

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
  const navigate = useNavigate();
  useEffect(() => {
    const fetchproduct = async () => {
      try {
        const { data } = await axiosInstancemain.get(`carousel/ `);
        setproduct(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchproduct();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      `Do you want  to delete the carousel item ?`
    );

    if (confirmDelete) {
      try {
        const axios = createAxiosInstanceWithAuth();

        const formData = new FormData();
        formData.append("id", id);

        const data = await axios.delete("main/carousel/", {
          data: formData,
        });

        if (data.status === 204 || data.status === 200) {
          setproduct(data.data?.message);
          toast.success("Item deleted", 2000);
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      toast("Deletion cancelled");
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

        <div
          style={{ marginTop: "13px", textAlign: "end", paddingRight: "65px" }}
        >
          <button
            onClick={() => navigate("/admin/carousel/add")}
            style={
              viewportWidth < 453
                ? { fontSize: "8px", width: "105px", height: "33px", margin: 0 }
                : { margin: 0 }
            }
            className={style.orderNowButton}
          >
            Add Carousel
          </button>
        </div>
        <div className={style.productListContainer}>
          {product.map((item) => (
            <div key={item.id} className={`col-12 ${style.productItem}`}>
              <img
                src={baseURL + item.image}
                style={{ height: "32px", width: "45px" }}
                alt=""
              />
              <div className={style.iconContainer}>
                <FaTrash
                  style={{ color: "red", cursor: "pointer" }}
                  onClick={() => handleDelete(item.id)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
