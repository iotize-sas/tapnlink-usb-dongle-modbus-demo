import { Routes } from "@angular/router";

export const SupervisorDashboardChildrenRoutes: Routes = [
  {
    path: "memory",
    loadChildren:
      "src/app/pages/tap-device-page/monitoring-page/supervisor-dashboard/memory/memory.module#SupervisorMemoryModule"
  },

  {
    path: "cpus",
    loadChildren:
      "src/app/pages/tap-device-page/monitoring-page/supervisor-dashboard/cpus/cpus.module#SupervisorCPUsModule"
  },

  {
    path: "control",
    loadChildren:
      "src/app/pages/tap-device-page/monitoring-page/supervisor-dashboard/control/control.module#SupervisorControlModule"
  },

  {
    path: "",
    redirectTo: "memory",
    pathMatch: "full"
  }
];
