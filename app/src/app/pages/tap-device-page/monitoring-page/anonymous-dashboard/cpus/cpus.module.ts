import { NgModule } from "@angular/core";
import { AppThemeModule } from "app-theme";
import { CpusRoutingModule } from "./cpus-routing.module";
import { CpusComponent } from "./cpus.component";
import { TapMonitoringModule } from "@iotize/ionic/monitoring";

@NgModule({
  declarations: [CpusComponent],
  imports: [AppThemeModule, CpusRoutingModule, TapMonitoringModule]
})
export class AnonymousCPUsModule {}
