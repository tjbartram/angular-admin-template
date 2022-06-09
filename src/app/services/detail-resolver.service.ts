import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import {
  Router,
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, EMPTY, of } from 'rxjs';
import { environment } from './../../environments/environment';
import { mergeMap, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DetailResolverService implements Resolve<any> {
  constructor(private dataService: DataService, private router: Router) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Observable<never> {
		console.log(route.routeConfig);
		let id = route.paramMap.get('id')
    if (id) {
      let target = '';
      if (route.routeConfig)
        if (route.routeConfig.path)
          target = route.routeConfig.path.replace('-detail', '');

      if(target === 'scan-job') target = 'scanJob';
      
      let queryString = '';

      switch (target) {
        case 'brand': {
          queryString =
            '&fields=*,brand_brandStore.*,brand_brandStore.brandStore_store.*,brand_company.company_sponsor.*';
          break;
        }
      }

      const url = `${environment.apiSettings.endpoint}${target}?id=${id}${queryString}`;
      return this.dataService.httpGET(url).pipe(
        take(1),
        mergeMap((data) => {
          if (data) {
            return of(data);
          } else {
            return EMPTY;
          }
        })
      );
    } else {
			this.router.navigate([ '404' ]);
      return EMPTY;
    }
  }
}
