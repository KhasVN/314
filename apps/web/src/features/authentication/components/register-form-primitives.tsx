export const REGISTER_INPUT_CLASS =
  'box-border h-12 w-full rounded-lg border border-[#767676] bg-white px-3.5 text-sm text-[#2d2d2d] outline-none focus:border-[#2557a7] focus:ring-2 focus:ring-[#eef4ff]';

export function RegisterFormCard({
  title,
  icon,
  subtitle,
  children,
}: {
  title: string;
  icon: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="squircle-card mb-4 bg-white p-6">
      <div className="mb-5">
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-[#2d2d2d]">
          <span className="text-lg">{icon}</span>
          {title}
        </h2>
        {subtitle && <p className="ml-7 mt-1 text-xs text-[#767676]">{subtitle}</p>}
      </div>
      <div className="flex flex-col gap-3.5">{children}</div>
    </div>
  );
}

export function RegisterField({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-semibold text-[#2d2d2d]">
        {label}
        {required && <span className="ml-1 text-[#c9262d]">*</span>}
      </label>
      {hint && <p className="mb-1.5 text-xs text-[#767676]">{hint}</p>}
      {children}
    </div>
  );
}
