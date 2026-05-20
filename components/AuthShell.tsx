interface AuthShellProps {
  tagline: string;
  children: React.ReactNode;
}

export function AuthShell({ tagline, children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="font-display text-5xl tracking-tight">
            Word<span className="text-accent">Pop</span>
          </h1>
          <p className="text-white/40 mt-2">{tagline}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
