import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Router, Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, EMPTY, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { mergeMap, take } from 'rxjs/operators';
import { IBrowseState } from './../interfaces/smart-data-list';

@Injectable({
  	providedIn: 'root'
})
export class GridDefResolverService implements Resolve<any> {

  	constructor(private dataService: DataService) { }

  	resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Observable<never> {
		let path = route?.routeConfig?.path;
		if(path === 'enrichmentlist') path = 'hostProduct';

		let url = `${environment.apiSettings.endpoint}gridDef?table=${path}`;
		const browseState: IBrowseState = this.dataService.getStoredData(`${path}browseState`);
		if(browseState) {
			if(browseState.viewId != '') url += `&viewId=${browseState.viewId}`;
		}
		return this.dataService.httpGET(url).pipe(
			take(1),
			mergeMap(data => {
				if(data) {
					return of(data);
				}else{
					return EMPTY
				}	
			})
		);
  	}
}
