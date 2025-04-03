// src/hooks/useQCReport.js
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import axios from "axios";
import { formatDate } from "@/util/formatDate.js";

// Hàm cộng số ngày vào 1 đối tượng Date
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Hàm lấy ngày đầu tuần (thứ 2) của ngày hiện tại
function getMonday(date) {
  const current = new Date(date);
  current.setHours(0, 0, 0, 0);
  const day = current.getDay();
  const diff = day === 0 ? 1 : 1 - day;
  current.setDate(current.getDate() + diff);
  return current;
}

// Nhận vào selectedOption từ component để quyết định gọi API nào trong các hàm prevWeek/nextWeek
export function useQCReport(selectedOption) {
  const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1/getTotalErrlean`;
  const API_URL_DPPM = `${import.meta.env.VITE_BACKEND_URL}/api/v1/getDPPMErrlean`;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monday = getMonday(today);
  const StartDate = ref(monday);
  const loading = ref({});

  const totalErrLeanData = ref([]);
  const totalDPPMErrLeanData = ref([]);

  // Tính ngày kết thúc tuần dựa trên StartDate
  const EndDate = computed(() => addDays(StartDate.value, 6));

  // Mảng số từ 0 đến 6, ứng với 7 ngày trong tuần
  const daysInWeek = [0, 1, 2, 3, 4, 5, 6];
  // Tính mảng các ngày trong tuần theo định dạng "YYYY-MM-DD"
  const weekDates = computed(() => {
    return daysInWeek.map(i => {
      // Sử dụng formatDate và cắt lấy phần ngày (10 ký tự đầu)
      return formatDate(addDays(StartDate.value, i)).slice(0, 10);
    });
  });

  // Kiểm tra disable nút next: không cho phép chuyển sang tuần sau khi vượt quá tuần hiện tại
  const isNextDisabled = computed(() => {
    const nextStartDate = addDays(StartDate.value, 7);
    // Lấy ngày thứ 2 của tuần hiện tại
    const currentMonday = getMonday(today);
    return nextStartDate > currentMonday;
  });

  // Hàm định dạng ngày hiển thị (cắt phần "MM-DD" từ chuỗi ngày)
  const displayFormatDate = (date) => {
    const dateStr = formatDate(date).slice(0, 10);
    return dateStr.substring(5);
  };

  // Nhóm dữ liệu theo phòng ban cho totalErrLeanData
  const groupedData = computed(() => {
    const grouped = {};
    // Sử dụng LeanName để nhóm dữ liệu
    totalErrLeanData.value.forEach(item => {
      if (!grouped[item.LeanName]) {
        // Gán cả LeanName và DepName từ item đầu tiên của nhóm
        grouped[item.LeanName] = { 
          LeanName: item.LeanName,
          DepName: item.DepName  // Lấy DepName tại đây
        };
        weekDates.value.forEach(date => {
          grouped[item.LeanName][date] = { Defect_Rate_Percentage: "0" };
        });
      }
      const itemDate = new Date(item.ScanDate);
      const formattedDate = formatDate(itemDate).slice(0, 10);
      if (weekDates.value.includes(formattedDate)) {
        grouped[item.LeanName][formattedDate].Defect_Rate_Percentage =
          item.Defect_Rate_Percentage !== undefined ? item.Defect_Rate_Percentage : "0";
      }
    });
    return Object.values(grouped);
  });
  

  // Hàm trợ giúp: định dạng ngày với thời gian cụ thể ("00:00:00" hoặc "23:59:59")
  function formatDateTime(date, timeStr) {
    return formatDate(date).slice(0, 10) + " " + timeStr;
  }

  const fetchTotalErrLeanData = async () => {
    loading.value["total"] = true;
    try {
      const response = await axios.post(API_URL, {
        StartDate: formatDateTime(StartDate.value, "00:00:00"),
        EndDate: formatDateTime(EndDate.value, "23:59:59")
      });
      totalErrLeanData.value = response.data?.data || [];
      // console.log("TotalErrLeanData:", totalErrLeanData.value);
    } catch (error) {
      console.error("Error calling TotalErrLeanData API:", error.response?.data || error.message);
      totalErrLeanData.value = [];
      ElMessage.error("Error loading aggregate data. Please try again!");
    } finally {
      loading.value["total"] = false;
    }
  };

  // Nhóm dữ liệu theo phòng ban cho totalDPPMErrLeanData
  const groupedDPPMErrLeanData = computed(() => {
    const grouped = {};
    const allDepartments = [...new Set(totalDPPMErrLeanData.value.map(item => item.LeanName))];
    allDepartments.forEach(LeanName => {
      grouped[LeanName] = { LeanName: LeanName };
      weekDates.value.forEach(date => {
        grouped[LeanName][date] = { DPPM: "0" };
      });
    });
    totalDPPMErrLeanData.value.forEach(item => {
      const itemDate = new Date(item.ScanDate);
      const formattedDate = formatDate(itemDate).slice(0, 10);
      if (weekDates.value.includes(formattedDate)) {
        grouped[item.LeanName][formattedDate].DPPM = item.DPPM;
      }
    });
    return Object.values(grouped);
  });

  const fetchDPPMErrLeanData = async () => {
    loading.value["dppm"] = true;
    try {
      const response = await axios.post(API_URL_DPPM, {
        StartDate: formatDateTime(StartDate.value, "00:00:00"),
        EndDate: formatDateTime(EndDate.value, "23:59:59")
      });
      totalDPPMErrLeanData.value = response.data?.data || [];
    } catch (error) {
      console.error("Lỗi kết nối API DPPM:", error.response?.data || error.message);
      totalDPPMErrLeanData.value = [];
      ElMessage.error("Có lỗi khi tải dữ liệu DPPM. Vui lòng thử lại!");
    } finally {
      loading.value["dppm"] = false;
    }
  };

  const prevWeek = () => {
    StartDate.value = addDays(StartDate.value, -7);
    if (selectedOption.value === "DPPM") {
      fetchDPPMErrLeanData();
    } else if (selectedOption.value === "Total_Defects") {
      fetchTotalErrLeanData();
    }
  };

  const nextWeek = () => {
    const nextStartDate = addDays(StartDate.value, 7);
    const currentMonday = getMonday(today);
    if (nextStartDate > currentMonday) {
      console.warn("⚠ Không thể vượt quá tuần hiện tại!");
      return;
    }
    StartDate.value = nextStartDate;
    if (selectedOption.value === "DPPM") {
      fetchDPPMErrLeanData();
    } else if (selectedOption.value === "Total_Defects") {
      fetchTotalErrLeanData();
    }
  };

  return {
    StartDate,
    EndDate,
    weekDates,
    formatDate: displayFormatDate,
    groupedData,
    groupedDPPMErrLeanData,
    totalErrLeanData,
    totalDPPMErrLeanData,
    loading,
    prevWeek,
    nextWeek,
    isNextDisabled,
    fetchTotalErrLeanData,
    fetchDPPMErrLeanData,
  };
}
