// hooks/useQCQMB/useSVGExport_QCQMB.js
import domtoimage from "dom-to-image";

/**
 * Hàm chuyển đổi dữ liệu và ảnh biểu đồ thành file SVG theo định dạng A4 landscape
 * @param {Array|Object} data - Dữ liệu cần xuất (có thể là mảng đối tượng hoặc object key-value)
 * @param {string} chartImageDataUrl - Data URL của ảnh biểu đồ (JPEG/PNG)
 */
export async function exportDataToSVG(data, chartImageDataUrl) {
  try {
    // Tạo container tạm thời để dựng nội dung báo cáo
    const container = document.createElement("div");
    // Đặt kích thước theo A4 landscape: 1122px (rộng) x 794px (cao)
    container.style.width = "1122px";
    container.style.height = "794px";
    container.style.boxSizing = "border-box"; // Để padding không làm tăng kích thước thật của container
    container.style.padding = "30px";
    container.style.backgroundColor = "#fff";
    container.style.fontFamily = "Helvetica, sans-serif";
    
    // Thêm CSS cho in ấn A4 dạng ngang (áp dụng khi in trực tiếp từ trình duyệt)
    const style = document.createElement("style");
    style.innerHTML = `@page { size: A4 landscape; margin: 0; }`;
    container.appendChild(style);

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
      // Nếu data là mảng đối tượng, sử dụng key của phần tử đầu tiên làm header
      headers = Object.keys(data[0]);
      rows = data.map(row => headers.map(header => row[header]));
    } else {
      // Nếu data là object key-value
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
    
    // 3. Thêm ảnh biểu đồ vào bên dưới bảng (nếu có)
    if (chartImageDataUrl) {
      const img = document.createElement("img");
      img.src = chartImageDataUrl;
      img.style.display = "block";
      img.style.width = "100%";
      img.style.marginTop = "30px";
      container.appendChild(img);
    }
    
    // Thêm container vào body để cho dom-to-image render (sẽ ẩn sau khi capture)
    document.body.appendChild(container);
    
    // 4. Chuyển container thành SVG thông qua dom-to-image
    const svgDataUrl = await domtoimage.toSvg(container);
    
    // Sau khi capture, xóa container khỏi DOM
    document.body.removeChild(container);
    
    // 5. Tạo link download và tự động click để tải file SVG về (đặt tên file đã cập nhật)
    const link = document.createElement("a");
    link.href = svgDataUrl;
    link.download = "QCNB_A4_landscape.svg";
    link.click();
  } catch (error) {
    console.error("Lỗi khi xuất SVG:", error);
    throw error;
  }
}
