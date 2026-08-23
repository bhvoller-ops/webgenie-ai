"use client";

export function DeleteAccountForm({ action }: { action: () => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm("Permanently delete your account? This can't be undone.")) {
          event.preventDefault();
        }
      }}
    >
      <button className="rounded-lg border border-rose-800 px-4 py-2 text-sm text-rose-300 hover:bg-rose-950/40">
        Delete my account
      </button>
    </form>
  );
}
