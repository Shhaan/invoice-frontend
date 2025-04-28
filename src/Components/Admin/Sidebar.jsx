import React from "react";
import style from "../../Main.module.css";
import { NavLink, useNavigate } from "react-router-dom";
import {
  axiosInstance,
  createAxiosInstanceWithAuth,
} from "../../Functions/axios";
export default function Sidebar({ side, props }) {
  const navigate = useNavigate();
  const handleClick = async () => {
    try {
      const axios = createAxiosInstanceWithAuth();
      const data = await axios.post("logout/");

      if (data.status == 200) {
        navigate("/admin/login");
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <React.Fragment>
      {props.map((i) => (
        <NavLink
          to={i.navigate}
          style={({ isActive }) => ({
            cursor: "pointer",
            color: "white",
            textDecoration: "none",
          })}
        >
          {i.name}
        </NavLink>
      ))}

      <NavLink
        style={{ color: "red", textDecoration: "none", cursor: "pointer" }}
        onClick={handleClick}
      >
        Logout
      </NavLink>
    </React.Fragment>
  );
}
