<!-- src/components/QC/QCReport/QCReport.vue -->
<template>
  <div class="container">
    <div class="header">
      <div class="header_actions">
        <el-button :icon="ArrowLeftBold" @click="prevWeek" round />
        <el-button :icon="ArrowRightBold" @click="nextWeek" :disabled="isNextDisabled" round />
      </div>
      <div class="header_segmented">
        <el-segmented v-model="selectedOption" :options="options" />
      </div>
      <div class="header_search">
        <el-button :icon="Search" @click="openQCReportSearch" round>Search</el-button>
      </div>
    </div>
    <el-table :data="selectedOption === 'DPPM' ? groupedDPPMErrLeanData : groupedData"
      v-loading="selectedOption === 'DPPM' ? loading['dppm'] : loading['total']">
      <el-table-column prop="LeanName" label="Date/Department" align="center" width="200" />
      <el-table-column v-for="(date, index) in weekDates" :key="index" :prop="date" :label="formatDate(date)"
        align="center" min-width="100">
        <template #header>
          <div class="table_header">
            <span>{{ formatDate(date) }}</span>
          </div>
        </template>
        <template #default="{ row }">
          <template v-if="selectedOption === 'Total_Defects' && row[date] && row[date].Defect_Rate_Percentage !== '-'">
            <div class="cell_clickable" @click="openChildDialog(row, date)">
              {{ row[date]?.Defect_Rate_Percentage > 0 ? row[date].Defect_Rate_Percentage + "%" : "0" }}
            </div>
          </template>
          <template v-else-if="selectedOption === 'DPPM' && row[date] && row[date].DPPM !== '-'">
            <span>{{ row[date].DPPM }}</span>
          </template>
          <span v-else>-</span>
        </template>
      </el-table-column>
    </el-table>
    <QCReportSearch ref="qcReportSearch" />

    <!-- Chèn component QCReportItems và truyền dữ liệu qua props -->
    <QCReportItems ref="qcItemsButtons" :StartDate="activeStartDate" :EndDate="activeEndDate"
      :LeanName="activeRow ? activeRow.LeanName : ''"  :DepName="activeRow ? activeRow.DepName : ''" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useQCReport } from "@/hooks/useQCReport/useQCReport_Table/useQCReportTable";
import { ElMessage } from 'element-plus';
import { ArrowLeftBold, ArrowRightBold, Search } from "@element-plus/icons-vue";
import QCReportItems from "@/components/QC/QCReport/QCReportItems/QCReportItemsDefects/QCReportECharts.vue";
import QCReportSearch from "@/components/QC/QCReport/QCReportItems/QCReportItemsSearch/QCReportSearch.vue";

const selectedOption = ref("DPPM");
const {
  prevWeek,
  nextWeek,
  isNextDisabled,
  formatDate,
  weekDates,
  groupedData,
  groupedDPPMErrLeanData,
  fetchTotalErrLeanData,
  fetchDPPMErrLeanData,
  loading
} = useQCReport(selectedOption);

const options = ref([
  { label: "DPPM", value: "DPPM" },
  { label: "Defect", value: "Total_Defects" }
]);

watch(selectedOption, async (newVal) => {
  if (newVal === "DPPM") {
    await fetchDPPMErrLeanData();
    // console.log("groupedDPPMErrLeanData:", groupedDPPMErrLeanData);
  } else if (newVal === "Total_Defects") {
    await fetchTotalErrLeanData();
    // console.log("groupedData:", groupedData);
  } else {
    ElMessage.warning("Invalid option");
  }
}, { immediate: true });


const formatDateTime = (date, isStart = true) => {
  const dateStr = date;
  return isStart ? `${dateStr} 00:00` : `${dateStr} 23:59`;
};

const qcReportSearch = ref(null);
const openQCReportSearch = () => {
  qcReportSearch.value.open = true;
}

// Các reactive property để truyền dữ liệu cho QCReportItems
const activeRow = ref(null);
const activeStartDate = ref('');
const activeEndDate = ref('');

// Ref đến component QCReportItems
const qcItemsButtons = ref(null);

// Hàm gọi mở dialog Elog trong QCReportItems
const openChildDialog = (row, date) => {
  activeRow.value = row;
  activeStartDate.value = formatDateTime(date, true);
  activeEndDate.value = formatDateTime(date, false);
  qcItemsButtons.value.openElogDialog();
}

</script>



<style scoped>
.container {
  display: flex;
  height: 90vh;
  gap: 10px;
  margin: 20px 20px 0 20px;
}

.header {
  display: flex;
  gap: 10px;
  justify-content: space-between;
  margin: 20px 0;
}

.header_actions {
  display: flex;
  gap: 10px;
}

.header_segmented .el-segmented {
  --el-segmented-item-selected-color: var(--el-text-color-primary);
  --el-segmented-item-selected-bg-color: #ffd100;
  --el-border-radius-base: 16px;
  border: 1px solid #DCDFE6;
}


:deep(.el-table th) {
  font-size: 16px;
  padding: 20px 0;
}

:deep(.el-table td) {
  color: rgb(22, 22, 222, 0.7);
  font-size: 16px;
  padding: 20px 0;
}

.cell_clickable {
  cursor: pointer;
}

.cell_clickable:hover {
  font-weight: bold;
}
</style>