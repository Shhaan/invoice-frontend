import React, { useEffect, useState } from "react";
import Adminheader from "../../../Components/Adminheader/Adminheader";
import Sidebar from "../../../Components/Admin/Sidebar";
import style from "../../../Main.module.css";
import routes from "../../../Functions/routes";
import {
  axiosInstancemain,
  baseURL,
  createAxiosInstanceWithAuth,
} from "../../../Functions/axios";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  message,
  Upload,
  Checkbox,
  Row,
  Col,
  Select,
  Flex,
} from "antd";
import { UploadOutlined } from "@ant-design/icons"; // Make sure to import UploadOutlined

function Dashboard() {
  const [side, setside] = useState(false);
  const [imageFileList, setImageFileList] = useState([]); // State to hold the selected image file list
  const [category, setcategory] = useState([]);
  const [customizationItems, setCustomizationItems] = useState([{}]);
  const [product, setProduct] = useState({
    is_bestseller: false,
    category: "",
    "Product name": "",
    Price: 0,
    count: "",
    Quantity: 0,
    is_available: false,
    is_piece: false,
    take_away: false,
    Code: "",
    SortOrder: 0,
  });
  const { id } = useParams(); // Get the deal ID from URL parameters
  const [form] = Form.useForm();

  const navigate = useNavigate();
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

    const fetchproduct = async () => {
      try {
        const token = localStorage.getItem("token");
        const axios = createAxiosInstanceWithAuth();
        const data = await axios.get(`main/products-edit/${id}/`, {
          headers: { Authorization: `Token ${token}` },
        });

        const dataMessage = data?.data?.message;
        console.log(dataMessage);

        const initialValues = {
          is_bestseller: dataMessage?.is_bestseller || false,
          category: dataMessage?.category || "",
          "Product name": dataMessage?.name || "",
          discription: dataMessage?.discription || "",

          Price: dataMessage?.price || 0,
          count: dataMessage?.count || "",
          Quantity: dataMessage?.quantity || 0,
          is_available: dataMessage?.is_available || false,
          is_piece: dataMessage?.is_piece || false,
          take_away: dataMessage?.take_away || false,
          Code: dataMessage?.code || "",
          SortOrder: dataMessage?.sort_order || 0,
          customize: (dataMessage?.customize || []).map((item) => ({
            text: item.text || "",
            image: item.image || null,
          })),
        };

        const initialImage = [
          {
            uid: "-1",
            name: "image.png",
            status: "done",
            url: baseURL + dataMessage?.image,
            originFileObj: null,
          },
        ];
        if (dataMessage?.customize) {
          const initializeCustomizationItems = async (dataMessage) => {
            const customizationData = await Promise.all(
              dataMessage.customize.map(async (item) => {
                const originFileObj = item?.image
                  ? await createFileObject(baseURL + item.image)
                  : "";
                return {
                  text: item.text || "",
                  image: [
                    {
                      uid: "-1",
                      name: originFileObj.name || "image.png",
                      status: "done",
                      url: item?.image ? baseURL + item.image : null,
                      originFileObj: originFileObj,
                    },
                  ],
                };
              })
            );
            setCustomizationItems(customizationData);
          };
          initializeCustomizationItems(dataMessage);
        }
        async function createFileObject(imageUrl) {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const fileName = imageUrl.split("/").pop();
          return new File([blob], fileName, { type: blob.type });
        }
        setImageFileList(initialImage);

        setProduct(dataMessage);

        form.setFieldsValue({ ...initialValues, image: initialImage });
      } catch (error) {
        if ((error.response.status = 404)) {
          navigate("/admin/product");
          toast.error("Product not found with given id", 3000);
        }
      }
    };
    fetchproduct();
  }, []);

  const onFinish = async (values) => {
    const formData = new FormData();

    if (imageFileList.length > 0 && imageFileList[0].originFileObj) {
      formData.append("image", imageFileList[0].originFileObj);
    } else if (imageFileList.length == 0) {
      message.error("must upload   image for profile");
      return;
    }
    formData.append("is_bestseller", values.is_bestseller);

    if (typeof values.category === "string") {
      const foundCategory = category.find((i) => i.name === values.category);
      formData.append("category", parseInt(foundCategory.id));
    } else {
      formData.append("category", values.category);
    }
    formData.append("name", values["Product name"]);
    formData.append("price", values.Price);
    formData.append("count", values.count);
    formData.append("quantity", values.Quantity);
    formData.append("is_available", product.is_available);
    formData.append("is_piece", values.is_piece);
    formData.append("take_away", values.take_away);
    formData.append("code", values.Code);
    formData.append("sort_order", values.SortOrder);
    formData.append("id", id);
    formData.append("discription", values.discription);

    console.log(customizationItems);

    if (customizationItems) {
      for (let index = 0; index < customizationItems.length; index++) {
        const item = customizationItems[index];

        formData.append(`customize[${index}][text]`, item.text || "");

        if (item.image && item.image[0]) {
          formData.append(
            `customize[${index}][image]`,
            item.image[0].originFileObj
          );
        }
      }
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstancemain.put("products/", formData, {
        headers: { Authorization: `Token ${token}` },
      });

      toast.success("Upload successful!");
      if (response.status == 201) navigate("/admin/product");
    } catch (error) {
      console.log(error);

      if (error?.response?.data?.message?.code) {
        return toast.error(error?.response?.data?.message?.code, {
          position: "top-center",
        });
      }

      toast.error("An error occured", {
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
              form={form}
              style={{
                padding: "32px",
                background: "rgb(255 246 242)",
                borderRadius: "9px",
              }}
              name="normal_login"
              initialValues={product}
              onFinish={onFinish}
            >
              <h2 style={{ color: "Black" }}>Product Edit</h2>

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
                  min={1}
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
                    <Col span={12}>
                      <Input
                        placeholder={`Cutting Item ${index + 1}`}
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
                    <Col span={6}>
                      <Upload
                        listType="picture"
                        fileList={item.image}
                        accept="image/*"
                        onChange={(info) =>
                          handleCustomizationImageChange(index, info)
                        }
                        beforeUpload={() => false}
                      >
                        <Button icon={<UploadOutlined />}>Upload Image</Button>
                      </Upload>
                    </Col>
                    <Col span={6}>
                      <Button
                        type="dashed"
                        onClick={() => removeCustomization(index)}
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
