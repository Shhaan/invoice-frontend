import React, { useEffect, useState } from "react";
import Adminheader from "../../../Components/Adminheader/Adminheader";
import Sidebar from "../../../Components/Admin/Sidebar";
import style from "../../../Main.module.css";
import routes from "../../../Functions/routes";
import { Form, Input, Button, message, Upload, Checkbox } from "antd";
import { axiosInstancemain, baseURL } from "../../../Functions/axios";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { UploadOutlined } from "@ant-design/icons";

function Dashboard() {
  const [side, setSide] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: "",
    as_peace: false,
    is_available: false,
  });
  const navigate = useNavigate();
  const { id } = useParams();
  const [imageFileList, setImageFileList] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchCategory = async () => {
      if (id) {
        try {
          const { data } = await axiosInstancemain.get(`category/`, {
            params: { id: id },
          });

          if (data.message) {
            const fetchedValues = {
              name: data.message.name,
              as_peace: data.message.as_piece,
              is_available: data.message.is_available,
              SortOrder: data?.message.sort_order || 0,
            };

            // Check if there's an image in the response
            if (data.message.image) {
              const initialImage = [
                {
                  uid: "-1",
                  name: "image.png",
                  status: "done",
                  url: baseURL + data.message.image,
                  originFileObj: null, // Set to null for the initial load
                },
              ];
              setImageFileList(initialImage);
              form.setFieldsValue({
                ...fetchedValues,
                image: initialImage,
              });
            } else {
              // If no image, just set the fetched values without image
              setImageFileList([]); // Clear the image list if no image exists
              form.setFieldsValue(fetchedValues);
            }

            setInitialValues(fetchedValues);
          }
        } catch (error) {
          if ((error.response.status = 404)) {
            navigate("/admin/category");
            toast.error("Category not found with given id", 3000);
          }
        }
      }
    };

    fetchCategory();
  }, [id, form]);

  const onFinish = async (values) => {
    const formData = new FormData();

    formData.append("as_piece", values.as_peace);
    formData.append("name", values.name);
    formData.append("is_available", initialValues.is_available);
    formData.append("sort_order", values.SortOrder);

    formData.append("id", id);
    console.log(imageFileList);

    if (imageFileList.length > 0 && imageFileList[0].originFileObj) {
      formData.append("image", imageFileList[0].originFileObj);
    } else if (imageFileList.length == 0) {
      message.error("must upload one image");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstancemain.put(`category/`, formData, {
        headers: { Authorization: `Token ${token}` },
      });
      toast.success("Category updated successfully!");
      if (response.status === 201) navigate("/admin/category");
    } catch (error) {
      if (error?.response?.data?.message?.name) {
        toast.error(error?.response?.data?.message?.name, {
          position: "top-center",
        });
        return;
      }
      toast.error("Update failed. Please try again.", {
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
      <Adminheader isAdmin={true} side={side} setside={setSide} />
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
            style={{ textAlign: "center", margin: "auto", marginTop: "94px" }}
          >
            <Form
              form={form}
              style={{
                padding: "32px",
                background: "rgb(255 246 242)",
                borderRadius: "9px",
              }}
              name="edit_category"
              initialValues={initialValues}
              onFinish={onFinish}
            >
              <h2 style={{ color: "Black", textAlign: "center" }}>
                Edit Category
              </h2>

              <Form.Item
                name="name"
                rules={[{ required: true, message: "Name is required" }]}
                label="Name"
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                className={style.inputofadd}
              >
                <Input style={{ height: "52px" }} placeholder="Name" />
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
              <Form.Item name="as_peace" valuePropName="checked">
                <Checkbox>As Piece</Checkbox>
              </Form.Item>

              <Form.Item
                name="image"
                label="Image"
                rules={[{ required: true, message: "Please upload an image!" }]}
              >
                <Upload
                  name="image"
                  accept="image/*"
                  listType="picture"
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
