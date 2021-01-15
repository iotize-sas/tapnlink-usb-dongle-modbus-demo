import { NgModule } from "@angular/core";
import { AppThemeModule } from "app-theme";
import { MemoryRoutingModule } from "./memory-routing.module";
import { MemoryComponent } from "./memory.component";
import { TapMonitoringModule } from "@iotize/ionic/monitoring";

@NgModule({
  declarations: [MemoryComponent],
  imports: [AppThemeModule, MemoryRoutingModule, TapMonitoringModule]
})
export class AnonymousMemoryModule {}
