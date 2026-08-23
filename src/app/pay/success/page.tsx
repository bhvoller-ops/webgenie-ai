export default function PaymentSuccessPage() {
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">WebGenie AI</p>
        <h1 className="mt-3 text-3xl font-semibold">You&apos;re all set 🎉</h1>
        <p className="mt-3 text-slate-400">
          Payment received — your subscription is active. We&apos;ll be in touch shortly to get everything set up.
        </p>
      </section>
    </main>
  );
}
