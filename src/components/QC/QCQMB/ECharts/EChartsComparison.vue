<!-- components/QC/QCQMB/ECharts/EChartsComparison.vue -->
<template>
  <div class="container">
    <!-- Hàng đầu: DatePicker với thẻ kéo dài qua toàn bộ, căn phải -->
    <div class="date-picker-wrapper">
      <div class="date-picker-container">
        <el-button type="primary" plain class="dongudoanhai" @click="fetchApiData_Comparison">
          <el-icon>
            <Check />
          </el-icon>
        </el-button>
        <DatePicker ref="datePickerRef_Comparison" :selectDate3="selectedDate3" :selectDate4="selectedDate4" />

      </div>
    </div>

    <!-- Hàng thứ 2: Chart và Bảng hiển thị ngang nhau -->
    <div class="row-content">
      <!-- Cột bên trái: Chart -->
      <div class="chart-container">
        <div ref="chartRef" class="chart-inner"></div>
      </div>

      <!-- Cột bên phải: bảng thông tin (rút gọn) -->
      <div class="table-container">
        <el-descriptions border :column="1" class="custom-descriptions">
          <el-descriptions-item label="Brand">
            <a class="Brand">New Balance</a>
          </el-descriptions-item>
          <el-descriptions-item label="Dep Name">
            <a class="Brand">{{ displayDepName }}</a>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import { Check } from "@element-plus/icons-vue";
import DatePicker from "@/components/DatePicker/DatePicker_Comparison.vue";
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

const selectedDate3 = ref(localStorage.getItem("selectedDate3") || "");
const selectedDate4 = ref(localStorage.getItem("selectedDate4") || "");
const selectedQCQMB = computed(() => qcStore.selectedQCQMB);
const DepName = ref(selectedQCQMB.value);

const apiData = ref<any>({});
const chartRef = ref<any>(null);

const echartsModule = computed(() => (useEChartsMain));
const { updateChart } = echartsModule.value(chartRef, apiData);

/* -------------------------------
  Logic gọi API
-------------------------------*/
const datePickerRef_Comparison = ref<any>(null);
async function fetchApiData_Comparison() {
  if (!selectedDate3.value) {
    selectedDate3.value = localStorage.getItem("selectedDate3") || "";
  }
  if (!selectedDate4.value) {
    selectedDate4.value = localStorage.getItem("selectedDate4") || "";
  }

  // Cập nhật ngày từ DatePicker
  if (datePickerRef_Comparison.value && datePickerRef_Comparison.value.getSelectedDates) {
    const dates = datePickerRef_Comparison.value.getSelectedDates();

    selectedDate3.value = dates.selectDate3;
    selectedDate4.value = dates.selectDate4;
  }

  await nextTick(); // Chờ Vue cập nhật state

  loadingInstance = ElLoading.service({
    lock: true,
    text: "Loading data...",
    background: "rgba(0, 0, 0, 0.8)",
  });

  try {
    const dayFormatted3 = selectedDate3.value.split(' ')[0];
    const dayFormatted4 = selectedDate4.value.split(' ')[0];

    let data = await getProductionDefectSummary(dayFormatted3, dayFormatted4, DepName.value);

    if (!data || (Array.isArray(data) && !data.length) || !Object.keys(data).length) {
      // ElMessage.warning("Không có dữ liệu!");
    }
    apiData.value = data || {};
    localStorage.setItem("selectedDate3", selectedDate3.value);
    localStorage.setItem("selectedDate4", selectedDate4.value);

    await nextTick();
    updateChart();
    // ElMessage.success("Chart will be updated!")
  } catch (error) {
    // ElMessage.error("Lỗi khi lấy dữ liệu API, vui lòng thử lại!");
    console.error("Lỗi API:", error);
  } finally {
    // Kết thúc loading
    loadingInstance.close();
  }
}

onMounted(async () => {
  await nextTick();
  fetchApiData_Comparison();
});
watch(selectedQCQMB, (newSelectedQCQMB) => {
  DepName.value = newSelectedQCQMB;
  fetchApiData_Comparison();
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
        "Start Date": selectedDate3.value,
        "End Date": selectedDate4.value,
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
    ElMessage.error("Lỗi khi xuất Excel, vui lòng thử lại!");
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
      ElMessage.error("Không có dữ liệu để xuất PDF!");
      return;
    }

    const { DepName, Defect_Rate, Pro_Quantity, Total_Defects }: ApiData = apiData.value[0];

    const newApiData = [
      {
        "Start Date": selectedDate3.value,
        "End Date": selectedDate4.value,
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
    ElMessage.error("Lỗi khi xuất PDF, vui lòng thử lại!");
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
        "Start Date": selectedDate3.value,
        "End Date": selectedDate4.value,
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
    ElMessage.error("Lỗi khi xuất PNG, vui lòng thử lại!");
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
        "Start Date": selectedDate3.value,
        "End Date": selectedDate4.value,
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
    ElMessage.error("Lỗi khi xuất SVG, vui lòng thử lại!");
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
  width: 98%;
}

/* Hàng đầu: DatePicker căn phải */
.date-picker-wrapper {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  padding-right: 10px;
}

.date-picker-container {
  display: flex;
  align-items: center;
}

.dongudoanhai {
  margin-right: 10px;
}

/* Hàng thứ 2: chia thành 2 cột */
.row-content {
  display: flex;
  width: 100%;
}

/* Chart bên trái */
.chart-container {
  flex: 1;
}

/* Bảng hiển thị bên phải */
.table-container {
  flex-shrink: 0;
  width: 280px;

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
  margin-right: 10px;
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
