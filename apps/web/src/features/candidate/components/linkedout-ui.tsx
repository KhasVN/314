import Link from 'next/link';

export function LinkedoutCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`squircle-card ${className}`}>{children}</div>;
}

export const LINKEDOUT_BLUE = '#2557a7';
export const LINKEDOUT_TEXT = '#2d2d2d';
export const LINKEDOUT_MUTED = '#595959';
export const LINKEDOUT_BORDER = '#d4d2d0';
export const LINKEDOUT_SURFACE = '#f3f2f1';

export function LinkedoutLogo({
  href = '/candidate',
  size = 'md',
}: {
  href?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const className =
    size === 'lg'
      ? 'text-4xl'
      : size === 'sm'
        ? 'text-2xl'
        : 'text-3xl';

  return (
    <Link
      href={href}
      className={`${className} font-bold leading-none tracking-[-0.08em] text-[#2557a7]`}
      aria-label="Linkedout home"
    >
      linkedout
    </Link>
  );
}

export function LinkedoutSimpleHeader({
  right,
  href = '/candidate',
}: {
  right?: React.ReactNode;
  href?: string;
}) {
  return (
    <header className="sticky top-0 z-[200] border-b border-[#e4e2e0] bg-white">
      <div className="mx-auto flex min-h-[62px] max-w-7xl items-center justify-between gap-4 px-4 lg:px-6">
        <LinkedoutLogo href={href} />
        {right && <div className="flex items-center gap-3">{right}</div>}
      </div>
    </header>
  );
}

export function LinkedoutButton({
  children,
  href,
  type = 'button',
  variant = 'primary',
  disabled,
  onClick,
  className = '',
}: {
  children: React.ReactNode;
  href?: string;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const styles = {
    primary: 'bg-[#2557a7] text-white hover:bg-[#164081]',
    secondary: 'border border-[#d4d2d0] bg-white text-[#2557a7] hover:bg-[#eef4ff]',
    danger: 'bg-[#c9262d] text-white hover:bg-[#a51d24]',
    ghost: 'text-[#2557a7] hover:bg-[#eef4ff]',
  }[variant];

  const classes = `squircle-button inline-flex min-h-11 items-center justify-center px-5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:bg-[#9bb8e5] ${styles} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}

export function LinkedoutPageShell({
  children,
  title,
  description,
  maxWidth = 'max-w-3xl',
}: {
  children: React.ReactNode;
  title: string;
  description?: string;
  maxWidth?: string;
}) {
  return (
    <div className="min-h-screen bg-white">
      <main className={`mx-auto ${maxWidth} px-4 py-10 lg:px-6`}>
        <div className="mb-7">
          <h1 className="text-3xl font-bold tracking-[-0.03em] text-[#2d2d2d]">{title}</h1>
          {description && <p className="mt-2 text-sm text-[#595959]">{description}</p>}
        </div>
        {children}
      </main>
    </div>
  );
}

export function LinkedoutInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-12 w-full rounded-lg border border-[#767676] bg-white px-4 text-base text-[#2d2d2d] placeholder:text-[#767676] focus:border-[#2557a7] focus:outline-none focus:ring-2 focus:ring-[#2557a7]/20 ${props.className ?? ''}`}
    />
  );
}

export function LinkedoutSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-12 w-full rounded-lg border border-[#767676] bg-white px-4 text-base text-[#2d2d2d] focus:border-[#2557a7] focus:outline-none focus:ring-2 focus:ring-[#2557a7]/20 ${props.className ?? ''}`}
    />
  );
}

export function LinkedoutTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border border-[#767676] bg-white px-4 py-3 text-base text-[#2d2d2d] placeholder:text-[#767676] focus:border-[#2557a7] focus:outline-none focus:ring-2 focus:ring-[#2557a7]/20 ${props.className ?? ''}`}
    />
  );
}

export function LinkedoutField({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[#2d2d2d]">
        {label}
        {required && <span className="ml-1 text-[#c9262d]">*</span>}
      </span>
      {hint && <span className="mb-2 block text-xs text-[#595959]">{hint}</span>}
      {children}
    </label>
  );
}
