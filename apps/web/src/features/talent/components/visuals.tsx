export function ArrowIcon({ className = 'size-7' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M5 16h20" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
      <path d="m18 9 7 7-7 7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
    </svg>
  );
}
