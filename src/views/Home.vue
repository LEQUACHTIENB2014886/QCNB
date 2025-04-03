<template>
  <div style="display: flex; justify-content: center;">
    <!-- Sử dụng width: 100% để tự động co giãn theo container -->
    <div ref="chartDom" style="width: 100%; height: 400px;"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';

const chartDom = ref(null);
let myChart = null;

const updateChartOption = () => {
  // Ví dụ: điều chỉnh fontSize dựa trên kích thước màn hình
  const screenWidth = window.innerWidth;
  // Giả sử với màn hình nhỏ, giảm fontSize xuống
  const dynamicFontSize = screenWidth < 600 ? 40 : 80;

  const option = {
    graphic: {
      elements: [
        {
          type: 'text',
          left: 'center',
          top: 'center',
          style: {
            text: 'Welcome to QCNB',
            fontSize: dynamicFontSize,
            fontWeight: 'bold',
            lineDash: [0, 200],
            lineDashOffset: 0,
            fill: '#264A6E',
            stroke: '#001f3f',
            lineWidth: 1
          },
          keyframeAnimation: {
            duration: 1500,
            loop: false,
            keyframes: [
              {
                percent: 0.5,
                style: {
                  fill: '#8CA0CC',
                  lineDashOffset: 200,
                  lineDash: [200, 0]
                }
              },
              {
                percent: 0.7,
                style: {
                  fill: 'transparent'
                }
              },
              {
                percent: 1,
                style: {
                  fill: '#2F5B86'
                }
              }
            ]
          }
        }
      ]
    }
  };

  // Cập nhật option cho chart
  myChart.setOption(option);
};

onMounted(() => {
  myChart = echarts.init(chartDom.value);
  updateChartOption();

  // Hàm xử lý resize chart
  const resizeChart = () => {
    updateChartOption();
    myChart.resize();
  };

  window.addEventListener('resize', resizeChart);

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeChart);
    myChart.dispose();
  });
});
</script>
