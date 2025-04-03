// types/LEAN_DPPM.ts
export interface LEAN_DPPM {
    DepNo: string;
    DepName: string;
    ScanDate: string; // Dạng ISO string, có thể convert sang Date nếu cần
    Pro_Quantity: string;
    Total_Defects: number;
    DPPM: number;
  }
  
  // Xuất các key dưới dạng constant để sử dụng an toàn khi truy cập thuộc tính
  export const DepNo: keyof LEAN_DPPM = "DepNo";
  export const DepName: keyof LEAN_DPPM = "DepName";
  export const ScanDate: keyof LEAN_DPPM = "ScanDate";
  export const Pro_Quantity: keyof LEAN_DPPM = "Pro_Quantity";
  export const Total_Defects: keyof LEAN_DPPM = "Total_Defects";
  export const DPPM: keyof LEAN_DPPM = "DPPM";
  