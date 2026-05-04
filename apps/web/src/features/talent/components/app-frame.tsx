type AppFrameProps = {
  activeTab: string;
  children: React.ReactNode;
  onTabChange: (tab: string) => void;
};

const tabs = ['search', 'employers', 'candidates', 'jobs', 'applications', 'auth'];

export function AppFrame({ activeTab, children, onTabChange }: AppFrameProps) {
  return (
    <main className="min-h-screen bg-base-100 text-base-content" suppressHydrationWarning>
      <section className="mx-auto min-h-screen w-full px-6 py-8 md:px-10 lg:px-12" suppressHydrationWarning>
        <header className="navbar min-h-0 px-0 py-0">
          <div className="navbar-start" />
          <nav className="navbar-center hidden lg:flex">
            <div className="menu menu-horizontal gap-9 px-0 text-xs">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  className={`btn btn-sm rounded-none ${activeTab === tab ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => onTabChange(tab)}
                >
                  {title(tab)}
                </button>
              ))}
              {/* ── Home page link ── */}
              <a href="/home" className="btn btn-sm rounded-none btn-secondary">
                Home
              </a>
              {/* ── Candidate homepage link ── */}
              <a href="/candidate" className="btn btn-sm rounded-none btn-accent">
                Candidate Home
              </a>
            </div>
          </nav>
          <div className="navbar-end" />
        </header>
        <div className="mt-8 flex flex-wrap gap-2 lg:hidden">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`btn btn-sm rounded-none ${activeTab === tab ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => onTabChange(tab)}
            >
              {title(tab)}
            </button>
          ))}
        </div>
        <div className="pt-12">{children}</div>
      </section>
    </main>
  );
}

function title(value: string) {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}
