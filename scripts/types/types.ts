export interface ReservationResponseItem {
    start_time: string;
    end_time: string;
    date: number;
    table_chosen: string;
}

export interface Reservation {
    startTime: string;
    endTime: string;
    date: number;
    tableChosen: string;
}

export interface ApiResponse {
    data: any;
    status: string;
}

export interface ReservationApiResponse extends ApiResponse {
    data: Array<ReservationResponseItem>;
}

export interface ReservationSubmissionApiResponse extends ApiResponse {
    data: string;
}

export enum ApiStatus {
    Success = 'success',
    Fail = 'fail'
}