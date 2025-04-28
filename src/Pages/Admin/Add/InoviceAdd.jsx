import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
import Adminheader from "../../../Components/Adminheader/Adminheader";
import Sidebar from "../../../Components/Admin/Sidebar";
import style from "../../../Main.module.css";
import routes from "../../../Functions/routes";
import dayjs from "dayjs";
import {
  Form,
  Input,
  Button,
  message,
  Flex,
  Select,
  Spin,
  DatePicker,
} from "antd";
import { useNavigate } from "react-router-dom";

import { FaTimes } from "react-icons/fa";
import {
  axiosInstancemain,
  createAxiosInstanceWithAuth,
} from "../../../Functions/axios";
import toast from "react-hot-toast";

const InvoiceProduct = lazy(() =>
  import("../../../Components/Admin/Invoiceproduct")
);
function Dashboard() {
  const [side, setside] = useState(false);
  const [paymentType, setPaymentType] = useState("cash");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(true);
  const [isdelivery, setisdelivery] = useState(false);
  const [time, settime] = useState([]);
  const [form] = Form.useForm();
  const [sale, setsale] = useState(true);
  const nameref = useRef();

  const navigate = useNavigate();
  const handleAddProductClick = () => {
    setIsModalVisible(true);
  };
  useEffect(() => {
    const fetchdata = async () => {
      try {
        const { data } = await axiosInstancemain.get("get-timeslot/");

        if (
          Array.isArray(data?.today?.timeslote) &&
          data?.today?.timeslote.length > 0
        ) {
          settime((e) => ["Now", ...data?.today?.timeslote]);
        } else {
          settime((e) => ["Now", ...data?.tomorrow?.timeslote]);
        }
      } catch (e) {
        console.error("Error fetching time slots:", e);
      }
    };

    fetchdata();
    form.setFieldsValue({
      time_slot: "Now",
      created_at: dayjs().format("YYYY-MM-DD"),
      payment: "cash",
    });

    nameref.current.focus();
  }, []);
  const onFinish = async (values) => {
    if (selectedProducts.length == 0) {
      toast.error("Product must be selected");
      return;
    }
    const total = selectedProducts
      .reduce((sum, product) => {
        return sum + product.count * product.price;
      }, 0)
      .toFixed(2);

    if (
      values?.payment == "credit" &&
      total < parseFloat(values?.pending_amount)
    ) {
      toast.error("Credit must be less than or equal to total");
      return;
    }

    let product = selectedProducts.map((e) => ({
      count: e.count,
      customize: e.customize,
      product: e.product_id,
      price: parseInt(e.price),
    }));

    try {
      const axios = createAxiosInstanceWithAuth();
      const data = await axios.post("main/invoice/", {
        ...values,
        is_sales: sale,
        product,
        is_delivery: isdelivery,
      });

      if (data.status == 201)
        navigate(`/admin/invoice/edit/${data?.data?.message?.id}`, {
          replace: true,
        });
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const formRef = useRef();

  const timeSlotInputRef = useRef();
  const paymentInputRef = useRef();
  const isDeliveryInputRef = useRef();
  const locationInputRef = useRef();
  const streetInputRef = useRef();
  const zoneInputRef = useRef();
  const InvoiceProductSelection = useRef();

  const handleKeyPress = (e, nextInputRef) => {
    if (e.key === "Enter") {
      nextInputRef.current?.focus();
      e.preventDefault(); // Prevent form submission
    }
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

        <div
          style={isModalVisible ? { display: "none" } : {}}
          className="col-10 m-auto col-md-9 col-lg-7"
        >
          <Flex
            vertical
            style={{
              textAlign: "center",
              margin: "auto",
              marginTop: "94px",
            }}
          >
            <Form
              ref={formRef}
              form={form}
              style={{
                padding: "32px",
                background: "rgb(255 246 242)",
                borderRadius: "9px",
                position: "relative",
              }}
              name="normal_login"
              initialValues={{ remember: true, is_delivery: false }}
              onFinish={onFinish}
            >
              <h2 style={{ color: "Black", textAlign: "center" }}>
                Add Invoice
              </h2>

              <Form.Item
                name="name"
                label="Customer Name"
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                className={style.inputofadd}
              >
                <Input
                  ref={nameref}
                  style={{ height: "52px" }}
                  placeholder="Customer name"
                  onKeyDown={(e) => handleKeyPress(e, timeSlotInputRef)}
                  autoFocus
                />
              </Form.Item>

              <Form.Item
                name="time_slot"
                label="Time slot"
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                className={style.inputofadd}
              >
                <Select
                  ref={timeSlotInputRef}
                  style={{ height: "52px" }}
                  placeholder="Select a time slot"
                  defaultValue={"Now"}
                  options={time.map((slot) => ({
                    label: slot, // Displayed in the dropdown
                    value: slot, // Stored in the form state
                  }))}
                  onKeyDown={(e) => handleKeyPress(e, paymentInputRef)}
                >
                  <Select.Option value="Now">Now</Select.Option>
                  {time.map((slot) => (
                    <Select.Option value={slot}>{slot}</Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="payment"
                label="Payment"
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
              >
                <Select
                  style={{ height: "52px" }}
                  placeholder="Select a payment type"
                  value={paymentType} // Bind the value to the paymentType state
                  onChange={(value) => setPaymentType(value)} // Update payment type state on change
                  onKeyDown={(e) => handleKeyPress(e, isDeliveryInputRef)}
                  defaultValue={paymentType}
                >
                  <Select.Option value="cash">Cash</Select.Option>
                  <Select.Option value="online payment">
                    Online payment
                  </Select.Option>
                  <Select.Option value="card">Card</Select.Option>
                  <Select.Option value="credit">Credit</Select.Option>
                </Select>
              </Form.Item>

              {paymentType === "credit" && (
                <Form.Item
                  name="pending_amount"
                  label="Credit Payment Amount"
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                >
                  <Input
                    style={{ height: "52px" }}
                    type="number"
                    placeholder="Enter credit payment amount"
                    onKeyDown={(e) => handleKeyPress(e, isDeliveryInputRef)}
                  />
                </Form.Item>
              )}

              <Form.Item name="is_delivery" label="Is delivery">
                <label className={style.switch}>
                  <Input
                    type="checkbox"
                    checked={isdelivery}
                    value={isdelivery || false}
                    onChange={() => setisdelivery((prev) => !prev)}
                  />
                  <span className={style.slider}></span>
                </label>
              </Form.Item>

              {isdelivery && (
                <>
                  <Form.Item
                    name="building"
                    label="Building"
                    rules={[
                      { required: true, message: "Building is required" },
                    ]}
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                    className={style.inputofadd}
                  >
                    <Input
                      style={{ height: "52px" }}
                      placeholder="Building"
                      type="number"
                      onKeyDown={(e) => handleKeyPress(e, locationInputRef)}
                    />
                  </Form.Item>
                  <Form.Item
                    name="location"
                    label="Location /remark "
                    rules={[
                      { required: true, message: "Location is required" },
                    ]}
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                    className={style.inputofadd}
                  >
                    <Input
                      ref={locationInputRef}
                      style={{ height: "52px" }}
                      placeholder="Location"
                      onKeyDown={(e) => handleKeyPress(e, streetInputRef)}
                    />
                  </Form.Item>
                  <Form.Item
                    name="Street"
                    label="Street"
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                    className={style.inputofadd}
                  >
                    <Input
                      ref={streetInputRef}
                      style={{ height: "52px" }}
                      placeholder="Street"
                      type="number"
                      onKeyDown={(e) => handleKeyPress(e, zoneInputRef)}
                    />
                  </Form.Item>
                  <Form.Item
                    name="Zone"
                    label="Zone"
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                    className={style.inputofadd}
                  >
                    <Input
                      type="number"
                      ref={zoneInputRef}
                      style={{ height: "52px" }}
                      placeholder="Zone"
                    />
                  </Form.Item>
                </>
              )}

              <div
                style={{
                  display: " flex",
                  flexDirection: "column",
                  marginBottom: "10px",
                }}
              >
                {selectedProducts.map((i) => (
                  <div
                    key={i.id}
                    className={`${style.selectedProducts} col-10 m-auto p-1 mb-2`}
                    style={{
                      background: "#f8cec3",
                      boxShadow: "1px 1px #ffe2da",
                    }}
                  >
                    <h3 className={style.invoicepopupname}>
                      {i.name} {`(${i.quantity})`} x{i.count}{" "}
                      {i.customize ? `- ${i.customize}` : ""}
                    </h3>

                    <div>
                      <FaTimes
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          setSelectedProducts((prevSelectedProducts) =>
                            prevSelectedProducts.filter(
                              (product) => product.id !== i.id
                            )
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="dashed"
                className="col-6"
                style={{ width: "100%", marginBottom: "20px" }}
                onClick={handleAddProductClick}
              >
                Add Product
              </Button>

              <Form.Item
                name="created_at"
                label="Invoice date"
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                className={style.inputofadd}
              >
                <Input
                  type="date"
                  style={{ height: "52px", width: "100%" }}
                  placeholder="Select date"
                  format="DD-MM-YYYY"
                  value={dayjs().format("YYYY-MM-DD")}
                  defaultValue={dayjs().format("YYYY-MM-DD")}
                  // Set the current date as the default value (using dayjs)
                  // Disable future dates using dayjs
                />
              </Form.Item>

              <h4 className="text-end">
                Total :
                {selectedProducts
                  .reduce((sum, product) => {
                    return sum + product.count * product.price;
                  }, 0)
                  .toFixed(2)}
              </h4>

              <Form.Item>
                <Button
                  className={style.orderNow}
                  type="primary"
                  htmlType="submit"
                  style={{ padding: "24px 25px" }}
                >
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </Flex>
        </div>
        {isModalVisible && (
          <Suspense
            fallback={
              <div style={{ textAlign: "center", margin: "20px 0" }}>
                <Spin size="large" />
                <p>Loading Invoice Product...</p>
              </div>
            }
          >
            <InvoiceProduct
              onclose={() => setIsModalVisible(false)}
              setSelectedProducts={setSelectedProducts}
              selectedProducts={selectedProducts}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
