import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ControlComponent } from "./control.component";
import { ControlChildrenRoutes } from "./control-routes";
import { DeviceAuthGuard } from "@iotize/ionic/auth";

const routes: Routes = [
  {
    path: "",
    component: ControlComponent,
    canActivate: [DeviceAuthGuard],
    data: {
      username: ["supervisor"]
    },

    children: ControlChildrenRoutes
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ControlRoutingModule {}
