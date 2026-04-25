export default function PaymentFailurePage() {
  return (
    <main className="min-h-screen bg-bg px-6 py-16 text-white">
      <div className="mx-auto flex max-w-2xl flex-col items-center rounded-3xl border border-border bg-bgCard p-10 text-center">
        <span className="mb-4 text-5xl">!</span>
        <h1 className="mb-3 text-4xl font-black">Pago no completado</h1>
        <p className="max-w-md text-sm text-muted">
          Mercado Pago informo que la operacion fue cancelada o fallo. Podes intentar nuevamente desde la reserva.
        </p>
        <a
          href="/"
          className="mt-8 rounded-full border border-border px-6 py-3 font-semibold"
        >
          Volver al inicio
        </a>
      </div>
    </main>
  );
}