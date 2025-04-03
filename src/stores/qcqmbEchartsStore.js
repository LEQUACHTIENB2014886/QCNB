// stores/QcEchartsStore.js
import { defineStore } from 'pinia';

// Hàm định dạng ngày
function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export const useQcEchartsStore = defineStore('qcEcharts', {
  state: () => ({
    showItem2: JSON.parse(localStorage.getItem("showItem2") || "false"),
    selectedDate: localStorage.getItem("selectedDate") ||
      formatDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
    selectedDate2: localStorage.getItem("selectedDate2") ||
      formatDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
    selectedDate3: localStorage.getItem("selectedDate3") ||
      formatDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
    selectedDate4: localStorage.getItem("selectedDate4") ||
      formatDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
    selectedQC: localStorage.getItem("selectedQC") || "",
    selectedQCQMB: localStorage.getItem("selectedQCQMB") || "",
  }),

  actions: {
    toggleItem2() {
      this.showItem2 = !this.showItem2;
      localStorage.setItem("showItem2", this.showItem2);
      window.dispatchEvent(new Event("resize"));
    },


    updateSelectedDate(date) {
      const formatted = formatDate(date);
      this.selectedDate = formatted;
      localStorage.setItem("selectedDate", formatted);
    },

    updateSelectedDate2(date) {
      const formatted = formatDate(date);
      this.selectedDate2 = formatted;
      localStorage.setItem("selectedDate2", formatted);
    },
    updateSelectedDate3(date) {
      const formatted = formatDate(date);
      this.selectedDate3 = formatted;
      localStorage.setItem("selectedDate3", formatted);
    },

    updateSelectedDate4(date) {
      const formatted = formatDate(date);
      this.selectedDate4 = formatted;
      localStorage.setItem("selectedDate4", formatted);
    },

    updateSelectedQC(qc) {
      this.selectedQC = qc;
      localStorage.setItem("selectedQC", qc);
    },

    updateSelectedQCQMB(qcQMB) {
      this.selectedQCQMB = qcQMB;
      localStorage.setItem("selectedQCQMB", qcQMB);
    },
  },
});
