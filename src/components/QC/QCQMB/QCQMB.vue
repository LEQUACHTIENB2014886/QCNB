<!-- components/QC/QCQMB/QCQMB.vue -->
<template>
  <div class="erpe-charts">
    <div class="top-row">
      <div :class="['flex-item', { fullWidth: !qcStore.showItem2 }, 'item']">
        <div class="chart-wrapper">
          <!-- Component ECharts để hiển thị biểu đồ -->
          <ECharts ref="echartsComponent" :selectedQC="qcStore.selectedQC" :key="moduleKey" />
        </div>
      </div>
      <div v-if="qcStore.showItem2" :class="['flex-item', 'item2']">
        <div class="chart-wrapper2">
          <!-- Component EChartsComparison khi hiển thị Double Chart -->
          <EChartsComparison :selectedQC="qcStore.selectedQC" :key="moduleKey" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, } from 'vue';
import { useQcEchartsStore } from '@/stores/qcqmbEchartsStore';
import ECharts from "@/components/QC/QCQMB/ECharts/EChartsMain.vue";
import EChartsComparison from "@/components/QC/QCQMB/ECharts/EChartsComparison.vue";

const qcStore = useQcEchartsStore();
qcStore.showItem2 = localStorage.getItem("showItem2") === "true";
const moduleKey = computed(() => (qcStore.showItem2 ? "true" : "false"));
const echartsComponent = ref(null);

// Các hàm xuất file được expose cho Header thông qua ref
function exportExcel() {
  if (echartsComponent.value && echartsComponent.value.exportExcel) {
    echartsComponent.value.exportExcel();
  }
}

function exportPDF() {
  if (echartsComponent.value && echartsComponent.value.exportPDF) {
    echartsComponent.value.exportPDF();
  }
}

function exportPNG() {
  if (echartsComponent.value && echartsComponent.value.exportPNG) {
    echartsComponent.value.exportPNG();
  }
}

function exportSVG() {
  if (echartsComponent.value && echartsComponent.value.exportSVG) {
    echartsComponent.value.exportSVG();
  }
}

defineExpose({
  exportExcel,
  exportPDF,
  exportPNG,
  exportSVG,
});


</script>

<style scoped>
.erpe-charts {
  width: 100%;
  height: 100%;
}

.top-row {
  display: flex;
  flex-wrap: nowrap;
  height: 100%;
}

.flex-item {
  position: relative;
  flex: 0 0 50%;
  box-sizing: border-box;
  padding: 0;
}

.flex-item.fullWidth {
  flex: 0 0 100%;
}

.chart-wrapper,
.chart-wrapper2 {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  box-sizing: border-box;
  text-align: center;
  font-weight: bold;
  overflow: auto;
  height: auto;
}

@media (max-width: 1440px) {
  .top-row {
    flex-direction: column;
    height: auto;
  }

  .flex-item {
    flex: 0 0 100%;
    width: 100%;
    position: relative;
  }

  .chart-wrapper,
  .chart-wrapper2 {
    position: relative;
    height: 100vh;
  }
}

@media (max-width: 678px) {
  .chart-wrapper {
    height: auto;
    margin-top: 5px;
  }

  .chart-wrapper2 {
    height: auto;
  }
}
</style>
