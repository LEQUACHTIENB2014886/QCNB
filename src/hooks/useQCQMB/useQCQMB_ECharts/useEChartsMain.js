// hooks/useEChartsTemp.js
import { ref, onMounted, nextTick, watch, onBeforeUnmount } from "vue";
import * as echarts from "echarts";

// Hàm làm tròn số 
const niceNumber = (value, round) => {
  const exponent = Math.floor(Math.log10(value));
  const fraction = value / Math.pow(10, exponent);
  let niceFraction;
  if (round) {
    niceFraction = fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10;
  } else {
    niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  }
  return niceFraction * Math.pow(10, exponent);
};

const getNiceScale = (min, max, ticks = 5) => {
  if (min === max) {
    return {
      niceMin: 0,
      niceMax: max || 1,
      tickSpacing: 1,
    };
  }
  const range = max - min;
  let tickSpacing = niceNumber(range / (ticks - 1), true);
  // Đảm bảo tickSpacing là số nguyên
  tickSpacing = tickSpacing < 1 ? 1 : Math.round(tickSpacing);
  const niceMax = Math.ceil(max / tickSpacing) * tickSpacing;
  return {
    niceMin: 0,
    niceMax,
    tickSpacing,
  };
};


// Hàm cắt chuỗi theo số ký tự cho trước
const formatLabel = (label, maxLen) => {
  let result = "";
  let start = 0;
  while (start < label.length) {
    if (label.length - start <= maxLen) {
      result += label.slice(start);
      break;
    }
    let breakIndex = start + maxLen;
    if (label[breakIndex] !== ' ') {
      const spaceIndex = label.lastIndexOf(' ', breakIndex);
      if (spaceIndex > start) {
        breakIndex = spaceIndex;
      }
    }
    result += label.slice(start, breakIndex) + "\n";
    start = breakIndex;
    if (label[start] === ' ') {
      start++;
    }
  }
  return result;
};

export default function useECharts(echartRef, rawData) {
  const chart = ref(null);
  // Khai báo để xuất excel
  const chartInstance = ref(null);
  // Hàm khởi tạo biểu đồ
  const initChart = async () => {
    await nextTick();
    if (!echartRef.value) {
      setTimeout(initChart, 150);
      return;
    }
    if (!chart.value) {
      chart.value = echarts.init(echartRef.value);
      // Gán instance vào thuộc tính __chart__
      echartRef.value.__chart__ = chart.value;

      chart.value.setOption({
        // backgroundColor: "rgba(194, 207, 194, 0.158)",
        tooltip: {
          trigger: 'item',
          
          position: function (pos, params, dom, rect, size) {
            const [chartWidth, chartHeight] = size.viewSize;
            const [tooltipWidth, tooltipHeight] = size.contentSize;
            let x = pos[0] + 30;
            let y = pos[1] - 30;

            if (x + tooltipWidth > chartWidth) {
              x = pos[0] - tooltipWidth - 30;
            }

            if (x < 0) {
              x = 20;
            }

            if (y + tooltipHeight > chartHeight) {
              y = pos[1] - tooltipHeight - 30;
            }

            if (y < 0) {
              y = 20;
            }

            return [x, y];
          },
        },

        xAxis: {
          type: "category",
          data: [],
          axisTick: { alignWithLabel: true },
          axisLine: {
            show: true,
            lineStyle: {
              color: "#000",
              width: 1.2
            }
          },
          axisLabel: {
            interval: 0,
            rotate: 0,
            fontSize: 12,
            formatter: (label) => {
              const parts = label.split(" || ");
              const english = parts[0] || "";
              const chinese = parts[1] || "";

              // Cắt từng chuỗi riêng biệt với 20 ký tự tối đa mỗi dòng
              const formattedEnglish = formatLabel(english, maxLabelChars);
              const formattedChinese = formatLabel(chinese, maxLabelChars);
              return formattedEnglish + "\n" + formattedChinese;
            }
          }
        },
        yAxis: [
          {
            min: 0,
            max: 1,
            axisLine: { show: true }
          },
          {
            min: 0,
            max: 1,
            name: "(%)",
            position: "right",
            axisLine: { show: true },
            axisLabel: { formatter: "{value} %" }
          }
        ],
        series: []
      });
      window.addEventListener("resize", resizeChart);
    }
  };

  // Hàm cập nhật kích thước
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
    }, 200);
  };

  // Hàm cập nhật dữ liệu 
  const updateChart = async () => {
    await nextTick();
    if (!echartRef.value || !chart.value) {
      return;
    }
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
      chart.value.setOption({
        title: { text: "" },
      });
    }

    const data = defectArray;
    const primaryData = data.map(item => item.Total_Defects);
    const secondaryData = data.map(item => item.Cumulative_Percentage);
    const tertiaryData = data.map(item => item.Defect_Percentage);
    // console.log("Sau khi gán rawData:", rawData.value[0].Total_Defects);

    const xAxisLabels = data.map(item => `${item.YWSM || ""} || ${item.ZWSM || ""}`);

    // const TotalDefects = rawData.value[0] ? rawData.value[0].Total_Defects : 0;
    // console.log("TotalDefects:", TotalDefects);

    const maxDefects = Math.max(...primaryData);
    const range = maxDefects; // vì min luôn = 0
    const divisions = range >= 4 ? 4 : (range < 3 ? 3 : 4);
    const interval = Math.ceil(range / divisions);

    const maxPercent = Math.max(...secondaryData);
    const { niceMax: niceMaxPercent } = getNiceScale(0, maxPercent, 5);

    // Reponsive
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
    const maxLabelChars = containerWidth < 400 ? 10 :
      containerWidth < 600 ? 10 :
        containerWidth < 900 ? 12 :
          containerWidth < 1050 ? 15 :
            containerWidth < 1200 ? 20 :
              containerWidth < 1440 ? 25 :
                containerWidth < 2000 ? 30 : 30;

    chart.value.setOption({
      grid: {
        bottom: 120, 
      },
      legend: {
        data: ["Defects", "Cumulative"],
        top: '0%',
        left: 'center',
        color: '#333',
        fontSize: 14,
        fontWeight: 'normal',
        itemGap: 20,
        itemWidth: 24,
        itemHeight: 12,
        // backgroundColor: 'rgba(255, 255, 255, 1)',
        borderColor: '#ccc',
        borderWidth: 1,
        padding: [5, 10]
      },
      tooltip:
      {
        formatter: (params) => {
          const idx = params.dataIndex;
          // Hiển thị cả hai trường tiếng Anh và tiếng Trung trong tooltip
          const defectNoteEng = data[idx].YWSM || "";
          const defectNoteChi = data[idx].ZWSM || "";
          const val1 = primaryData[idx] ?? 0;
          const val2 = tertiaryData[idx] ?? 0;
          const val3 = secondaryData[idx] ?? 0;
          return `<strong>${defectNoteEng}
          </strong>${defectNoteChi}<br/>
          <strong>Total Defects:</strong> ${val1}<br/>
          <strong>Defect Percent:</strong> ${val2}%<br/>
          <strong>Cumulative Percent:</strong> ${val3}%`;
        }
      },
      xAxis: {
        data: xAxisLabels,
        axisLabel: {
          interval: 0,
          rotate: 0,
          margin: 10,
          fontSize: 12,
          formatter: (label) => {
            const parts = label.split(" || ");
            const english = parts[0] || "";
            const chinese = parts[1] || "";
            const formattedEnglish = formatLabel(english, maxLabelChars);
            const formattedChinese = formatLabel(chinese, maxLabelChars);
            return formattedEnglish + "\n" + formattedChinese;
          }
        }
      },
      yAxis: [
        {
          // name: `Total Defects: ${TotalDefects}`,
          // nameLocation: "end",
          // nameGap: 10,
          min: 0,
          max: maxDefects,
          interval: interval,
          axisLine: {
            show: true,
            lineStyle: {
              color: "#000",
              width: 1.2
            }
          },
          splitLine: { show: false },
          axisLabel: {
            // formatter: (value) => value
          }
        }, {
          min: 0,
          name: "(%)",
          max: niceMaxPercent,
          axisLine: {
            show: true,
            lineStyle: {
              color: "#000",
              width: 1.2
            }
          },
          splitLine: { show: false },
          axisLabel: { formatter: "{value}" }
        }
      ],
      series: [
        {
          name: "Defects",
          color: "#509CE6",
          type: "bar",
          data: primaryData,
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
              return data[params.dataIndex].YWSM === "Other" ? "#F05A57" : "#509CE6";
            },
            shadowColor: "rgba(0, 0, 0, 0.2)",
            shadowBlur: 4,
            shadowOffsetX: 2,
            shadowOffsetY: 2
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
          // Thêm cấu hình emphasis để tăng kích thước khi hover
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: "rgba(0, 0, 0, 0.5)",
              borderColor: "black",
              borderWidth: 1
            },
            label: {
              // Tăng kích thước font của label khi hover
              fontSize: dynamicFontSize + 4,
              fontWeight: 'bold'
            }
          },
          animationDurationUpdate: 1000,
          animationEasing: "cubicOut"
        }
        ,
        {
          name: "Cumulative",
          type: "line",
          data: secondaryData,
          yAxisIndex: 1,
          smooth: true,
          symbol: 'circle',
          symbolSize: 10,
          lineStyle: {
            width: 6,
            color: "#F2C50F" // màu line
          },
          itemStyle: {
            color: "#fff",
            borderColor: "#4D5096",  // màu ve chó
            borderWidth: 3
          },
          tooltip: {
            borderColor: "#ccc",
            borderWidth: 3,
            backgroundColor: "rgba(255, 255, 255, 1)",
            color: "#333"
          },
          emphasis: {
            symbolSize: 14,
            itemStyle: {
              color: "#F2C50F",
              borderColor: "#4D5096", // màu hover ve chó
              borderWidth: 3,
              shadowColor: "rgba(0, 0, 0, 0.5)",
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowOffsetY: 0
            },
            label: {
              show: true,
              fontWeight: "bold",
              color: "#000",
              fontSize: 20,
            }
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}%',
            fontSize: dynamicFontSize,
            fontWeight: 'bold',
            color: '#000',
            // textShadowColor: 'rgba(0, 0, 0, 0.5)',
            // textShadowBlur: 4,
            // textShadowOffsetX: 2,
            // textShadowOffsetY: 2,
          }
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
