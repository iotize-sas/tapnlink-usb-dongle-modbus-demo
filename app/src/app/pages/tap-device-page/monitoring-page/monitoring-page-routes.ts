import { DeviceAuthGuard } from "@iotize/ionic/auth";

export const monitoringRoutes = [
  {
    path: "anonymous",
    loadChildren:
      "src/app/pages/tap-device-page/monitoring-page/anonymous-dashboard/anonymous-dashboard.module#AnonymousDashboardModule"
  },
  {
    path: "admin",
    loadChildren:
      "src/app/pages/tap-device-page/monitoring-page/admin-dashboard/admin-dashboard.module#AdminDashboardModule"
  },
  {
    path: "supervisor",
    loadChildren:
      "src/app/pages/tap-device-page/monitoring-page/supervisor-dashboard/supervisor-dashboard.module#SupervisorDashboardModule"
  }
];
