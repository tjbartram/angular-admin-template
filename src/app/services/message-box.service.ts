import { Injectable } from '@angular/core';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';

@Injectable({
  providedIn: 'root'
})
export class MessageBoxService {
  private tService: ToasterService;
  init(tService: ToasterService){
    this.tService = tService;
}

  constructor() { }

    showSuccess(header : string, body : string = '') {
        this.tService.pop('success', header, body);
    };
    
    showError(header : string, body : string = '') {
        this.tService.pop('error', header, body);
    };

    showWarning(header : string, body : string = '') {
        this.tService.pop('warning', header, body);
    };

    showInfo(header : string, body : string = '') {
        this.tService.pop('info', header, body);
    };
    
    // showPrimary(header : string, body : string = '') {
    //     this.tService.pop('primary', header, body);
    // };

}
