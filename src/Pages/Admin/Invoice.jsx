import React, { useEffect, useState } from "react";
import Adminheader from "../../Components/Adminheader/Adminheader";
import Sidebar from "../../Components/Admin/Sidebar";
import style from "../../Main.module.css";
import {
  axiosInstance,
  createAxiosInstanceWithAuth,
} from "../../Functions/axios";
import SearchComponent from "../../Components/Adminheader/SearchComponent";
import routes from "../../Functions/routes";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

function Dashboard() {
  const [side, setside] = useState(false);
  const [product, setproduct] = useState([]);

  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [datec, setdatec] = useState("");

  const navigate = useNavigate();

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
    const fetchproduct = async () => {
      try {
        const axios = createAxiosInstanceWithAuth();
        const productResponse = await axios.get(`main/invoice/`);
        setproduct(productResponse?.data?.results);
        setdatec(productResponse?.data?.results[0].created_at);
        setTotalPages(Math.ceil(productResponse.data.count / 40));
      } catch (error) {
        console.log(error);
      }
    };
    fetchproduct();
  }, []);
  const handleclick = async (page) => {
    try {
      const axios = createAxiosInstanceWithAuth();
      const productResponse = await axios.get(`main/invoice/?page=${page} `);
      setproduct(productResponse?.data?.results);
      setdatec(productResponse?.data?.results[0].created_at);

      setCurrentPage(page);
      setTotalPages(Math.ceil(productResponse.data.count / 40));
    } catch (error) {
      console.log(error);
    }
  };
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this invoice?"
    );

    if (confirmDelete) {
      try {
        const axios = createAxiosInstanceWithAuth();

        const formData = new FormData();
        formData.append("id", id);

        const response = await axios.delete("main/invoice/", {
          data: formData,
        });

        if (response.status === 204 || response.status === 200) {
          setproduct(response?.data?.results);
          setTotalPages(Math.ceil(response.data.count / 40));
          toast.success("Inoice deleted successfully!");
        }
      } catch (error) {
        console.error(error.response ? error.response.data : error.message);
      }
    } else {
      toast("Deletion cancelled");
    }
  };

  const hanldekichenpdfclick = async (id) => {
    try {
      const response = await axiosInstance.get(
        `invoice/generatethermal-kichen-pdf/${id}/`,
        {
          headers: { Authorization: `Token ${localStorage.getItem("token")}` },
        }
      );

      if (response.status === 200) {
        const message = response?.data?.message;

        // Create receipt content
        const receiptWindow = window.open("", "PRINT", "height=600,width=400");

        if (receiptWindow) {
          receiptWindow.document.write(`
            <html>
            <head>
              <title>Kitchen Receipt</title>
              <style>
                body {
                  font-family: monospace;
                  font-size: 12px;
                  padding: 10px;
                  width: 280px;
                }
                .center {
                  text-align: center;
                  font-weight: bold;
                }
                .line {
                  border-top: 1px dashed #000;
                  margin: 5px 0;
                }
                table {
                  width: 100%;
                  font-size: 12px;
                  border-collapse: collapse;
                }
                th, td {
                  padding: 2px 0;
                }
                td:last-child {
                  text-align: right;
                }
              </style>
            </head>
            <body>
              <div class="center">KITCHEN ORDER</div>
              <div class="line"></div>
              <p><strong>Order:</strong> ${message?.id}</p>
              <p><strong>Time:</strong> ${message?.created_at}</p>
              <p><strong>Counter:</strong> CASH COUNTER</p>
              <p><strong>Order Type:</strong> ${
                message?.is_delivery ? "Delivery" : "Take Away"
              }</p>
              <div class="line"></div>
              <table>
                <thead>
                  <tr><th>Item</th><th>Qty</th></tr>
                </thead>
                <tbody>
                  ${message?.items
                    ?.map(
                      (item) => `
                    <tr>
                      <td>${item.name}</td>
                      <td>${item.quantity}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
              <div class="line"></div>
              ${
                message?.is_delivery
                  ? `
                <p><strong>Delivery Address:</strong></p>
                <p>${message.building}, ${message.Street}, Zone ${message.Zone}</p>
                <p><strong>Time Slot:</strong> ${message.time_slot}</p>
                <div class="line"></div>
              `
                  : ""
              }
              <div class="center">Thank you!</div>
            </body>
            </html>
          `);

          receiptWindow.document.close();
          receiptWindow.focus();

          receiptWindow.print();
          receiptWindow.close();

          toast.success("Print successfully");
        } else {
          toast.error("Popup blocked. Please allow popups.");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to print");
    }
  };

  const hanldepdfclick = async (id) => {
    try {
      const response = await axiosInstance.get(
        `invoice/generatethermal-kichen-pdf/${id}/`,
        {
          headers: { Authorization: `Token ${localStorage.getItem("token")}` },
        }
      );

      if (response.status == 200) {
        try {
          const payload = {
            message: response?.data?.message, // Replace with your actual data structure
          };

          const a = await axios.post(
            "https://127.0.0.1:8000/invoice/",
            payload,
            {
              headers: {
                "Content-Type": "application/json", // Explicitly set the content type
              },
            }
          );

          if (a.status === 200) {
            toast.success("Print successfully");
          }
        } catch (error) {
          console.error("Error:", error);
          toast.error("Failed to print");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handlecash = async () => {
    try {
      const a = await axios.get(
        "https://127.0.0.1:8000/cashdrawer/",

        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (a.status === 200) {
        toast.success("Cash counter opend succesfully");
      }
    } catch (error) {
      toast.error("Failed to open counter");
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

        <SearchComponent
          setitem={setproduct}
          name={"Invoice"}
          api={"/invoice"}
          navigate={"/admin"}
          setcount={setTotalPages}
          setcurrent={setCurrentPage}
        />
        <div
          style={{
            textAlign: "end",
            marginRight: "20px",
          }}
        >
          <button
            style={
              viewportWidth < 453
                ? { fontSize: "7px", width: "90px", height: "26px", margin: 0 }
                : { margin: 0 }
            }
            onClick={handlecash}
            className={style.counterb}
          >
            Open counter
          </button>
        </div>

        <div className={style.productListContainer}>
          {product &&
            product.map((item) => (
              <div key={item.id} className={`col-12 ${style.productItem}`}>
                <div>
                  <span className={`me-4 ${style.productName}`}>
                    # {item.id}
                  </span>
                  <span className={`me-4 ${style.productName}`}>
                    {item.created_at}
                  </span>
                  <span className={style.productName}>QR: {item.total}</span>
                </div>

                <div className={style.iconContainer}>
                  <button
                    style={viewportWidth < 453 ? { fontSize: "10px" } : {}}
                    className={style.buttoninvoicegen}
                    onClick={() => hanldepdfclick(item.id)}
                  >
                    Generate invoice
                  </button>

                  <button
                    style={viewportWidth < 453 ? { fontSize: "10px" } : {}}
                    className={style.buttoninvoicegen}
                    onClick={() => hanldekichenpdfclick(item.id)}
                  >
                    Kichen invoice
                  </button>

                  <FaEdit
                    style={{ color: "blue", cursor: "pointer" }}
                    onClick={() => navigate(`/admin/invoice/edit/${item.id}`)}
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
