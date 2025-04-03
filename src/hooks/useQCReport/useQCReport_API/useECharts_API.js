// src/hooks/useQCQMB/useECharts_API.js
import axios from "axios";

// const API_URL = "http://localhost:8084/api/v1/getProductionDefectSummary";
const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1/getProductionDefectSummary`;

export const getProductionDefectSummary = async (payload) => {
  try {
    const { data } = await axios.post(API_URL, payload);
    return data.data;
    
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }

};