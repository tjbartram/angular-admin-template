import { Component, OnInit, ViewChild } from '@angular/core';
import { ToasterPlacement, ToasterComponent, ToastCloseDirective } from '@coreui/angular';
import { Router } from '@angular/router';
import { MessageBoxService } from 'src/app/services/message-box.service';
import { DataService } from 'src/app/services/data.service';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-login-container',
	templateUrl: './login-container.component.html',
	styleUrls: ['./login-container.component.scss']
})
export class LoginContainerComponent implements OnInit {

	@ViewChild('toaster', { static: true, read: ToasterComponent }) toaster: ToasterComponent;
	
	public toasterPlacement = ToasterPlacement.TopEnd;

	constructor(private messageBox : MessageBoxService,
		private router: Router, private dataService: DataService) { 
		this.dataService.getData('currentUser', '', (response) => {
			console.log(response);
			if(response.noCookie && !environment.production) this.router.navigate([ 'nocookie' ]);
		});
	}
	ngOnInit(): void {
		this.messageBox.init(this.toaster);
	}
}
