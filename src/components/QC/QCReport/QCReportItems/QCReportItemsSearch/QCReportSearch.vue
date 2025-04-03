<!-- src/components/QC/QCReport/QCReportSearch.vue -->
<template>
  <el-drawer v-model="open" title="Search" direction="rtl" size="60%">
    <div class="container-search">
      <div class="label">
        Department
        <el-select v-model="selectedDep" placeholder="Select Department" style="width: 180px;">
          <el-option v-for="item in departmentOptions" :key="item.DepName" :label="item.LeanName"
            :value="item.DepName" />
        </el-select>

      </div>
      <div class="container-search-item">
        <div class="label">
          Date & Time
        </div>
        <div>
          <DatePicker ref="datePickerRef" :selectDate="selectedDate" :selectDate2="selectedDate2" />
        </div>
      </div>
      <div>
        <el-button type="primary" @click="fetchApiData" :icon="Search" plain style="height: 40px;">Search</el-button>
      </div>

      <el-table :data="dppmData" v-loading="loading">
        <el-table-column prop="LeanName" label="Department" />
        <el-table-column prop="DPPM" label="DPPM" />
        <el-table-column prop="Total_Defects" label="Total Defects" />
        <el-table-column label="Date">
          <template #default="scope">
            {{ formatDate(scope.row.ScanDate) }}
          </template>
        </el-table-column>
        <template #empty>
          <div class="empty">
            <el-empty />
          </div>
        </template>
      </el-table>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Search } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { formatDate } from "@/util/formatDate.js";

// API
import { fetchDPPMData } from "@/hooks/useQCReport/useQCReport_API/useQCReportSearch_API.js";

// State
import { useDashboardStore } from "@/stores/dashboardStore";
// Import component DatePicker
import DatePicker from "@/components/DatePicker/DatePicker.vue";

// Types
import type { TotalErrleaninday } from "@/types/QC_Reports";
const open = ref(false);
const loading = ref(false);
const selectedDep = ref("");

const selectedDate = ref(localStorage.getItem("selectedDate") || "");
const selectedDate2 = ref(localStorage.getItem("selectedDate2") || "");

const dppmData = ref([]);

// Lấy mảng phòng ban từ store đã lưu
const dashboardStore = useDashboardStore();
const departmentNames = computed(() => dashboardStore.arrDepName);
const departmentOptions = computed(() =>
  departmentNames.value.map((item: TotalErrleaninday) => ({
    DepName: item.DepName,
    LeanName: item.LeanName
  }))
);

// console.log(departmentNames.value)
const datePickerRef = ref<any>(null);
const fetchApiData = async () => {
  // Kiểm tra nếu chưa chọn đầy đủ department hoặc thời gian
  if (datePickerRef.value && datePickerRef.value.getSelectedDates) {
    const dates = datePickerRef.value.getSelectedDates();
    selectedDate.value = dates.selectDate;
    selectedDate2.value = dates.selectDate2;

    // Cập nhật localStorage nếu cần
    localStorage.setItem("selectedDate", selectedDate.value);
    localStorage.setItem("selectedDate2", selectedDate2.value);
  }

  if (!selectedDep.value || !selectedDate.value || !selectedDate2.value) {
    ElMessage({
      message: "Please select full Department and time",
      type: "warning",
    });
    return;
  }

  loading.value = true;

  // Gộp 2 giá trị ngày thành mảng giống như range ban đầu
  const dateRange = [selectedDate.value, selectedDate2.value];
  dppmData.value = await fetchDPPMData(dateRange, selectedDep.value);

  // 🛑 Kiểm tra nếu không có dữ liệu
  if (!dppmData.value.length) {
    ElMessage({
      message: "No data found for the selected criteria",
      type: "warning",
    });
  } else 
    ElMessage({
      message: "Data loaded successfully",
      type: "success",
    });

  loading.value = false;
};

defineExpose({ open });

</script>

<style scoped>
.container-search {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.container-search-item {
  display: flex;
  justify-content: center;
  align-items: center;
}

.label {
  color: gray;
  font-size: 16px;
  margin-right: 10px;

}
</style>
