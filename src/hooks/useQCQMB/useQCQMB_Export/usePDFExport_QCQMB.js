// hooks/useQCQMB/usePDFExport_QCQMB.js
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; // Import đúng plugin

/**
 * Hàm chuyển đổi dữ liệu và ảnh biểu đồ thành file PDF
 * @param {Array|Object} data - Dữ liệu cần xuất (có thể là mảng đối tượng hoặc object key-value)
 * @param {string} chartImageDataUrl - Data URL của ảnh biểu đồ (JPEG/PNG)
 */
export async function exportDataToPDF(data, chartImageDataUrl) {
    try {
        // 1. Tạo đối tượng jsPDF với trang A4, landscape
        const doc = new jsPDF({
            orientation: "landscape",
            unit: "pt",
            format: "a4"
        });

        // 2. Thêm tiêu đề cho báo cáo
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("QCNB System", doc.internal.pageSize.getWidth() / 2, 40, {
            align: "center"
        });

        // 3. Chuẩn bị dữ liệu bảng
        let headers = [];
        let rows = [];
        if (Array.isArray(data) && data.length) {
            // Nếu data là mảng các đối tượng, dùng các key của đối tượng đầu tiên làm header
            headers = Object.keys(data[0]);
            rows = data.map(row => headers.map(header => row[header]));
        } else {
            // Nếu data không phải là mảng, giả định là object key-value
            headers = ["Thuộc tính", "Giá trị"];
            rows = Object.entries(data);
        }

        // 4. Gọi autoTable để vẽ bảng
        autoTable(doc, {
            startY: 60,            // Bảng bắt đầu từ toạ độ Y = 60
            margin: { left: 30, right: 30 },
            head: [headers],
            body: rows,
            theme: "grid",         // Kiểu bảng 'grid' có sẵn
            headStyles: {
                fillColor: [22, 160, 133],  // Màu nền header (xanh ngọc)
                textColor: [255, 255, 255], // Màu chữ header (trắng)
                lineWidth: 0.5,
                lineColor: [0, 0, 0],
                fontSize: 12,
                fontStyle: "bold"
            },
            bodyStyles: {
                fillColor: [236, 240, 241], // Màu nền body (xám nhạt)
                textColor: [0, 0, 0],       // Màu chữ body (đen)
                lineWidth: 0.5,
                lineColor: [0, 0, 0],
                fontSize: 10
            },
            alternateRowStyles: {
                fillColor: [255, 255, 255]  // Hàng xen kẽ màu trắng
            },
            styles: {
                halign: "center",           // Canh giữa nội dung
                cellPadding: 5
            }
        });

        // 5. Lấy vị trí cuối của bảng để chèn ảnh biểu đồ phía dưới
        const finalY = doc.lastAutoTable.finalY + 30;

        // 6. Thêm ảnh biểu đồ vào file PDF
        if (chartImageDataUrl) {
            // Lấy thông tin ảnh
            const imgProps = doc.getImageProperties(chartImageDataUrl);
            // Chừa lề trái phải 30pt
            const pdfWidth = doc.internal.pageSize.getWidth() - 60;
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            // doc.setFontSize(12);
            // doc.setFont("helvetica", "normal");
            // doc.text("Biểu đồ:", 30, finalY - 10);

            // Thêm ảnh
            doc.addImage(chartImageDataUrl, "JPEG", 30, finalY, pdfWidth, pdfHeight);
        }

        // 7. Xuất file PDF
        doc.save("QCNB.pdf");
    } catch (error) {
        console.error("Lỗi khi xuất PDF:", error);
        throw error;
    }
}
