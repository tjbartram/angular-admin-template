import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LangResolverService } from 'src/app/services/lang-resolver.service';
import { GridDefResolverService } from 'src/app/services/grid-def-resolver.service';
import { ScanJobDetailComponent } from './scan-job-detail/scan-job-detail.component';
import { ScanJobListingComponent } from './scan-job-listing/scan-job-listing.component';
import { DetailResolverService } from 'src/app/services/detail-resolver.service';

const routes: Routes = [
  { path: '', redirectTo: 'scan-job-listing' },
  {
    path: 'scan-job-listing',
    component: ScanJobListingComponent,
    resolve: { lang: LangResolverService, gridDef: GridDefResolverService }
  },
  {
    path: 'scan-job-detail/:id',
    component: ScanJobDetailComponent,
    resolve: { data: DetailResolverService },
  },
  {
    path: 'scan-job-detail',
    component: ScanJobDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScanJobRoutingModule { }
