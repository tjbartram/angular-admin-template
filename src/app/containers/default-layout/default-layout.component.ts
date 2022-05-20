import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MessageBoxService } from 'src/app/services/message-box.service';
import { ToasterPlacement, ToasterComponent, ToastCloseDirective } from '@coreui/angular';
import { ToastSampleComponent } from 'src/app/components/toast-sample/toast-sample.component';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
})
export class DefaultLayoutComponent implements OnInit, OnDestroy {

  @ViewChild('toaster', { static: true, read: ToasterComponent }) toaster: ToasterComponent;

  public toasterPlacement = ToasterPlacement.TopEnd;
  public navItems = [];

  public perfectScrollbarConfig = {
    suppressScrollX: true,
  };
	private componentSubs: Subscription = new Subscription();

  constructor(private messageBox: MessageBoxService, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.messageBox.init(this.toaster);
    this.componentSubs.add(this.activatedRoute.data.subscribe((data: any) => {
			if(data.navBar){
				this.navItems = data.navBar;
			}
		}));
  }

  ngOnDestroy(): void {
    this.componentSubs.unsubscribe();
  }
}
