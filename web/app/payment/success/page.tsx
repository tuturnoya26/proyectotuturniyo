export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-bg px-6 py-16 text-white">
      <div className="mx-auto flex max-w-2xl flex-col items-center rounded-3xl border border-border bg-bgCard p-10 text-center">
        <span className="mb-4 text-5xl">OK</span>
        <h1 className="mb-3 text-4xl font-black">Pago aprobado</h1>
        <p className="max-w-md text-sm text-muted">
          Recibimos la confirmacion de Mercado Pago. Ya podes volver a Turnio para ver el estado de tu reserva.
        </p>
        <a
          href="/"
          className="mt-8 rounded-full bg-accent px-6 py-3 font-semibold text-bg"
        >
          Volver al inicio
        </a>
      </div>
    </main>
  );
}