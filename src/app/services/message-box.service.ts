import { Injectable } from '@angular/core';
import { ToasterComponent } from '@coreui/angular';
import { ToastSampleComponent } from '../components/toast-sample/toast-sample.component';

@Injectable({
  providedIn: 'root'
})
export class MessageBoxService {
  private toaster: ToasterComponent;

  init(toaster: ToasterComponent) {
    this.toaster = toaster;
  }

  constructor() { }

  showSuccess(header : string, body : string = '') {
    let options = {
      title: header,
      body: body,
      delay: 5000,
      color: 'success',
      autohide: true
    }
    this.toaster.addToast(ToastSampleComponent, options);
  };
  
  showError(header : string, body : string = '') {
    let options = {
      title: header,
      body: body,
      delay: 5000,
      color: 'danger',
      autohide: true
    }
    this.toaster.addToast(ToastSampleComponent, options);
  };

  showWarning(header : string, body : string = '') {
    let options = {
      title: header,
      body: body,
      delay: 5000,
      color: 'warning',
      autohide: true
    }
    this.toaster.addToast(ToastSampleComponent, options);
  };

  showInfo(header : string, body : string = '') {
    let options = {
      title: header,
      body: body,
      delay: 5000,
      color: 'info',
      autohide: true
    }
    this.toaster.addToast(ToastSampleComponent, options);
  };

  // showPrimary(header : string, body : string = '') {
  //  this.tService.pop('primary', header, body);
  // };

}
