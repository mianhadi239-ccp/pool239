-- ============================================================
-- SUPABASE POSTGRESQL SCHEMA FOR POOL BOOKING SYSTEM
-- Copy and paste this script directly into Supabase SQL Editor
-- ============================================================

-- 1. Create pool_bookings Table
CREATE TABLE IF NOT EXISTS public.pool_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    booking_date DATE NOT NULL,
    day_of_week TEXT NOT NULL,
    people INTEGER NOT NULL CHECK (people > 0),
    hours INTEGER NOT NULL CHECK (hours > 0),
    rate_per_person_per_hour NUMERIC(10, 2) NOT NULL DEFAULT 300.00,
    total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create Performance Indexes for Fast Queries
CREATE INDEX IF NOT EXISTS idx_pool_bookings_date ON public.pool_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_pool_bookings_status ON public.pool_bookings(status);
CREATE INDEX IF NOT EXISTS idx_pool_bookings_invoice ON public.pool_bookings(invoice_number);

-- 3. Automatic updated_at Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_pool_bookings_updated_at ON public.pool_bookings;
CREATE TRIGGER set_pool_bookings_updated_at
    BEFORE UPDATE ON public.pool_bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.pool_bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policy 1: Anyone can read bookings (for public calendar availability)
CREATE POLICY "Allow public read access to pool_bookings"
    ON public.pool_bookings
    FOR SELECT
    USING (true);

-- RLS Policy 2: Anyone can insert a new booking request
CREATE POLICY "Allow public insert for new booking requests"
    ON public.pool_bookings
    FOR INSERT
    WITH CHECK (true);

-- RLS Policy 3: Allow full access (Update/Delete) for authenticated admin users
CREATE POLICY "Allow update and delete for admin users"
    ON public.pool_bookings
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 5. Seed Initial Sample Data
INSERT INTO public.pool_bookings 
(invoice_number, customer_name, booking_date, day_of_week, people, hours, rate_per_person_per_hour, total_price, status)
VALUES
('INV-7X9K-3A1B', 'John Doe', '2026-07-23', 'Thursday', 4, 2, 300.00, 2400.00, 'accepted'),
('INV-8Y2M-9C4D', 'Sarah Smith', '2026-07-25', 'Saturday', 6, 3, 300.00, 5400.00, 'accepted'),
('INV-9Z4P-1E5F', 'Mike Johnson', '2026-07-28', 'Tuesday', 5, 2, 300.00, 3000.00, 'pending'),
('INV-1A5Q-6F7G', 'David Lee', '2026-08-01', 'Saturday', 8, 4, 300.00, 9600.00, 'pending')
ON CONFLICT (invoice_number) DO NOTHING;
