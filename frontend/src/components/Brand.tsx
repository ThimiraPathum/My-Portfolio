export default function Brand({ name }: { name: string }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-3">
      <img src="/tp-gold-logo.png" alt="" aria-hidden="true" width={48} height={48} className="h-12 w-12 shrink-0 object-contain" />
      <span className="truncate text-sm font-semibold tracking-tight text-stone-900 sm:text-base">{name}</span>
    </span>
  );
}
