import React, { useEffect } from "react";
import Adminheader from "../../Components/Adminheader/Adminheader";
import { Button, Form, Input, Flex, message } from "antd"; // Importing message for feedback
import style from "../../Main.module.css";
import {
  axiosInstance,
  createAxiosInstanceWithAuth,
} from "../../Functions/axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const axiosInstanceAuthorization = createAxiosInstanceWithAuth();
        const response = await axiosInstanceAuthorization.get("user/");
        if (response.status === 200) {
          navigate("/admin");
        }
      } catch (error) {
        console.log(error); // Log the error
      }
    };
    fetchUser();
  }, [navigate]);

  const onFinish = async (values) => {
    const { email, password } = values;

    try {
      const response = await axiosInstance.post("login/", {
        email,
        password,
      });

      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        navigate("/admin");
      }
    } catch (error) {
      console.error(error);
      message.error("Invalid email or password");
    }
  };

  return (
    <div>
      <Adminheader isAdmin={false} />

      <Flex
        vertical
        style={{
          textAlign: "center",
          margin: "auto",
          marginTop: "94px",
        }}
        className="col-10 col-md-8 col-lg-7 col-xl-5 col-xxl-3"
      >
        <Form
          style={{
            padding: "32px",
            background: "#ffffff",
            borderRadius: "9px",
          }}
          name="normal_login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <h2>Login</h2>

          <Form.Item
            name="email" // Change the name to email
            rules={[{ required: true, message: "This field is required" }]}
          >
            <Input style={{ height: "52px" }} placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password" // Change the name to password
            rules={[{ required: true, message: "This field is required" }]}
          >
            <Input
              type="password"
              style={{ height: "52px" }}
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              className={style.orderNowButton}
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
  );
}

export default Login;
