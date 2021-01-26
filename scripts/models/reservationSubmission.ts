import { ApiStatus, ReservationSubmissionApiResponse } from "../types/types";

export class ReservationSubmission {
    /**
     * The constructor.
     * @param eventTitle The event title.
     * @param name The name of the user.
     * @param orgName The organization name.
     * @param email The email of the user.
     * @param month The month selected.
     * @param date The date selected.
     * @param year The year selected.
     * @param weekday The weekday selected.
     * @param startTime The start time selected.
     * @param endTime The end time selected.
     * @param tableChosen The table chosen.
     * @param comments The comments.
     */
    constructor(
        public eventTitle: string,
        public name: string,
        public orgName: string,
        public email: string,
        public month: number,
        public date: number,
        public year: number,
        public weekday: number,
        public startTime: string,
        public endTime: string,
        public tableChosen: string,
        public comments: string,
    ) { }

    /**
     * Send the data.
     * @returns The reservation ID.
     */
    public async sendData() {
        const submissionFormData = new FormData();
        submissionFormData.append('eventTitleText', this.eventTitle);
        submissionFormData.append('nameText', this.name);
        submissionFormData.append('orgNameText', this.orgName);
        submissionFormData.append('emailText', this.email);
        submissionFormData.append('monthText', String(this.month));
        submissionFormData.append('dateText', String(this.date));
        submissionFormData.append('yearText', String(this.year));
        submissionFormData.append('weekdayText', String(this.weekday));
        submissionFormData.append('startTimeText', this.startTime);
        submissionFormData.append('endTimeText', this.endTime);
        submissionFormData.append('tableChosenText', this.tableChosen);
        submissionFormData.append('commentsText', this.comments);

        const response = await fetch('../api/reserve.php', {
            method: 'POST',
            body: submissionFormData
        });

        const data: ReservationSubmissionApiResponse = await response.json();

        if (data.status === ApiStatus.Fail) {
            throw new Error(data.data);
        }

        return data.data;
    }
}