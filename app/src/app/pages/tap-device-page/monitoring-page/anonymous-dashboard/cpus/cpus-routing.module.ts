import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CpusComponent } from "./cpus.component";
import { CpusChildrenRoutes } from "./cpus-routes";

const routes: Routes = [
  {
    path: "",
    component: CpusComponent,

    children: CpusChildrenRoutes
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CpusRoutingModule {}
