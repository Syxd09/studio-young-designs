-- Database Schema for Studio Young Designs Admin Panel & CMS
-- Run this SQL in your Supabase SQL Editor to set up tables and security policies.

-- 1. SITE CONFIGURATION (Texts & Numbers)
CREATE TABLE site_config (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial website text configurations
INSERT INTO site_config (key, value) VALUES
('hero_title', 'Bespoke spaces, crafted over forty years.'),
('hero_subtitle', 'We design and build luxury modular kitchens, custom wardrobes, and turnkey residential interiors across Bangalore. Built on precision, crafted for generations.'),
('about_heading', 'Timeless design, in-house craftsmanship.'),
('about_desc_1', 'For over forty years, Studio Young Designs has stood as a hallmark of bespoke residential design in Bangalore. What began as a boutique carpentry atelier in 1981 has evolved into a fully integrated, state-of-the-art design and manufacturing command center.'),
('about_desc_2', 'We do not believe in mass production. Every modular kitchen, custom walk-in wardrobe, and furniture composition is designed individually, engineered in-house, and crafted by master artisans. Our forty-year legacy is built upon structural integrity, materials that age gracefully, and an uncompromising attention to detail.'),
('stat_years', '40+'),
('stat_years_label', 'Years of Craft'),
('stat_spaces', '700+'),
('stat_spaces_label', 'Residential Spaces'),
('stat_artisans', '35+'),
('stat_artisans_label', 'Master Craftsmen'),
('contact_email', 'hello@studioyoung.in'),
('contact_phone', '+91 98450 12345'),
('contact_address', '12, Lavelle Road, Bangalore, Karnataka 560001'),
('contact_hours', 'Mon – Sat · 10:00 AM – 7:00 PM');

-- 2. LAYOUT IMAGES (Dynamic images on different pages)
CREATE TABLE layout_images (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  key TEXT UNIQUE NOT NULL,
  image_url TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial layout images using current stock images or placeholders
INSERT INTO layout_images (key, image_url) VALUES
('hero_bg', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80'),
('about_img', 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1000&q=80'),
('logo', '/logo-transparent.png');

-- 3. SERVICES
CREATE TABLE services (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_desc TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  benefits TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  display_order INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed services matching the site pages
INSERT INTO services (slug, title, short_desc, description, image_url, benefits, features, display_order, is_visible) VALUES
('kitchens', 'Modular Kitchens', 'Architectural kitchens engineered for premium ergonomics and structural durability.', 'A kitchen is the architectural hearth of the modern home. We craft bespoke modular systems combining European hardware (Blum, Grass) with high-density moisture-resistant (HDMR) boards and natural wood veneers, tailor-made to resist Bangalore''s varied culinary habits.', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80', ARRAY['Lacquered & Acrylic finishes', 'Blum premium drawer runner systems', 'Quartz & Granite seamless countertops'], ARRAY['In-house manufacturing & quality testing', '45-day turnkey installation timeline', '10-year comprehensive warranty'], 0, true),
('wardrobes', 'Custom Wardrobes', 'Bespoke walk-in closets and wardrobes tailored to maximize luxury and storage.', 'Storage should be as elegant as the garments it houses. Our premium wardrobe collections range from floor-to-ceiling sliding systems with concealed profile lighting to open walk-in wardrobes styled in structural glass, anodized aluminium, and rich tinted wood veneers.', 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1000&q=80', ARRAY['Integrated LED sensor lighting', 'Fluted glass and aluminum frames', 'Italian leather drawer organizers'], ARRAY['Soft-close wardrobe hinges', 'Customizable drawer layouts', 'Dehumidifying ventilation panels'], 1, true),
('living-spaces', 'Living Spaces', 'Curated custom TV units, wall panelling, and bespoke luxury furniture.', 'The living area is the canvas of your home. We design and manufacture integrated wall panelling, suspended credenzas, custom-built sofas, and marble-inlaid coffee tables designed to flow organically with the lighting and architecture of your room.', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80', ARRAY['Suspended marble-top credenzas', 'Sound-dampening fluted wall panels', 'Concealed smart cable management'], ARRAY['Locally sourced premium hardwoods', 'Bespoke fabric selections', 'High-density structural cushions'], 2, true),
('interiors', 'Turnkey Interiors', 'End-to-end luxury residential interior design and execution services.', 'Bespoke complete-home transformations. From lighting blueprints and false ceiling execution to custom carpentry, wall finishes, and decor curation, we manage the entire project lifecycle with single-point accountability.', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80', ARRAY['Complete spatial coordination blueprints', 'Premium false ceiling & ambient lighting', 'Strict adherence to design timelines'], ARRAY['In-house project managers', 'Rigorous 150-point quality check', 'Dedicated post-handover support team'], 3, true);

-- 4. PORTFOLIO GALLERY
CREATE TABLE gallery (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  category TEXT NOT NULL, -- kitchens, wardrobes, living, interiors
  image_url TEXT NOT NULL,
  span TEXT DEFAULT 'standard', -- standard, tall, wide
  display_order INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial gallery items
INSERT INTO gallery (title, subtitle, category, image_url, span, display_order, is_visible) VALUES
('Walnut Kitchen', 'Modular · Sadashivanagar', 'kitchens', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80', 'wide', 0, true),
('Malabar Residence', 'Dining · Bangalore', 'interiors', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80', 'tall', 1, true),
('Cedar Walk-In', 'Master Wardrobe', 'wardrobes', 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1000&q=80', 'standard', 2, true),
('Living Composition', 'Walnut & Linen', 'living', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80', 'standard', 3, true),
('Sadashivanagar House', 'Master Bedroom', 'interiors', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80', 'standard', 4, true),
('Cubbon Study', 'Home Library', 'living', 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1000&q=80', 'tall', 5, true),
('Turnkey Villa', 'Complete Interior', 'interiors', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80', 'wide', 6, true),
('Whitefield Villa', 'Marble & Walnut Bath', 'interiors', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=80', 'standard', 7, true);

-- 5. TESTIMONIALS
CREATE TABLE testimonials (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  customer_name TEXT NOT NULL,
  company_name TEXT,
  rating INT CHECK (rating >= 1 AND rating <= 5) DEFAULT 5,
  content TEXT NOT NULL,
  profile_image_url TEXT,
  display_order INT DEFAULT 0,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial testimonials
INSERT INTO testimonials (customer_name, company_name, rating, content, profile_image_url, display_order) VALUES
('Anand Rao', 'Whitefield Villa Owner', 5, ' Studio Young Designs converted our bare villa shell into a work of art. Their 40 years of experience shone through in the design phase, and their bespoke modular kitchen remains the highlight of our home.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80', 0),
('Meera Krishnan', 'Sadashivanagar Resident', 5, 'Their in-house workshop is the real deal. The modular sliding wardrobes they delivered are of international standard, showing perfect alignment and micro-detail finishing. Highly recommended for premium homes.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80', 1);

-- 6. JOURNAL / BLOG POSTS
CREATE TABLE journal_posts (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT NOT NULL,
  read_time TEXT DEFAULT '5 min read',
  category TEXT DEFAULT 'Design Theory',
  tags TEXT[] DEFAULT '{}',
  is_visible BOOLEAN DEFAULT TRUE,
  published_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial journal posts
INSERT INTO journal_posts (slug, title, excerpt, content, image_url, read_time, category, is_visible) VALUES
('evolution-modular-kitchen-design', 'The Evolution of the Modular Kitchen', 'How modern engineering has transformed the traditional Indian cooking hearth into the social hub of the home.', 'The modular kitchen has evolved from a functional cooking zone into the social heart of the modern Indian home. In Bangalore, where urban lifestyles demand efficiency without compromising on aesthetic sophistication, planning a kitchen requires a careful balance of ergonomics, material durability, and design flow.', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80', '5 min read', 'Kitchen Planning', true),
('crafting-perfect-walk-in-wardrobe', 'Crafting the Perfect Walk-In Wardrobe', 'A study of ergonomics, luxury materials, and spatial planning for private dressing spaces.', 'Your wardrobe is more than just storage; it is a personal boutique. Explore how custom walk-in closets and glass wardrobes add functional luxury to bedrooms. We examine how custom lighting, leather tray inserts, and wood selections convert storage into a true sensory experience.', 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1000&q=80', '7 min read', 'Wardrobe Design', true);

-- 7. ENQUIRIES / CONTACT LEADS
CREATE TABLE enquiries (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'New', -- New, Contacted, Quoted, Closed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE layout_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- 1. PUBLIC READ-ONLY ACCESS POLICIES
CREATE POLICY "Allow public read-only to site_config" ON site_config FOR SELECT USING (true);
CREATE POLICY "Allow public read-only to layout_images" ON layout_images FOR SELECT USING (true);
CREATE POLICY "Allow public read-only to services" ON services FOR SELECT USING (is_visible = true);
CREATE POLICY "Allow public read-only to gallery" ON gallery FOR SELECT USING (is_visible = true);
CREATE POLICY "Allow public read-only to testimonials" ON testimonials FOR SELECT USING (is_approved = true);
CREATE POLICY "Allow public read-only to journal_posts" ON journal_posts FOR SELECT USING (is_visible = true);

-- 2. PUBLIC WRITE POLICIES
CREATE POLICY "Allow public insert on enquiries" ON enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on testimonials" ON testimonials FOR INSERT WITH CHECK (true);

-- 3. SECURE ADMIN ALL POLICIES (Requires user to be authenticated)
CREATE POLICY "Allow authenticated to manage site_config" ON site_config FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated to manage layout_images" ON layout_images FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated to manage services" ON services FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated to manage gallery" ON gallery FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated to manage testimonials" ON testimonials FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated to manage journal_posts" ON journal_posts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated to manage enquiries" ON enquiries FOR ALL USING (auth.role() = 'authenticated');


-- ==========================================
-- STORAGE BUCKETS CONFIGURATION (MEDIA MANAGEMENT)
-- ==========================================
-- Note: Create the 'studio-young-assets' bucket in the Supabase Storage dashboard, and set it to PUBLIC.
-- If storage.objects table exists, enable RLS and add these policies:

-- Storage Policies for 'studio-young-assets' bucket
-- Note: Make sure to replace bucket_id checks if you split them into multiple buckets,
-- or use a single unified bucket with folder prefixes (e.g. 'gallery/', 'services/', 'testimonials/').

CREATE POLICY "Allow public read-only from studio-young-assets" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'studio-young-assets');

CREATE POLICY "Allow authenticated to upload to studio-young-assets" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'studio-young-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated to edit in studio-young-assets" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'studio-young-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated to delete in studio-young-assets" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'studio-young-assets' AND auth.role() = 'authenticated');


-- ==========================================
-- SEED DEFAULT ADMIN USER
-- ==========================================
-- Run this SQL block to seed your primary admin user.
-- Email: admin@studioyoung.in
-- Password: #StudioYoung1981 (Change this in production)

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, 
  email_confirmed_at, recovery_sent_at, last_sign_in_at, 
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
  confirmation_token, email_change, email_change_token_new, recovery_token
)
SELECT 
  '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 
  'admin@studioyoung.in', extensions.crypt('#StudioYoung1981', extensions.gen_salt('bf')), 
  now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{}', now(), now(), '', '', '', ''
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@studioyoung.in');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
SELECT gen_random_uuid(), id, format('{"sub":"%s","email":"%s"}', id, email)::jsonb, 'email', id::text, now(), now(), now()
FROM auth.users WHERE email = 'admin@studioyoung.in'
ON CONFLICT DO NOTHING;


-- ==========================================
-- 8. STORAGE BUCKET & RLS POLICIES
-- ==========================================
-- Run this block to initialize storage bucket and configure anonymous read/write access.

-- Insert bucket configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('studio-young-assets', 'studio-young-assets', true, 15728640, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Enable Select Policy
CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'studio-young-assets');

-- Enable Insert Policy (authenticated only)
CREATE POLICY "Allow authenticated upload access" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'studio-young-assets' AND auth.role() = 'authenticated');

-- Enable Delete Policy (authenticated only)
CREATE POLICY "Allow authenticated delete access" ON storage.objects
  FOR DELETE USING (bucket_id = 'studio-young-assets' AND auth.role() = 'authenticated');


-- ==========================================
-- 8. WHY CHOOSE US (CARDS)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.why_choose_us (
    id bigint primary key generated always as identity,
    title text not null,
    description text not null,
    is_visible boolean not null default true,
    display_order integer not null default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.why_choose_us ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on why_choose_us" 
ON public.why_choose_us FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Allow authenticated insert on why_choose_us" 
ON public.why_choose_us FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated update on why_choose_us" 
ON public.why_choose_us FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated delete on why_choose_us" 
ON public.why_choose_us FOR DELETE 
TO authenticated 
USING (true);

INSERT INTO public.why_choose_us (title, description, display_order)
SELECT '40+ Years Experience', 'A four-decade practice, refined project by project.', 0
WHERE NOT EXISTS (SELECT 1 FROM public.why_choose_us);

INSERT INTO public.why_choose_us (title, description, display_order)
SELECT 'Bespoke Designs', 'Every space drawn from the ground up around how you live.', 1
WHERE NOT EXISTS (SELECT 1 FROM public.why_choose_us WHERE title = 'Bespoke Designs');

INSERT INTO public.why_choose_us (title, description, display_order)
SELECT 'Premium Materials', 'Walnut, oak, natural stone, brass — sourced without compromise.', 2
WHERE NOT EXISTS (SELECT 1 FROM public.why_choose_us WHERE title = 'Premium Materials');

INSERT INTO public.why_choose_us (title, description, display_order)
SELECT 'Turnkey Execution', 'One studio, from first sketch to final handover.', 3
WHERE NOT EXISTS (SELECT 1 FROM public.why_choose_us WHERE title = 'Turnkey Execution');

INSERT INTO public.why_choose_us (title, description, display_order)
SELECT 'Expert Craftsmanship', 'In-house atelier with master carpenters and finishers.', 4
WHERE NOT EXISTS (SELECT 1 FROM public.why_choose_us WHERE title = 'Expert Craftsmanship');

INSERT INTO public.why_choose_us (title, description, display_order)
SELECT 'Personalized Design Process', 'A slow, considered dialogue with each client.', 5
WHERE NOT EXISTS (SELECT 1 FROM public.why_choose_us WHERE title = 'Personalized Design Process');
