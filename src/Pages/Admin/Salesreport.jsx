import React, { useEffect, useState } from "react";
import Adminheader from "../../Components/Adminheader/Adminheader";
import Sidebar from "../../Components/Admin/Sidebar";
import style from "../../Main.module.css";
import routes from "../../Functions/routes";
import { axiosInstance } from "../../Functions/axios";
import toast from "react-hot-toast";
import InfiniteScroll from "react-infinite-scroll-component";
import dayjs from "dayjs";

const SalesReport = () => {
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [ordertype, setOrderType] = useState("");
  const [paymenttype, setPaymentType] = useState("");
  const [orders, setOrders] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [side, setSide] = useState(false);

  const fetchOrders = async (reset = false) => {
    if (loading || (!reset && !hasMore)) return;

    try {
      setLoading(true);

      const response = await axiosInstance.get(
        reset ? "invoice/sales-report/" : nextPage,
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("token") || ""}`,
          },
          params: reset ? { startDate, endDate, ordertype, paymenttype } : {},
        }
      );

      const newResults = response?.data?.results || [];
      setOrders((prev) => (reset ? newResults : [...prev, ...newResults]));
      setNextPage(response?.data?.next);
      setHasMore(Boolean(response?.data?.next));
    } catch (error) {
      toast.error("Failed to fetch sales data.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when component loads
  useEffect(() => {
    fetchOrders(true);
  }, []);

  const handleGenerateReport = (e) => {
    e.preventDefault();
    fetchOrders(true); // Reset and fetch new data based on filters
  };

  return (
    <div>
      <Adminheader isAdmin={true} side={side} setside={setSide} />
      <div className={style.adminflexdiv}>
        <div
          className={`col-4 col-md-2 ${
            side ? style.adminsidebar : `${style.adminsidebar} ${style.closed}`
          }`}
        >
          <Sidebar side={side} props={routes} />
        </div>

        <div className="sales-report-container">
          <h1 className="text-center">Sales Report</h1>

          <form style={{ marginTop: "50px" }} onSubmit={handleGenerateReport}>
            <div className="row" style={{ width: "100%" }}>
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

              <div className="col-md-2 mb-3">
                <label htmlFor="payment" className="form-label">
                  Payment Type:
                </label>
                <select
                  className="form-control"
                  value={paymenttype}
                  onChange={(e) => setPaymentType(e.target.value)}
                >
                  <option value="">All payment types</option>
                  <option value="cash">Cash</option>
                  <option value="online payment">Online Payment</option>
                  <option value="card">Card</option>
                  <option value="credit">Credit</option>
                </select>
              </div>

              <div className="col-md-2 mb-3">
                <label htmlFor="ordertype" className="form-label">
                  Order Type:
                </label>
                <select
                  className="form-control"
                  value={ordertype}
                  onChange={(e) => setOrderType(e.target.value)}
                >
                  <option value="">All order types</option>
                  <option value="delivery">Delivery</option>
                  <option value="Take_away">Take Away</option>
                </select>
              </div>

              <div className="col-md-2 mb-3" style={{ marginTop: "32px" }}>
                <button type="submit" className="btn btn-primary">
                  Generate Report
                </button>
              </div>
            </div>
          </form>

          {loading && orders.length === 0 ? (
            <p>Loading...</p>
          ) : orders.length === 0 ? (
            <p>No sales data available.</p>
          ) : (
            <div className="table-responsive mt-4">
              <InfiniteScroll
                dataLength={orders.length}
                next={() => fetchOrders(false)}
                hasMore={hasMore}
                loader={<p>Loading more orders...</p>}
                endMessage={<p>No more data to load.</p>}
              >
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Order Date</th>
                      <th>Sales Item</th>
                      <th>Quantity</th>
                      <th>Net Profit</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, index) => (
                      <tr key={index}>
                        <td>{order.created_at}</td>
                        <td>{order.product_name}</td>
                        <td>{order.count}</td>
                        <td>{order.price}</td>
                        <td>{order.sub_total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </InfiniteScroll>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesReport;
