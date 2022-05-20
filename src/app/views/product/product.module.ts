import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductRoutingModule } from './product-routing.module';
import { ProductListingComponent } from './product-listing/product-listing.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { SmartDataListModule } from 'src/app/components/smart-data-list/smart-data-list.module';


@NgModule({
  declarations: [
    ProductListingComponent,
    ProductDetailComponent,
  ],
  imports: [
    CommonModule,
    ProductRoutingModule,
    SmartDataListModule
  ]
})
export class ProductModule { }
