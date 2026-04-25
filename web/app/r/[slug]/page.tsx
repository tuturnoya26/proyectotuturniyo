import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import BookingClient from './booking-client';

interface PageProps {
  params: { slug: string };
}

export default async function PublicBooking({ params }: PageProps) {
  // Cargar el negocio por slug
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!business) {
    notFound();
  }

  // Cargar servicios y horarios
  const [servicesRes, hoursRes, employeesRes] = await Promise.all([
    supabase.from('services').select('*').eq('business_id', business.id).eq('active', true),
    supabase.from('business_hours').select('*').eq('business_id', business.id),
    supabase.from('employees').select('*').eq('business_id', business.id).eq('active', true),
  ]);

  return (
    <main className="min-h-screen bg-bg text-white">
      {/* Header */}
      <header className="bg-bgCard border-b border-border">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-bgElevated rounded-2xl flex items-center justify-center text-3xl">
              ✂️
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-black">{business.name}</h1>
              {business.address && (
                <p className="text-muted text-sm mt-1">📍 {business.address}</p>
              )}
              <div className="flex items-center gap-3 mt-2">
                <span className="bg-bgElevated px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <span className="text-accent">★</span>
                  {business.rating || '—'}
                  <span className="text-muted">({business.reviews_count})</span>
                </span>
                <span className="text-success text-xs flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>
                  Abierto
                </span>
              </div>
            </div>
          </div>

          {business.description && (
            <p className="text-muted text-sm mt-6 leading-relaxed">{business.description}</p>
          )}
        </div>
      </header>

      {/* Booking flow */}
      <BookingClient
        business={business}
        services={servicesRes.data ?? []}
        hours={hoursRes.data ?? []}
        employees={employeesRes.data ?? []}
      />

      {/* Footer */}
      <footer className="border-t border-border mt-12 px-6 py-6 text-center">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-muted text-xs hover:text-white"
        >
          Hecho con
          <span className="bg-accent text-bg w-5 h-5 rounded-md flex items-center justify-center font-black text-xs">
            T
          </span>
          Turnio
        </a>
      </footer>
    </main>
  );
}
