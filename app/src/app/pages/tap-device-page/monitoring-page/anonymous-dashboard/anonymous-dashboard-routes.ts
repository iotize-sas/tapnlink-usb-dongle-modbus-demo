import { Routes } from "@angular/router";

export const AnonymousDashboardChildrenRoutes: Routes = [
  {
    path: "memory",
    loadChildren:
      "src/app/pages/tap-device-page/monitoring-page/anonymous-dashboard/memory/memory.module#AnonymousMemoryModule"
  },

  {
    path: "cpus",
    loadChildren:
      "src/app/pages/tap-device-page/monitoring-page/anonymous-dashboard/cpus/cpus.module#AnonymousCPUsModule"
  },

  {
    path: "control",
    loadChildren:
      "src/app/pages/tap-device-page/monitoring-page/anonymous-dashboard/control/control.module#AnonymousControlModule"
  },

  {
    path: "",
    redirectTo: "memory",
    pathMatch: "full"
  }
];
