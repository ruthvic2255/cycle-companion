-- Create profiles table for user personal data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date_of_birth DATE,
  blood_group TEXT CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create physical_data table for tracking health metrics
CREATE TABLE public.physical_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  height_cm DECIMAL(5,2),
  weight_kg DECIMAL(5,2),
  hemoglobin_level DECIMAL(4,2),
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  pain_level TEXT CHECK (pain_level IN ('low', 'medium', 'high')),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create menstrual_cycles table for period tracking
CREATE TABLE public.menstrual_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  cycle_length INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create exercise_videos table
CREATE TABLE public.exercise_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create food_videos table
CREATE TABLE public.food_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create suggested_foods table
CREATE TABLE public.suggested_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  benefits TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create notification_settings table
CREATE TABLE public.notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  days_before_period INTEGER DEFAULT 3,
  email_notifications BOOLEAN DEFAULT TRUE,
  last_notification_sent TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.physical_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menstrual_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggested_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for physical_data
CREATE POLICY "Users can view own physical data"
  ON public.physical_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own physical data"
  ON public.physical_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own physical data"
  ON public.physical_data FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own physical data"
  ON public.physical_data FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for menstrual_cycles
CREATE POLICY "Users can view own cycles"
  ON public.menstrual_cycles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cycles"
  ON public.menstrual_cycles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cycles"
  ON public.menstrual_cycles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cycles"
  ON public.menstrual_cycles FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for exercise_videos (public read)
CREATE POLICY "Anyone can view active exercise videos"
  ON public.exercise_videos FOR SELECT
  USING (is_active = true);

-- RLS Policies for food_videos (public read)
CREATE POLICY "Anyone can view active food videos"
  ON public.food_videos FOR SELECT
  USING (is_active = true);

-- RLS Policies for suggested_foods (public read)
CREATE POLICY "Anyone can view active suggested foods"
  ON public.suggested_foods FOR SELECT
  USING (is_active = true);

-- RLS Policies for notification_settings
CREATE POLICY "Users can view own notification settings"
  ON public.notification_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification settings"
  ON public.notification_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification settings"
  ON public.notification_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menstrual_cycles_updated_at
  BEFORE UPDATE ON public.menstrual_cycles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample exercise videos
INSERT INTO public.exercise_videos (title, youtube_url, description, display_order) VALUES
  ('Yoga for Period Relief', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Gentle yoga poses to ease menstrual discomfort', 1),
  ('Light Cardio Workout', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Low-impact cardio exercises', 2),
  ('Stretching Routine', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Full body stretching for menstrual health', 3);

-- Insert some sample food videos
INSERT INTO public.food_videos (title, youtube_url, description, display_order) VALUES
  ('Iron-Rich Foods Guide', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Foods to boost iron levels during menstruation', 1),
  ('Anti-Inflammatory Diet', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Foods that reduce period cramps', 2);

-- Insert some suggested foods
INSERT INTO public.suggested_foods (name, description, category, benefits, display_order) VALUES
  ('Leafy Greens', 'Spinach, kale, and other dark leafy vegetables', 'Vegetables', 'High in iron and calcium, helps combat fatigue', 1),
  ('Salmon', 'Rich in omega-3 fatty acids', 'Protein', 'Reduces inflammation and period pain', 2),
  ('Bananas', 'Natural source of potassium', 'Fruits', 'Helps with bloating and mood regulation', 3),
  ('Dark Chocolate', 'High quality dark chocolate (70%+)', 'Treats', 'Rich in magnesium, helps reduce cramps', 4),
  ('Ginger Tea', 'Fresh or dried ginger steeped in hot water', 'Beverages', 'Natural anti-inflammatory and pain reliever', 5),
  ('Almonds', 'Raw or roasted almonds', 'Nuts', 'High in magnesium and vitamin E', 6);