-- Add latitude and longitude columns to customers table for map functionality
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 6),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(10, 6);

-- Add index for location queries
CREATE INDEX IF NOT EXISTS idx_customers_location ON customers(latitude, longitude);
