import { ChangeDetectorRef, Component, ElementRef, forwardRef, Input, Renderer2 } from '@angular/core';

import { ToastComponent, ToasterService } from '@coreui/angular';

@Component({
  selector: 'app-toast-sample',
  templateUrl: './toast-sample.component.html',
  styleUrls: [ './toast-sample.component.scss' ],
  providers: [{ provide: ToastComponent, useExisting: forwardRef(() => ToastSampleComponent) }]
})
export class ToastSampleComponent extends ToastComponent {

  @Input() closeButton = true;
  @Input() title = '';
  @Input() body = '';

  constructor(
    public hostElement: ElementRef,
    public renderer: Renderer2,
    public toasterService: ToasterService,
    public changeDetectorRef: ChangeDetectorRef
  ) {
    super(hostElement, renderer, toasterService, changeDetectorRef);
  }
}