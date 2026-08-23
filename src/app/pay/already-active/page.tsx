export default function AlreadyActivePage() {
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">WebGenie AI</p>
        <h1 className="mt-3 text-3xl font-semibold">Already active</h1>
        <p className="mt-3 text-slate-400">
          This subscription is already active — no need to check out again. Reach out if something looks off.
        </p>
      </section>
    </main>
  );
}
