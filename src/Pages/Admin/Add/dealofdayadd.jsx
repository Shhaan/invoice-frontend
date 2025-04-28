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
  Checkbox,
  Flex,
  Select,
} from "antd";
import { axiosInstancemain } from "../../../Functions/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [side, setside] = useState(false);
  const [product, setproduct] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const { data } = await axiosInstancemain.get(
          `products/?is_paginated=${false}`,
          {
            headers: {
              Authorization: `Token ${localStorage.getItem("token")}`,
            },
          }
        );

        setproduct(data.message);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        message.error("Failed to load categories.");
      }
    };
    fetchCategory();
  }, []);

  const onFinish = async (values) => {
    const formData = new FormData();

    formData.append("price", values.price);
    formData.append("quantity", values.Quantity);
    formData.append("product", values.product);
    formData.append("is_available", values.is_available);

    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstancemain.post("deal/", formData, {
        headers: { Authorization: `Token ${token}` },
      });
      toast.success("Upload successful!");
      if (response.status == 201) navigate("/admin/deal-of-day");
    } catch (error) {
      console.log(error);

      if (
        error?.response?.data?.message &&
        typeof error.response.data.message === "string"
      ) {
        toast.error(error?.response?.data?.message, {
          position: "top-center",
        });
        return;
      } else if (error?.response?.data?.message?.message) {
        toast.error(error?.response?.data?.message?.message, {
          position: "top-center",
        });
        return;
      }
      toast.error("Upload failed. Please try again.", {
        position: "top-center",
      });
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
              initialValues={{ remember: true }}
              onFinish={onFinish}
            >
              <h2 style={{ color: "Black", textAlign: "center" }}>Add Deals</h2>

              <Form.Item label="product">
                <Form.Item
                  name="product"
                  rules={[
                    { required: true, message: "Please select a product!" },
                  ]}
                  noStyle
                >
                  <Select
                    placeholder="Select a product"
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option?.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {product.map((product, i) => (
                      <Select.Option
                        key={product.product_id}
                        value={product.product_id}
                      >
                        {`${product.name} (${product.code}) (${product.price})`}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Form.Item>

              <Form.Item
                name="price"
                rules={[{ required: true, message: "Price is required" }]}
                label="price"
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                className={style.inputofadd}
              >
                <Input
                  type="number"
                  style={{ height: "52px" }}
                  placeholder="Price"
                />
              </Form.Item>

              <Form.Item name="is_available" valuePropName="checked">
                <Checkbox>Is available</Checkbox>
              </Form.Item>

              <Form.Item
                name="Quantity"
                label="Quantity"
                rules={[{ required: true, message: "Quantity is required" }]}
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                className={style.inputofadd}
              >
                <Input
                  type="text"
                  style={{ height: "52px" }}
                  placeholder="Quantity"
                />
              </Form.Item>

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
