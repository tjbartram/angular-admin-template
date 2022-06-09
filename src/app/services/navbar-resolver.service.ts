import { Injectable } from "@angular/core";
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataService } from './data.service';
import { IUserSettings } from "../interfaces/smart-data-list";
import { INavData } from '@coreui/angular';


@Injectable({
	providedIn: 'root'
})
export class NavBarResolver implements Resolve<any> {
	constructor(private translate: TranslateService, private dataService: DataService) { }
	resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Observable<never> {
		let userSettings: IUserSettings = this.dataService.getStoredData('userSettings');

		return this.translate.get('NAVBAR').pipe(map((data) => {
			let nav: INavData[] = [];

			//Default example nav:
			nav.push({ name: 'Dashboard', url: '/dashboard', icon: 'fa-light fa-chart-line' });
			nav.push({ name: 'Product', url: '/product', icon: 'fa-light fa-clipboard-list' });
			nav.push({ name: 'Scan Job', url: '/scan-job', icon: 'fa-light fa-clipboard-list' });
			
			switch(userSettings.type) {
				case 'a user type': {
					//Add elements to nav

					break;
				}
			}

			

			return nav;
		}));
	}

}