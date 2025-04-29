import axios from "axios";

export const baseURL = "https://invoice-backend-eight.vercel.app";
const baseURLmain = "https://invoice-backend-eight.vercel.app/main";
export const phone = 97430162002;
export const whatsappapi = "https://api.whatsapp.com/send/?phone";

export const axiosInstance = axios.create({
  baseURL: baseURL,
});

export const createAxiosInstanceWithAuth = () => {
  const token = localStorage.getItem("token");
  return axios.create({
    baseURL: baseURL,
    headers: { Authorization: `Token ${token}` },
  });
};

export const axiosInstancemain = axios.create({
  baseURL: baseURLmain,
});
