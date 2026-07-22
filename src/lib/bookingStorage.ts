import { BookingRequest, BookingStatus } from '../types/booking';
import { supabase, isSupabaseConfigured, mapRowToBooking, mapBookingToRow, DatabaseBookingRow } from './supabase';

const STORAGE_KEY = 'ccp_pool_bookings_v1';
const EVENT_NAME = 'ccp_bookings_updated';

// Default initial bookings for fallback
const INITIAL_BOOKINGS: BookingRequest[] = [
  {
    id: 'req-1',
    invoiceNumber: 'INV-7X9K-3A1B',
    date: '2026-07-23',
    day: 'Thursday',
    customerName: 'John Doe',
    people: 4,
    hours: 2,
    ratePerPersonPerHour: 300,
    totalPrice: 2400,
    status: 'accepted',
    createdAt: new Date('2026-07-20T10:00:00Z').toISOString(),
  },
  {
    id: 'req-2',
    invoiceNumber: 'INV-8Y2M-9C4D',
    date: '2026-07-25',
    day: 'Saturday',
    customerName: 'Sarah Smith',
    people: 6,
    hours: 3,
    ratePerPersonPerHour: 300,
    totalPrice: 5400,
    status: 'accepted',
    createdAt: new Date('2026-07-21T14:30:00Z').toISOString(),
  },
  {
    id: 'req-3',
    invoiceNumber: 'INV-9Z4P-1E5F',
    date: '2026-07-28',
    day: 'Tuesday',
    customerName: 'Mike Johnson',
    people: 5,
    hours: 2,
    ratePerPersonPerHour: 300,
    totalPrice: 3000,
    status: 'pending',
    createdAt: new Date('2026-07-22T09:15:00Z').toISOString(),
  },
  {
    id: 'req-4',
    invoiceNumber: 'INV-1A5Q-6F7G',
    date: '2026-08-01',
    day: 'Saturday',
    customerName: 'David Lee',
    people: 8,
    hours: 4,
    ratePerPersonPerHour: 300,
    totalPrice: 9600,
    status: 'pending',
    createdAt: new Date('2026-07-22T11:45:00Z').toISOString(),
  },
];

// In-memory cache of bookings for synchronous UI rendering
let cachedBookings: BookingRequest[] = [];

// Helper to broadcast update event locally
const broadcastUpdate = (bookings: BookingRequest[]) => {
  cachedBookings = bookings;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  } catch (e) {
    console.error('Failed to update localStorage cache', e);
  }
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: bookings }));
};

export const getStoredBookings = (): BookingRequest[] => {
  if (cachedBookings.length > 0) {
    return cachedBookings;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BOOKINGS));
      cachedBookings = INITIAL_BOOKINGS;
      return INITIAL_BOOKINGS;
    }
    cachedBookings = JSON.parse(raw);
    return cachedBookings;
  } catch (e) {
    console.error('Failed to parse bookings from localStorage', e);
    return INITIAL_BOOKINGS;
  }
};

/**
 * Fetches bookings directly from Supabase (or fallback)
 */
export const fetchBookingsFromSupabase = async (): Promise<BookingRequest[]> => {
  if (!isSupabaseConfigured() || !supabase) {
    return getStoredBookings();
  }

  try {
    const { data, error } = await supabase
      .from('pool_bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return getStoredBookings();
    }

    const mapped = (data as DatabaseBookingRow[]).map(mapRowToBooking);
    broadcastUpdate(mapped);
    return mapped;
  } catch (e) {
    console.error('Supabase query error:', e);
    return getStoredBookings();
  }
};

/**
 * Adds a new booking request to Supabase
 */
export const addBookingRequest = async (
  request: Omit<BookingRequest, 'id' | 'createdAt' | 'status'>
): Promise<BookingRequest> => {
  const newBooking: BookingRequest = {
    ...request,
    id: 'req-' + Date.now(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  // Optimistically update local state & local storage
  const current = getStoredBookings();
  const updated = [newBooking, ...current];
  broadcastUpdate(updated);

  if (isSupabaseConfigured() && supabase) {
    try {
      const row = mapBookingToRow(request);
      const { data, error } = await supabase
        .from('pool_bookings')
        .insert([row])
        .select()
        .single();

      if (error) {
        console.error('Supabase Insert error:', error);
      } else if (data) {
        const createdBooking = mapRowToBooking(data as DatabaseBookingRow);
        // Replace optimistic entry with server response
        const syncUpdated = current.map((b) => (b.invoiceNumber === createdBooking.invoiceNumber ? createdBooking : b));
        broadcastUpdate(syncUpdated);
        return createdBooking;
      }
    } catch (e) {
      console.error('Failed to insert into Supabase:', e);
    }
  }

  return newBooking;
};

/**
 * Updates booking status (accepted/rejected) in Supabase
 */
export const updateBookingStatus = async (id: string, status: BookingStatus): Promise<void> => {
  const current = getStoredBookings();
  const updated = current.map((b) => (b.id === id ? { ...b, status } : b));
  broadcastUpdate(updated);

  if (isSupabaseConfigured() && supabase) {
    try {
      // Find invoice or ID
      const target = current.find((b) => b.id === id);
      if (target) {
        const { error } = await supabase
          .from('pool_bookings')
          .update({ status })
          .or(`id.eq.${id},invoice_number.eq.${target.invoiceNumber}`);

        if (error) {
          console.error('Supabase status update error:', error);
        }
      }
    } catch (e) {
      console.error('Failed to update status in Supabase:', e);
    }
  }
};

/**
 * Deletes a booking request from Supabase
 */
export const deleteBookingRequest = async (id: string): Promise<void> => {
  const current = getStoredBookings();
  const target = current.find((b) => b.id === id);
  const updated = current.filter((b) => b.id !== id);
  broadcastUpdate(updated);

  if (isSupabaseConfigured() && supabase && target) {
    try {
      const { error } = await supabase
        .from('pool_bookings')
        .delete()
        .or(`id.eq.${id},invoice_number.eq.${target.invoiceNumber}`);

      if (error) {
        console.error('Supabase delete error:', error);
      }
    } catch (e) {
      console.error('Failed to delete from Supabase:', e);
    }
  }
};

/**
 * Subscribes to real-time updates from Supabase + local custom events
 */
export const subscribeToBookings = (callback: (bookings: BookingRequest[]) => void) => {
  // Initial fetch from Supabase asynchronously
  fetchBookingsFromSupabase().then(callback);

  const localHandler = () => {
    callback(getStoredBookings());
  };

  window.addEventListener(EVENT_NAME, localHandler);
  window.addEventListener('storage', localHandler);

  // Setup Supabase Realtime Subscription if configured
  let supabaseChannel: any = null;
  if (isSupabaseConfigured() && supabase) {
    supabaseChannel = supabase
      .channel('pool_bookings_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pool_bookings' },
        () => {
          fetchBookingsFromSupabase().then(callback);
        }
      )
      .subscribe();
  }

  return () => {
    window.removeEventListener(EVENT_NAME, localHandler);
    window.removeEventListener('storage', localHandler);
    if (supabaseChannel && supabase) {
      supabase.removeChannel(supabaseChannel);
    }
  };
};
