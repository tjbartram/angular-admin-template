import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridModule } from 'smart-webcomponents-angular/grid';
import { SmartDataListModule } from './../../components/smart-data-list/smart-data-list.module';

import { ExampleListingRoutingModule } from './example-listing-routing.module';
import { ExampleListingComponent } from './example-listing.component';


@NgModule({
  declarations: [
    ExampleListingComponent
  ],
  imports: [
    CommonModule,
    ExampleListingRoutingModule,
    GridModule,
    SmartDataListModule
  ]
})
export class ExampleListingModule { }
