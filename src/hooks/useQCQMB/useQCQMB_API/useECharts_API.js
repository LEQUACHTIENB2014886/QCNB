// hooks/useECharts_API.js
import axios from "axios";

// const API_URL = "http://localhost:8084/api/v1/getProductionDefectSummary";
const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1/getProductionDefectSummary`;

export const getProductionDefectSummary = async (StartDate, EndDate, DepName) => {

  try {
    const { data } = await axios.post(API_URL, {
      StartDate: StartDate,
      EndDate: EndDate,
      DepName: DepName,
    });
    return data.data;

  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
  
};