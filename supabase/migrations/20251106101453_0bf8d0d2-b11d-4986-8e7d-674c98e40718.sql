-- Create enum for blood types
CREATE TYPE blood_type AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');

-- Create enum for request status
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'fulfilled', 'rejected');

-- Create enum for donor eligibility
CREATE TYPE donor_eligibility AS ENUM ('eligible', 'temporarily_ineligible', 'permanently_ineligible');

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blood inventory table
CREATE TABLE public.blood_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blood_type blood_type NOT NULL,
  quantity_ml INTEGER NOT NULL CHECK (quantity_ml >= 0),
  collection_date TIMESTAMP WITH TIME ZONE NOT NULL,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create donors table
CREATE TABLE public.donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  blood_type blood_type NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  address TEXT,
  last_donation_date TIMESTAMP WITH TIME ZONE,
  eligibility donor_eligibility NOT NULL DEFAULT 'eligible',
  medical_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blood requests table
CREATE TABLE public.blood_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_name TEXT NOT NULL,
  hospital_name TEXT NOT NULL,
  blood_type blood_type NOT NULL,
  quantity_ml INTEGER NOT NULL CHECK (quantity_ml > 0),
  urgency TEXT NOT NULL DEFAULT 'normal',
  status request_status NOT NULL DEFAULT 'pending',
  requested_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- RLS Policies for blood_inventory
CREATE POLICY "Anyone authenticated can view inventory" ON public.blood_inventory
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff can manage inventory" ON public.blood_inventory
  FOR ALL TO authenticated USING (true);

-- RLS Policies for donors
CREATE POLICY "Anyone authenticated can view donors" ON public.donors
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff can manage donors" ON public.donors
  FOR ALL TO authenticated USING (true);

-- RLS Policies for blood_requests
CREATE POLICY "Anyone authenticated can view requests" ON public.blood_requests
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff can create requests" ON public.blood_requests
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Staff can update requests" ON public.blood_requests
  FOR UPDATE TO authenticated USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_blood_inventory_updated_at
  BEFORE UPDATE ON public.blood_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donors_updated_at
  BEFORE UPDATE ON public.donors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blood_requests_updated_at
  BEFORE UPDATE ON public.blood_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    'staff'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some sample data for blood inventory
INSERT INTO public.blood_inventory (blood_type, quantity_ml, collection_date, expiry_date, status) VALUES
  ('O+', 5000, NOW() - INTERVAL '5 days', NOW() + INTERVAL '37 days', 'available'),
  ('A+', 3500, NOW() - INTERVAL '10 days', NOW() + INTERVAL '32 days', 'available'),
  ('B+', 2000, NOW() - INTERVAL '3 days', NOW() + INTERVAL '39 days', 'available'),
  ('AB+', 1500, NOW() - INTERVAL '7 days', NOW() + INTERVAL '35 days', 'available'),
  ('O-', 4500, NOW() - INTERVAL '2 days', NOW() + INTERVAL '40 days', 'available'),
  ('A-', 2500, NOW() - INTERVAL '8 days', NOW() + INTERVAL '34 days', 'available'),
  ('B-', 1800, NOW() - INTERVAL '4 days', NOW() + INTERVAL '38 days', 'available'),
  ('AB-', 1200, NOW() - INTERVAL '6 days', NOW() + INTERVAL '36 days', 'available');

-- Insert sample donors
INSERT INTO public.donors (full_name, blood_type, email, phone, date_of_birth, address, last_donation_date, eligibility) VALUES
  ('John Smith', 'O+', 'john.smith@email.com', '+1-555-0101', '1985-03-15', '123 Main St, City', NOW() - INTERVAL '90 days', 'eligible'),
  ('Emma Johnson', 'A+', 'emma.j@email.com', '+1-555-0102', '1990-07-22', '456 Oak Ave, Town', NOW() - INTERVAL '120 days', 'eligible'),
  ('Michael Brown', 'B+', 'michael.b@email.com', '+1-555-0103', '1988-11-08', '789 Pine Rd, Village', NOW() - INTERVAL '45 days', 'temporarily_ineligible'),
  ('Sarah Davis', 'AB+', 'sarah.d@email.com', '+1-555-0104', '1992-05-30', '321 Elm St, Borough', NOW() - INTERVAL '150 days', 'eligible'),
  ('David Wilson', 'O-', 'david.w@email.com', '+1-555-0105', '1987-09-12', '654 Maple Dr, County', NOW() - INTERVAL '100 days', 'eligible'),
  ('Lisa Anderson', 'A-', 'lisa.a@email.com', '+1-555-0106', '1995-01-25', '987 Birch Ln, District', NOW() - INTERVAL '80 days', 'eligible');

-- Insert sample blood requests
INSERT INTO public.blood_requests (requester_name, hospital_name, blood_type, quantity_ml, urgency, status, notes) VALUES
  ('Dr. James Wilson', 'City General Hospital', 'O-', 2000, 'urgent', 'pending', 'Emergency surgery patient'),
  ('Dr. Sarah Chen', 'Memorial Medical Center', 'A+', 1500, 'normal', 'approved', 'Scheduled transfusion'),
  ('Dr. Robert Martinez', 'Community Hospital', 'B+', 1000, 'high', 'fulfilled', 'Post-operative care'),
  ('Dr. Emily Taylor', 'Regional Medical Center', 'AB+', 800, 'normal', 'pending', 'Routine procedure');