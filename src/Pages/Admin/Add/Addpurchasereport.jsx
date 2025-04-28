import React, { useEffect, useState } from "react";
import Adminheader from "../../../Components/Adminheader/Adminheader";
import Sidebar from "../../../Components/Admin/Sidebar";
import style from "../../../Main.module.css";
import routes from "../../../Functions/routes";
import {
  Form,
  Input,
  Button,
  Upload,
  message,
  Flex,
  Row,
  Col,
  Select,
} from "antd";
import { Checkbox } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { axiosInstance, axiosInstancemain } from "../../../Functions/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import dayjs from "dayjs";

function Dashboard() {
  const [side, setside] = useState(false);
  const [category, setcategory] = useState([]);
  const [customizationItems, setCustomizationItems] = useState([
    { Product: "" },
  ]); // State for customization items
  const navigate = useNavigate();
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [form] = Form.useForm();
  const [credit, setcredit] = useState(0);
  const [newcustomer, setnewcustomer] = useState(false);

  useEffect(() => {
    form.setFieldsValue({
      created_at: dayjs().format("YYYY-MM-DD"),
    });
    const fetchcategory = async () => {
      try {
        const token = localStorage.getItem("token");

        const data = await axiosInstance.get("/invoice/customer/", {
          headers: { Authorization: `Token ${token}` },
          params: { ispage: false },
        });
        setcategory(data?.data?.message);
        console.log(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchcategory();

    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const onFinish = async (values) => {
    const formData = new FormData();
    const date = new Date();
    formData.append("customer", values.customer);
    formData.append("created_at", values.created_at);
    formData.append("credit_pay", credit);

    formData.append("new", newcustomer);

    if (newcustomer) {
      formData.append("name", values.name);
      formData.append("phone", values.phone);
    }

    formData.append(
      "total",
      customizationItems.reduce((acc, item) => {
        return acc + item.Price * item.Quantity;
      }, 0)
    );

    formData.append(
      "credit_pending",
      customizationItems.reduce((acc, item) => {
        return acc + item.Price * item.Quantity;
      }, 0) - credit
    );

    if (
      credit >
      customizationItems.reduce((acc, item) => {
        return acc + item.Price * item.Quantity;
      }, 0)
    ) {
      toast.error("The credit paying amount must be less than total");
      return;
    }

    if (customizationItems.length <= 0) {
      toast.error("Must enter one product");
      return;
    }
    if (customizationItems) {
      customizationItems.forEach((item, index) => {
        formData.append(`customize[${index}][Product]`, item.Product);
        formData.append(`customize[${index}][Quantity]`, item.Quantity);
        formData.append(`customize[${index}][Price]`, item.Price);
      });
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.post(
        "/invoice/customer-item/",
        formData,
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      toast.success("Upload successful!");
      if (response.status == 201) navigate("/admin/purchase");
    } catch (error) {
      if (error?.response?.data?.message?.code) {
        return toast.error(error?.response?.data?.message?.code);
      }

      message.error(error?.response?.data?.message);
    }
  };

  const handleCustomizationChange = (index, field, value) => {
    const updatedItems = [...customizationItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setCustomizationItems(updatedItems);
  };

  const addCustomizationItem = () => {
    setCustomizationItems([
      ...customizationItems,
      { Product: "", Quantity: 0, Price: 0 },
    ]);
  };

  const removeCustomization = (index) => {
    setCustomizationItems(customizationItems.filter((_, i) => i !== index));
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
        <div className="col-10 m-auto col-md-9 col-lg-7">
          <Flex
            vertical
            style={{
              textAlign: "center",
              margin: "auto",
              marginTop: "94px",
            }}
          >
            <Form
              style={{
                padding: "32px",
                background: "rgb(255 246 242)",
                borderRadius: "9px",
              }}
              name="normal_login"
              initialValues={{
                remember: true,
              }}
              form={form}
              onFinish={onFinish}
            >
              <h2 style={{ color: "Black", marginBottom: "30px" }}>
                Purchase Add
              </h2>
              <Form.Item name="new" style={{ marginBottom: "10px" }}>
                <label className={style.switch}>
                  <Input
                    type="checkbox"
                    checked={newcustomer}
                    value={newcustomer}
                    onChange={() => setnewcustomer((p) => !p)}
                  />
                  <span className={style.slider}></span>
                </label>
              </Form.Item>
              {newcustomer ? (
                <>
                  <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ required: true, message: "name is required" }]}
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                    className={style.inputofadd}
                  >
                    <Input style={{ height: "52px" }} placeholder="Name" />
                  </Form.Item>

                  <Form.Item
                    name="phone"
                    label="Phone"
                    rules={[{ required: true, message: " Phone is required" }]}
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                    className={style.inputofadd}
                  >
                    <Input
                      type="number"
                      style={{ height: "52px" }}
                      placeholder="phone"
                    />
                  </Form.Item>
                </>
              ) : (
                <Form.Item label="Customer">
                  <Form.Item
                    name="customer"
                    rules={[
                      { required: true, message: "Please select a customer!" },
                    ]}
                    noStyle
                  >
                    <Select
                      placeholder="Select a customer"
                      style={{ width: "100%" }}
                    >
                      {category.map((cat) => (
                        <Select.Option key={cat.id} value={cat.id}>
                          {cat.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Form.Item>
              )}
              <Form.Item label="Add product">
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th
                          style={{
                            border: "1px solid #ddd",
                            padding: "8px",
                            textAlign: "left",
                          }}
                        >
                          Product
                        </th>
                        <th
                          style={{
                            border: "1px solid #ddd",
                            padding: "8px",
                            textAlign: "left",
                          }}
                        >
                          Quantity
                        </th>
                        <th
                          style={{
                            border: "1px solid #ddd",
                            padding: "8px",
                            textAlign: "left",
                          }}
                        >
                          Price
                        </th>

                        <th
                          style={{
                            border: "1px solid #ddd",
                            padding: "8px",
                            textAlign: "left",
                          }}
                        >
                          Sub total
                        </th>

                        <th
                          style={{
                            border: "1px solid #ddd",
                            padding: "8px",
                            textAlign: "left",
                          }}
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {customizationItems.map((item, index) => (
                        <tr key={index}>
                          <td
                            style={{ border: "1px solid #ddd", padding: "8px" }}
                          >
                            <Input
                              required
                              placeholder={`Product ${index + 1}`}
                              value={item.Product}
                              onChange={(e) =>
                                handleCustomizationChange(
                                  index,
                                  "Product",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td
                            style={{ border: "1px solid #ddd", padding: "8px" }}
                          >
                            <Input
                              required
                              placeholder={`Quantity ${index + 1}`}
                              value={item.Quantity}
                              type="number"
                              step="0.01"
                              min={0}
                              onChange={(e) =>
                                handleCustomizationChange(
                                  index,
                                  "Quantity",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td
                            style={{ border: "1px solid #ddd", padding: "8px" }}
                          >
                            <Input
                              required
                              placeholder={`Price ${index + 1}`}
                              value={item.Price}
                              step="0.01"
                              min={0}
                              type="number"
                              onChange={(e) =>
                                handleCustomizationChange(
                                  index,
                                  "Price",
                                  e.target.value
                                )
                              }
                            />
                          </td>

                          <td
                            style={{ border: "1px solid #ddd", padding: "8px" }}
                          >
                            <Input
                              placeholder={`0`}
                              value={(item.Price * item.Quantity).toFixed(2)}
                              defaultValue={0}
                              step="0.01"
                              min={0}
                              type="number"
                              disabled
                            />
                          </td>

                          <td
                            style={{ border: "1px solid #ddd", padding: "8px" }}
                          >
                            <Button
                              type="dashed"
                              onClick={() => removeCustomization(index)}
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button
                  type="dashed"
                  onClick={addCustomizationItem}
                  style={{ marginTop: "10px", width: "100%" }}
                >
                  Add More
                </Button>
              </Form.Item>
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
                  defaultValue={dayjs()}
                  value={dayjs()}
                />
              </Form.Item>
              <Form.Item
                name="pending_amount"
                label="Pay amount "
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
              >
                <Input
                  style={{ height: "52px" }}
                  type="number"
                  min={0}
                  step="0.01"
                  max={customizationItems.reduce(
                    (acc, item) => acc + item.Price * item.Quantity,
                    0
                  )}
                  value={credit}
                  defaultValue={0}
                  onChange={(e) => {
                    const total = customizationItems.reduce(
                      (acc, item) => acc + item.Price * item.Quantity,
                      0
                    );

                    const enteredValue = Number(e.target.value);

                    if (enteredValue <= total) {
                      setcredit(enteredValue);
                    } else {
                      setcredit(total);
                    }
                  }}
                  placeholder="Enter   payment amount"
                />
              </Form.Item>
              <h6 className="text-end">
                Pending amount:{" "}
                {isNaN(
                  customizationItems
                    .reduce((acc, item) => {
                      return acc + item.Price * item.Quantity;
                    }, 0)
                    .toFixed(2)
                )
                  ? 0
                  : (
                      customizationItems.reduce((acc, item) => {
                        return acc + item.Price * item.Quantity;
                      }, 0) - credit
                    ).toFixed(2)}
              </h6>
              <h6 className="text-end">
                {" "}
                Total:{" "}
                {isNaN(
                  customizationItems
                    .reduce((acc, item) => {
                      return acc + item.Price * item.Quantity;
                    }, 0)
                    .toFixed(2)
                )
                  ? 0
                  : customizationItems
                      .reduce((acc, item) => {
                        return acc + item.Price * item.Quantity;
                      }, 0)
                      .toFixed(2)}
              </h6>
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
      </div>
    </div>
  );
}

export default Dashboard;
