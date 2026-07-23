import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import { format } from "date-fns";
import "react-calendar/dist/Calendar.css";
import "./poolbooking.css";
import images from "../assets";
import { BookingRequest } from "../types/booking";
import { getStoredBookings, addBookingRequest, subscribeToBookings } from "../lib/bookingStorage";

interface InvoiceData {
  customerName: string;
  customerEmail: string;
  date: string;
  day: string;
  people: number;
  hours: number;
  ratePerPersonPerHour: number;
  totalPrice: number;
  invoiceNumber: string;
}

export default function PoolBooking() {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [date, setDate] = useState(new Date());
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [people, setPeople] = useState(5);
  const [hours, setHours] = useState(2);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [submittedInvoiceNumber, setSubmittedInvoiceNumber] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const TYPO_MAP: Record<string, string> = {
    'gmai.com': 'gmail.com',
    'gamil.com': 'gmail.com',
    'gmial.com': 'gmail.com',
    'gmaill.com': 'gmail.com',
    'gmai.co': 'gmail.com',
    'yaho.com': 'yahoo.com',
    'yahou.com': 'yahoo.com',
    'yaho.co': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'hotmai.com': 'hotmail.com',
    'outlok.com': 'outlook.com',
    'outloo.com': 'outlook.com',
    'icloud.co': 'icloud.com',
  };

  const validateEmail = async (val: string): Promise<boolean> => {
    const trimmed = val.trim().toLowerCase();
    if (!trimmed) {
      setEmailError("Email address is required.");
      return false;
    }

    // 1. Basic format regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed)) {
      setEmailError("Please enter a valid email address (e.g. user@example.com).");
      return false;
    }

    const domain = trimmed.split('@')[1];

    // 2. Common typo detection
    if (TYPO_MAP[domain]) {
      const suggested = trimmed.split('@')[0] + '@' + TYPO_MAP[domain];
      setEmailError(`Invalid domain '${domain}'. Did you mean '${suggested}'?`);
      return false;
    }

    // 3. DNS MX/A Domain Existence Verification via Google Public DNS
    try {
      setIsValidatingEmail(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        // Status 3 = NXDOMAIN (Domain does not exist)
        if (data.Status === 3) {
          setEmailError(`The domain '${domain}' does not exist. Please check your email.`);
          setIsValidatingEmail(false);
          return false;
        }

        // If no MX records, check for A records (host exists or can take mail)
        if ((!data.Answer || data.Answer.length === 0) && data.Status === 0) {
          const aRes = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`);
          const aData = await aRes.json();
          if (aData.Status === 3 || (!aData.Answer || aData.Answer.length === 0)) {
            setEmailError(`The domain '${domain}' is invalid or cannot receive emails.`);
            setIsValidatingEmail(false);
            return false;
          }
        }
      }
    } catch (err) {
      console.warn("DNS domain check skipped or timed out:", err);
    } finally {
      setIsValidatingEmail(false);
    }

    setEmailError(null);
    return true;
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (emailError) {
      // Re-validate format locally
      const trimmed = val.trim().toLowerCase();
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (emailRegex.test(trimmed)) {
        setEmailError(null);
      }
    }
  };

  const handleEmailBlur = async () => {
    if (email.trim()) {
      await validateEmail(email);
    }
  };

  useEffect(() => {
    setRequests(getStoredBookings());
    const unsubscribe = subscribeToBookings((updatedBookings) => {
      setRequests(updatedBookings);
    });
    return unsubscribe;
  }, []);

  const day = format(date, "EEEE");
  const formattedDate = format(date, "yyyy-MM-dd");

  const acceptedBooking = requests.find((b) => b.date === formattedDate && b.status === "accepted");
  const pendingBooking = requests.find((b) => b.date === formattedDate && b.status === "pending");
  
  const isAccepted = !!acceptedBooking;
  const isPending = !!pendingBooking;

  const ratePerPersonPerHour = 600;
  const price = people * hours * ratePerPersonPerHour;

  // Get start of today (00:00:00) to allow today's date but disable past dates
  const getTodayStart = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  // Generate a short, readable invoice number (e.g. INV-4829)
  const generateInvoiceNumber = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `INV-${num}`;
  };

  const handleRequestBooking = async () => {
    const today = getTodayStart();
    const selectedDateTime = new Date(date);
    selectedDateTime.setHours(0, 0, 0, 0);

    if (selectedDateTime < today) {
      alert("You cannot request a booking for a past date.");
      return;
    }

    if (!name.trim()) {
      alert("Please enter your name for the booking request.");
      return;
    }

    const isEmailValid = await validateEmail(email);
    if (!isEmailValid) {
      return;
    }

    if (people > 13) {
      alert("Maximum allowed number of people is 13.");
      return;
    }

    if (isAccepted) {
      alert("This date is already accepted and fully booked.");
      return;
    }

    // Show the invoice modal with 'Request & Pay'
    setInvoiceData({
      customerName: name.trim(),
      customerEmail: email.trim(),
      date: formattedDate,
      day,
      people,
      hours,
      ratePerPersonPerHour,
      totalPrice: price,
      invoiceNumber: generateInvoiceNumber(),
    });
    setShowInvoice(true);
  };

  const submitRequestAndPay = () => {
    if (!invoiceData) return;
    
    // Store request with pending status
    addBookingRequest({
      invoiceNumber: invoiceData.invoiceNumber,
      date: invoiceData.date,
      day: invoiceData.day,
      customerName: invoiceData.customerName,
      customerEmail: invoiceData.customerEmail,
      people: invoiceData.people,
      hours: invoiceData.hours,
      ratePerPersonPerHour: invoiceData.ratePerPersonPerHour,
      totalPrice: invoiceData.totalPrice,
    });

    setSubmittedInvoiceNumber(invoiceData.invoiceNumber);
    setShowInvoice(false);
    setInvoiceData(null);
    setName("");
    setEmail("");
  };

  const cancelInvoice = () => {
    setShowInvoice(false);
    setInvoiceData(null);
  };

  return (
    <div className="hero-pool-booking">
      <div
        className="hero-pool-booking-bg"
        style={{ backgroundImage: `url(${images.Slider3})` }}
      ></div>
      <div className="hero-overlay"></div>
      
      <div className="hero-content-container">
        
        <div className="hero-header-text">
          <span className="subtitle"></span>
          <h1 className="title">Book Your Private Pool Session</h1>
        </div>

        <div className="booking-container">

          {/* Left Column: Pool Availability Calendar */}
          <div className="availability">

            <h2> Pool Availability</h2>

            <div className="legend">

              <div>
                <span className="green"></span>
                Available
              </div>

              <div>
                <span className="yellow"></span>
                Pending Approval
              </div>

              <div>
                <span className="red"></span>
                Booked
              </div>

            </div>

            <Calendar
              value={date}
              minDate={getTodayStart()}
              onChange={(value) => {
                if (value instanceof Date) {
                  setDate(value);
                }
              }}
              tileClassName={({ date: tileDate }) => {
                const current = format(tileDate, "yyyy-MM-dd");
                const accepted = requests.some((b) => b.date === current && b.status === "accepted");
                const pending = requests.some((b) => b.date === current && b.status === "pending");
                
                let tileClass = accepted ? "booked" : pending ? "pending-tile" : "available";
                if (current === formattedDate) {
                  tileClass += " selected-date-tile";
                }
                return tileClass;
              }}
              tileContent={({ date: tileDate, view }) => {
                if (view === "month") {
                  const current = format(tileDate, "yyyy-MM-dd");
                  const isSelected = current === formattedDate;
                  const accepted = requests.find((b) => b.date === current && b.status === "accepted");
                  const pending = requests.find((b) => b.date === current && b.status === "pending");
                  
                  return (
                    <>
                      {accepted && <div className="booked-name">{accepted.customerName}</div>}
                      {!accepted && pending && <div className="pending-name">Req: {pending.customerName}</div>}
                      {isSelected && <div className="selected-badge">✓ Selected</div>}
                    </>
                  );
                }
                return null;
              }}
            />

          </div>

          {/* Right Column: Booking Details Card */}
          <div className="booking-card">

            <h2>Request Pool Session</h2>

            <label>Selected Date</label>
            <input
              type="text"
              value={`${formattedDate} (${day})`}
              readOnly
              className="readonly-input"
            />

            <label>
              Customer Name <span className="text-rose-500 font-bold">*</span>
            </label>
            {isAccepted ? (
              <input
                type="text"
                value={`Booked by ${acceptedBooking.customerName}`}
                readOnly
                className="readonly-input booked-customer-name"
              />
            ) : isPending ? (
              <input
                type="text"
                value={`Pending request by ${pendingBooking.customerName}`}
                readOnly
                className="readonly-input pending-customer-name"
              />
            ) : (
              <input
                type="text"
                placeholder="Enter customer name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="name-input"
              />
            )}

            <label>
              Customer Email <span className="text-rose-500 font-bold">*</span>
            </label>
            {isAccepted ? (
              <input
                type="email"
                value={acceptedBooking.customerEmail || 'n/a'}
                readOnly
                className="readonly-input booked-customer-name"
              />
            ) : isPending ? (
              <input
                type="email"
                value={pendingBooking.customerEmail || 'n/a'}
                readOnly
                className="readonly-input pending-customer-name"
              />
            ) : (
              <div className="email-input-wrapper">
                <input
                  type="email"
                  placeholder="Enter customer email (required)"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={handleEmailBlur}
                  className={`name-input ${emailError ? 'input-field-error' : ''}`}
                  required
                />
                {isValidatingEmail && (
                  <p className="field-validating-message">
                    🔍 Verifying email domain availability...
                  </p>
                )}
                {!isValidatingEmail && emailError && (
                  <p className="field-error-message">
                    ⚠️ {emailError}
                  </p>
                )}
              </div>
            )}

            <label>Number of People (Max 13)</label>
            <select
              value={people}
              onChange={(e) => setPeople(Number(e.target.value))}
              disabled={isAccepted}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Person' : 'People'}
                </option>
              ))}
            </select>

            <label>Hours</label>
            <select
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              disabled={isAccepted}
            >
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Hour' : 'Hours'}
                </option>
              ))}
            </select>

            <div className="price">
              <span>Total Price</span>
              <h1>Rs. {price}</h1>
            </div>

            <button
              className="book-btn"
              disabled={isAccepted}
              onClick={handleRequestBooking}
            >
              {isAccepted
                ? `Booked by ${acceptedBooking.customerName}`
                : isPending
                ? `Pending Approval (${pendingBooking.customerName})`
                : "Request Booking"}
            </button>

          </div>

        </div>

      </div>

      {/* Invoice Modal Overlay */}
      {showInvoice && invoiceData && (
        <div className="invoice-overlay" onClick={cancelInvoice}>
          <div className="invoice-modal" onClick={(e) => e.stopPropagation()}>

            {/* Invoice Header */}
            <div className="invoice-header">
              <div className="invoice-brand">
                <div className="invoice-logo">🏊</div>
                <div>
                  <h2 className="invoice-company-name">Pool Booking</h2>
                  <p className="invoice-tagline">Private Pool Sessions</p>
                </div>
              </div>
              <div className="invoice-meta">
                <span className="invoice-badge">BOOKING INVOICE</span>
                <p className="invoice-number">{invoiceData.invoiceNumber}</p>
                <p className="invoice-date-issued">Issued: {format(new Date(), "dd MMM yyyy")}</p>
              </div>
            </div>

            <div className="invoice-divider"></div>

            {/* Payment & Request Notice Banner */}
            <div className="invoice-payment-notice">
              <div className="invoice-notice-icon">💳</div>
              <div>
                <h3>To confirm your booking, please pay the amount below</h3>
                <p>Click "Request & Pay" to submit your request for admin approval.</p>
              </div>
            </div>

            {/* Customer & Booking Info */}
            <div className="invoice-info-grid">
              <div className="invoice-info-block">
                <h4>Bill To</h4>
                <p className="invoice-customer-name">{invoiceData.customerName}</p>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{invoiceData.customerEmail}</p>
              </div>
              <div className="invoice-info-block">
                <h4>Booking Details</h4>
                <p>{invoiceData.date} ({invoiceData.day})</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="invoice-table-wrapper">
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <span className="invoice-item-title">Private Pool Session</span>
                      <span className="invoice-item-sub">{invoiceData.people} {invoiceData.people === 1 ? 'person' : 'people'} × {invoiceData.hours} {invoiceData.hours === 1 ? 'hour' : 'hours'}</span>
                    </td>
                    <td>{invoiceData.people * invoiceData.hours}</td>
                    <td>Rs. {invoiceData.ratePerPersonPerHour}</td>
                    <td>Rs. {invoiceData.totalPrice}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="invoice-totals">
              <div className="invoice-total-row">
                <span>Subtotal</span>
                <span>Rs. {invoiceData.totalPrice}</span>
              </div>
              <div className="invoice-total-row">
                <span>Tax (0%)</span>
                <span>Rs. 0</span>
              </div>
              <div className="invoice-total-row invoice-grand-total">
                <span>Total Amount Due</span>
                <span>Rs. {invoiceData.totalPrice}</span>
              </div>
            </div>

            {/* Payment Accounts Section */}
            <div className="invoice-payment-methods">
              <div className="invoice-payment-header">
                <h4>💳 Official Payment Accounts</h4>
                <span className="payment-instruction-badge">Pay via Easypaisa or Bank</span>
              </div>

              <div className="payment-options-grid">
                {/* Option 1: Easypaisa */}
                <div className="payment-card easypaisa-card">
                  <div className="payment-card-top">
                    <span className="payment-provider-badge easypaisa-pill">Easypaisa</span>
                    <span className="payment-method-tag">Mobile Wallet</span>
                  </div>
                  <div className="payment-card-row">
                    <span className="pay-label">Account Title:</span>
                    <span className="pay-val font-semibold">Abdul Hadi</span>
                  </div>
                  <div className="payment-card-row">
                    <span className="pay-label">Mobile Number:</span>
                    <div className="pay-val-group">
                      <span className="pay-val font-mono font-bold text-emerald-700">03318666239</span>
                      <button
                        type="button"
                        className="copy-btn"
                        onClick={() => handleCopy("03318666239", "easypaisa")}
                      >
                        {copiedText === "easypaisa" ? "Copied! ✓" : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Option 2: Bank Makramah */}
                <div className="payment-card bank-card">
                  <div className="payment-card-top">
                    <span className="payment-provider-badge bank-pill">Bank Makramah</span>
                    <span className="payment-method-tag">Bank Transfer</span>
                  </div>
                  <div className="payment-card-row">
                    <span className="pay-label">Account Title:</span>
                    <span className="pay-val font-semibold">Abdul Hadi</span>
                  </div>
                  <div className="payment-card-row">
                    <span className="pay-label">Account Number:</span>
                    <div className="pay-val-group">
                      <span className="pay-val font-mono font-bold text-blue-800">0601586016000001</span>
                      <button
                        type="button"
                        className="copy-btn"
                        onClick={() => handleCopy("0601586016000001", "bank")}
                      >
                        {copiedText === "bank" ? "Copied! ✓" : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="invoice-actions">
              <button className="invoice-btn-cancel" onClick={cancelInvoice}>
                Cancel
              </button>
              <button className="invoice-btn-confirm" onClick={submitRequestAndPay}>
                Request & Pay — Rs. {invoiceData.totalPrice}
              </button>
            </div>

            {/* Footer note */}
            <p className="invoice-footer-note">
              Submitting this payment requests your session. Admin approval will lock your chosen date.
            </p>

          </div>
        </div>
      )}

      {/* Success Confirmation Modal */}
      {submittedInvoiceNumber && (
        <div className="invoice-overlay" onClick={() => setSubmittedInvoiceNumber(null)}>
          <div className="invoice-modal text-center py-10 px-8" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border-2 border-amber-300">
              ⏳
            </div>
            <h2 className="font-primary text-2xl uppercase tracking-wider text-gray-900 mb-2">
              Request & Payment Submitted!
            </h2>
            <p className="text-sm text-gray-600 mb-4 font-secondary">
              Your request <strong className="text-gray-900 font-mono">{submittedInvoiceNumber}</strong> has been received and is currently <span className="text-amber-600 font-semibold uppercase">Pending Admin Approval</span>.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 mb-4 text-left">
              💡 <strong>Next Step:</strong> The pool administrator will review and accept your booking request in the Admin Panel.
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-800 mb-6 text-left flex items-start gap-2.5">
              <span className="text-base">📧</span>
              <div>
                <strong>Email Notification Dispatched:</strong> An alert email has been sent to <strong>mianhadi239@gmail.com</strong> and a confirmation copy to your email address.
              </div>
            </div>
            <button
              onClick={() => setSubmittedInvoiceNumber(null)}
              className="px-8 py-3.5 bg-primary hover:bg-accent text-white font-tertiary text-sm tracking-widest uppercase rounded-lg font-semibold transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}