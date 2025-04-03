// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { useDashboardStore } from '@/stores/dashboardStore';

const Dashboard = () => import('@/views/Dashboard.vue');
const Home = () => import('@/views/Home.vue');
const QCReport = () => import('@/components/QC/QCReport/QCReport.vue');
const LEANDPPM = () => import('@/components/QC/LEANDPPM/LEANDPPM.vue');
const QCQMB = () => import('@/components/QC/QCQMB/QCQMB.vue');

const routes = [
  {
    path: '/',
    component: Dashboard,
    redirect: '/home',
    children: [
      { path: 'home', name: 'Home', component: Home, meta: { title: 'Home' } },
      { path: 'leandppm', name: 'LEANDPPM', component: LEANDPPM, meta: { title: 'LEANDPPM' } },
      { path: 'qc-report', name: 'QCReport', component: QCReport, meta: { title: 'QCReport' } },
      { path: 'qc-qmb', name: 'QCQMB', component: QCQMB, meta: { title: 'QCQMB' } },
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard để cập nhật tiêu đề trang
router.beforeEach((to, from, next) => {
  // Cập nhật active menu nếu cần
  if (to.path === '/home') {
    const dashboardStore = useDashboardStore();
    dashboardStore.updateActiveMenu('home');
  }
  
  // Lấy tiêu đề từ meta hoặc sử dụng tên route nếu không có meta.title
  const pageTitle = to.meta.title || to.name;
  document.title = `QCNB | ${pageTitle}`;
  
  next();
});

export default router;
