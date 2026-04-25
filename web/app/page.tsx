const logoUrl = 'https://pub-eaeba6de27524ea58f25de946dbeb592.r2.dev/logo%20solo%20blanco.png';

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-bg text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_top,rgba(2,159,173,0.22),transparent_58%)]" />
      <div className="pointer-events-none absolute left-[-8rem] top-40 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-6rem] top-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-4">
          <img
            src={logoUrl}
            alt="TU TURNO YA"
            className="h-12 w-12 rounded-2xl object-contain p-1 shadow-[0_0_40px_rgba(2,159,173,0.2)]"
          />
          <div>
            <div className="text-[0.7rem] uppercase tracking-[0.35em] text-accent/80">Reserva inteligente</div>
            <span className="text-lg font-extrabold tracking-[0.18em]">TU TURNO YA</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a href="#features" className="hidden text-sm text-muted transition hover:text-white md:inline">
            Cómo funciona
          </a>
          <a href="#pricing" className="hidden text-sm text-muted transition hover:text-white md:inline">
            Precios
          </a>
          <a
            href="#pricing"
            className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-bg shadow-[0_10px_30px_rgba(2,159,173,0.35)] transition hover:scale-[1.02]"
          >
            Empezar
          </a>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-10">
        <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="relative z-10">
            <span className="mb-7 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-accent backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-accent" />
              Para barberias y salones
            </span>
            <h1 className="max-w-3xl text-5xl font-black leading-[0.96] md:text-7xl lg:text-[5.5rem]">
              La agenda que hace ver premium a tu negocio.
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-muted md:text-lg">
              TU TURNO YA centraliza reservas, pagos y presencia online en una interfaz clara,
              rapida y lista para vender mas sin llamadas ni vueltas.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-4 text-sm font-semibold text-bg shadow-[0_14px_40px_rgba(2,159,173,0.35)] transition hover:translate-y-[-1px]"
              >
                Crear mi cuenta
                <span>+</span>
              </a>
              <a
                href="#features"
                className="rounded-full border border-white/10 bg-white/5 px-7 py-4 text-sm font-semibold text-white backdrop-blur transition hover:border-accent/50 hover:bg-white/10"
              >
                Ver experiencia
              </a>
            </div>
            <div className="mt-12 grid max-w-2xl grid-cols-3 gap-4">
              <Metric value="500+" label="locales activos" />
              <Metric value="10k+" label="turnos por mes" />
              <Metric value="4.9" label="valoracion promedio" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 scale-95 rounded-[2rem] bg-gradient-to-br from-accent/30 via-transparent to-accent/5 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <div className="rounded-[1.7rem] border border-white/10 bg-[#0f1114] p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={logoUrl}
                      alt="TU TURNO YA"
                      className="h-16 w-16 rounded-[1.5rem] object-contain p-1 md:h-20 md:w-20"
                    />
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-accent/80">Dashboard</p>
                      <h2 className="mt-2 text-2xl font-black md:text-3xl">TU TURNO YA</h2>
                      <p className="mt-2 max-w-xs text-sm leading-6 text-muted">
                        Reservas, pagos y agenda en una sola vista. Sin ruido. Sin pantallas que parecen plantilla.
                      </p>
                    </div>
                  </div>
                  <div className="hidden rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent md:block">
                    EN VIVO
                  </div>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted">Hoy</p>
                        <p className="mt-2 text-4xl font-black">128</p>
                      </div>
                      <div className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                        +24%
                      </div>
                    </div>
                    <div className="mt-5 flex items-end gap-2">
                      <Bar h="h-12" />
                      <Bar h="h-20" />
                      <Bar h="h-14" />
                      <Bar h="h-24" active />
                      <Bar h="h-16" />
                      <Bar h="h-28" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Panel title="Proximo turno" value="15:30 - Fade + Barba" subtitle="Cliente confirmado" />
                    <Panel title="Cobros online" value="92%" subtitle="Mercado Pago integrado" />
                    <Panel title="Link publico" value="tuturnoya.app" subtitle="Listo para Instagram y WhatsApp" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-y border-white/10 bg-white/[0.03] px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-accent/80">Experiencia</p>
              <h2 className="mt-3 max-w-xl text-4xl font-black leading-tight md:text-5xl">
                Moderna de verdad, no una landing generica.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-muted">
              Pensada para comunicar confianza, velocidad y orden. La interfaz vende mejor porque prioriza jerarquia, contraste y marca.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Feature index="01" title="Cerca tuyo" text="Encontrá los mejores locales de tu zona con búsqueda por ubicación." />
            <Feature index="02" title="Reservá al toque" text="Elegí día, hora y profesional en menos de 30 segundos." />
            <Feature index="03" title="Pago integrado" text="Pagá con Mercado Pago al reservar. Cero ausentes garantizado." />
            <Feature index="04" title="Para profesionales" text="Gestioná tu agenda, equipo y caja desde el celular." />
            <Feature index="05" title="Programa de fidelidad" text="Cada 5 turnos, el 6to gratis. Premiá a tus clientes habituales." />
            <Feature index="06" title="Tu link compartible" text="Compartí tu link de reservas en Instagram, WhatsApp y donde quieras." />
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-4xl px-6 py-24">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.03] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:p-12">
          <p className="text-xs uppercase tracking-[0.28em] text-accent/80">Lanzamiento</p>
          <h2 className="mt-4 text-4xl font-black md:text-5xl">Listo para arrancar con una presencia mas seria.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted md:text-lg">
            Sumá tu local a TU TURNO YA gratis. Cobrás cuando tus clientes pagan y mostrás una marca mucho mas prolija desde el primer dia.
          </p>
          <a
            href="#"
            className="mt-8 inline-flex rounded-full bg-accent px-8 py-4 text-lg font-bold text-bg shadow-[0_14px_40px_rgba(2,159,173,0.35)] transition hover:translate-y-[-1px]"
          >
            Crear mi cuenta gratis
          </a>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="TU TURNO YA" className="h-8 w-8 rounded-xl object-contain p-0.5" />
            <span className="text-sm font-bold tracking-[0.2em]">TU TURNO YA</span>
          </div>
          <div className="text-xs text-muted">© 2026 TU TURNO YA. Hecho en Argentina.</div>
        </div>
      </footer>
    </main>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
      <div className="text-3xl font-black md:text-4xl">{value}</div>
      <div className="mt-2 text-xs uppercase tracking-[0.2em] text-muted">{label}</div>
    </div>
  );
}

function Bar({ h, active }: { h: string; active?: boolean }) {
  return (
    <div
      className={`w-full rounded-full ${h} ${active ? 'bg-accent shadow-[0_0_30px_rgba(2,159,173,0.35)]' : 'bg-white/10'}`}
    />
  );
}

function Panel({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[0.65rem] uppercase tracking-[0.22em] text-muted">{title}</p>
      <p className="mt-2 text-lg font-bold leading-snug">{value}</p>
      <p className="mt-1 text-xs text-muted">{subtitle}</p>
    </div>
  );
}

function Feature({ index, title, text }: { index: string; title: string; text: string }) {
  return (
    <div className="group rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03] p-6 transition hover:border-accent/40 hover:translate-y-[-2px]">
      <div className="mb-10 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-[0.28em] text-accent/80">{index}</span>
        <span className="h-px w-14 bg-accent/40 transition group-hover:w-20" />
      </div>
      <h3 className="mb-3 text-2xl font-bold">{title}</h3>
      <p className="text-sm leading-7 text-muted">{text}</p>
    </div>
  );
}
