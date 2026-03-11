interface FooterMessageModalProps {
  message: {
    section: string;
    title: string;
    body: string;
  } | null;
  onClose: () => void;
}

// Displays footer policy/support content in a reusable modal overlay.
function FooterMessageModal({ message, onClose }: FooterMessageModalProps) {
  if (!message) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close message"
        onClick={onClose}
        className="absolute inset-0 bg-primary-950/70 backdrop-blur-sm"
      />
      <article className="relative z-10 w-full max-w-2xl rounded-2xl border border-primary-300/70 bg-primary-100/95 p-6 shadow-raised sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-700">
          {message.section}
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-primary-900">{message.title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-primary-700">{message.body}</p>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-primary-800 px-5 py-2 text-sm font-semibold text-white shadow-neon hover:bg-primary-500"
          >
            Close
          </button>
        </div>
      </article>
    </div>
  );
}

export default FooterMessageModal;
