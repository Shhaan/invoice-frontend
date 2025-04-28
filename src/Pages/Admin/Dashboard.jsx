import React, { useEffect, useState } from "react";
import Adminheader from "../../Components/Adminheader/Adminheader";
import Sidebar from "../../Components/Admin/Sidebar";
import style from "../../Main.module.css";
import routes from "../../Functions/routes";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { createAxiosInstanceWithAuth } from "../../Functions/axios";

function Dashboard() {
  const [side, setside] = useState(false);
  const [data, setdata] = useState({});

  useEffect(() => {
    const fetchsale = async () => {
      try {
        const axios = createAxiosInstanceWithAuth();
        const { data } = await axios.get("main/sale-details/");
        setdata({ ...data.message });
      } catch (error) {
        console.error("Failed to fetch sale data", error);
      }
    };
    fetchsale();
  }, []);

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
          className="col-9 col-md-10"
          style={{
            paddingLeft: "40px",
            transition: "margin 0.3s ease",
            margin: "auto",
          }}
        >
          <div>
            <div className={style["dashboard-content-container"]}>
              <div className={style["dashboard-summary-grid"]}>
                <div className={style["dashboard-grid-card"]}>
                  <h3>Total Sales</h3>
                  <p>{data?.total}</p>
                </div>
                <div className={style["dashboard-grid-card"]}>
                  <h3>Total Orders</h3>
                  <p>{data?.count}</p>
                </div>
              </div>
            </div>
          </div>

          <Table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #ddd",
              borderRadius: "8px",
              backgroundColor: "#fff",
            }}
          >
            <Thead style={{ backgroundColor: "#f4f4f4", color: "#333" }}>
              <Tr>
                <Th
                  style={{
                    padding: "12px 18px",
                    textAlign: "left",
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "#4a4a4a",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  Item name
                </Th>

                <Th
                  style={{
                    padding: "12px 18px",
                    textAlign: "left",
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "#4a4a4a",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  Total
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {data?.product_sales?.map((product, index) => (
                <Tr
                  key={index}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff",
                    border: "none",
                  }}
                >
                  <Td
                    style={{
                      padding: "12px 18px",
                      textAlign: "left",
                      fontSize: "16px",
                      borderBottom: "1px solid #ddd",
                      color: "#555",
                    }}
                  >
                    {product.productcustomize__name}
                  </Td>
                  <Td
                    style={{
                      padding: "12px 18px",
                      textAlign: "left",
                      fontSize: "16px",
                      borderBottom: "1px solid #ddd",
                      color: "#555",
                    }}
                  >
                    {product.total_sales}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
