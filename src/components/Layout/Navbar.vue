<!-- components/Layout/Navbar.vue -->
<template>
  <div class="aside-container">
    <div class="aside-header">
      <el-button size="small" @click="toggleCollapse">
        <el-icon v-if="isCollapse">
          <Fold />
        </el-icon>
        <el-icon v-else>
          <Expand />
        </el-icon>
      </el-button>
    </div>
    <div class="aside-content">
      <div class="menu-wrapper" :style="{ width: menuWidth }">
        <el-menu :default-active="activeMenu" :collapse="isCollapse" mode="vertical" collapse-transition>
          <!-- Home -->
          <el-menu-item index="home" @click="handleMenuClick('home', '/home')" class="menu-item">
            <div class="menu-content">
              <el-icon class="icon">
                <HomeFilled />
              </el-icon>
              <span class="note">Home</span>
            </div>
          </el-menu-item>
          <!-- ERP ECharts-->
          <el-sub-menu index="2">
            <template #title>
              <div class="menu-content">
                <el-icon class="icon">
                  <Histogram />
                </el-icon>
                <span class="note">ERP</span>
              </div>
            </template>
            <el-sub-menu index="2-0">
              <template #title>
                <div class="menu-content">
                  <el-icon class="icon">
                    <Menu />
                  </el-icon>
                  <span class="note">QC</span>
                </div>
              </template>
              <!-- LEAN DPPM -->
              <el-menu-item index="2-1" @click="handleLeanDPPM('2-1', '/leandppm')" class="menu-item">
                <div class="menu-content">
                  <el-icon class="icon">
                    <Document />
                  </el-icon>
                  <span class="note">LEAN DPPM</span>
                </div>
              </el-menu-item>
              <!-- QC Report -->
              <el-menu-item index="2-2" @click="handleMenuClick('2-2', '/qc-report')" class="menu-item">
                <div class="menu-content">
                  <el-icon class="icon">
                    <DataBoard />
                  </el-icon>
                  <span class="note">QC Report</span>
                </div>
              </el-menu-item>
              <!-- QC QMB: render động dựa trên dữ liệu API -->
              <el-sub-menu index="2-1-3">
                <template #title>
                  <div class="menu-content">
                    <el-icon class="icon">
                      <TrendCharts />
                    </el-icon>
                    <span class="note">QC QMB</span>
                  </div>
                </template>
                <el-menu-item v-for="(item, index) in arrDepName" :key="index" :index="`2-1-3-${index + 1}`"
                  @click="handleQCClick(`2-1-3-${index + 1}`, item.DepName)" class="menu-item">
                  <div class="menu-content">
                    <span class="note">{{ item.LeanName }}</span>
                  </div>
                </el-menu-item>


              </el-sub-menu>
            </el-sub-menu>
          </el-sub-menu>
        </el-menu>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, onMounted } from 'vue';
import { formatDate } from '@/util/formatDate'
import { useRouter } from 'vue-router';

// state
import { useDashboardStore } from '@/stores/dashboardStore';
import { useQcEchartsStore } from "@/stores/qcqmbEchartsStore";

// API
import { getDepName } from "@/hooks/useNavbar_API";

// el-icon
import {
  Expand,
  Fold,
  HomeFilled,
  Histogram,
  Menu,
  DataBoard,
  TrendCharts,
  Document,
} from '@element-plus/icons-vue';

// type
import { BDepartment } from "@/types/QC_QBM";

// Khai báo biến arrDepName để lưu danh sách phòng ban
const arrDepName = ref<BDepartment[]>([]);
// console.log(arrDepName);
const dashboardStore = useDashboardStore();

onMounted(async () => {
  try {
    const departments = await getDepName();
    arrDepName.value = departments;
    // Lưu mảng phòng ban vào store (và localStorage)
    dashboardStore.updateDepartments(departments);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
  }
});

const router = useRouter();

// Sử dụng state từ store
const activeMenu = computed(() => dashboardStore.activeMenu);
const isCollapse = computed(() => dashboardStore.isCollapse);
const menuWidth = computed(() => (dashboardStore.isCollapse ? '64px' : '250px'));

const qcEchartsStore = useQcEchartsStore();

// Thiết lập ngày mặc định cho selectedDate và selectedDate2 (2 ngày trước)
const date1 = new Date();
date1.setDate(date1.getDate() - 2);
date1.setHours(0, 0, 0, 0);
const defaultDate = formatDate(date1);

const date2 = new Date();
date2.setDate(date2.getDate() - 2);
date2.setHours(23, 59, 0, 0);
const defaultDate2 = formatDate(date2);

// Thiết lập ngày mặc định cho selectedDate3 và selectedDate4 (3 ngày trước)
const date3 = new Date();
date3.setDate(date3.getDate() - 3);
date3.setHours(0, 0, 0, 0);
const defaultDate3 = formatDate(date3);

const date4 = new Date();
date4.setDate(date4.getDate() - 3);
date4.setHours(23, 59, 0, 0);
const defaultDate4 = formatDate(date4);

// Lean DPPM
const handleLeanDPPM = (index: string, qcValue: string) => {
  dashboardStore.updateActiveMenu(index);
  qcEchartsStore.updateSelectedQC(qcValue);

  localStorage.setItem("selectedDate", defaultDate);
  localStorage.setItem("selectedDate2", defaultDate2);

  dashboardStore.handleQCSelect(qcValue);

  router.push('/leandppm').then(() => {
    window.dispatchEvent(new Event('localStorageChanged'));
    nextTick().then(() => {
      window.dispatchEvent(new Event('resize'));
    });
  });
};

// QC QMB
const handleQCClick = (index: string, qcValue: string) => {
  dashboardStore.updateActiveMenu(index);
  qcEchartsStore.updateSelectedQCQMB(qcValue);  // Cập nhật selectedQCQMB thay vì selectedQC

  // Cập nhật store và localStorage với ngày tháng
  qcEchartsStore.updateSelectedDate(defaultDate);
  localStorage.setItem("selectedDate", defaultDate);
  localStorage.setItem("selectedDate2", defaultDate2);
  localStorage.setItem("selectedDate3", defaultDate3);
  localStorage.setItem("selectedDate4", defaultDate4);
  localStorage.setItem("showItem2", "false");

  dashboardStore.handleQCSelect(qcValue);

  router.push('/qc-qmb').then(() => {
    window.dispatchEvent(new Event('localStorageChanged'));
    nextTick().then(() => {
      window.dispatchEvent(new Event('resize'));
    });
  });
};

// QC Report
const handleMenuClick = (index: string, path: string) => {
  dashboardStore.updateActiveMenu(index);

  localStorage.setItem("selectedDate", defaultDate);
  localStorage.setItem("selectedDate2", defaultDate2);
  router.push(path);
};

// Hàm thay đổi trạng thái collapse
const toggleCollapse = () => {
  dashboardStore.setCollapse(!dashboardStore.isCollapse);
};
</script>


<style scoped>
.aside-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.aside-header {
  padding: 10px;
  margin-left: 5px;
}

.aside-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
}

.menu-wrapper {
  transition: width 0.3s ease;
  overflow: hidden;
}

.menu-content {
  display: flex;
  align-items: center;
  gap: 3px;
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

a {
  text-decoration: none;
  color: inherit;
}

a:visited,
a:active {
  color: inherit;
}

.el-menu--collapse .note {
  display: none;
}

.note {
  font-size: 14px;
}

.icon {
  width: 16px;
  height: auto;
}
</style>
