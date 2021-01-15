import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { MemoryComponent } from "./memory.component";
import { MemoryChildrenRoutes } from "./memory-routes";
import { DeviceAuthGuard } from "@iotize/ionic/auth";

const routes: Routes = [
  {
    path: "",
    component: MemoryComponent,
    canActivate: [DeviceAuthGuard],
    data: {
      username: ["supervisor"]
    },

    children: MemoryChildrenRoutes
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MemoryRoutingModule {}
