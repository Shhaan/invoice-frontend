import React, { useEffect } from "react";
import { createAxiosInstanceWithAuth } from "./axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function AdminWrapper({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const axiosInstanceAuthorization = createAxiosInstanceWithAuth();
        const response = await axiosInstanceAuthorization.get("user/");

        if (response.status !== 200) {
          throw new Error("User not authenticated");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        if (!window.location.pathname.includes("/admin/login")) {
          navigate("/admin/login");
          toast.error("User not authenticated", { duration: 3000 });
        }
      }
    };

    fetchUser();
  }, [navigate]);

  return <div>{children}</div>;
}

export default AdminWrapper;
