
-- Helper function for ownership check
CREATE OR REPLACE FUNCTION public.is_user_owner(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN target_user_id = auth.uid();
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- User profiles with exam data
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  current_score INTEGER DEFAULT 0,
  target_score INTEGER DEFAULT 1500,
  exam_date DATE,
  preferred_subjects TEXT[] DEFAULT '{}',
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (public.is_user_owner(user_id));
CREATE POLICY "Users can create own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (public.is_user_owner(user_id));
CREATE POLICY "Users can delete own profile" ON public.user_profiles FOR DELETE USING (public.is_user_owner(user_id));

-- Test results
CREATE TABLE public.test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL,
  reading_score INTEGER NOT NULL DEFAULT 0,
  math_score INTEGER NOT NULL DEFAULT 0,
  weak_topics TEXT[] DEFAULT '{}',
  time_spent INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  test_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own results" ON public.test_results FOR SELECT USING (public.is_user_owner(user_id));
CREATE POLICY "Users can create own results" ON public.test_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own results" ON public.test_results FOR DELETE USING (public.is_user_owner(user_id));

-- Study plan tasks
CREATE TABLE public.study_plan_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic TEXT NOT NULL,
  task_type TEXT NOT NULL DEFAULT 'practice',
  duration INTEGER NOT NULL DEFAULT 30,
  day_of_week INTEGER NOT NULL,
  plan_date DATE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.study_plan_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks" ON public.study_plan_tasks FOR SELECT USING (public.is_user_owner(user_id));
CREATE POLICY "Users can create own tasks" ON public.study_plan_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.study_plan_tasks FOR UPDATE USING (public.is_user_owner(user_id));
CREATE POLICY "Users can delete own tasks" ON public.study_plan_tasks FOR DELETE USING (public.is_user_owner(user_id));

-- Question responses for analytics
CREATE TABLE public.question_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  test_result_id UUID REFERENCES public.test_results(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  section TEXT NOT NULL,
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  user_answer INTEGER,
  correct_answer INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  time_taken INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.question_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own responses" ON public.question_responses FOR SELECT USING (public.is_user_owner(user_id));
CREATE POLICY "Users can create own responses" ON public.question_responses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
