import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DefaultLayoutComponent, LoginContainerComponent } from './containers';
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
      {
        path: 'product',
        loadChildren: () =>
          import('./views/product/product.module').then((m) => m.ProductModule),
      },
      {
        path: 'scan-job',
        loadChildren: () =>
          import ('./views/scan-job/scan-job.module').then((m) => m.ScanJobModule),
      }
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
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
