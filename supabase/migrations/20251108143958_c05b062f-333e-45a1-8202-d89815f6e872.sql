-- Create patients table
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  patient_id TEXT NOT NULL UNIQUE,
  blood_type blood_type NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  date_of_birth DATE NOT NULL,
  medical_notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_id UUID REFERENCES public.donors(id) ON DELETE SET NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  appointment_type TEXT NOT NULL DEFAULT 'donation',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patients
CREATE POLICY "Anyone authenticated can view patients"
  ON public.patients FOR SELECT
  USING (true);

CREATE POLICY "Staff can manage patients"
  ON public.patients FOR ALL
  USING (true);

-- RLS Policies for appointments
CREATE POLICY "Anyone authenticated can view appointments"
  ON public.appointments FOR SELECT
  USING (true);

CREATE POLICY "Staff can manage appointments"
  ON public.appointments FOR ALL
  USING (true);

-- Add triggers for updated_at
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();