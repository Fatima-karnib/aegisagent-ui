export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* glow accents */}
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-[var(--indigo)] opacity-20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-[var(--accent)] opacity-10 blur-[120px]" />
      <div className="relative w-full">{children}</div>
    </div>
  );
}
