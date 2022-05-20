import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DefaultLayoutComponent, LoginContainerComponent } from './containers';
import { LangResolverService } from './services/lang-resolver.service';
import { GridDefResolverService } from './services/grid-def-resolver.service';
import { NavBarResolver } from './services/navbar-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: LoginContainerComponent,
    data: { title: 'Scanetix | Login' },
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./views/pages/pages.module').then((m) => m.PagesModule),
      },
    ],
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    data: { title: 'Home' },
    resolve: { navBar: NavBarResolver },
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./views/dashboard/dashboard.module').then(
            (m) => m.DashboardModule
          ),
      },
      // {
      //   path: 'product',
      //   resolve: { lang: LangResolverService, gridDef: GridDefResolverService },
      //   loadChildren: () =>
      //     import('./views/example-listing/example-listing.module').then(
      //       (m) => m.ExampleListingModule
      //     ),
      // },
      {
        path: 'product',
        loadChildren: () =>
          import('./views/product/product.module').then((m) => m.ProductModule),
      },
    ],
  },
  { path: '**', redirectTo: '404' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'top',
      anchorScrolling: 'enabled',
      initialNavigation: 'enabledBlocking',
      // relativeLinkResolution: 'legacy'
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
