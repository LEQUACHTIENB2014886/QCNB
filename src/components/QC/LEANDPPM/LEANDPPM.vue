<!-- components/QC/LEANDPPM/LEANDPPM.vue -->
<template>
  <div class="container2">
    <div class="container-top2">
      <!-- Sử dụng component DatePicker -->
      <DatePicker ref="datePickerRef" :selectDate="selectedDate" :selectDate2="selectedDate2" />
      <!-- Nút Confirm nằm ở đây -->
      <div class="date-time-input-config">
        <el-button type="primary" plain class="dongudoanhai" @click="confirmSelection">
          <el-icon>
            <Check />
          </el-icon>
        </el-button>
      </div>
    </div>

    <div class="container-bottom2">
      <div ref="chartRef" class="chart-container2"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from "vue";
import { ElMessage } from "element-plus";
import DatePicker from "@/components/DatePicker/DatePicker.vue";
import { Check } from '@element-plus/icons-vue';
import { getLEANDPPMData } from "@/hooks/useLEANDPPM/useLEANDPPM_API/useLEANDPPM_API.js";
import useEChartsTemp from "@/hooks/useLEANDPPM/useLEANDPPM_ECharts/useLEANDPPM_ECharts.js";
import { useQcEchartsStore } from "@/stores/qcqmbEchartsStore";

const qcStore = useQcEchartsStore();
const selectedQC = computed(() => qcStore.selectedQC);

const selectedDate = ref(localStorage.getItem("selectedDate") || "");
const selectedDate2 = ref(localStorage.getItem("selectedDate2") || "");

const apiData = ref<any>({});
const chartRef = ref<any>(null);
const datePickerRef = ref<any>(null);

function confirmSelection() {
  if (datePickerRef.value && datePickerRef.value.getSelectedDates) {
    const dates = datePickerRef.value.getSelectedDates();
    selectedDate.value = dates.selectDate;
    selectedDate2.value = dates.selectDate2;
    localStorage.setItem("selectedDate", selectedDate.value);
    localStorage.setItem("selectedDate2", selectedDate2.value);
    fetchApiData2();
  }
}

async function fetchApiData2() {
  if (!selectedDate.value || !selectedDate2.value || !selectedQC.value) return;
  try {
    const dayFormatted = selectedDate.value.split(' ')[0];
    const dayFormatted2 = selectedDate2.value.split(' ')[0];
    const data = await getLEANDPPMData(dayFormatted, dayFormatted2);
    apiData.value = data || {};
    await nextTick();
    ElMessage.success("Data loaded successfully!");
    updateChart();
  } catch (error) {
    ElMessage.error("Lỗi khi lấy dữ liệu API, vui lòng thử lại!");
    console.error("Có lỗi khi lấy dữ liệu API:", error);
  }
  // isFetching = false;
}

// Gọi useEChartsTemp trực tiếp để lấy updateChart
const { updateChart } = useEChartsTemp(chartRef, apiData);
// console.log(apiData)
onMounted(() => {
  fetchApiData2();
});

</script>




<style scoped>
.container2 {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 93vh;
}

.container-top2 {
  width: 100%;
  max-width: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.date-time-input-config {
  margin-left: 10px;
}

.container-bottom2 {
  width: 100%;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
  margin: 20px 0;
}

.chart-container2 {
  width: 100%;
  height: 80vh;
  overflow: hidden;
  transition: all 0.5s ease;
}

.dongudoanhai {
  width: 40px;
  height: 40px;
}

/* Responsive styles */
@media (max-width: 678px) {
  .container2 {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .container-top2,
  .container-bottom2 {
    max-width: 100%;
    width: 100%;
    margin: 0 auto;
  }

  .container-top2 {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .chart-container2 {
    margin: 15px 0;
    height: 45vh;
  }

  .date-picker-container2 {
    display: flex;
    align-items: center;
    border: 1px solid #d8d7d7;
    margin-top: 10px;
    border-radius: 4px 4px 0px 0px;
    padding: 4.6px;
    width: 210px;
  }
}
</style>
