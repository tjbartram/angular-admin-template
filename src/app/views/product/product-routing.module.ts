import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductListingComponent } from './product-listing/product-listing.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { DetailResolverService } from './../../services/detail-resolver.service';
import { LangResolverService } from 'src/app/services/lang-resolver.service';
import { GridDefResolverService } from 'src/app/services/grid-def-resolver.service';

const routes: Routes = [
  { path: '', redirectTo: 'product-listing' },
  {
    path: 'product-listing',
    component: ProductListingComponent,
    resolve: { lang: LangResolverService, gridDef: GridDefResolverService },
  },
  {
    path: 'product-detail/:id',
    component: ProductDetailComponent,
    resolve: { data: DetailResolverService },
  },
  {
    path: 'product-detail',
    component: ProductDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductRoutingModule {}
