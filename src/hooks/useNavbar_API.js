// hooks/useNavbar_API.js
import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1/getDepName`;

export const getDepName = async () => {
  try {
    const response = await axios.get(API_URL); 
    // console.log("Dữ liệu trả về từ API:", response.data);
    return response.data.data; // return data from API

  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};
