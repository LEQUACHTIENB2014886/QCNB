// src/hooks/useLEANDPPM/useLEANDPPM_API.js
import axios from "axios";

const API_URL_DPPMALL = `${import.meta.env.VITE_BACKEND_URL}/api/v1/getDPPMErrAllLean`;

export const getLEANDPPMData = async (StartDate, EndDate) => {
  try {
    const { data } = await axios.post(API_URL_DPPMALL, {
      StartDate,
      EndDate,
    });
    // console.log(StartDate)
    // console.log(EndDate)
    return data.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};
