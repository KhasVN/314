'use client';

export function RegisterPageHeader({ step }: { step: number }) {
  const steps = [
    { n: 1, label: 'Account' },
    { n: 2, label: 'Profile' },
    { n: 3, label: 'Skills' },
  ] as const;

  return (
    <div className="border-b border-[#e4e2e0] bg-gradient-to-r from-white via-[#f9fbff] to-[#eef4ff] px-4 pb-8 pt-10 text-center">
      <h1 className="text-3xl font-bold tracking-[-0.03em] text-[#2d2d2d]">Create your profile</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-[#595959]">
        We&apos;ll create your account and sign you in when you finish — then you can explore jobs right away.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        {steps.map((s) => (
          <div key={s.n} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  step >= s.n ? 'bg-[#2557a7] text-white' : 'bg-[#f3f2f1] text-[#767676]'
                }`}
              >
                {step > s.n ? '✓' : s.n}
              </div>
              <span className={`text-xs font-semibold ${step >= s.n ? 'text-[#2557a7]' : 'text-[#767676]'}`}>
                {s.label}
              </span>
            </div>
            {s.n < 3 && (
              <div className={`hidden h-0.5 w-8 sm:block ${step > s.n ? 'bg-[#2557a7]' : 'bg-[#e4e2e0]'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
