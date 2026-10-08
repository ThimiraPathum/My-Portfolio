interface LoadErrorProps {
  subject: string;
  onRetry: () => void;
}

export default function LoadError({ subject, onRetry }: LoadErrorProps) {
  return (
    <div role="alert" className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-orange-200 bg-white p-5 sm:p-6">
      <div>
        <p className="text-sm font-semibold text-stone-900">Unable to load {subject}</p>
        <p className="mt-1 text-sm text-stone-600">Please try again in a moment.</p>
      </div>
      <button type="button" onClick={onRetry} className="rounded-lg bg-stone-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700">
        Retry
      </button>
    </div>
  );
}
