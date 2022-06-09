import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ScanJobRoutingModule } from './scan-job-routing.module';
import { ScanJobListingComponent } from './scan-job-listing/scan-job-listing.component';
import { ScanJobDetailComponent } from './scan-job-detail/scan-job-detail.component';
import { SmartDataListModule } from 'src/app/components/smart-data-list/smart-data-list.module';


@NgModule({
  declarations: [
    ScanJobListingComponent,
    ScanJobDetailComponent
  ],
  imports: [
    CommonModule,
    ScanJobRoutingModule,
    SmartDataListModule
  ]
})
export class ScanJobModule { }
