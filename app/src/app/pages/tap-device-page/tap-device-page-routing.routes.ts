import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "info",
    loadChildren:
      "src/app/pages/tap-device-page/tap-info-page/tap-info-page.module#TapInfoPageModule"
  },
  {
    path: "protocol-configuration",
    loadChildren:
      "src/app/pages/tap-device-page/protocol-configuration/protocol-configuration.module#ProtocolConfigurationModule"
  },
  {
    path: "connectivity",
    loadChildren:
      "src/app/pages/tap-device-page/tap-connectivity-settings-page/tap-connectivity-settings-page.module#TapConnectivitySettingsPageModule"
  },
  {
    path: "login",
    loadChildren:
      "src/app/pages/tap-device-page/tap-login-page/tap-login-page.module#TapLoginPageModule"
  },
  {
    path: "monitoring",
    loadChildren:
      "src/app/pages/tap-device-page/monitoring-page/monitoring-page.module#MonitoringPageModule"
  },
  {
    path: "",
    redirectTo: "monitoring",
    pathMatch: "full"
  }
];
