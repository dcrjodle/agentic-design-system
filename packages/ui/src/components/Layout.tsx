import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Component, Download, Database } from "lucide-react";

const links = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/components", icon: Component, label: "Components" },
  { to: "/import", icon: Download, label: "Import" },
];

export default function Layout() {
  return (
    <div className="flex h-screen">
      <nav className="w-56 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
          <Database className="w-5 h-5 text-violet-400" />
          <span className="font-semibold text-sm tracking-tight">Design System DB</span>
        </div>
        <div className="flex-1 p-2 space-y-1">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-violet-500/15 text-violet-300"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
