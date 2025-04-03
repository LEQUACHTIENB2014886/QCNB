// hooks/useQCReport/useQCReportSearch_API.js
import axios from "axios";

const API_URL_DPPM = `${import.meta.env.VITE_BACKEND_URL}/api/v1/getDailyDPPMByLeanReport`;

export const fetchDPPMData = async (selectedDate, selectedDep) => {
    try {
        if (!selectedDate.length) return [];
        const star = selectedDate[0];
        const end = selectedDate[1] || selectedDate[0];
        const response = await axios.post(API_URL_DPPM, {
            StartDate: star,
            EndDate: end,
            DepName: selectedDep
        });
        return response.data?.data || [];
    } catch (error) {
        console.error("Error call API DPPM:", error.response?.data || error.message);
        return [];
    }
};
