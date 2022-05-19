import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { IconSetService } from '@coreui/icons-angular';
import { iconSubset } from './icons/icon-subset';
import { Title } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { AppStartService } from './services/app-start.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'body',
  template: '<router-outlet></router-outlet>',
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  title = 'Angular Admin Template';

  constructor(
    private router: Router,
    private titleService: Title,
    private iconSetService: IconSetService,
    private translate: TranslateService
  ) {
    titleService.setTitle(this.title);
    // iconSet singleton
    iconSetService.icons = { ...iconSubset };

    translate.setDefaultLang('en');
    translate.use(environment.lang);
  }

  ngOnInit(): void {
    this.router.events.subscribe((evt : any) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
    });
  }
}

export function loadUserSettings(appStart: AppStartService) {
	return () => appStart.getUserSettings();
}
