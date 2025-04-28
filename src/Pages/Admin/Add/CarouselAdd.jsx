import React, { useState } from "react";
import Adminheader from "../../../Components/Adminheader/Adminheader";
import Sidebar from "../../../Components/Admin/Sidebar";
import style from "../../../Main.module.css";
import routes from "../../../Functions/routes";
import { Form, Button, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { axiosInstancemain } from "../../../Functions/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [side, setside] = useState(false);
  const [imageFileList, setImageFileList] = useState([]);
  const navigate = useNavigate();

  const onFinish = async () => {
    const formData = new FormData();
    if (imageFileList.length > 0) {
      formData.append("image", imageFileList[0].originFileObj); // Append the image file
    } else {
      return message.error("Please upload an image before submitting.");
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstancemain.post("carousel/", formData, {
        headers: { Authorization: `Token ${token}` },
      });
      toast.success("Image uploaded successfully!");
      if (response.status === 201) navigate("/admin/carousel"); // Redirect to carousel page
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Upload failed. Please try again.");
    }
  };

  const handleUploadChange = ({ fileList }) => {
    if (fileList.length > 1) {
      fileList = [fileList[fileList.length - 1]]; // Keep only the most recent image
      message.warning(
        "Only one image is allowed. The latest image will be kept."
      );
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
          <div
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
              onFinish={onFinish}
            >
              <h2 style={{ color: "Black", textAlign: "center" }}>
                Add Carousel Image
              </h2>

              <Form.Item
                name="image"
                label="Upload Image"
                rules={[{ required: true, message: "Please upload an image!" }]}
              >
                <Upload
                  name="image"
                  listType="picture"
                  accept="image/*"
                  fileList={imageFileList}
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
