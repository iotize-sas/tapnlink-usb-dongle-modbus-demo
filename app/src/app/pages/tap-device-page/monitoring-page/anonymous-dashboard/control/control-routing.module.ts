import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ControlComponent } from "./control.component";
import { ControlChildrenRoutes } from "./control-routes";

const routes: Routes = [
  {
    path: "",
    component: ControlComponent,

    children: ControlChildrenRoutes
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ControlRoutingModule {}
