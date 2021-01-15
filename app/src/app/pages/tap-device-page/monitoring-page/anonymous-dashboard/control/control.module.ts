import { NgModule } from "@angular/core";
import { AppThemeModule } from "app-theme";
import { ControlRoutingModule } from "./control-routing.module";
import { ControlComponent } from "./control.component";
import { TapMonitoringModule } from "@iotize/ionic/monitoring";

@NgModule({
  declarations: [ControlComponent],
  imports: [AppThemeModule, ControlRoutingModule, TapMonitoringModule]
})
export class AnonymousControlModule {}
