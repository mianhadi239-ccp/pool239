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
 * Sends email notifications for booking requests and status updates (Admin + Customer)
 */
export const sendBookingNotificationEmail = async (
  booking: BookingRequest
): Promise<EmailDeliveryStatus> => {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || DEFAULT_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || DEFAULT_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || DEFAULT_PUBLIC_KEY;

  if (!isEmailJSConfigured()) {
    console.warn('[Email Service] EmailJS is not configured or missing keys.');
    return { sent: false, message: 'EmailJS keys missing.' };
  }

  const isStatusUpdate = booking.status !== 'pending';

  const baseParams = {
    // Recipient & Reply targets
    admin_email: ADMIN_EMAIL,
    customer_email: booking.customerEmail,
    reply_to: booking.customerEmail,
    user_email: booking.customerEmail,
    email: booking.customerEmail,

    // Customer & Admin Names
    customer_name: booking.customerName,
    name: booking.customerName,
    from_name: booking.customerName,

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
    subject: isStatusUpdate
      ? `🏊 Booking ${booking.invoiceNumber} Update: ${booking.status.toUpperCase()}`
      : `🏊 New Booking Request: ${booking.invoiceNumber} - ${booking.customerName}`,
    message: isStatusUpdate
      ? `Your Pool Booking Request (${booking.invoiceNumber}) status has been updated to: ${booking.status.toUpperCase()}.\n\n` +
        `Customer Name: ${booking.customerName}\n` +
        `Date: ${booking.date} (${booking.day})\n` +
        `Guests: ${booking.people} People\n` +
        `Duration: ${booking.hours} Hours\n` +
        `Total Price: Rs. ${booking.totalPrice.toLocaleString()}\n` +
        `Status: ${booking.status.toUpperCase()}`
      : `New Pool Booking Request Received!\n\n` +
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

  console.log(`[Email Service] Dispatching email for invoice ${booking.invoiceNumber}...`);

  let adminSuccess = false;
  let customerSuccess = false;

  // 1. Dispatch to Admin (mianhadi239@gmail.com)
  try {
    const adminParams = { ...baseParams, to_email: ADMIN_EMAIL, to_name: 'Pool Administrator' };
    const response = await emailjs.send(serviceId, templateId, adminParams, publicKey);
    console.log('[Email Service] Admin EmailJS Success:', response.status, response.text);
    adminSuccess = response.status === 200;
  } catch (err) {
    console.error('[Email Service] Admin EmailJS error:', err);
  }

  // 2. Dispatch to Customer (if valid email provided and not identical to admin)
  if (
    booking.customerEmail &&
    booking.customerEmail !== 'n/a' &&
    booking.customerEmail.includes('@') &&
    booking.customerEmail.toLowerCase() !== ADMIN_EMAIL.toLowerCase()
  ) {
    try {
      const customerParams = { ...baseParams, to_email: booking.customerEmail, to_name: booking.customerName };
      const response = await emailjs.send(serviceId, templateId, customerParams, publicKey);
      console.log('[Email Service] Customer EmailJS Success:', response.status, response.text);
      customerSuccess = response.status === 200;
    } catch (err) {
      console.error('[Email Service] Customer EmailJS error:', err);
    }
  }

  return {
    sent: adminSuccess || customerSuccess,
    message: `Admin email sent: ${adminSuccess}, Customer email sent: ${customerSuccess}`,
  };
};
