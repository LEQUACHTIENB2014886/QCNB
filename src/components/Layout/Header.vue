<!-- components/Layout/Header.vue -->
<template>
  <header class="header">
    <div class="header-content">
      <img src="@/assets/echarts.png" class="icon" />
      <h1>QCNB</h1>
    </div>
    <!-- Hiển thị các nút chỉ khi activeMenu khớp với "2-1-3-<số>" -->
    <div v-if="showButtons" class="button-wrapper">
      <!-- Nút 1: Toggle Single/Double Chart -->
      <el-button type="warning" plain @click="toggleItem2" class="el-bt">
        <img :src="icon1" alt="icon" class="img" />
        {{ qcStore.showItem2 ? 'Double' : 'Single' }}
      </el-button>
     
      <!-- Nút 2: Export -->
      <el-button type="primary" plain @click="handleExportClick" class="el-bt3">
        <img :src="exportImg" alt="Export" class="img" />
        Export
      </el-button>
    </div>
    <!-- Dialog chọn định dạng xuất file -->
    <el-dialog v-model="dialogVisible" title="Export file format" width="290px" :before-close="handleClose">
      <div>
        <!-- Excel -->
        <el-button type="success" plain class="dongudoanhai" @click="exportExcel">
          <img src="@/assets/Excel.png" alt="Export" class="img" />Excel Export
        </el-button>
        <!-- PDF -->
        <el-button type="danger" plain class="dongudoanhai" @click="exportPDF">
          <img src="@/assets/PDF.png" alt="Export" class="img" />PDF Export
        </el-button>
      </div>
      <div style="padding-top: 10px">
        <!-- PNG -->
        <el-button type="primary" plain class="dongudoanhai" @click="exportPNG">
          <img src="@/assets/PNG.png" alt="Export" class="img" />PNG Export
        </el-button>
        <!-- SVG -->
        <el-button type="warning" plain class="dongudoanhai" @click="exportSVG">
          <img src="@/assets/SVG.png" alt="Export" class="img" />SVG Export
        </el-button>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="info" plain @click="dialogVisible = false">Cancel</el-button>
        </div>
      </template>
    </el-dialog>
  </header>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useQcEchartsStore } from '@/stores/qcqmbEchartsStore';
import { ElMessage } from 'element-plus';

// Import ảnh
import singleChart from '@/assets/bar-bar.png';
import doubleChart from '@/assets/bar-line.png';
import iconBarBar from '@/assets/single-chart.png';
import iconBarLine from '@/assets/double-chart.png';
import exportIcon from '@/assets/export-file.png';

// Nhận prop activeMenu và echartsRef từ component cha
const props = defineProps({
  activeMenu: {
    type: String,
    default: ''
  },
  echartsRef: {
    type: Object,
    default: null
  }
});

const qcStore = useQcEchartsStore();
const dialogVisible = ref(false);

// Reactive cho các ảnh và biểu tượng
const icon1 = ref(iconBarBar);
const exportImg = ref(exportIcon);

// Kiểm tra activeMenu theo định dạng "2-1-3-<số>"
const showButtons = computed(() => {
  return /^2-1-3-\d+$/.test(String(props.activeMenu).trim());
});

// Hàm toggle nút 1: chuyển đổi giữa hiển thị Single/Double Chart
function toggleItem2() {
  qcStore.toggleItem2();
  if (icon1.value === iconBarBar) {
    icon1.value = iconBarLine;
    ElMessage.success("Double Chart Ready !");
  } else {
    icon1.value = iconBarBar;
    ElMessage.success("Single Chart Ready !");
  }
}

// Hàm xử lý nút Export: nếu biểu đồ hiển thị đúng trạng thái thì mở dialog xuất file
function handleExportClick() {
  if (qcStore.showItem2) {
    ElMessage.warning("Turn off Double Chart to Export file");
  } else {
    dialogVisible.value = true;
  }
}

const handleClose = () => {
  dialogVisible.value = false;
};

// Các hàm export file gọi qua ref được truyền từ cha (QCQMB)
function exportExcel() {
  if (props.echartsRef && props.echartsRef.exportExcel) {
    props.echartsRef.exportExcel();
  }
}

function exportPDF() {
  if (props.echartsRef && props.echartsRef.exportPDF) {
    props.echartsRef.exportPDF();
  }
}

function exportPNG() {
  if (props.echartsRef && props.echartsRef.exportPNG) {
    props.echartsRef.exportPNG();
  }
}

function exportSVG() {
  if (props.echartsRef && props.echartsRef.exportSVG) {
    props.echartsRef.exportSVG();
  }
}
</script>

<style scoped>
.header {
  background-color: #2f5b86;
  color: #fff;
  height: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  font-weight: 800;
  text-shadow: 0 2px 5px rgba(194, 197, 26, 0.2);
}

.header-content {
  display: flex;
  align-items: center;
}

.icon {
  width: 28px;
  height: auto;
  margin-right: 10px;
}

h1 {
  font-size: 1.5rem;
  margin: 0;
}

.button-wrapper {
  display: flex;
  margin-right: 40px;
  gap: 10px;
  align-items: center;
}

.el-bt,
.el-bt2,
.el-bt3 {
  font-size: 12px;
  width: 100px;
}

.img {
  width: 15px;
  height: 15px;
  margin-right: 6px;
  margin-bottom: 1px;
}

.dongudoanhai {
  width: 120px;
}
</style>
