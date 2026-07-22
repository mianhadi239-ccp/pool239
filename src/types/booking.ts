export type BookingStatus = 'pending' | 'accepted' | 'rejected';

export interface BookingRequest {
  id: string;
  invoiceNumber: string;
  date: string; // YYYY-MM-DD
  day: string;
  customerName: string;
  people: number;
  hours: number;
  ratePerPersonPerHour: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
}
