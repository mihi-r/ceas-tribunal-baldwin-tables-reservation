import { ApiStatus, Reservation, ReservationApiResponse } from "../types/types";

export class Reservations {
    public reservations: Reservation[] = [];

    /**
     * Fetch reservation data.
     * @param dateList The comma separated list of dates to fetch reservations for.
     * @param monthList The comma separated list of months to fetch reservations for.
     * @param yearList The comma separated list of years to fetch reservations for.
     */
    public async fetchData(dateList: string, monthList: string, yearList: string) {
        const submissionFormData = new FormData();
        submissionFormData.append('dateListText', dateList);
        submissionFormData.append('monthListText', monthList);
        submissionFormData.append('yearListText', yearList);

        const response = await fetch('../api/get_reserved.php', {
            method: 'POST',
            body: submissionFormData
        });

        const data: ReservationApiResponse = await response.json();

        if (data.status === ApiStatus.Success) {
            const reservationResponseItems = data.data;

            reservationResponseItems.forEach((reservationResponseItem) => {
                const reservation: Reservation = {
                    startTime: reservationResponseItem.start_time,
                    endTime: reservationResponseItem.end_time,
                    date: reservationResponseItem.date,
                    tableChosen: reservationResponseItem.table_chosen
                }

                this.reservations.push(reservation);
            });
        } else {
            throw new Error('Could not fetch info. Please check your network connection and try again.')
        }
    }
}