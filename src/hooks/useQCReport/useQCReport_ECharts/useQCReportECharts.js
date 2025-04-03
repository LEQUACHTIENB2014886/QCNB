// hooks/useQCReport/useECharts.js
import * as echarts from "echarts";

// Hàm định dạng số "nice" (cho trục y)
export const niceNumber = (value, round) => {
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

// Hàm lấy trục y "nice"
export const getNiceScale = (min, max, ticks = 5) => {
  if (min === max) {
    return {
      niceMin: 0,
      niceMax: max || 1,
      tickSpacing: 1,
    };
  }
  const range = max - min;
  let tickSpacing = niceNumber(range / (ticks - 1), true);
  tickSpacing = tickSpacing < 1 ? 1 : Math.round(tickSpacing);
  const niceMax = Math.ceil(max / tickSpacing) * tickSpacing;
  return {
    niceMin: 0,
    niceMax,
    tickSpacing,
  };
};

// Hàm cắt chuỗi để xuống dòng khi quá dài
export const formatLabel = (label, maxLen) => {
  let result = "";
  let start = 0;
  while (start < label.length) {
    if (label.length - start <= maxLen) {
      result += label.slice(start);
      break;
    }
    let breakIndex = start + maxLen;
    if (label[breakIndex] !== " ") {
      const spaceIndex = label.lastIndexOf(" ", breakIndex);
      if (spaceIndex > start) {
        breakIndex = spaceIndex;
      }
    }
    result += label.slice(start, breakIndex) + "\n";
    start = breakIndex;
    if (label[start] === " ") {
      start++;
    }
  }
  return result;
};

// Khởi tạo chart với các option cơ bản
export const initEChart = (chartRef, maxLabelChars) => {
  const chartInstance = echarts.init(chartRef);
  chartInstance.setOption({
    // backgroundColor: "rgba(194, 207, 194, 0.158)",
    tooltip: {
      textStyle: {
        align: "center"
      },
      trigger: "item",
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
      axisLine: { show: true },
      axisLabel: {
        interval: 0,
        rotate: 45,
        fontSize: 10,
        formatter: (label) => {
          const parts = label.split(" || ");
          const english = parts[0] || "";
          const chinese = parts[1] || "";
          const formattedEnglish = formatLabel(english, maxLabelChars.value);
          const formattedChinese = formatLabel(chinese, maxLabelChars.value);
          return formattedEnglish + "\n" + formattedChinese;
        },
      },
    },
    yAxis: [
      {
        min: 0,
        max: 1,
        axisLine: { show: true },
      },
      {
        min: 0,
        max: 1,
        name: "(%)",
        position: "right",
        axisLine: { show: true },
        axisLabel: { formatter: "{value} %" },
      },
    ],
    series: [],
  });
  return chartInstance;
};

// Hàm cập nhật chart dựa trên dữ liệu truyền vào và tham số cấu hình
export const updateEChart = (chart, chartData, maxLabelChars) => {
  if (!chartData || chartData.length === 0) {
    chart.clear();
    chart.setOption({
      title: {
        text: "No Data",
        left: "center",
        top: "middle",
        textStyle: { fontSize: 16, fontWeight: "bold", fontFamily: "Arial" },
      },
    });
    return;
  } else {
    chart.setOption({ title: { text: "" } });
  }
  // Giả sử chartData[0].data chứa mảng dữ liệu
  const data = chartData[0].data || [];
  const primaryData = data.map(item => item.Total_Defects);
  const secondaryData = data.map(item => item.Cumulative_Percentage);
  const tertiaryData = data.map(item => item.Defect_Percentage);
  const xAxisLabels = data.map(item => `${item.YWSM || ""} || ${item.ZWSM || ""}`);

  const maxDefects = Math.max(...primaryData);
  let interval = maxDefects > 4 ? Math.ceil(maxDefects / 4) : 1;
  const maxPercent = Math.max(...secondaryData);
  const { niceMax: niceMaxPercent } = getNiceScale(0, maxPercent, 5);

  const containerWidth = chart.getDom().clientWidth;
  let dynamicBarWidth;
  if (containerWidth < 400) {
    dynamicBarWidth = 40;
  } else if (containerWidth < 600) {
    dynamicBarWidth = 60;
  } else if (containerWidth < 900) {
    dynamicBarWidth = 80;
  } else {
    dynamicBarWidth = 120;
  }

  // Cập nhật số ký tự hiển thị trên nhãn dựa theo chiều rộng container
  if (containerWidth < 400) {
    maxLabelChars.value = 10;
  } else if (containerWidth < 600) {
    maxLabelChars.value = 10;
  } else if (containerWidth < 900) {
    maxLabelChars.value = 20;
  } else if (containerWidth < 1440) {
    maxLabelChars.value = 30;
  } else if (containerWidth < 2000) {
    maxLabelChars.value = 50;
  } else {
    maxLabelChars.value = 60;
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

  chart.setOption({
    legend: {
      data: ["Defects", "Cumulative"],
      top: "0%",
      left: "center",
      textStyle: {
        color: "#333",
        fontSize: 14,
        fontWeight: "normal",
      },
      itemGap: 20,
      itemWidth: 26,
      itemHeight: 14,
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      borderColor: "#ccc",
      borderWidth: 1,
      padding: [5, 10],
    },
    tooltip: {
      formatter: (params) => {
        const idx = params.dataIndex;
        const defectNoteEng = data[idx].YWSM || "";
        const defectNoteChi = data[idx].ZWSM || "";
        const val1 = primaryData[idx] ?? 0;
        const val2 = tertiaryData[idx] ?? 0;
        const val3 = secondaryData[idx] ?? 0;
        return `<strong>${defectNoteEng}</strong> ${defectNoteChi}<br/>
                <strong>Total Defects:</strong> ${val1}<br/>
                <strong>Defect Percent:</strong> ${val2}%<br/>
                <strong>Cumulative Percent:</strong> ${val3}%`;
      },
    },
    xAxis: {
      data: xAxisLabels,
      axisLabel: {
        interval: 0,
        rotate: 0,
        margin: 10,
        fontSize: 10,
        formatter: (label) => {
          const parts = label.split(" || ");
          const english = parts[0] || "";
          const chinese = parts[1] || "";
          const formattedEnglish = formatLabel(english, maxLabelChars.value);
          const formattedChinese = formatLabel(chinese, maxLabelChars.value);
          return formattedEnglish + "\n" + formattedChinese;
        },
      },
    },
    yAxis: [
      {
        min: 0,
        max: maxDefects,
        interval: interval,
        axisLine: { show: true, lineStyle: { color: "#000", width: 1 } },
        splitLine: { show: false },
        axisLabel: { formatter: (value) => value },
      },
      {
        min: 0,
        name: "(%)",
        max: niceMaxPercent,
        axisLine: { show: true, lineStyle: { color: "#000", width: 1 } },
        splitLine: { show: false },
        axisLabel: { formatter: "{value}" },
      },
    ],
    series: [
      {
        name: "Defects",
        type: "bar",
        color: "#509CE6",
        data: primaryData,
        yAxisIndex: 0,
        barWidth: dynamicBarWidth,
        barGap: "0%",
        tooltip: {
          borderColor: "#ccc",
          borderWidth: 3,
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
          shadowOffsetY: 2,
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
      },
      {
        name: "Cumulative",
        type: "line",
        data: secondaryData,
        yAxisIndex: 1,
        smooth: true,
        symbol: "circle",
        symbolSize: 10,
        lineStyle: {
          width: 6,
          color: "#F2C50F"
        },
        itemStyle: {
          color: "#fff",
          borderColor: "#4D5096",
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
            borderColor: "#4D5096",
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
          position: "top",
          formatter: "{c}%",
          fontSize: dynamicFontSize,
          fontWeight: "bold",
          color: "#000",
        }
      },
    ],
  });
};

// Hàm resize chart (nên được gọi bên ngoài component khi window resize)
export const resizeEChart = (chart, updateFn) => {
  if (!chart) return;
  chart.resize();
  if (typeof updateFn === "function") {
    updateFn();
  }
};
