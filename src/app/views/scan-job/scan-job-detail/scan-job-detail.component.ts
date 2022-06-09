import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-scan-job-detail',
  templateUrl: './scan-job-detail.component.html',
  styleUrls: ['./scan-job-detail.component.scss']
})
export class ScanJobDetailComponent implements OnInit {
  public scanJobData: any;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.data.subscribe((data: any) => {
      console.log(data);
      if (data.data) {
        //Loaded record for view / edit
        this.scanJobData = data.data.response.product[0];
      } else {
        //New record
        this.scanJobData = { id: 'null', title: 'New Scan Job' };
      }
    });
  }

}
