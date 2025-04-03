// stores/dashboardStore.js
import { defineStore } from 'pinia';

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    activeMenu: localStorage.getItem('activeMenu') || 'home',
    isCollapse: localStorage.getItem('navbarCollapse')
      ? localStorage.getItem('navbarCollapse') === 'true'
      : true,
    selectedQC: localStorage.getItem('selectedQC') || '',
    arrDepName: JSON.parse(localStorage.getItem('arrDepName') || '[]'),
  }),
  actions: {
    updateActiveMenu(newMenu) {
      this.activeMenu = newMenu;
      localStorage.setItem('activeMenu', newMenu);
    },
    setCollapse(state) {
      this.isCollapse = state;
      localStorage.setItem('navbarCollapse', state);
    },
    handleQCSelect(value) {
      this.selectedQC = value;
      localStorage.setItem('selectedQC', value);
    },
    updateDepartments(departments) {
      this.arrDepName = departments;
      localStorage.setItem('arrDepName', JSON.stringify(departments));
    },
  },
});
