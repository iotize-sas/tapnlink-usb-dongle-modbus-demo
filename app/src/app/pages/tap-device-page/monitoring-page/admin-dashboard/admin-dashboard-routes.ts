import { Routes } from "@angular/router";

export const AdminDashboardChildrenRoutes: Routes = [
  {
    path: "memory",
    loadChildren:
      "src/app/pages/tap-device-page/monitoring-page/admin-dashboard/memory/memory.module#AdminMemoryModule"
  },

  {
    path: "cpus",
    loadChildren:
      "src/app/pages/tap-device-page/monitoring-page/admin-dashboard/cpus/cpus.module#AdminCPUsModule"
  },

  {
    path: "control",
    loadChildren:
      "src/app/pages/tap-device-page/monitoring-page/admin-dashboard/control/control.module#AdminControlModule"
  },

  {
    path: "",
    redirectTo: "memory",
    pathMatch: "full"
  }
];
