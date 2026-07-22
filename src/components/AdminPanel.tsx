import { useState, useEffect } from 'react';
import { getStoredBookings, updateBookingStatus, deleteBookingRequest, subscribeToBookings } from '../lib/bookingStorage';
import { BookingRequest, BookingStatus } from '../types/booking';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import images from '../assets';
import { isSupabaseConfigured } from '../lib/supabase';

interface AdminPanelProps {
  onLogout?: () => void;
}

export default function AdminPanel({ onLogout }: AdminPanelProps) {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [filter, setFilter] = useState<BookingStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setBookings(getStoredBookings());
    const unsubscribe = subscribeToBookings((updatedBookings) => {
      setBookings(updatedBookings);
    });
    return unsubscribe;
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleAccept = (request: BookingRequest) => {
    updateBookingStatus(request.id, 'accepted');
    showToast(`Accepted booking request ${request.invoiceNumber} for ${request.customerName}!`);
  };

  const handleReject = (request: BookingRequest) => {
    updateBookingStatus(request.id, 'rejected');
    showToast(`Rejected request ${request.invoiceNumber} for ${request.customerName}.`);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the booking for ${name}?`)) {
      deleteBookingRequest(id);
      showToast(`Deleted booking for ${name}.`);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesFilter = filter === 'all' || b.status === filter;
    const matchesSearch =
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.date.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const totalRequests = bookings.length;
  const pendingRequests = bookings.filter((b) => b.status === 'pending').length;
  const acceptedRequests = bookings.filter((b) => b.status === 'accepted').length;
  const totalRevenue = bookings
    .filter((b) => b.status === 'accepted')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <div
      className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-cover bg-center font-secondary relative"
      style={{ backgroundImage: `url(${images.Slider2})` }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-24 right-6 z-50 bg-accent text-white px-6 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-white/20 animate-bounce">
            <span className="text-xl">✨</span>
            <span className="font-tertiary tracking-wide font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="bg-accent/20 text-accent font-tertiary tracking-[3px] text-xs font-semibold px-3 py-1 rounded-full uppercase">
                Management Portal
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Device-Bound JWT Verified (HS256)
              </span>
              {isSupabaseConfigured() ? (
                <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[11px] font-mono px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  ⚡ Supabase Connected (Realtime)
                </span>
              ) : (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-mono px-2.5 py-0.5 rounded-full flex items-center gap-1.5" title="Fill .env credentials to activate live Supabase database">
                  🔌 Supabase Pending (.env)
                </span>
              )}
              <span className="text-gray-400 text-sm">• Private Admin Access</span>
            </div>
            <h1 className="font-primary text-3xl sm:text-4xl text-white uppercase tracking-wider">
              Pool Booking Requests Admin Panel
            </h1>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-4 py-2.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg font-tertiary text-xs tracking-widest uppercase transition flex items-center gap-1.5 border border-rose-500/30 font-semibold"
              >
                <span>🔒</span> Lock Panel
              </button>
            )}
            <Link
              to="/"
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-tertiary text-sm tracking-widest uppercase transition flex items-center gap-2 border border-white/10"
            >
              <span>←</span> Return to Public Site
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-6 rounded-2xl">
            <p className="text-gray-400 font-tertiary tracking-widest uppercase text-xs">Total Requests</p>
            <h3 className="text-3xl font-primary text-white mt-1">{totalRequests}</h3>
            <p className="text-xs text-gray-400 mt-2">All submitted booking requests</p>
          </div>

          <div className="bg-amber-500/10 backdrop-blur-md border border-amber-500/30 p-6 rounded-2xl">
            <div className="flex justify-between items-start">
              <p className="text-amber-400 font-tertiary tracking-widest uppercase text-xs">Pending Approval</p>
              {pendingRequests > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
              )}
            </div>
            <h3 className="text-3xl font-primary text-amber-300 mt-1">{pendingRequests}</h3>
            <p className="text-xs text-amber-400/80 mt-2">Awaiting admin review</p>
          </div>

          <div className="bg-emerald-500/10 backdrop-blur-md border border-emerald-500/30 p-6 rounded-2xl">
            <p className="text-emerald-400 font-tertiary tracking-widest uppercase text-xs">Accepted Bookings</p>
            <h3 className="text-3xl font-primary text-emerald-300 mt-1">{acceptedRequests}</h3>
            <p className="text-xs text-emerald-400/80 mt-2">Confirmed session dates</p>
          </div>

          <div className="bg-accent/15 backdrop-blur-md border border-accent/30 p-6 rounded-2xl">
            <p className="text-accent font-tertiary tracking-widest uppercase text-xs">Confirmed Revenue</p>
            <h3 className="text-3xl font-primary text-accent mt-1">Rs. {totalRevenue.toLocaleString()}</h3>
            <p className="text-xs text-accent/80 mt-2">From accepted bookings</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {(['all', 'pending', 'accepted', 'rejected'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-5 py-2.5 rounded-xl font-tertiary text-xs tracking-[1.5px] uppercase transition font-semibold ${
                    filter === tab
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab === 'all' && `All (${totalRequests})`}
                  {tab === 'pending' && `Pending (${pendingRequests})`}
                  {tab === 'accepted' && `Accepted (${acceptedRequests})`}
                  {tab === 'rejected' && `Rejected (${bookings.filter((b) => b.status === 'rejected').length})`}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="w-full md:w-72">
              <input
                type="text"
                placeholder="Search name, date, invoice..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent bg-white"
              />
            </div>
          </div>
        </div>

        {/* Requests Table / Cards */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {filteredBookings.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <span className="text-4xl block mb-3">📋</span>
              <h3 className="font-primary text-xl text-primary mb-1">No Booking Requests Found</h3>
              <p className="text-sm">There are no requests matching your current filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100/80 border-b border-gray-200 text-xs font-tertiary tracking-widest uppercase text-gray-600">
                    <th className="py-4 px-6">Invoice & Customer</th>
                    <th className="py-4 px-6">Session Date</th>
                    <th className="py-4 px-6">Guests & Time</th>
                    <th className="py-4 px-6">Total Amount</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm text-gray-800">
                  {filteredBookings.map((request) => (
                    <tr key={request.id} className="hover:bg-amber-50/40 transition">
                      
                      {/* Customer Info */}
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900 text-base">
                          {request.customerName}
                        </div>
                        {request.customerEmail && (
                          <div className="text-xs text-amber-700 font-mono flex items-center gap-1 mt-0.5">
                            ✉️ {request.customerEmail}
                          </div>
                        )}
                        <div className="text-xs font-mono text-gray-500 mt-0.5">
                          {request.invoiceNumber}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          Requested: {format(new Date(request.createdAt), 'dd MMM yyyy, HH:mm')}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">{request.date}</div>
                        <div className="text-xs text-accent font-semibold">{request.day}</div>
                      </td>

                      {/* Details */}
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">
                          {request.people} {request.people === 1 ? 'Person' : 'People'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {request.hours} {request.hours === 1 ? 'Hour' : 'Hours'} session
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-accent text-base">
                          Rs. {request.totalPrice.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          (Rs. {request.ratePerPersonPerHour}/person/hr)
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-6">
                        {request.status === 'pending' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                            Pending Approval
                          </span>
                        )}
                        {request.status === 'accepted' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            ✓ Accepted & Confirmed
                          </span>
                        )}
                        {request.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
                            ✕ Rejected
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {request.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleAccept(request)}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-tertiary text-xs uppercase tracking-wider rounded-lg shadow-md transition font-semibold"
                              >
                                ✓ Accept
                              </button>
                              <button
                                onClick={() => handleReject(request)}
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-tertiary text-xs uppercase tracking-wider rounded-lg shadow-md transition font-semibold"
                              >
                                ✕ Reject
                              </button>
                            </>
                          ) : request.status === 'accepted' ? (
                            <button
                              onClick={() => handleReject(request)}
                              className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs rounded-lg transition font-medium"
                            >
                              Change to Rejected
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAccept(request)}
                              className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs rounded-lg transition font-medium"
                            >
                              Accept Now
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(request.id, request.customerName)}
                            title="Delete Request"
                            className="p-2 text-gray-400 hover:text-rose-600 transition"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
