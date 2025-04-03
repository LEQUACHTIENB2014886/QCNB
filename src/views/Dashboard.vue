<!-- views/Dashboard.vue -->
<template>
  <div class="container">
    <Header
      class="header-fixed"
      :activeMenu="dashboardStore.activeMenu"
      :echartsRef="echartsComponentRef"
    />
    <div :class="['content', { collapsed: dashboardStore.isCollapse }]">
      <Navbar
        :menuActive="dashboardStore.activeMenu"
        :isCollapse="dashboardStore.isCollapse"
        @menuChange="dashboardStore.updateActiveMenu"
        @qcSelect="dashboardStore.handleQCSelect"
      />
      <div class="main-content">
        <!-- Dùng v-slot để render component và lấy đúng instance -->
        <router-view v-slot="{ Component }">
          <component :is="Component" ref="echartsComponentRef" :selectedQC="dashboardStore.selectedQC" />
        </router-view>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useDashboardStore } from '@/stores/dashboardStore';
import Header from '@/components/Layout/Header.vue';
import Navbar from '@/components/Layout/Navbar.vue';
import Footer from '@/components/Layout/Footer.vue';

const dashboardStore = useDashboardStore();
const echartsComponentRef = ref(null);
</script>


<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;

}

.header-fixed {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 64px;
  z-index: 1000;
}

.content {
  display: flex;
  flex: 1;
  margin-top: 64px;
}

.main-content {
  flex: 1;
  width: calc(100% - 200px);
}
</style>
