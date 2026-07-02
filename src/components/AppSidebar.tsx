import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Building2, Sparkles, LayoutGrid } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useCompany } from "@/contexts/CompanyContext";

const nav = [
  { title: "Company Intelligence", url: "/company/intelligence", icon: Building2 },
  { title: "Skill Intelligence", url: "/company/skills", icon: Sparkles },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const { selected, clear } = useCompany();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-slate-200 bg-[#F8FAFC]">
        <div className="px-2 py-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            SVCK · Intelligence
          </div>
          {selected && (
            <div className="mt-1 truncate text-sm font-semibold text-slate-800">
              {selected.companyName}
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[#F8FAFC]">
        <SidebarGroup>
          <SidebarGroupLabel>Explore</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => {
                const active = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className={
                        active
                          ? "!bg-[#EFF6FF] !text-[#2563EB] font-medium"
                          : "text-slate-700 hover:bg-slate-100"
                      }
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 bg-[#F8FAFC]">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                clear();
                navigate({ to: "/" });
              }}
              className="text-slate-700 hover:bg-slate-100"
            >
              <LayoutGrid className="h-4 w-4" />
              <span>All Companies</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
