// types/QC_QBM.ts
interface ProductionDefectSummaryRequest {
    DepName: string;
    StartDate: string;
    EndDate: string;
}

interface ProductionDefectSummary {
    DepNo: string;
    DepName: string;
    Pro_Quantity: number;
    Total_Defects: number;
    Defect_Rate: number;
    Data: DefectAnalysis[];
}

interface DefectAnalysis {
    DepNo: string;
    YWSM: string;   
    ZWSM: string;
    Total_Defects: number;
    Defect_Percentage: number;
    Cumulative_Percentage: number;
    Item: number;
}

interface BDepartment {
    DepName: string;
    LeanName: string;
}

export { ProductionDefectSummaryRequest, ProductionDefectSummary, DefectAnalysis, BDepartment }