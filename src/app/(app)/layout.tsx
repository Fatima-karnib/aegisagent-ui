import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="mx-auto w-full max-w-[1500px] flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
