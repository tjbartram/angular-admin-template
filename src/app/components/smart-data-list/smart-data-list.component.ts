import { Component, OnInit, Input, OnDestroy, Output, EventEmitter, ViewChild, HostListener } from '@angular/core';
import { DataService } from './../../services/data.service';
import { environment } from 'src/environments/environment';
import { IGridDefiniton, IRelateCount, IMenuDefinition, IBrowseState, IQueryLine } from 'src/app/interfaces/smart-data-list';
import { MenuComponent } from 'node_modules/smart-webcomponents-angular/menu'
import { DataAdapterVirtualDataSourceDetails, GridColumn } from 'smart-webcomponents-angular';
import { of, EMPTY } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';
import { minResult } from 'src/app/generic-functions';
import { GridComponent, Smart } from 'smart-webcomponents-angular/grid';
import { QueryEditorComponent } from '../query-editor/query-editor.component';

@Component({
  selector: 'app-smart-data-list',
  templateUrl: './smart-data-list.component.html',
  styleUrls: ['./smart-data-list.component.scss']
})
export class SmartDataListComponent implements OnInit, OnDestroy {

  @ViewChild('menuAction', { static: true, read: MenuComponent }) menuAction: MenuComponent;
  @ViewChild('menuPrint', { static: true, read: MenuComponent }) menuPrint: MenuComponent;
  @ViewChild('menuQuery', { static: true, read: MenuComponent }) menuQuery: MenuComponent;
  @ViewChild('menuView', { static: true, read: MenuComponent }) menuView: MenuComponent;
  @ViewChild('menuSimpleSearch', { static: true, read: MenuComponent }) menuSimpleSearch: MenuComponent;
  @ViewChild('menuRelate', { static: true, read: MenuComponent }) menuRelate: MenuComponent;
  @ViewChild('smartGrid', { static: false, read: GridComponent }) smartGrid: GridComponent;

  @ViewChild('queryEditor', { static: true, read: QueryEditorComponent }) queryEditor: QueryEditorComponent;

	@Input('newDisabled') newDisabled: boolean = false;
	@Input('simpleFilterFields') simpleFilterFields: string[] = [];
	@Input('doubleClickCallback') doubleClickCallback: Function;
	@Input('newCallback') newCallback: Function;
	@Input('targetResource') targetResource: string;
	@Input('baseQueryString') baseQueryString: string = '';
  @Input('gridDef') set _gridDef(value: IGridDefiniton) {
    this.gridDef = value;
    if(this.gridDef.viewList) {
      this.gridDef.viewList.forEach((element) => {
        if(element.value === this.gridDef.viewData.id){
          element.html = `${element.name}<i style="float: right" class="far fa-check"></i>`;
        }else{
          if(element.name) element.html = element.name;
        }
      });
    }
    
    this.gridSource.dataFields = this.gridDef.viewData.detail.datafields;
  };

  @Output() actionSelected = new EventEmitter();
  @Output() printSelected = new EventEmitter();
  @Output() querySelected = new EventEmitter();

  @HostListener('window:resize', ['$event'])
	onResize(event) {
		this.rTime = new Date();
    	if (this.timeout === false) {
      		this.timeout = true;
			setTimeout(this.resizeend, this.delta);
    }
	}

  public smartTheme = environment.smartTheme;
  public recordCount: string = `Records Found: 0`;
	public simpleFilterValue: string = '';
	public simpleFilterHistory: IMenuDefinition[] = [];
	public relateCount: IRelateCount[] = [];
  public relateMenuSource: IMenuDefinition[] = [];
  public gridHeight = `${minResult(window.innerHeight - environment.usedHeight, 250)}px`;

	private userData: any;
  private browseState: IBrowseState;
  private loadToken: boolean;
  private autoscroll: boolean;
  private timeout = false;
	private rTime: Date;
	private delta: number = 200;
  private sorting: boolean;

  public gridDef: IGridDefiniton = { actionList: [], printList: [], queryList: [], viewData: { name: '', fk_user: '', handle: '', type: 1, default: false, detail: { datafields: [], columns: [], editColumns: [] } } };

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.baseQueryString = (this.baseQueryString === '') ? `relateCount=true` : `${this.baseQueryString}&relateCount=true`;
		this.browseState = this.dataService.getStoredData(`${this.targetResource}browseState`);
		if(!this.browseState) {
			this.browseState = {
				lastQuery: { targetResource: this.targetResource, query: [] },
				selectToken: '',
				scrollIndex: 0,
				viewId: '',
				searchHistory: []
      }
      this.dataService.getData(this.targetResource, this.baseQueryString, this.gridSetToken, null, this.browseState.lastQuery, true);
    }else {
      this.autoscroll = this.browseState.scrollIndex !== 0;
			this.loadToken = true;
    }
    this.queryEditor.init(this.browseState.lastQuery, environment.apiSettings.endpoint);
    this.userData = this.dataService.getStoredData('userSettings');
    this.simpleFilterHistory = this.browseState.searchHistory;
  }

  ngAfterViewInit(): void {
    // this.smartGrid.refresh()
    if(this.loadToken) {
      this.dataService.getData(this.targetResource, `${this.baseQueryString}&selectToken=${this.browseState.selectToken}`, this.gridSetToken, null, null, true);
    }else {
      this.smartGrid.refresh();
    }
  };

  getGridData = (first: number | undefined, last: number | undefined, resultCallbackFunction: any) => {
    let url = `${environment.apiSettings.endpoint}${this.targetResource}`

    let queryString = '?';
    if(this.browseState.selectToken) queryString += `selectToken=${this.browseState.selectToken}`
    if(this.gridDef.viewData.id) queryString+= `${(queryString !== '?') ? '&' : ''}viewId=${this.gridDef.viewData.id}`;
    if(first) queryString += `${(queryString !== '?') ? '&' : ''}startIndex=${first}`;
    if(last) queryString += `${(queryString !== '?') ? '&' : ''}endIndex=${last}`;

    if(queryString !== '?') url += queryString;

    this.dataService.httpGET(url).subscribe((data: any) => {
      resultCallbackFunction({ dataSource: data.response[this.targetResource], virtualDataSourceLength: data.response.recordsFound });
    });
  };

  virtualDataSource = (resultCallbackFunction: any, details: DataAdapterVirtualDataSourceDetails) => {
    setTimeout(() => {
      this.getGridData(details.first, details.last, resultCallbackFunction)
    }, 100);
  };

  gridSetToken = (response: any) => {
    console.log(response);
    this.browseState.selectToken = response.selectToken;

    if(!this.sorting) this.smartGrid.clearSelection();
    else this.sorting = false;

    this.relateCount = response.relateCount;

    //For some reason, updating the data source with a virtualDataSource that is not 0 causes an error in the grid component,
    //Therefore, first assigning a datasource with 0 length, then with the real length...
    // this.smartGrid.beginUpdate();
    // this.smartGrid.dataSource.virtualDataSourceLength = response.recordsFound;
    // this.smartGrid.endUpdate();

    // this.smartGrid.refresh();
    
    // this.smartGrid.refreshView();

    // let tempGridSource = new Smart.DataAdapter({
    //   datafields: [
    //     { name: 'id', dataType: 'string' },
    //     { name: 'reference', dataType: 'string' },
    //     { name: 'title', dataType: 'string' }
    //   ],
    //   virtualDataSourceCache: true,
    //   virtualDataSource: this.virtualDataSource,
    //   virtualDataSourceLength: 0
    // });
    // this.smartGrid.dataSource = tempGridSource;

    let tempGridSource2 = new Smart.DataAdapter({
      datafields: [
        { name: 'uuid', dataType: 'string' },
        { name: 'reference', dataType: 'string' },
        { name: 'title', dataType: 'string' }
      ],
      id: 'uuid',
      virtualDataSourceCache: true,
      virtualDataSource: this.virtualDataSource,
      virtualDataSourceLength: response.recordsFound
    });
    this.smartGrid.dataSource = tempGridSource2;
  };

  public gridSource = new Smart.DataAdapter({
    datafields: [
      { name: 'uuid', dataType: 'string' },
      { name: 'reference', dataType: 'string' },
      { name: 'title', dataType: 'string' }
    ],
    id: 'uuid',
    virtualDataSourceCache: true,
    virtualDataSource: this.virtualDataSource,
    virtualDataSourceLength: 0
  });
  public gridSelectionSettings = {
    enabled: true,
    checkBoxes: {
      enabled: true,
      selectAllMode: 'all'
    }
  };

  public gridColumns = [
    { label: 'ID', dataField: 'uuid' },
    { label: 'Ref', dataField: 'title' }
  ];

  ngOnDestroy(): void {

  }

  btNewClicked(event: any): void {
    console.log(this.smartGrid.dataSource);
		this.newCallback();
	}
  btShowAllClicked(event: any): void {
		this.dataService.getData(this.targetResource, this.baseQueryString, this.gridSetToken, null, null, true);
	}
  btShowSubsetClicked(event: any): void {
		this.applySubset('subset');
	}
	btOmitSubsetClicked(event: any): void {
		this.applySubset('omitset');
	}
	btQueryClicked(event: any): void {
		this.queryEditor.open();
  }

  applySubset(type: 'omitset' | 'subset'): void {
    this.smartGrid.ensureVisible(0);
    this.smartGrid.getSelectedRows().then((rows) => {
      let rowIndexes = rows.map(x => x[0]);
      console.log(rows);
      const subSetRequest = { subset: rowIndexes };
      const queryString = `selectToken=${this.browseState.selectToken}${(this.baseQueryString != '') ? `&${this.baseQueryString}` : ``}`;
      this.dataService.getSubsetToken(this.targetResource, queryString, this.gridSetToken, null, subSetRequest, type);
    });;
	}

  btMenuClicked(event: MouseEvent, type: string): void {
    let targetElement = event.target;
    if(targetElement) {
      if(targetElement["localName"] == 'i')
      targetElement = targetElement["parentElement"]["parentElement"];
      let target = <Element> targetElement;
      let rect = target.getBoundingClientRect();
      switch (type) {
        case 'query': {
          this.menuQuery.open(rect.left, rect.top + rect.height + window.scrollY);
          break;
        }
        case 'action': {
          this.menuAction.open(rect.left, rect.top + rect.height + window.scrollY);
          break;
        }
        case 'view': {
          this.menuView.open(rect.left, rect.top + rect.height + window.scrollY);
          break;
        }
        case 'print': {
          this.menuPrint.open(rect.left, rect.top + rect.height + window.scrollY);
          break;
        }
        case 'relate': {
          this.menuRelate.open(rect.left, rect.top + rect.height + window.scrollY);
          break;
        }
        case 'simpleSearch': {
          this.menuSimpleSearch.open(rect.left, rect.top + rect.height + window.scrollY);
          break;
        }
      }
    }
  }

  simpleFilterChange(): void {
		// if(this.simpleFilterValue !== '') {
		// 	//Add filter value to history
		// 	let index = this.simpleFilterHistory.findIndex(element => {
		// 		return element.value == this.simpleFilterValue;
		// 	});
		// 	if(index == -1) this.simpleFilterHistory.push({ html: this.simpleFilterValue, value: this.simpleFilterValue });
		// 	this.menuSimpleSearch.source([]);
		// 	this.menuSimpleSearch.source(this.simpleFilterHistory);
		// 	this.browseState.searchHistory = this.simpleFilterHistory;

		// 	//run query
		// 	let queryString = `simpleFilter=${this.simpleFilterValue}`;
		// 	if(this.baseQueryString != '') queryString += `&${this.baseQueryString}`;
		// 	this.dataService.getData(this.targetResource, queryString, this.gridSetToken, null, null, true);
		// }
  }
  
  async menuItemClick(event: any, target: string) {
    console.log(event);

    let eventData = {
      param: event.detail.value,
      data: []
    }

    switch(target) {
      case 'action': {
        break;
      }
      case 'print': {
        break;
      }
      case 'view': {
        break;
      }
      case 'query': {
        if(event.detail.value === 'query') {
          //Open advanced Query editor
          this.queryEditor.open();
        }else {
          //Callback to parent
          this.querySelected.emit(eventData);
        }
        break;
      }
      case 'simpleSearch': {
        break;
      }
      case 'relate': {
        break;
      }
    };
  }

  resizeend = () => {
		if (+new Date() - +this.rTime < this.delta) {
			setTimeout(this.resizeend, this.delta);
		} else {
			this.timeout = false;
			this.gridHeight = `${minResult(window.innerHeight - environment.usedHeight, 250)}px`;
		}
  }
  
  queryComplete(event: IQueryLine[]): void {
    if(event) {
      this.smartGrid.ensureVisible(0);
      this.browseState.lastQuery.query = event;
      this.dataService.getData(this.targetResource, this.baseQueryString, this.gridSetToken, null, this.browseState.lastQuery, true);
    }
  }
}
