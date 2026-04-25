export type UserRole = 'client' | 'owner';
export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';
export type BusinessCategory =
  | 'barberia'
  | 'peluqueria'
  | 'estetica'
  | 'unas'
  | 'spa'
  | 'otros';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  description: string | null;
  category: BusinessCategory;
  address: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  cover_url: string | null;
  logo_url: string | null;
  phone: string | null;
  rating: number;
  reviews_count: number;
  created_at: string;
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number;
  active: boolean;
}

export interface Employee {
  id: string;
  business_id: string;
  user_id: string | null;
  full_name: string;
  avatar_url: string | null;
  role: string | null;
  active: boolean;
}

export interface BusinessHours {
  id: string;
  business_id: string;
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  closed: boolean;
}

export interface Appointment {
  id: string;
  business_id: string;
  service_id: string;
  employee_id: string | null;
  client_id: string | null;
  client_name: string | null;
  client_phone: string | null;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  payment_status: PaymentStatus;
  payment_id: string | null;
  price_cents: number;
  notes: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  appointment_id: string;
  business_id: string;
  client_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

// Supabase Database type
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      businesses: { Row: Business; Insert: Partial<Business>; Update: Partial<Business> };
      services: { Row: Service; Insert: Partial<Service>; Update: Partial<Service> };
      employees: { Row: Employee; Insert: Partial<Employee>; Update: Partial<Employee> };
      business_hours: {
        Row: BusinessHours;
        Insert: Partial<BusinessHours>;
        Update: Partial<BusinessHours>;
      };
      appointments: {
        Row: Appointment;
        Insert: Partial<Appointment>;
        Update: Partial<Appointment>;
      };
      reviews: { Row: Review; Insert: Partial<Review>; Update: Partial<Review> };
    };
  };
}

// UI helpers
export const formatPrice = (cents: number) =>
  `$${(cents / 100).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;

export const CATEGORIES: { id: BusinessCategory; label: string; icon: string }[] = [
  { id: 'barberia', label: 'Barbería', icon: '✂️' },
  { id: 'peluqueria', label: 'Peluquería', icon: '💇' },
  { id: 'estetica', label: 'Estética', icon: '💆' },
  { id: 'unas', label: 'Uñas', icon: '💅' },
  { id: 'spa', label: 'Spa', icon: '🧖' },
  { id: 'otros', label: 'Otros', icon: '✨' },
];

export const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
export const DAYS_OF_WEEK_LONG = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];
