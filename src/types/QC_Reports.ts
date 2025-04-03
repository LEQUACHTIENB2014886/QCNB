// types/QC_Reports.ts

interface TotalErrleaninday {
    DepNo: string;
    DepName: string;
    ScanDate: string;
    Pro_Quantity: string;
    Total_Defects: number;
    Defect_Rate_Percentage: number;
    LeanName: string;
}

interface TotalErrleanindayRequest {
    StartDate: string; 
    EndDate: string;   
    DepName: string;
}

interface DPPMErrleaninday {
    DepNo: string;
    DepName: string;
    ScanDate: string;
    Pro_Quantity: string;
    Total_Defects: number;
    DPPM: number;
}

interface DPPMErrAllLeanInDay {
    DepNo: string;
    DepName: string;
    ScanDate: string;
    Pro_Quantity: string;
    Total_Defects: number;
    DPPM: number;
}

interface ItemErrleaninday {
    DepNo: string;
    DepName: string;
    ScanDate: string;
    Pro_Quantity: string;
    Total_Defects: number;
    Defect_Rate_Percentage: number;
}

export { TotalErrleanindayRequest, TotalErrleaninday, DPPMErrleaninday, DPPMErrAllLeanInDay, ItemErrleaninday }
