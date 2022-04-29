import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExampleListingComponent } from './example-listing.component';

const routes: Routes = [
  {
    path: '',
    component: ExampleListingComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExampleListingRoutingModule { }
