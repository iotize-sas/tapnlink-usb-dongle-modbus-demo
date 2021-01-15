import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { TapConnectMqttTabComponent } from "./tap-connect-mqtt-tab.component";
import { TapConnectMqttModule, TapConnectionStoreModule } from "@iotize/ionic";
import { IonicModule } from "@ionic/angular";
import { AppThemeModule } from "app-theme";

@NgModule({
  declarations: [TapConnectMqttTabComponent],
  imports: [
    AppThemeModule,
    TapConnectMqttModule,

    TapConnectionStoreModule,

    RouterModule.forChild([
      {
        path: "",
        component: TapConnectMqttTabComponent
      }
    ])
  ]
})
export class TapConnectMqttTabModule {}
