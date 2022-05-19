import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { ClassToggleService, HeaderComponent } from '@coreui/angular';

@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
})
export class DefaultHeaderComponent extends HeaderComponent {

  @Input() sidebarId: string = "sidebar";

  public newMessages = new Array(4)
  public newTasks = new Array(5)
  public newNotifications = new Array(5)

  public notificationCount = 10;
  public bPesudoLogin = false;

  constructor(private classToggler: ClassToggleService) {
    super();
  }

  revertLogin(): void {

  }

  helpClicked(): void {

  }
  toggleAside(): void {

  }

}
