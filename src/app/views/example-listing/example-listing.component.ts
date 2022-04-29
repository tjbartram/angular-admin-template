import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { GridComponent, GridColumn, DataAdapter, Smart } from 'smart-webcomponents-angular/grid';
import { IGridDefiniton } from 'src/app/interfaces/smart-data-list';
import { Subscribable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-example-listing',
  templateUrl: './example-listing.component.html',
  styleUrls: ['./example-listing.component.scss']
})

export class ExampleListingComponent implements OnInit, OnDestroy {

  @ViewChild('smartGrid', { static: true }) smartGrid: GridComponent;

  public dataSource = new Smart.DataAdapter({
    dataSource: [
      { id: 0, column1: "Tester", column2: "Value" },
      { id: 1, column1: "Row 2", column2: "data 2" }
    ],
    datafields: [
      'id: number',
      'column1: string',
      'column2: string'
    ]
  });
  public columns: GridColumn[] = [
    { label: 'Column 1', dataField: 'column1', width: '30%', columnGroup: 'name' },
    { label: 'Column 2', dataField: 'column2', width: '70%', columnGroup: 'name' }
  ];

  public gridDef: IGridDefiniton;
  private componentSubs: Subscription = new Subscription();

  constructor(private activatedRoute: ActivatedRoute, private dataService: DataService) { }

  ngOnInit(): void {
    this.componentSubs.add(this.activatedRoute.data.subscribe((data: any) => {
      this.gridDef = data.gridDef;
    }));
  }

  ngOnDestroy(): void {
    this.componentSubs.unsubscribe();
  }

}
