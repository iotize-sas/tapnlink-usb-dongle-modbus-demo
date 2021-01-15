import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CpusComponent } from "./cpus.component";
import { CpusChildrenRoutes } from "./cpus-routes";
import { DeviceAuthGuard } from "@iotize/ionic/auth";

const routes: Routes = [
  {
    path: "",
    component: CpusComponent,
    canActivate: [DeviceAuthGuard],
    data: {
      username: ["admin"]
    },

    children: CpusChildrenRoutes
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CpusRoutingModule {}
