import { Component, OnInit, ViewChild } from '@angular/core';
import { navItems } from './_nav';
import { MessageBoxService } from 'src/app/services/message-box.service';
import { ToasterPlacement, ToasterComponent, ToastCloseDirective } from '@coreui/angular';
import { ToastSampleComponent } from 'src/app/components/toast-sample/toast-sample.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
})
export class DefaultLayoutComponent implements OnInit {

  @ViewChild('toaster', { static: true, read: ToasterComponent }) toaster: ToasterComponent;

  public toasterPlacement = ToasterPlacement.TopEnd;
  public navItems = navItems;

  public perfectScrollbarConfig = {
    suppressScrollX: true,
  };

  constructor(private messageBox: MessageBoxService) {}

  ngOnInit(): void {
    this.messageBox.init(this.toaster);
  }
}
