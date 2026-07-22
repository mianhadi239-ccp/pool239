import emailjs from '@emailjs/browser';
import { BookingRequest } from '../types/booking';

export const ADMIN_EMAIL = 'mianhadi239@gmail.com';

// Default EmailJS keys for production / Vercel fallback
const DEFAULT_SERVICE_ID = 'service_08jihyp';
const DEFAULT_TEMPLATE_ID = 'template_lk21mgb';
const DEFAULT_PUBLIC_KEY = 'kfvmN_Z8Gpw1ZKMfo';

export interface EmailDeliveryStatus {
  sent: boolean;
  message: string;
}

/**
 * Helper to check if valid EmailJS keys exist in environment or fallbacks
 */
export const isEmailJSConfigured = (): boolean => {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || DEFAULT_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || DEFAULT_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || DEFAULT_PUBLIC_KEY;

  return Boolean(
    serviceId &&
    templateId &&
    publicKey &&
    !serviceId.includes('your_') &&
    !publicKey.includes('your_')
  );
};

/**
 * Sends EXACTLY ONE email notification per booking request (Works on Vercel & Localhost)
 */
export const sendBookingNotificationEmail = async (
  booking: BookingRequest
): Promise<EmailDeliveryStatus> => {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || DEFAULT_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || DEFAULT_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || DEFAULT_PUBLIC_KEY;

  // Comprehensive template parameters matching any EmailJS template variable names
  const emailParams = {
    // Recipient & Reply targets
    to_email: ADMIN_EMAIL,
    admin_email: ADMIN_EMAIL,
    customer_email: booking.customerEmail,
    reply_to: booking.customerEmail,
    user_email: booking.customerEmail,
    email: booking.customerEmail,

    // Customer & Admin Names
    customer_name: booking.customerName,
    name: booking.customerName,
    from_name: booking.customerName,
    to_name: 'Pool Administrator',

    // Booking Itemization
    invoice_number: booking.invoiceNumber,
    booking_date: `${booking.date} (${booking.day})`,
    date: booking.date,
    day: booking.day,
    people: booking.people,
    guests: booking.people,
    hours: booking.hours,
    total_price: `Rs. ${booking.totalPrice.toLocaleString()}`,
    price: `Rs. ${booking.totalPrice.toLocaleString()}`,
    status: booking.status.toUpperCase(),
    requested_at: new Date().toLocaleString(),
    admin_link: `${window.location.origin}/admin`,
    subject: `🏊 New Booking Request: ${booking.invoiceNumber} - ${booking.customerName}`,
    message: `New Pool Booking Request Received!\n\n` +
      `Invoice #: ${booking.invoiceNumber}\n` +
      `Customer Name: ${booking.customerName}\n` +
      `Customer Email: ${booking.customerEmail}\n` +
      `Date: ${booking.date} (${booking.day})\n` +
      `Guests: ${booking.people} People\n` +
      `Duration: ${booking.hours} Hours\n` +
      `Total Price: Rs. ${booking.totalPrice.toLocaleString()}\n` +
      `Status: PENDING ADMIN APPROVAL\n\n` +
      `Admin Portal: ${window.location.origin}/admin`,
  };

  console.log(`[Email Service] Dispatching single email for invoice ${booking.invoiceNumber}...`);

  if (isEmailJSConfigured()) {
    try {
      const response = await emailjs.send(serviceId, templateId, emailParams, publicKey);
      console.log('[Email Service] EmailJS Single Dispatch Success:', response.status, response.text);
      if (response.status === 200) {
        return { sent: true, message: 'Email sent successfully via EmailJS.' };
      }
    } catch (err) {
      console.error('[Email Service] EmailJS dispatch error:', err);
    }
  }

  return { sent: false, message: 'Email dispatch completed.' };
};
