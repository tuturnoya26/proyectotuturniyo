'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { format, addDays, parseISO, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  business: any;
  services: any[];
  hours: any[];
  employees: any[];
}

const formatPrice = (cents: number) =>
  `$${(cents / 100).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;

export default function BookingClient({ business, services, hours, employees }: Props) {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [slots, setSlots] = useState<{ slot_start: string; slot_end: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Datos del cliente (guest booking)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [done, setDone] = useState(false);

  const days = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));

  useEffect(() => {
    if (selectedService) loadSlots();
  }, [selectedService, selectedDate]);

  async function loadSlots() {
    if (!selectedService) return;
    setLoading(true);
    setSelectedSlot(null);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const { data } = await supabase.rpc('get_available_slots', {
      p_business_id: business.id,
      p_service_id: selectedService.id,
      p_date: dateStr,
    });
    setSlots((data as any) ?? []);
    setLoading(false);
  }

  async function confirm() {
    if (!selectedService || !selectedSlot || !name || !phone) {
      alert('Completá tu nombre y teléfono para confirmar');
      return;
    }
    setConfirming(true);
    const slot = slots.find((s) => s.slot_start === selectedSlot)!;

    const { error } = await supabase.from('appointments').insert({
      business_id: business.id,
      service_id: selectedService.id,
      client_name: name,
      client_phone: phone,
      starts_at: slot.slot_start,
      ends_at: slot.slot_end,
      status: 'pending',
      payment_status: 'pending',
      price_cents: selectedService.price_cents,
    });

    setConfirming(false);
    if (error) {
      alert('Error al reservar: ' + error.message);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6 text-bg text-4xl">
          ✓
        </div>
        <h2 className="text-3xl font-black mb-3">¡Turno reservado!</h2>
        <p className="text-muted mb-2">
          Te contactaremos al <strong className="text-white">{phone}</strong> para
          confirmar.
        </p>
        <p className="text-muted text-sm">
          {format(parseISO(selectedSlot!), "EEEE d 'de' MMMM 'a las' HH:mm", {
            locale: es,
          })}
        </p>
        <p className="text-muted text-sm mt-1">
          {selectedService.name} · {formatPrice(selectedService.price_cents)}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* Step 1: service */}
      <Section number={1} title="Elegí el servicio">
        <div className="space-y-2">
          {services.map((s) => {
            const active = selectedService?.id === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedService(s)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition ${
                  active
                    ? 'bg-accent text-bg border-accent'
                    : 'bg-bgCard border-border hover:border-accent/50'
                }`}
              >
                <div className="text-left">
                  <div className="font-bold">{s.name}</div>
                  <div
                    className={`text-xs ${
                      active ? 'text-bg/70' : 'text-muted'
                    } mt-0.5`}
                  >
                    {s.duration_minutes} min
                  </div>
                </div>
                <div className={`font-black text-lg ${active ? 'text-bg' : 'text-accent'}`}>
                  {formatPrice(s.price_cents)}
                </div>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Step 2: date */}
      {selectedService && (
        <Section number={2} title="Elegí día">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {days.map((d) => {
              const active = isSameDay(d, selectedDate);
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => setSelectedDate(d)}
                  className={`flex-shrink-0 px-3 py-3 rounded-2xl border min-w-[68px] text-center transition ${
                    active
                      ? 'bg-accent text-bg border-accent'
                      : 'bg-bgCard border-border hover:border-accent/50'
                  }`}
                >
                  <div
                    className={`text-[10px] font-bold ${
                      active ? 'text-bg' : 'text-muted'
                    }`}
                  >
                    {format(d, 'EEE', { locale: es }).toUpperCase()}
                  </div>
                  <div className="text-xl font-black my-0.5">{format(d, 'd')}</div>
                  <div
                    className={`text-[10px] ${
                      active ? 'text-bg/70' : 'text-muted'
                    }`}
                  >
                    {format(d, 'MMM', { locale: es })}
                  </div>
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {/* Step 3: time */}
      {selectedService && (
        <Section number={3} title="Elegí horario">
          {loading ? (
            <div className="text-muted text-sm py-6">Cargando horarios...</div>
          ) : slots.length === 0 ? (
            <div className="text-muted text-sm py-6 bg-bgCard border border-border rounded-2xl text-center">
              No hay horarios disponibles para este día.
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {slots.map((s) => {
                const time = format(parseISO(s.slot_start), 'HH:mm');
                const active = selectedSlot === s.slot_start;
                return (
                  <button
                    key={s.slot_start}
                    onClick={() => setSelectedSlot(s.slot_start)}
                    className={`py-3 rounded-full border text-sm font-semibold transition ${
                      active
                        ? 'bg-accent text-bg border-accent'
                        : 'bg-bgCard border-border hover:border-accent/50'
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          )}
        </Section>
      )}

      {/* Step 4: contact */}
      {selectedSlot && (
        <Section number={4} title="Tus datos">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-bgCard border border-border rounded-xl px-4 py-3 outline-none focus:border-accent"
            />
            <input
              type="tel"
              placeholder="WhatsApp / Teléfono"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-bgCard border border-border rounded-xl px-4 py-3 outline-none focus:border-accent"
            />
          </div>

          <button
            onClick={confirm}
            disabled={confirming || !name || !phone}
            className="w-full mt-6 bg-accent text-bg font-bold py-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {confirming ? 'Reservando...' : `Confirmar — ${formatPrice(selectedService.price_cents)}`}
          </button>

          <p className="text-xs text-muted text-center mt-3">
            Al confirmar aceptás los términos del servicio.
          </p>
        </Section>
      )}
    </div>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 bg-accent rounded-full flex items-center justify-center text-bg font-black text-sm">
          {number}
        </div>
        <h3 className="font-bold text-lg">{title}</h3>
      </div>
      {children}
    </div>
  );
}
