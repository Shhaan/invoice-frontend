import React, { useEffect, useRef, useState } from "react";
import { Form, Modal, InputNumber, Button, Spin, message, Select } from "antd";
import { FaTimes } from "react-icons/fa";
import { axiosInstancemain, baseURL } from "../../Functions/axios";
import toast from "react-hot-toast";
import style from "../../Main.module.css";

const InvoiceProduct = ({ onclose, setSelectedProducts, selectedProducts }) => {
  const [form] = Form.useForm();
  const [product, setProduct] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({});
  const [isEditing, setIsEditing] = useState(false); // Track editing state
  const [type, settype] = useState("shop");
  const [customize, setCustomize] = useState([]);
  const [flag, setflag] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const { data } = await axiosInstancemain.get(
          `/products/?category=${type}&is_paginated=${false}`,
          {
            headers: {
              Authorization: `Token ${localStorage.getItem("token")}`,
            },
          }
        );

        if (data.length === 0) {
          toast("No product available. Try adding products.");
          onclose();
        }

        setProduct(data?.message);
      } catch (error) {
        setProduct([]);
        console.error("Failed to fetch products:", error);
        message.error("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [onclose, type]);

  useEffect(() => {
    const fetchcus = async () => {
      if (currentProduct.product_id) {
        console.log(currentProduct);

        try {
          const customizationResponse = await axiosInstancemain.get(
            `/customize/${currentProduct.product_id}/`
          );

          const customizationData = customizationResponse?.data?.message || [];
          console.log(customizationData);

          if (customizationData.length > 0) {
            setCustomize(customizationData);
          } else {
            setCustomize([]);
          }
        } catch (error) {
          console.log(error);
        }
      }
    };

    fetchcus();
  }, [flag]);

  const handleProductClick = (product) => {
    setIsEditing(false); // Reset editing state
    setCurrentProduct(product);
    setIsModalOpen(true);
    quantityRef.current?.focus();
    form.setFieldsValue({
      count: 1,

      customize: "",
      price: product.price,
    });
    setflag((e) => !e);
  };

  const handleEditClick = (product) => {
    form.setFieldsValue({
      count: product.count,
      customize: product?.customize,
      price: product.price,
    });
    quantityRef.current?.focus();
    setIsEditing(true); // Set editing state
    setCurrentProduct(product);
    setIsModalOpen(true);
    setflag((e) => !e);
  };

  const handleAddOrUpdateProduct = (values) => {
    const { count, customize, price } = values;

    if (isEditing) {
      setSelectedProducts((prevSelectedProducts) =>
        prevSelectedProducts.map((item) =>
          item.id === currentProduct.id
            ? { ...item, count, customize, price }
            : item
        )
      );
    } else {
      // Add new product
      setSelectedProducts((prevSelectedProducts) => [
        ...prevSelectedProducts,
        {
          id: Date.now(),
          product_id: currentProduct.product_id,
          name: currentProduct.name,
          image: currentProduct.image,
          price,
          count,
          quantity: currentProduct?.quantity,

          customize: customize ? customize : "",
        },
      ]);
    }

    setIsModalOpen(false);
    setCurrentProduct({});
  };

  const handleChange = (value) => {};

  const formRef = useRef(null); // Reference for the form
  const quantityRef = useRef(null); // Reference for the quantity input
  const customizeRef = useRef(null); // Reference for the customize select
  const priceRef = useRef(null); // Reference for the price input

  const handleKeyDown = (e, nextRef) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextRef?.current?.focus(); // Focus the next field
    }
  };

  return (
    <div className={style.invoicepopup}>
      <div className="text-end m-3">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px",
          }}
        >
          <select
            onChange={(e) => settype(e.target.value)}
            className={style.customSelect}
          >
            <option value="shop">Shop</option>
            <option value="order">Order</option>
            <option value="combo">Combo</option>
          </select>

          <FaTimes
            onClick={onclose}
            style={{ fontSize: "28px", cursor: "pointer", color: "red" }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin size="large" />
          <p>Loading products...</p>
        </div>
      ) : (
        <div
          style={{
            padding: "10px",
            background: "white",
            display: "flex",
            flexDirection: "row",
            height: "100vh",
          }}
        >
          <div
            className={`col-8 col-md-8 col-xl-9 ${style.rmscroll}`}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "20px",
              justifyContent: "center",
              height: "inherit",
              overflowY: "auto",
            }}
          >
            {product.map((i) => (
              <div
                key={i.product_id}
                className={style.withoutselectedProducts}
                onClick={() => handleProductClick(i)}
                style={{
                  width: "150px",
                  textAlign: "center",
                  padding: "12px",
                  gap: "0",
                  cursor: "pointer",
                  border: "1px solid #f0f0f0",
                  borderRadius: "8px",
                  height: "250px",
                  boxShadow: "1px 1px  #cbcdce",
                }}
              >
                <img
                  style={{
                    width: "100%",
                    height: "120px",
                    objectFit: "contain",
                    marginBottom: "8px",
                    borderRadius: "6px",
                  }}
                  src={baseURL + i.image}
                  alt="product"
                />
                <h3
                  className={style.invoicepopupname}
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#333",
                  }}
                >
                  {i.name}
                </h3>
                <h6> {i.quantity}</h6>
              </div>
            ))}
          </div>

          {/* Selected Products */}

          <div
            className="col-4 col-md-4 col-xl-3"
            style={{
              padding: "20px",
              background: "#f8f8f8",
              borderRadius: "8px",
              height: "inherit",
            }}
          >
            <h3
              style={
                viewportWidth < 500
                  ? {
                      marginBottom: "16px",
                      color: "#333",
                      textAlign: "center",
                      fontSize: "14px",
                    }
                  : { marginBottom: "16px", color: "#333", textAlign: "center" }
              }
            >
              Selected Products
            </h3>
            <div
              style={{ overflowY: "auto", maxHeight: "80%" }}
              className={style.rmscroll}
            >
              {selectedProducts.map((i) => (
                <div
                  style={
                    viewportWidth < 500
                      ? {
                          background: "#fff",
                          marginBottom: "10px",
                          padding: "10px",
                          borderRadius: "6px",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: "pointer",
                          fontSize: "10px",
                        }
                      : {
                          background: "#fff",
                          marginBottom: "10px",
                          padding: "10px",
                          borderRadius: "6px",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: "pointer",
                        }
                  }
                  onClick={() => handleEditClick(i)}
                >
                  <div key={i.id}>
                    {i.name} {`(${i.quantity})`} x {i.count}{" "}
                    {i.customize ? `- ${i.customize}` : ""}
                  </div>
                  <FaTimes
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProducts((prevSelectedProducts) =>
                        prevSelectedProducts.filter(
                          (product) => product.id !== i.id
                        )
                      );
                    }}
                  />
                </div>
              ))}
            </div>
            <h6
              style={
                viewportWidth < 500
                  ? {
                      color: "#333",
                      textAlign: "end",
                      fontSize: "13px",
                      marginTop: "22px",
                    }
                  : { color: "#333", textAlign: "end", marginTop: "22px" }
              }
            >
              Total:
              {selectedProducts
                .reduce((sum, product) => {
                  return sum + product.count * product.price;
                }, 0)
                .toFixed(2)}
            </h6>
          </div>
        </div>
      )}

      {/* Modal for Adding or Editing Product */}
      <Modal
        title={
          isEditing
            ? `Edit ${currentProduct?.name} (${currentProduct?.quantity})`
            : `Customize ${currentProduct?.name} (${currentProduct?.quantity})`
        }
        visible={isModalOpen}
        onCancel={() => (setIsModalOpen(false), setCurrentProduct({}))}
        footer={null}
      >
        {currentProduct && (
          <Form
            layout="vertical"
            form={form}
            onFinish={handleAddOrUpdateProduct}
          >
            <Form.Item
              label="Quantity"
              name="count"
              rules={[{ required: true, message: "Please enter a count" }]}
            >
              <InputNumber
                ref={quantityRef} // Focus reference
                type="number"
                min={1}
                style={{ width: "100%" }}
                autoFocus // Focus on load
              />
            </Form.Item>

            <Form.Item label="Cutting size" name="customize">
              <Select
                style={{ width: "100%" }}
                placeholder="Select a cutting size"
                ref={customizeRef}
                onKeyDown={(e) => handleKeyDown(e, priceRef)}
                onChange={handleChange} // Update state on selection
              >
                {customize.map((size) => (
                  <Select.Option key={size.customization_id} value={size.name}>
                    {size.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Price"
              name="price"
              rules={[{ required: true, message: "Please enter a price" }]}
            >
              <InputNumber
                min={1}
                type="number"
                style={{ width: "100%" }}
                ref={priceRef}
              />
            </Form.Item>

            <Button type="primary" htmlType="submit" block>
              {isEditing ? "Update Product" : "Add to Item"}
            </Button>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default InvoiceProduct;
