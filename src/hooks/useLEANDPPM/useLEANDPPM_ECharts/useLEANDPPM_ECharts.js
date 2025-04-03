// src/hooks/useLEANDPPM/useLEANDPPM_EChartsTemp.js
import { ref, onMounted, nextTick, watch, onBeforeUnmount } from "vue";
import * as echarts from "echarts";


export default function useECharts(echartRef, rawData) {
  const chart = ref(null);
  const chartInstance = ref(null);

  const initChart = async () => {
    await nextTick();
    if (!echartRef.value) {
      setTimeout(initChart, 500);
      return;
    }
    if (!chart.value) {
      chart.value = echarts.init(echartRef.value);
      echartRef.value.__chart__ = chart.value;

      chart.value.setOption({
        tooltip: {
          trigger: 'item',
          position: function (pos, params, dom, rect, size) {
          },
        },
        xAxis: {
          type: "category",
          data: [],
          axisTick: { alignWithLabel: true },
          axisLine: {
            show: true,
            lineStyle: { color: "#000", width: 1.2 }
          },
          axisLabel: {
            interval: 0,
            rotate: 0,
            fontSize: 12,

          }
        },
        yAxis: {
          min: 0,
          max: 1,
          axisLine: { show: true }
        },
        series: []
      });
      window.addEventListener("resize", resizeChart);
    }
  };

  let resizeTimeout;
  const resizeChart = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      nextTick().then(() => {
        if (chart.value) {
          chart.value.resize();
          updateChart();
        }
      });
    }, 1000);
  };

  const updateChart = async () => {
    await nextTick();
    if (!echartRef.value || !chart.value) return;

    let defectArray = [];
    if (
      Array.isArray(rawData.value) &&
      rawData.value.length > 0 &&
      Array.isArray(rawData.value[0].data)
    ) {
      defectArray = rawData.value[0].data;
    } else if (rawData.value && Array.isArray(rawData.value.data)) {
      defectArray = rawData.value.data;
    } else if (Array.isArray(rawData.value)) {
      defectArray = rawData.value;
    }

    if (defectArray.length === 0) {
      chart.value.clear();
      chart.value.setOption({
        title: {
          text: "No Data",
          left: "center",
          top: "middle",
          fontSize: 16, fontWeight: "bold", fontFamily: "Arial",
        }
      });
      return;
    } else {
      chart.value.setOption({ title: { text: "" } });
    }

    const data = defectArray;
    const firstData = data.map(item => item.DPPM);
    const TotalDefects = data.map(item => item.Total_Defects);
    const ProQuantity = data.map(item => item.Pro_Quantity);
    const DepName = data.map(item => item.LeanName);


    const xAxisLabels = data.map(item => `${item.YWSM || ""} ${item.ZWSM || ""}`);

    const maxDPPM = Math.max(...firstData);
    const range = maxDPPM;
    const divisions = range >= 4 ? 4 : (range < 3 ? 3 : 4);
    const interval = Math.ceil(range / divisions);

    const containerWidth = echartRef.value.clientWidth;
    let dynamicBarWidth;
    if (containerWidth < 400) {
      dynamicBarWidth = 30;
    } else if (containerWidth < 600) {
      dynamicBarWidth = 40;
    } else if (containerWidth < 900) {
      dynamicBarWidth = 50;
    } else if (containerWidth < 1200) {
      dynamicBarWidth = 60;
    } else if (containerWidth < 1440) {
      dynamicBarWidth = 70;
    } else {
      dynamicBarWidth = 140;
    }

    let dynamicFontSize;
    if (containerWidth < 400) {
      dynamicFontSize = 10;
    } else if (containerWidth < 600) {
      dynamicFontSize = 12;
    } else if (containerWidth < 900) {
      dynamicFontSize = 14;
    } else if (containerWidth < 1050) {
      dynamicFontSize = 15;
    } else if (containerWidth < 1200) {
      dynamicFontSize = 16;
    } else if (containerWidth < 1400) {
      dynamicFontSize = 17;
    } else {
      dynamicFontSize = 18;
    }

    // Chỉ giữ lại series của "DPPM"
    chart.value.setOption({
      legend: {
        data: ["DPPM"],
        top: '0',
        left: 'center',
        color: '#333',
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'normal',
        itemGap: 20,
        itemWidth: 24,
        itemHeight: 12,
        borderColor: '#ccc',
        borderWidth: 1,
        padding: [5, 10]
      },
      tooltip: {
        formatter: (params) => {
          const idx = params.dataIndex;
          const val1 = TotalDefects[idx] ?? 0;
          const val2 = ProQuantity[idx] ?? 0;
          const val3 = DepName[idx] ?? 0;
          const val4 = firstData[idx] ?? 0;
          return `
            <div style="text-align: center;">
              <strong>Dep Name:</strong> ${val3}<br/>
              <strong>Pro Quantity:</strong> ${val2}<br/>
              <strong>Total Defects:</strong> ${val1}<br/>     
              <strong>DPPM:</strong> ${val4}<br/>
 
            </div>
          `;
        }
      },

      xAxis: {
        data: xAxisLabels,
        axisLabel: {
          interval: 0,
          rotate: 0,
          margin: 10,
          fontSize: 12,
          formatter: (label, index) => {
            return `${label}\n${DepName[index]}`;
          }
        }
      },
      
      // Cấu hình duy nhất cho trục y
      yAxis: {
        min: 0,
        max: maxDPPM,
        interval: interval,
        axisLine: {
          show: true,
          lineStyle: { color: "#000", width: 1.2 }
        },
        splitLine: { show: false }
      },
      series: [
        {
          name: "DPPM",
          color: "#509CE6",
          type: "bar",
          data: firstData,
          yAxisIndex: 0,
          barWidth: dynamicBarWidth,
          tooltip: {
            borderColor: "#ccc",
            borderWidth: 2,
            backgroundColor: "rgba(255, 255, 255, 1)",
            color: "#333"
          },
          itemStyle: {
            color: function (params) {
              const currentValue = params.value;
              if (currentValue === maxDPPM) {
                return "#F08784"; 
              } else {
                return "#509CE6";
              }
            },
          },
        
          label: {
            show: true,
            position: 'insideBottom',
            formatter: '{c}',
            fontWeight: 'bold',
            distance: 0,
            fontSize: dynamicFontSize,
            color: 'black'
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: "rgba(0, 0, 0, 0.5)",
              borderColor: "black",
              borderWidth: 1
            },
            label: {
              fontSize: dynamicFontSize + 4,
              fontWeight: 'bold'
            }
          },
          animationDurationUpdate: 1000,
          animationEasing: "cubicOut"
        }
      ]
    });
  };

  onMounted(initChart);
  watch(rawData, async () => {
    await nextTick();
    updateChart();
  });
  onBeforeUnmount(() => {
    window.removeEventListener("resize", resizeChart);
  });

  return { updateChart, chartInstance };
}

