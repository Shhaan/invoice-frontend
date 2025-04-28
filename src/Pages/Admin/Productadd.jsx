import React, { useEffect, useState } from "react";
import Adminheader from "../../Components/Adminheader/Adminheader";
import Sidebar from "../../Components/Admin/Sidebar";
import style from "../../Main.module.css";
import routes from "../../Functions/routes";
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
import { axiosInstancemain } from "../../Functions/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Dashboard() {
  const [side, setside] = useState(false);
  const [imageFileList, setImageFileList] = useState([]); // State to hold the selected image file list
  const [category, setcategory] = useState([]);
  const [customizationItems, setCustomizationItems] = useState([{}]); // State for customization items
  const navigate = useNavigate();
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

  useEffect(() => {
    const fetchcategory = async () => {
      try {
        const token = localStorage.getItem("token");

        const data = await axiosInstancemain.get("category/", {
          headers: { Authorization: `Token ${token}` },
        });
        setcategory(data?.data?.message);
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
    if (imageFileList.length > 0) {
      formData.append("image", imageFileList[0].originFileObj);
    }

    formData.append("is_bestseller", values.is_bestseller);
    formData.append("category", values.category);
    formData.append("name", values["Product name"]);
    formData.append("price", values.Price);
    formData.append("count", values.count);
    formData.append("quantity", values.Quantity);
    formData.append("is_available", true);
    formData.append("is_piece", values.is_piece);
    formData.append("take_away", values.take_away);
    formData.append("code", values.Code);
    formData.append("sort_order", values.SortOrder);
    formData.append("discription", values.discription);

    if (customizationItems) {
      customizationItems.forEach((item, index) => {
        formData.append(`customize[${index}][text]`, item.text || "");
        if (item.image && item.image[0]) {
          formData.append(
            `customize[${index}][image]`,
            item.image[0].originFileObj
          );
        }
      });
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstancemain.post("/products/", formData, {
        headers: { Authorization: `Token ${token}` },
      });

      toast.success("Upload successful!");
      if (response.status == 201) navigate("/admin/product");
    } catch (error) {
      if (error?.response?.data?.message?.code) {
        return toast.error(error?.response?.data?.message?.code);
      }

      message.error(error?.response?.data?.message);
    }
  };

  const handleUploadChange = ({ fileList }) => {
    if (fileList.length > 1) {
      fileList = [fileList[fileList.length - 1]];
      message.warning("Only the latest image will be kept.");
    }
    setImageFileList(fileList);
  };
  const handleCustomizationChange = (index, field, value) => {
    const updatedItems = [...customizationItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setCustomizationItems(updatedItems);
  };

  const handleCustomizationImageChange = (index, { fileList }) => {
    if (fileList.length > 1) {
      fileList = [fileList[fileList.length - 1]];
      message.warning("Only the latest image will be kept.");
    }
    const updatedItems = [...customizationItems];
    updatedItems[index].image = fileList;
    setCustomizationItems(updatedItems);
  };

  const addCustomizationItem = () => {
    setCustomizationItems([...customizationItems, { text: "", image: [] }]);
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

                is_bestseller: false, // Set initial value to false
                is_piece: false,
                take_away: false,
              }}
              onFinish={onFinish}
            >
              <h2 style={{ color: "Black" }}>Product Add</h2>

              <Form.Item
                name="Product name"
                label="Product name"
                rules={[
                  { required: true, message: "Product name is required" },
                ]}
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                className={style.inputofadd}
              >
                <Input style={{ height: "52px" }} placeholder="Product name" />
              </Form.Item>

              <Form.Item
                name="Price"
                rules={[{ required: true, message: "Price is required" }]}
                label="Price"
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

              <Form.Item
                name="discription"
                label="Description"
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                className={style.inputofadd}
              >
                <Input.TextArea
                  // Adjust the number of visible rows as needed
                  style={{ resize: "none" }} // Optional: Prevents resizing
                  placeholder="Enter description"
                />
              </Form.Item>
              <Form.Item
                name="count"
                label="Stock"
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                className={style.inputofadd}
              >
                <Input
                  type="number"
                  style={{ height: "52px" }}
                  placeholder="Stock"
                  min={0.01} // Minimum value allowed
                  step={0.01} // Step for decimal increments
                />
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

              <Form.Item
                name="Code"
                label="Code"
                rules={[{ required: true, message: "Code is required" }]}
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                className={style.inputofadd}
              >
                <Input
                  type="text"
                  style={{ height: "52px" }}
                  placeholder="Code"
                />
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

              <Form.Item label="Category">
                <Form.Item
                  name="category"
                  rules={[
                    { required: true, message: "Please select a category!" },
                  ]}
                  noStyle
                >
                  <Select
                    placeholder="Select a category"
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

              <Form.Item label="Cutting size">
                {customizationItems.map((item, index) => (
                  <Row key={index} gutter={16} style={{ marginBottom: "8px" }}>
                    <Col
                      xs={24}
                      sm={12}
                      md={12}
                      lg={12}
                      style={{
                        marginBottom: viewportWidth < 576 ? "8px" : "0",
                      }}
                    >
                      <Input
                        placeholder={`Cutting size ${index + 1}`}
                        value={item.text}
                        onChange={(e) =>
                          handleCustomizationChange(
                            index,
                            "text",
                            e.target.value
                          )
                        }
                      />
                    </Col>
                    <Col
                      xs={12}
                      sm={6}
                      md={6}
                      lg={6}
                      style={{
                        marginBottom: viewportWidth < 576 ? "8px" : "0",
                      }}
                    >
                      <Upload
                        accept="image/*"
                        listType="picture"
                        fileList={item.image}
                        onChange={(info) =>
                          handleCustomizationImageChange(index, info)
                        }
                        beforeUpload={() => false}
                      >
                        <Button icon={<UploadOutlined />}>Upload</Button>
                      </Upload>
                    </Col>
                    <Col xs={12} sm={6} md={6} lg={6}>
                      <Button
                        type="dashed"
                        onClick={() => removeCustomization(index)}
                        block={viewportWidth < 576}
                      >
                        Remove
                      </Button>
                    </Col>
                  </Row>
                ))}

                <Button type="dashed" onClick={addCustomizationItem}>
                  Add More
                </Button>
              </Form.Item>
              <Form.Item label="Options">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="is_bestseller" valuePropName="checked">
                      <Checkbox>Is bestseller</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="is_piece" valuePropName="checked">
                      <Checkbox>Is Piece</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="take_away" valuePropName="checked">
                      <Checkbox>Delivery Not Available</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="image"
                      label="Image"
                      rules={[
                        { required: true, message: "Please upload an image!" },
                      ]}
                    >
                      <Upload
                        name="image"
                        accept="image/*"
                        listType="picture"
                        fileList={imageFileList} // Use the state to control the file list
                        onChange={handleUploadChange}
                        beforeUpload={() => false} // Prevent automatic upload
                      >
                        <Button icon={<UploadOutlined />}>Upload Image</Button>
                      </Upload>
                    </Form.Item>
                  </Col>
                </Row>
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
