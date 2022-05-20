import { Component, OnInit, OnDestroy } from '@angular/core';
import { IGridDefiniton } from 'src/app/interfaces/smart-data-list';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-listing',
  templateUrl: './product-listing.component.html',
  styleUrls: ['./product-listing.component.scss']
})
export class ProductListingComponent implements OnInit, OnDestroy {

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
