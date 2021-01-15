import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { MemoryComponent } from "./memory.component";
import { MemoryChildrenRoutes } from "./memory-routes";

const routes: Routes = [
  {
    path: "",
    component: MemoryComponent,

    children: MemoryChildrenRoutes
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MemoryRoutingModule {}
