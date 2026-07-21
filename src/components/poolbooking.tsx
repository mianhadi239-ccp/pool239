import { useState } from "react";
import Calendar from "react-calendar";
import { format } from "date-fns";
import "react-calendar/dist/Calendar.css";
import "./poolbooking.css";
import images from "../assets";

interface Booking {
  date: string;
  name: string;
}

export default function PoolBooking() {
  const [bookings, setBookings] = useState<Booking[]>([
    { date: "2026-07-23", name: "John" },
    { date: "2026-07-25", name: "Sarah" },
    { date: "2026-07-28", name: "Mike" },
    { date: "2026-08-01", name: "David" }
  ]);

  const [date, setDate] = useState(new Date());
  const [name, setName] = useState("");
  const [people, setPeople] = useState(5);
  const [hours, setHours] = useState(2);

  const day = format(date, "EEEE");
  const formattedDate = format(date, "yyyy-MM-dd");

  const selectedBooking = bookings.find((b) => b.date === formattedDate);
  const booked = !!selectedBooking;

  const price = people * hours * 300;

  // Get start of today (00:00:00) to allow today's date but disable past dates
  const getTodayStart = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const bookPool = () => {
    const today = getTodayStart();
    const selectedDateTime = new Date(date);
    selectedDateTime.setHours(0, 0, 0, 0);

    if (selectedDateTime < today) {
      alert("You cannot book a past date.");
      return;
    }

    if (!name.trim()) {
      alert("Please enter a customer name for the booking.");
      return;
    }

    if (booked) {
      alert("This day is already booked.");
      return;
    }

    const newBooking: Booking = { date: formattedDate, name: name.trim() };
    setBookings([...bookings, newBooking]);
    alert(
      `Booking Confirmed!

Customer: ${name.trim()}
Date: ${formattedDate}
Day: ${day}
People: ${people}
Hours: ${hours}
Total: Rs.${price}`
    );
    setName(""); // Reset input field
  };

  return (
    <div
      className="hero-pool-booking"
      style={{ backgroundImage: `url(${images.Slider3})` }}
    >
      <div className="hero-overlay"></div>
      
      <div className="hero-content-container">
        
        <div className="hero-header-text">
          <span className="subtitle">Just Enjoy & Relax</span>
          <h1 className="title">Book Your Private Pool Session</h1>
        </div>

        <div className="booking-container">

          {/* Left Column: Pool Availability Calendar */}
          <div className="availability">

            <h2>Pool Availability</h2>

            <div className="legend">

              <div>
                <span className="green"></span>
                Available
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
              tileClassName={({ date }) => {
                const current = format(date, "yyyy-MM-dd");
                const isBooked = bookings.some((b) => b.date === current);
                return isBooked ? "booked" : "available";
              }}
              tileContent={({ date, view }) => {
                if (view === "month") {
                  const current = format(date, "yyyy-MM-dd");
                  const booking = bookings.find((b) => b.date === current);
                  if (booking) {
                    return <div className="booked-name">{booking.name}</div>;
                  }
                }
                return null;
              }}
            />

          </div>

          {/* Right Column: Booking Details Card */}
          <div className="booking-card">

            <h2>Book Your Pool</h2>

            <label>Selected Date</label>
            <input
              type="text"
              value={`${formattedDate} (${day})`}
              readOnly
              className="readonly-input"
            />

            <label>Customer Name</label>
            {booked ? (
              <input
                type="text"
                value={`Booked by ${selectedBooking.name}`}
                readOnly
                className="readonly-input booked-customer-name"
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

            <label>Number of People</label>
            <select
              value={people}
              onChange={(e) => setPeople(Number(e.target.value))}
              disabled={booked}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Person' : 'People'}
                </option>
              ))}
            </select>

            <label>Hours</label>
            <select
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              disabled={booked}
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
              disabled={booked}
              onClick={bookPool}
            >
              {booked ? `Booked by ${selectedBooking.name}` : "Book Now"}
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}