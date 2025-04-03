<!-- src\components\QC\QCReport\QCReportItems\QCReportItems.vue -->
<template>
  <el-dialog v-model="showElogDialog" @open="handleOpen" :title="dialogTitle" width="90%">
    <div ref="chartRef" class="chart-container"></div>
    <template #footer>
      <el-button @click="showElogDialog = false">Cancel</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onBeforeUnmount, onMounted, computed } from "vue";
import { ElMessage } from "element-plus";
import { getProductionDefectSummary } from "@/hooks/useQCReport/useQCReport_API/useECharts_API.js";
import { initEChart, updateEChart, resizeEChart } from '@/hooks/useQCReport/useQCReport_ECharts/useQCReportECharts.js';

const showElogDialog = ref(false);

const props = defineProps({
  DepName: { type: String, required: true },
  StartDate: { type: String, required: true },
  EndDate: { type: String, required: true },
  LeanName: { type: String, required: true },
});

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  if (dateStr.includes("T")) {
    return dateStr.split("T")[0];
  }
  if (dateStr.includes(" ")) {
    return dateStr.split(" ")[0];
  }
  return dateStr;
};

const dialogTitle = computed(() => {
  const dateOnly = formatDate(props.StartDate);
  return `Total Defects Chart - ${props.LeanName} - ${dateOnly}`;
});

const openElogDialog = () => {
  showElogDialog.value = true;
};

defineExpose({
  openElogDialog
});

const handleOpen = () => {
  nextTick(() => {
    if (chart.value) {
      chart.value.resize();
      updateChart();
    }
  });
};

const chartRef = ref(null);
const chart = ref(null);
const chartData = ref([]);
const maxLabelChars = ref(30);
let resizeTimeout;

async function fetchChartData() {
  try {
    const payload = { LeanName: props.LeanName, StartDate: props.StartDate, EndDate: props.EndDate, DepName: props.DepName };
    const data = await getProductionDefectSummary(payload);
    chartData.value = data || [];
  } catch (error) {
    console.error("Error calling API", error);
    ElMessage.error("Error data");
  }
}

const initChart = async () => {
  await nextTick();
  if (!chartRef.value) {
    setTimeout(initChart, 1500);
    return;
  }
  if (!chart.value) {
    chart.value = initEChart(chartRef.value, maxLabelChars);
    window.addEventListener("resize", resizeChart);
  }
};

const resizeChart = () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    nextTick().then(() => {
      if (chart.value) {
        resizeEChart(chart.value, updateChart);
      }
    });
  });
};

const updateChart = async () => {
  await nextTick();
  if (!chartRef.value || !chart.value) return;
  updateEChart(chart.value, chartData.value, maxLabelChars);
};

onMounted(async () => {
  await initChart();
  await fetchChartData();
  updateChart();
});

watch(() => [props.StartDate, props.EndDate, props.LeanName, props.DepName], async () => {
  await fetchChartData();
  await nextTick();
  updateChart();
});
watch(showElogDialog, (newVal) => {
  if (newVal) {
    nextTick(() => {
      setTimeout(() => {
        if (chart.value) {
          chart.value.resize();
          updateChart();
        }
      }, 1500);
    });
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeChart);
});
</script>


<style scoped>
.chart-container {
  width: 100%;
  height: 66vh;
}
</style>
