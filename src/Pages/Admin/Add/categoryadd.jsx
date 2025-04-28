import React, { useEffect, useState } from "react";
import Adminheader from "../../../Components/Adminheader/Adminheader";
import Sidebar from "../../../Components/Admin/Sidebar";
import style from "../../../Main.module.css";
import routes from "../../../Functions/routes";
import { Form, Input, Button, Upload, message, Checkbox, Flex } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { axiosInstancemain } from "../../../Functions/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [side, setside] = useState(false);
  const [imageFileList, setImageFileList] = useState([]);
  const [category, setcategory] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const { data } = await axiosInstancemain.get("category/");
        setcategory(data?.message);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        message.error("Failed to load categories.");
      }
    };
    fetchCategory();
  }, []);

  const onFinish = async (values) => {
    const formData = new FormData();
    if (imageFileList.length > 0) {
      formData.append("image", imageFileList[0].originFileObj);
    }
    formData.append("is_available", true);

    formData.append("name", values["Category name"]); // Correct access
    formData.append("as_peace", values.as_peace); // Access checkbox correctly
    formData.append("sort_order", values.SortOrder);

    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstancemain.post("category/", formData, {
        headers: { Authorization: `Token ${token}` },
      });
      toast.success("Upload successful!");
      if (response.status == 201) navigate("/admin/category");
    } catch (error) {
      if (error?.response?.data?.message?.name) {
        return toast.error(error?.response?.data?.message?.name, {
          position: "top-center",
        });
      }
      toast.error("Upload failed. Please try again.", {
        position: "top-center",
      });
    }
  };

  const handleUploadChange = ({ fileList }) => {
    if (fileList.length > 1) {
      fileList = [fileList[fileList.length - 1]];
      message.warning("Only the latest image will be kept.");
    }
    setImageFileList(fileList);
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
              <h2 style={{ color: "Black", textAlign: "center" }}>
                Category Add
              </h2>
              <Form.Item
                name="Category name"
                label="Category Name"
                rules={[
                  { required: true, message: "Category name is required" },
                ]}
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                className={style.inputofadd}
              >
                <Input style={{ height: "52px" }} placeholder="Category name" />
              </Form.Item>
              <Form.Item name="as_peace" valuePropName="checked">
                <Checkbox>As Peace</Checkbox>
              </Form.Item>

              <Form.Item
                name="SortOrder"
                label="Sort Order"
                rules={[{ required: true, message: "Sort order is required" }]}
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                className={style.inputofadd}
              >
                <Input
                  type="number"
                  style={{ height: "52px" }}
                  placeholder="Sort Order"
                />
              </Form.Item>
              <Form.Item
                name="image"
                label="Image"
                rules={[{ required: true, message: "Please upload an image!" }]}
              >
                <Upload
                  name="image"
                  listType="picture"
                  accept="image/*"
                  fileList={imageFileList} // Use the state to control the file list
                  onChange={handleUploadChange}
                  beforeUpload={() => false} // Prevent automatic upload
                >
                  <Button icon={<UploadOutlined />}>Upload Image</Button>
                </Upload>
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
