import { createFileRoute, Outlet, Navigate, useRouterState } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useCompany } from "@/contexts/CompanyContext";

export const Route = createFileRoute("/company")({
  component: CompanyLayout,
});

function CompanyLayout() {
  const { selected } = useCompany();
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  if (!selected) {
    return <Navigate to="/" />;
  }

  if (pathname === "/company" || pathname === "/company/") {
    return <Navigate to="/company/intelligence" replace />;
  }

  const section = pathname.includes("/skills")
    ? "Skill Intelligence"
    : "Company Intelligence";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-white">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b border-slate-200 bg-white px-4">
            <SidebarTrigger className="md:hidden" />
            <nav className="flex items-center gap-2 text-sm text-slate-500">
              <span className="text-slate-400">SVCK</span>
              <span>/</span>
              <span className="font-medium text-slate-700">{selected.companyName}</span>
              <span>/</span>
              <span className="text-slate-900">{section}</span>
            </nav>
          </header>
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
