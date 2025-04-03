<!-- components/QC/QCQMB/ECharts/EchartsMain.vue -->
<template>
  <div class="container">
    <!-- Hàng đầu: DatePicker với thẻ kéo dài qua toàn bộ -->
    <div class="date-picker-wrapper">
      <div class="date-picker-container">
        <DatePicker ref="datePickerRef" :selectDate="selectedDate" :selectDate2="selectedDate2" />
        <el-button type="primary" plain class="dongudoanhai" @click="fetchApiData">
          <el-icon>
            <Check />
          </el-icon>
        </el-button>
      </div>
    </div>

    <!-- Hàng thứ 2: Bảng và Chart hiển thị ngang nhau -->
    <div class="row-content">
      <!-- Cột bên trái: bảng thông tin (rút gọn) -->
      <div class="table-container">
        <el-descriptions border :column="1" class="custom-descriptions">
          <el-descriptions-item label="Brand">
            <a class="Brand">New Balance</a>
          </el-descriptions-item>
          <el-descriptions-item label="Dep Name">
            <a class="Brand">{{ displayDepName  }}</a>
          </el-descriptions-item>
          <el-descriptions-item label="Defect Rate">
            {{ apiData.Defect_Rate || (apiData[0] && apiData[0].Defect_Rate) }} %
          </el-descriptions-item>
          <el-descriptions-item label="Pro Quantity">
            {{ apiData.Pro_Quantity || (apiData[0] && apiData[0].Pro_Quantity) }}
          </el-descriptions-item>
          <el-descriptions-item label="Total Defects">
            {{ apiData.Total_Defects || (apiData[0] && apiData[0].Total_Defects) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- Cột bên phải: Chart -->
      <div class="chart-container">
        <div ref="chartRef" class="chart-inner"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import { Check } from "@element-plus/icons-vue";
import DatePicker from "@/components/DatePicker/DatePicker.vue";
// API
import { getProductionDefectSummary } from "@/hooks/useQCQMB/useQCQMB_API/useECharts_API.js";
// Echarts
import useEChartsMain from "@/hooks/useQCQMB/useQCQMB_ECharts/useEChartsMain.js";
// Export
import { exportDataToExcel } from "@/hooks/useQCQMB/useQCQMB_Export/useExcelExport_QCQMB.js";
import { exportDataToPDF } from "@/hooks/useQCQMB/useQCQMB_Export/usePDFExport_QCQMB.js";
import { exportDataToPNG } from "@/hooks/useQCQMB/useQCQMB_Export/usePNGExport_QCQMB.js";
import { exportDataToSVG } from "@/hooks/useQCQMB/useQCQMB_Export/useSVGExport_QCQMB.js";
// State
import { useQcEchartsStore } from "@/stores/qcqmbEchartsStore";
import { useDashboardStore } from '@/stores/dashboardStore';
//Loading
import { ElLoading } from "element-plus";

let loadingInstance = null;

const dashboardStore = useDashboardStore();

// Tạo computed property để tìm LeanName tương ứng
const displayDepName = computed(() => {
  const dept = dashboardStore.arrDepName.find((item) => item.DepName === DepName.value);
  return dept ? dept.LeanName : DepName.value;
});
const qcStore = useQcEchartsStore();

const selectedDate = ref(localStorage.getItem("selectedDate") || "");
const selectedDate2 = ref(localStorage.getItem("selectedDate2") || "");
const selectedQCQMB = computed(() => qcStore.selectedQCQMB);
const DepName = ref(selectedQCQMB.value); 

const apiData = ref<any>({});
const chartRef = ref<any>(null);
const echartsModule = computed(() => (useEChartsMain));
const { updateChart } = echartsModule.value(chartRef, apiData);

/* -------------------------------
  Logic gọi API
-------------------------------*/
const datePickerRef = ref<any>(null);
  async function fetchApiData() {
  if (!selectedDate.value) {
    selectedDate.value = localStorage.getItem("selectedDate") || "";
  }
  if (!selectedDate2.value) {
    selectedDate2.value = localStorage.getItem("selectedDate2") || "";
  }

  if (datePickerRef.value && datePickerRef.value.getSelectedDates) {
    const dates = datePickerRef.value.getSelectedDates();
    selectedDate.value = dates.selectDate;
    selectedDate2.value = dates.selectDate2;
  }

  await nextTick();

  loadingInstance = ElLoading.service({
    lock: true,
    text: "Loading data...",
    background: "rgba(0, 0, 0, 0.8)",
  });

  try {
    const dayFormatted = selectedDate.value.split(" ")[0];
    const dayFormatted2 = selectedDate2.value.split(" ")[0];

    let data = await getProductionDefectSummary(dayFormatted, dayFormatted2, DepName.value);

    apiData.value = data || {};
    localStorage.setItem("selectedDate", selectedDate.value);
    localStorage.setItem("selectedDate2", selectedDate2.value);

    await nextTick();
    updateChart();
  } catch (error) {
    console.error("Lỗi API:", error);
    ElMessage.error("Lỗi khi lấy dữ liệu API, vui lòng thử lại!");
  } finally {
    // Kết thúc loading
    loadingInstance.close();
  }
}


onMounted(async () => {
  await nextTick();
  fetchApiData();
});
watch(selectedQCQMB, (newSelectedQCQMB) => {
  DepName.value = newSelectedQCQMB;  
  fetchApiData();  
});
/* -------------------------------
 Export ECharts
-------------------------------*/
async function exportExcel() {
  try {
    let chartImageDataUrl = "";
    if (chartRef.value && chartRef.value.__chart__) {
      chartImageDataUrl = chartRef.value.__chart__.getDataURL({
        type: "png",
        pixelRatio: 5,
        backgroundColor: "#fff",
      });
    }
    if (!chartImageDataUrl) {
      ElMessage.error("Unable to get image from chart!");
      return;
    }

    const { DepName, Defect_Rate, Pro_Quantity, Total_Defects } = apiData.value[0];
    const newApiData = [
      {
        "Start Date": selectedDate.value,
        "End Date": selectedDate2.value,
        "Dep Name": DepName,
        "Defect Rate": Defect_Rate,
        "Pro Quantity": Pro_Quantity,
        "Total Defects": Total_Defects,
      },
    ];

    await exportDataToExcel(newApiData, chartImageDataUrl);
    ElMessage.success("Export Excel success");
  } catch (error) {
    console.error("Lỗi khi xuất Excel:", error);
    ElMessage.error("Can't export Excel");
  }
}
async function exportPDF(): Promise<void> {
  try {
    let chartImageDataUrl: string = "";

    if (chartRef.value && (chartRef.value as any).__chart__) {
      chartImageDataUrl = (chartRef.value as any).__chart__.getDataURL({
        type: "jpeg",
        pixelRatio: 3,
        backgroundColor: "#fff",
      });
    }

    if (!chartImageDataUrl) {
      ElMessage.error("Unable to get image from chart!");
      return;
    }

    interface ApiData {
      DepName: string;
      Defect_Rate: number;
      Pro_Quantity: number;
      Total_Defects: number;
    }

    if (!apiData.value || apiData.value.length === 0) {
      ElMessage.error("Can't export PDF!");
      return;
    }

    const { DepName, Defect_Rate, Pro_Quantity, Total_Defects }: ApiData = apiData.value[0];

    const newApiData = [
      {
        "Start Date": selectedDate.value,
        "End Date": selectedDate2.value,
        "Dep Name": DepName,
        "Defect Rate": Defect_Rate,
        "Pro Quantity": Pro_Quantity,
        "Total Defects": Total_Defects,
      },
    ];

    await exportDataToPDF(newApiData, chartImageDataUrl);
    ElMessage.success("Export PDF success");
  } catch (error) {
    console.error("Lỗi khi xuất PDF:", error);
    ElMessage.error("Can't export PDF");
  }
}
async function exportPNG() {
  try {
    let chartImageDataUrl = "";
    if (chartRef.value && chartRef.value.__chart__) {
      chartImageDataUrl = chartRef.value.__chart__.getDataURL({
        type: "jpeg",
        pixelRatio: 3,
        backgroundColor: "#fff",
      });
    }
    if (!chartImageDataUrl) {
      return ElMessage.error("Unable to get image from chart!");
    }

    const { DepName, Defect_Rate, Pro_Quantity, Total_Defects } = apiData.value[0];
    const newApiData = [
      {
        "Start Date": selectedDate.value,
        "End Date": selectedDate2.value,
        "Dep Name": DepName,
        "Defect Rate": Defect_Rate,
        "Pro Quantity": Pro_Quantity,
        "Total Defects": Total_Defects,
      },
    ];

    await exportDataToPNG(newApiData, chartImageDataUrl);
    ElMessage.success("Export PNG success");
  } catch (error) {
    console.error("Lỗi khi xuất PNG:", error);
    ElMessage.error("Can't export PNG");
  }
}
async function exportSVG() {
  try {
    let chartImageDataUrl = "";
    if (chartRef.value && chartRef.value.__chart__) {
      chartImageDataUrl = chartRef.value.__chart__.getDataURL({
        type: "jpeg",
        pixelRatio: 3,
        backgroundColor: "#fff",
      });
    }
    if (!chartImageDataUrl) {
      return ElMessage.error("Unable to get image from chart!");
    }

    const { DepName, Defect_Rate, Pro_Quantity, Total_Defects } = apiData.value[0];
    const newApiData = [
      {
        "Start Date": selectedDate.value,
        "End Date": selectedDate2.value,
        "Dep Name": DepName,
        "Defect Rate": Defect_Rate,
        "Pro Quantity": Pro_Quantity,
        "Total Defects": Total_Defects,
      },
    ];

    await exportDataToSVG(newApiData, chartImageDataUrl);
    ElMessage.success("Export SVG success");
  } catch (error) {
    console.error("Lỗi khi xuất SVG:", error);
    ElMessage.error("Can't export SVG");
  }
}

// Expose các hàm export cho component cha
defineExpose({
  exportExcel,
  exportPDF,
  exportPNG,
  exportSVG,
});
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* Hàng đầu: DatePicker */
.date-picker-wrapper {
  width: auto;
  /* background-color: #f5f7fa; */
  padding-left: 10px;
  /* box-shadow: 0 1px 4px rgba(0,0,0,0.1); */
  /* margin-bottom: 10px; */
}

.date-picker-container {
  display: flex;
  align-items: center;
}

/* Hàng thứ 2: chia thành 2 cột */
.row-content {
  display: flex;
  width: 100%;
}

.dongudoanhai {
  margin-left: 10px;
}

/* Bảng hiển thị bên trái */
.table-container {
  flex-shrink: 0;
  width: 280px;
  margin-left: 10px;
}

/* Chart bên phải */
.chart-container {
  flex: 1;
}

.chart-inner {
  width: 100%;
  height: 80vh;
  transition: all 0.5s ease;
}

/* Các style cho bảng */
.custom-descriptions {
  min-width: 100%;
  overflow-x: hidden;
}

.custom-descriptions .el-descriptions__label {
  width: 120px !important;
}

.Brand {
  font-weight: 600;
}

@media (max-width: 768px) {
  .row-content {
    flex-direction: column;
  }

  .table-container {
    width: 100%;
    margin-bottom: 10px;
  }

  .chart-inner {
    height: 50vh;
  }
}
</style>
