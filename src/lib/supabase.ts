import { createClient } from '@supabase/supabase-js';
import { BookingRequest } from '../types/booking';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('your-supabase-anon-key')
  );
};

// Initialize Supabase client
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database row interface matching PostgreSQL table schema
export interface DatabaseBookingRow {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email?: string;
  booking_date: string;
  day_of_week: string;
  people: number;
  hours: number;
  rate_per_person_per_hour: number;
  total_price: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at?: string;
}

// Convert database row (snake_case) to BookingRequest (camelCase)
export const mapRowToBooking = (row: DatabaseBookingRow): BookingRequest => {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    customerName: row.customer_name,
    customerEmail: row.customer_email || 'n/a',
    date: row.booking_date,
    day: row.day_of_week,
    people: row.people,
    hours: row.hours,
    ratePerPersonPerHour: Number(row.rate_per_person_per_hour),
    totalPrice: Number(row.total_price),
    status: row.status,
    createdAt: row.created_at,
  };
};

// Convert BookingRequest (camelCase) to database row (snake_case)
export const mapBookingToRow = (
  booking: Omit<BookingRequest, 'id' | 'createdAt' | 'status'>
): Omit<DatabaseBookingRow, 'id' | 'created_at' | 'updated_at'> => {
  return {
    invoice_number: booking.invoiceNumber,
    customer_name: booking.customerName,
    customer_email: booking.customerEmail,
    booking_date: booking.date,
    day_of_week: booking.day,
    people: booking.people,
    hours: booking.hours,
    rate_per_person_per_hour: booking.ratePerPersonPerHour,
    total_price: booking.totalPrice,
    status: 'pending',
  };
};
