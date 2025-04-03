// hooks/useQCQMB/usePNGExport_QCQMB.js
import html2canvas from "html2canvas";

/**
 * Hàm chuyển đổi dữ liệu và ảnh biểu đồ thành file PNG theo kích thước A4 landscape
 * @param {Array|Object} data - Dữ liệu cần xuất (có thể là mảng đối tượng hoặc object key-value)
 * @param {string} chartImageDataUrl - Data URL của ảnh biểu đồ (JPEG/PNG)
 */
export async function exportDataToPNG(data, chartImageDataUrl) {
  try {
    // Tạo một container tạm thời để dựng nội dung cần xuất
    const container = document.createElement("div");
    // Đặt kích thước theo chuẩn A4 landscape (1122 x 794px tương đương)
    container.style.width = "1122px";
    // container.style.height = "794px";
    container.style.padding = "30px";
    container.style.backgroundColor = "#fff";
    container.style.fontFamily = "Helvetica, sans-serif";
    // Nếu cần căn giữa nội dung container trong ảnh xuất ra
    container.style.margin = "0 auto";

    // 1. Thêm tiêu đề cho báo cáo
    const title = document.createElement("h1");
    title.innerText = "QCNB System";
    title.style.textAlign = "center";
    title.style.marginBottom = "20px";
    container.appendChild(title);

    // 2. Tạo bảng dữ liệu
    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.marginTop = "20px";
    
    let headers = [];
    let rows = [];
    if (Array.isArray(data) && data.length) {
      headers = Object.keys(data[0]);
      rows = data.map(row => headers.map(header => row[header]));
    } else {
      headers = ["Thuộc tính", "Giá trị"];
      rows = Object.entries(data);
    }
    
    // Tạo phần header cho bảng
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    headers.forEach(headerText => {
      const th = document.createElement("th");
      th.innerText = headerText;
      th.style.border = "1px solid #000";
      th.style.padding = "5px";
      th.style.backgroundColor = "rgb(22,160,133)";
      th.style.color = "#fff";
      th.style.textAlign = "center";
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Tạo phần body cho bảng
    const tbody = document.createElement("tbody");
    rows.forEach(rowData => {
      const row = document.createElement("tr");
      rowData.forEach(cellData => {
        const td = document.createElement("td");
        td.innerText = cellData;
        td.style.border = "1px solid #000";
        td.style.padding = "5px";
        td.style.textAlign = "center";
        row.appendChild(td);
      });
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    container.appendChild(table);
    
    // 3. Thêm ảnh biểu đồ vào bên dưới bảng
    if (chartImageDataUrl) {
      const img = document.createElement("img");
      img.src = chartImageDataUrl;
      img.style.display = "block";
      img.style.width = "100%";
      img.style.marginTop = "30px";
      container.appendChild(img);
    }
    
    // Thêm container vào body (nó sẽ ẩn sau khi render)
    document.body.appendChild(container);
    
    // 4. Sử dụng html2canvas để chuyển container thành canvas
    const canvas = await html2canvas(container, {
      scale: 2, // scale cao hơn cho chất lượng ảnh tốt hơn
    });
    
    // Sau khi capture, xóa container tạm thời khỏi DOM
    document.body.removeChild(container);
    
    // 5. Chuyển canvas thành data URL (PNG)
    const pngDataUrl = canvas.toDataURL("image/png");
    
    // 6. Tạo link download và tự động click để tải file PNG về
    const link = document.createElement("a");
    link.href = pngDataUrl;
    link.download = "QCNB.png";
    link.click();
  } catch (error) {
    console.error("Lỗi khi xuất PNG:", error);
    throw error;
  }
}
