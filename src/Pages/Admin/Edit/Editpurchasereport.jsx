import React, { useEffect, useState } from "react";
import Adminheader from "../../../Components/Adminheader/Adminheader";
import Sidebar from "../../../Components/Admin/Sidebar";
import style from "../../../Main.module.css";
import routes from "../../../Functions/routes";
import { Table, Spin, message, Popconfirm } from "antd";
import { axiosInstance } from "../../../Functions/axios";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import InfiniteScroll from "react-infinite-scroll-component";
import dayjs from "dayjs";

function Dashboard() {
  const [side, setside] = useState(false);
  const [invoiceData, setInvoiceData] = useState([]); // Holds the invoice data
  const [loading, setLoading] = useState(false); // Loading state
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));

  const [page, setPage] = useState(1); // Tracks the current page for infinite scrolling
  const [hasMore, setHasMore] = useState(true); // Determines if there are more pages to load
  const [customer, setcustomer] = useState({});
  const { id } = useParams();

  const fetchCategory = async (reset = false) => {
    if (loading || (!reset && !hasMore)) return;

    try {
      setLoading(true);

      if (reset) {
        setInvoiceData([]); // Clear data when resetting
        setPage(1); // Reset page number
        setHasMore(true); // Reset infinite scroll
      }

      const response = await axiosInstance.get("/invoice/customer-mainitem/", {
        headers: { Authorization: `Token ${localStorage.getItem("token")}` },
        params: { id, page: reset ? 1 : page, startDate, endDate },
      });

      const newResults = response?.data?.results || [];
      setInvoiceData((prevData) =>
        reset ? newResults : [...prevData, ...newResults]
      );
      setHasMore(Boolean(response?.data?.next));
      setPage(reset ? 2 : page + 1); // Increment page only if not resetting
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch invoice data");
    } finally {
      setLoading(false);
    }
  };

  const fetchcustomer = async () => {
    try {
      const productResponse = await axiosInstance.get(`/invoice/customer/`, {
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
        params: { customer_id: id, startDate, endDate },
      });
      setcustomer(productResponse?.data.message);
      console.log(productResponse?.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Initial Data Fetch
  useEffect(() => {
    fetchCategory(true); // Reset state and fetch new data on ID change
    fetchcustomer();
  }, [id]);

  const handleDelete = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.delete(
        `/invoice/customer-mainitem/`,
        {
          headers: { Authorization: `Token ${token}` },
          data: { orderId },
        }
      );

      if (response.status === 204) {
        setInvoiceData((prevData) =>
          prevData.filter((item) => item.id !== orderId)
        );
        fetchcustomer();

        toast.success("Order deleted successfully!");
      } else {
        throw new Error("Failed to delete order");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete order");
    }
  };

  const renderFooter = (mainItem) => (
    <div>
      <hr />
      <strong>Order date:</strong> {mainItem.created_at}
      <br />
      <div style={{ textAlign: "right", paddingTop: "10px" }}>
        <strong>Total amount:</strong> {mainItem.total}
        <br />
        <strong>Pay amount :</strong> {mainItem.paid}
        <br />
        <strong>Credit balance:</strong> {mainItem.credit}
        <br />
      </div>
      <Popconfirm
        title="Are you sure to delete this order?"
        onConfirm={() => handleDelete(mainItem.id)}
        okText="Yes"
        cancelText="No"
      >
        <button
          className="btn btn-danger text-white"
          style={{ marginTop: "10px" }}
        >
          Delete
        </button>
      </Popconfirm>
    </div>
  );

  const prepareDataSource = (mainItem) => {
    return mainItem.item.map((product, index) => ({
      key: index,
      product_name: product.product_name,
      quantity: product.count,
      price: product.price,
      sub_total: product.sub_total,
    }));
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates.");
      return;
    }

    fetchCategory(true); // Reset and fetch data
    fetchcustomer();
  };

  return (
    <div>
      <Adminheader isAdmin={true} side={side} setside={setside} />
      <div className={style.adminflexdiv}>
        <div
          className={`col-3 col-md-2 ${
            side ? style.adminsidebar : `${style.adminsidebar} ${style.closed}`
          }`}
        >
          <Sidebar side={side} props={routes} />
        </div>
        <div className="col-10 m-auto col-md-9 col-lg-7 pt-5">
          <div className={style.customerDetails}>
            <h2 className={style.customername}>Name:{customer.name}</h2>
            <br />
            <h2 className={style.customerphone}>Phone:{customer.phone}</h2>

            <br />
            <div className={style.customerinfo}>
              <h2>
                <strong>Credit:</strong> {customer.credit}
              </h2>
              <h2>
                <strong>Paid:</strong> {customer.paid}
              </h2>
              <h2>
                <strong>Total:</strong> {customer.total}
              </h2>
            </div>
          </div>
          <div
            className="row"
            style={{
              width: "100%",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div className="col-md-3 mb-3">
              <label htmlFor="start_date" className="form-label">
                Start Date:
              </label>
              <input
                type="date"
                className="form-control"
                name="start_date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="col-md-3 mb-3">
              <label htmlFor="end_date" className="form-label">
                End Date:
              </label>
              <input
                type="date"
                className="form-control"
                name="end_date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="col-md-2 mb-3" style={{ marginTop: "32px" }}>
              <button
                onClick={handleGenerateReport}
                className="btn btn-primary"
              >
                Generate
              </button>
            </div>
          </div>

          <InfiniteScroll
            dataLength={invoiceData.length}
            next={() => fetchCategory(false)}
            hasMore={hasMore}
            loader={
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <Spin size="large" />
              </div>
            }
            endMessage={
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <b>No more invoices to load</b>
              </div>
            }
          >
            {invoiceData.map((mainItem) => (
              <div key={mainItem.id}>
                <Table
                  columns={[
                    {
                      title: "Product",
                      dataIndex: "product_name",
                      key: "product_name",
                    },
                    {
                      title: "Quantity",
                      dataIndex: "quantity",
                      key: "quantity",
                    },
                    {
                      title: "Price",
                      dataIndex: "price",
                      key: "price",
                    },
                    {
                      title: "Sub Total",
                      dataIndex: "sub_total",
                      key: "sub_total",
                    },
                  ]}
                  dataSource={prepareDataSource(mainItem)}
                  pagination={false}
                  rowKey="key"
                  footer={() => renderFooter(mainItem)}
                  className={style.invoicetable}
                />
              </div>
            ))}
          </InfiniteScroll>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
