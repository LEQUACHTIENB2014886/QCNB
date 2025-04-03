// hooks/useQCQMB/useExcelExport_QCQMB.js
import { use } from "echarts";
import ExcelJS from "exceljs";

function dataURLtoBuffer(dataURL) {
  const base64Str = dataURL.split(",")[1];
  const binaryStr = window.atob(base64Str);
  const len = binaryStr.length;
  const buffer = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    buffer[i] = binaryStr.charCodeAt(i);
  }
  return buffer;
}

export async function exportDataToExcel(data, chartImageDataUrl) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("QCNB-Sheet1");

  //  Setup trang A4, landscape, ép vừa 1 trang (ngang) và giảm lề
  worksheet.pageSetup = {
    paperSize: 9, // A4
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1, // ép vừa 1 trang chiều ngang
    fitToHeight: 0, // không giới hạn chiều cao
    margins: {
      left: 0.5,
      right: 0.20,
      top: 0.25,
      bottom: 0.25,
      header: 0.2,
      footer: 0.2,
    },
    horizontalCentered: true, // Căn giữa theo chiều ngang khi in
    verticalCentered: true,   // Căn giữa theo chiều dọc khi in
  };


  //  Thiết lập độ rộng cột (tuỳ chỉnh theo nhu cầu)
  worksheet.getColumn(1).width = 32; // Start Date
  worksheet.getColumn(2).width = 32; // End Date
  worksheet.getColumn(3).width = 32; // Dep Name
  worksheet.getColumn(4).width = 32; // Defect Rate
  worksheet.getColumn(5).width = 32; // Pro Quantity
  worksheet.getColumn(6).width = 32; // Total Defects

  //  Thêm dữ liệu vào worksheet
  if (Array.isArray(data) && data.length) {
    // Nếu data là mảng object
    const header = Object.keys(data[0]);
    worksheet.addRow(header); // row 1: tiêu đề
    data.forEach((row) => {
      const rowData = header.map((key) => row[key]);
      worksheet.addRow(rowData);
    });
  } else {
    // Nếu data không phải mảng hoặc mảng rỗng, thêm theo kiểu cặp key-value
    worksheet.addRow(["Thuộc tính", "Giá trị"]);
    Object.keys(data).forEach((key) => {
      worksheet.addRow([key, data[key]]);
    });
  }

  //  Định dạng màu sắc, căn giữa, border cho bảng
  // Lấy số dòng dữ liệu thực tế
  const lastDataRow = worksheet.lastRow.number;
  // Giả sử bạn muốn kẻ viền cho 6 cột từ row 1 đến row cuối
  const totalCols = 6;

  for (let rowIndex = 1; rowIndex <= lastDataRow; rowIndex++) {
    const row = worksheet.getRow(rowIndex);
    for (let colIndex = 1; colIndex <= totalCols; colIndex++) {
      const cell = row.getCell(colIndex);

      // Căn giữa
      cell.alignment = { horizontal: "center", vertical: "middle" };

      // Tô màu header (hàng 1) màu vàng, các hàng sau (dữ liệu) màu xám
      if (rowIndex === 1) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFF00" }, // Vàng
        };
      } else {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFD9D9D9" }, // Xám nhạt
        };
      }

      // Border xung quanh ô
      cell.border = {
        top: { style: "thin", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
      };
    }
  }

  //  Thêm một vài hàng trống trước khi chèn ảnh (nếu cần)
  worksheet.addRow([]);
  worksheet.addRow([]);

  //  Chèn ảnh (nếu có)
  if (chartImageDataUrl) {
    const imageBuffer = dataURLtoBuffer(chartImageDataUrl);
    const imageId = workbook.addImage({
      buffer: imageBuffer,
      extension: "png",
    });

    // Chọn toạ độ chèn ảnh (tl: top-left, br: bottom-right)
    // Điều chỉnh để ảnh gọn hơn, tránh dư khoảng trắng
    worksheet.addImage(imageId, {
      tl: { col: 0, row: worksheet.lastRow.number + 3 },
      br: { col: 6, row: worksheet.lastRow.number + 40 },
    });
  }

  //  Xuất file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = "QCNB.xlsx";
  link.click();
}
