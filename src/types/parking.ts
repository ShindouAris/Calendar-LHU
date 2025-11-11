export interface PlateData {
    id: number;
    plate: string;
    userId: string;
    type: "BIKE" | "CAR";
    createdAt: string;
    updatedAt: string;
}

export interface DepositHistory {
    id: string | number; // item-key
    price: number;
    createdAt: string;
    campusKey: string;
}

export interface PaymentHistory {
    id: string | number;
    licensePlateIn: string;
    price: number;
    timeOut: string;
    campusKey: string;
}
