<!-- components/DatePicker/DatePicker.vue -->
<template>
    <el-form :model="form">
      <div class="date-time-container">
        <!-- First Date Input -->
        <div class="border-table">
          <div class="date-time-input-date">
            <el-form-item>
              <el-input
                v-model="form.dateInput1"
                placeholder="YYYY-MM-dd"
                @input="formatDate1"
                @blur="validateDate1"
                style="width: 105px;"
              />
            </el-form-item>
          </div>
          <div class="date-time-input-time">
            <el-form-item>
              <el-input
                v-model="form.timeInput1"
                placeholder="HH:mm"
                @input="formatTime1"
                @blur="validateTime1"
                style="width: 70px;"
              />
            </el-form-item>
          </div>
        </div>
        <!-- Second Date Input -->
        <div class="border-table">
          <div class="date-time-input-date">
            <el-form-item>
              <el-input
                v-model="form.dateInput2"
                placeholder="YYYY-MM-dd"
                @input="formatDate2"
                @blur="validateDate2"
                style="width: 105px;"
              />
            </el-form-item>
          </div>
          <div class="date-time-input-time">
            <el-form-item>
              <el-input
                v-model="form.timeInput2"
                placeholder="HH:mm"
                @input="formatTime2"
                @blur="validateTime2"
                style="width: 70px;"
              />
            </el-form-item>
          </div>
        </div>
      </div>
    </el-form>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from "vue";
  
  interface FormData {
    dateInput1: string;
    timeInput1: string;
    dateInput2: string;
    timeInput2: string;
  }
  
  const props = defineProps<{
    selectDate: string,
    selectDate2: string
  }>();
  
  const form = ref<FormData>({
    dateInput1: '',
    timeInput1: '',
    dateInput2: '',
    timeInput2: ''
  });
  
  // Hàm tách ngày và giờ từ giá trị truyền vào
  const formatDateTime = (value: string) => {
    if (!value) return { date: '', time: '' };
    const [date, time] = value.split(' ');
    return { date, time };
  };
  
  // Khởi tạo giá trị form từ props
  const updateFormFromProps = () => {
    const { date: date1, time: time1 } = formatDateTime(props.selectDate);
    const { date: date2, time: time2 } = formatDateTime(props.selectDate2);
    form.value.dateInput1 = date1;
    form.value.timeInput1 = time1;
    form.value.dateInput2 = date2;
    form.value.timeInput2 = time2;
  };
  
  onMounted(() => {
    updateFormFromProps();
  });
  
  // Các hàm format và validate
  function formatDate1(value: string) {
    form.value.dateInput1 = formatDate(value);
  }
  function formatTime1(value: string) {
    form.value.timeInput1 = formatTime(value);
  }
  function formatDate2(value: string) {
    form.value.dateInput2 = formatDate(value);
  }
  function formatTime2(value: string) {
    form.value.timeInput2 = formatTime(value);
  }
  
  function formatDate(value: string) {
    const digits = value.replace(/[^0-9]/g, '');
    let formatted = '';
    if (digits.length > 0) {
      formatted = digits.substring(0, 4);
      if (digits.length >= 5) {
        formatted += '-' + digits.substring(4, 6);
      }
      if (digits.length >= 7) {
        formatted += '-' + digits.substring(6, 8);
      }
    }
    return formatted;
  }
  
  function formatTime(value: string) {
    const digits = value.replace(/[^0-9]/g, '');
    let formatted = '';
    if (digits.length > 0) {
      formatted = digits.substring(0, 2);
      if (digits.length >= 3) {
        formatted += ':' + digits.substring(2, 4);
      }
    }
    return formatted;
  }
  
  function validateDate1() {
    form.value.dateInput1 = validateDate(form.value.dateInput1);
  }
  function validateTime1() {
    form.value.timeInput1 = validateTime(form.value.timeInput1);
  }
  function validateDate2() {
    form.value.dateInput2 = validateDate(form.value.dateInput2);
  }
  function validateTime2() {
    form.value.timeInput2 = validateTime(form.value.timeInput2);
  }
  
  function getDefaultDate() {
    const today = new Date();
    today.setDate(today.getDate() - 2);
    return today.toISOString().split('T')[0];
  }
  
  function validateDate(dateStr: string) {
    const pattern = /^\d{4}-\d{1,2}-\d{1,2}$/;
    if (!pattern.test(dateStr)) {
      return getDefaultDate();
    }
    const [year, month, day] = dateStr.split('-').map(Number);
    if (month < 1 || month > 12) return getDefaultDate();
    const maxDay = new Date(year, month, 0).getDate();
    if (day < 1 || day > maxDay) return getDefaultDate();
    const inputDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setDate(today.getDate() - 2);
    if (inputDate > today) return getDefaultDate();
    const formattedMonth = month < 10 ? '0' + month : month.toString();
    const formattedDay = day < 10 ? '0' + day : day.toString();
    return `${year}-${formattedMonth}-${formattedDay}`;
  }
  
  function validateTime(timeStr: string) {
    const pattern = /^(\d{1,2}):(\d{1,2})$/;
    if (!pattern.test(timeStr)) {
      return '00:00';
    }
    const [hour, minute] = timeStr.split(':').map(Number);
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      return '00:00';
    }
    const formattedHour = hour < 10 ? '0' + hour : hour.toString();
    const formattedMinute = minute < 10 ? '0' + minute : minute.toString();
    return `${formattedHour}:${formattedMinute}`;
  }
  
  // Hàm public trả về giá trị chọn hiện tại của 2 input
  function getSelectedDates() {
    return {
      selectDate: `${form.value.dateInput1} ${form.value.timeInput1}`,
      selectDate2: `${form.value.dateInput2} ${form.value.timeInput2}`
    };
  }
  
  // Expose hàm getSelectedDates để component cha có thể gọi được thông qua ref
  defineExpose({ getSelectedDates });
  </script>
  
  <style scoped>
  .date-time-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 20px 0;
    gap: 10px;
  }
  .border-table {
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 5px;
    width: 180px;
  }
  .date-time-input-date {
    margin-right: 5px;
  }


  .el-form-item {
    margin-bottom: 0;
  }
  </style>
  