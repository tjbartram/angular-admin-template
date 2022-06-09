import { Component, OnInit, OnDestroy } from '@angular/core';
import { IGridDefiniton } from 'src/app/interfaces/smart-data-list';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-scan-job-listing',
  templateUrl: './scan-job-listing.component.html',
  styleUrls: ['./scan-job-listing.component.scss']
})
export class ScanJobListingComponent implements OnInit, OnDestroy {

  public gridDef: IGridDefiniton;
  private componentSubs: Subscription = new Subscription();

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.componentSubs.add(this.activatedRoute.data.subscribe((data: any) => {
      this.gridDef = data.gridDef;
    }));
  }

  ngOnDestroy(): void {
    this.componentSubs.unsubscribe();
  }

}
