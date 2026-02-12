import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Download, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/import", icon: Download, label: "Import" },
];

export default function Layout() {
  return (
    <div className="dark flex h-screen bg-background text-foreground">
      <nav className="w-56 border-r flex flex-col">
        <div className="p-4 flex items-center gap-2">
          <Database className="size-5 text-primary" />
          <span className="font-semibold text-sm tracking-tight">Design System DB</span>
        </div>
        <Separator />
        <div className="flex-1 p-2 space-y-1">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === "/"}>
              {({ isActive }) => (
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn("w-full justify-start gap-2.5", !isActive && "text-muted-foreground")}
                  size="sm"
                >
                  <Icon className="size-4" />
                  {label}
                </Button>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
