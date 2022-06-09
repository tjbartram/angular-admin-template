import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  Output,
  EventEmitter,
  ViewChild,
  HostListener,
} from '@angular/core';
import { DataService } from './../../services/data.service';
import { environment } from 'src/environments/environment';
import {
  IGridDefiniton,
  IRelateCount,
  IMenuDefinition,
  IBrowseState,
  IQueryLine,
  IView,
  IUserSettings,
} from 'src/app/interfaces/smart-data-list';
import { MenuComponent } from 'node_modules/smart-webcomponents-angular/menu';
import {
  DataAdapterVirtualDataSourceDetails,
  GridColumn,
  Grid,
} from 'smart-webcomponents-angular';
import { of, EMPTY } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';
import { minResult } from 'src/app/generic-functions';
import { GridComponent, Smart } from 'smart-webcomponents-angular/grid';
import { QueryEditorComponent } from '../query-editor/query-editor.component';
import { LowerCasePipe } from '@angular/common';
import { SmartViewEditorComponent } from '../smart-view-editor/smart-view-editor.component';
import { MessageBoxService } from 'src/app/services/message-box.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-smart-data-list',
  templateUrl: './smart-data-list.component.html',
  styleUrls: ['./smart-data-list.component.scss'],
})
export class SmartDataListComponent implements OnInit, OnDestroy {
  @ViewChild('menuAction', { static: true, read: MenuComponent })
  menuAction: MenuComponent;
  @ViewChild('menuPrint', { static: true, read: MenuComponent })
  menuPrint: MenuComponent;
  @ViewChild('menuQuery', { static: true, read: MenuComponent })
  menuQuery: MenuComponent;
  @ViewChild('menuView', { static: true, read: MenuComponent })
  menuView: MenuComponent;
  @ViewChild('menuSimpleSearch', { static: true, read: MenuComponent })
  menuSimpleSearch: MenuComponent;
  @ViewChild('menuRelate', { static: true, read: MenuComponent })
  menuRelate: MenuComponent;
  @ViewChild('smartGrid', { static: false, read: GridComponent })
  smartGrid: GridComponent;
  @ViewChild('viewEditor', { static: true, read: SmartViewEditorComponent })
  viewEditor: SmartViewEditorComponent;
  @ViewChild('queryEditor', { static: true, read: QueryEditorComponent })
  queryEditor: QueryEditorComponent;

  @Input('newDisabled') newDisabled: boolean = false;
  @Input('simpleFilterFields') simpleFilterFields: string[] = [];
  @Input('doubleClickCallback') doubleClickCallback: Function;
  @Input('newCallback') newCallback: Function;
  @Input('targetResource') targetResource: string;
  @Input('baseQueryString') baseQueryString: string = '';
  @Input('gridDef') set _gridDef(value: IGridDefiniton) {
    this.gridDef = value;
    if (this.gridDef.viewList) {
      this.gridDef.viewList.forEach((element) => {
        if (element.value === this.gridDef.viewData.id) {
          element.label = `<i style="float: right" class="far fa-check"></i>${element.name}`;
        } else {
          if (element.name)
            element.label = `<span style="margin-left: 14px">${element.name}</span>`;
        }
      });
    }
    // this.applyView(this.gridDef.viewData.id);
    this.gridSource.dataFields = this.gridDef.viewData.detail.datafields;
  }

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
  public recordCount: number = 0;
  public recordsFound: string = `Recs: 0`;
  public simpleFilterValue: string = '';
  public simpleFilterHistory: IMenuDefinition[] = [];
  public relateCount: IRelateCount[] = [];
  public relateMenuSource: IMenuDefinition[] = [];
  public gridHeight = `${minResult(
    window.innerHeight - environment.usedHeight,
    250
  )}px`;

  private userData: IUserSettings;
  private browseState: IBrowseState;
  private loadToken: boolean;
  private autoscroll: boolean;
  private timeout = false;
  private rTime: Date;
  private delta: number = 200;
  private sorting: boolean;
  private atag_Link: HTMLAnchorElement;

  public gridDef: IGridDefiniton = {
    actionList: [],
    printList: [],
    queryList: [],
    viewData: {
      id: '',
      name: '',
      fk_user: '',
      handle: '',
      type: 1,
      default: false,
      detail: { datafields: [], columns: [], editColumns: [] },
    },
  };

  constructor(
    private dataService: DataService,
    private messageBox: MessageBoxService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.baseQueryString =
      this.baseQueryString === ''
        ? `relateCount=true`
        : `${this.baseQueryString}&relateCount=true`;
    this.browseState = this.dataService.getStoredData(
      `${this.targetResource}browseState`
    );
    if (!this.browseState) {
      this.browseState = {
        lastQuery: { targetResource: this.targetResource, query: [] },
        selectToken: '',
        scrollIndex: 0,
        viewId: '',
        searchHistory: [],
      };
      this.dataService.getData(
        this.targetResource,
        this.baseQueryString,
        this.gridSetToken,
        null,
        this.browseState.lastQuery,
        true
      );
    } else {
      this.autoscroll = this.browseState.scrollIndex !== 0;
      this.loadToken = true;
    }
    this.queryEditor.init(
      this.browseState.lastQuery,
      environment.apiSettings.endpoint
    );
    this.userData = this.dataService.getStoredData('userSettings');
    this.simpleFilterHistory = this.browseState.searchHistory;
    this.atag_Link = document.getElementById('atag_Link') as HTMLAnchorElement;
  }

  ngAfterViewInit(): void {
    if (this.loadToken) {
      this.dataService.getData(
        this.targetResource,
        `${this.baseQueryString}&selectToken=${this.browseState.selectToken}`,
        this.gridSetToken,
        null,
        null,
        true
      );
    }
  }

  getGridData = (
    details: DataAdapterVirtualDataSourceDetails,
    resultCallbackFunction: any
  ) => {
    let url = `${environment.apiSettings.endpoint}${this.targetResource}`;

    let queryString = '?';
    if (this.browseState.selectToken)
      queryString += `selectToken=${this.browseState.selectToken}`;
    console.log(this.gridDef.viewData.id);
    if (this.gridDef.viewData.id)
      queryString += `${queryString !== '?' ? '&' : ''}viewId=${
        this.gridDef.viewData.id
      }`;
    if (details.first)
      queryString += `${queryString !== '?' ? '&' : ''}startIndex=${details.first}`;
    if (details.last)
      queryString += `${queryString !== '?' ? '&' : ''}endIndex=${details.last}`;

    if(details.sorting) {
      console.log(details.sorting);
      if(details.sorting.length > 0) {
        let sortString = '';
        for(let element in details.sorting) {
          console.log(element, details.sorting[element]);
          let dir = (details.sorting[element].sortOrder == 'asc') ? '>' : '<';
          if(sortString !== '') sortString += ';';
          sortString += `${element};${dir}`
        }
        if(sortString !== '') queryString += `${queryString !== '?' ? '&' : ''}order_by=${sortString}`
      }
    }

    if (queryString !== '?') url += queryString;

    this.dataService.httpGET(url).subscribe((data: any) => {
      resultCallbackFunction({
        dataSource: data.response[this.targetResource],
      });
    });
  };

  virtualDataSource = (
    resultCallbackFunction: any,
    details: DataAdapterVirtualDataSourceDetails
  ) => {
    this.getGridData(details, resultCallbackFunction);
  };

  gridSetToken = (response: any) => {
    console.log(response);
    this.browseState.selectToken = response.selectToken;

    if (!this.sorting) this.smartGrid.clearSelection();
    else this.sorting = false;

    this.relateCount = response.relateCount;
    this.recordCount = response.recordsFound;
    this.recordsFound = `Recs: ${response.recordsFound}`;
    this.buildRelateMenu();

    let tempGridSource = new Smart.DataAdapter({
      mapChar: '.',
      dataFields: this.gridDef.viewData.detail.datafields,
      id: 'id',
      virtualDataSourceCache: true,
      virtualDataSource: this.virtualDataSource,
      virtualDataSourceLength: response.recordsFound,
    });
    this.smartGrid.dataSource = tempGridSource;
  };

  public gridSource = new Smart.DataAdapter({
    dataFields: ['id: string', 'reference: string', 'title: string'],
    id: 'id',
  });
  public gridSelectionSettings = {
    enabled: true,
    allowRowSelection: false,
    checkBoxes: {
      enabled: true,
      selectAllMode: 'all',
    },
  };
  public gridBehavior = {
    columnResizeMode: 'growAndShrink',
    allowColumnAutoSizeOnDoubleClick: true
  };
  public gridAppearance = {
    alternationStart: 0,
    alternationCount: 2
  };

  public gridSettings = {
    sorting: {
      enabled: true,
      mode: 'many'
    },
    appearance: {
      alternationStart: 0,
      alternationCount: 2
    },
    behavior: {
      columnResizeMode: 'growAndShrink'
    },
    selection: {
      enabled: true,
      allowRowSelection: false,
      defaultSelection: true,
      checkBoxes: {
        enabled: true,
        selectAllMode: 'all',
      }  
    }
  };

  ngOnDestroy(): void {
    this.dataService.setStoredData(
      `${this.targetResource}browseState`,
      this.browseState
    );
  }

  btNewClicked(event: any): void {
    this.newCallback();
  }
  btShowAllClicked(event: any): void {
    this.dataService.getData(
      this.targetResource,
      this.baseQueryString,
      this.gridSetToken,
      null,
      null,
      true
    );
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
    this.smartGrid.getSelectedRowIndexes().then((rows) => {
      let rowIndexes: number[] = [];
      rows.forEach((e) => {
        if (e === 0 || e) rowIndexes.push(e);
      });
      console.log(rowIndexes);
      const subSetRequest = { subset: rowIndexes };
      const queryString = `selectToken=${this.browseState.selectToken}${
        this.baseQueryString != '' ? `&${this.baseQueryString}` : ``
      }`;
      this.dataService.getSubsetToken(
        this.targetResource,
        queryString,
        this.gridSetToken,
        null,
        subSetRequest,
        type
      );
    });
  }

  buildRelateMenu(): void {
    this.relateMenuSource = [];
    this.relateCount.forEach(count => {
      let bAdd = true;
      if(this.userData.prefs.sidebarAccess) {
        if(this.userData.prefs.sidebarAccess[count.listing] !== undefined) bAdd = this.userData.prefs.sidebarAccess[count.listing];
      };
      if(bAdd) {
        let menuItem: IMenuDefinition = { 
          value: count.table, label: `${count.label} [${count.count}]`, disabled: (count.count === 0)
        };
        this.relateMenuSource.push(menuItem);
      }
    });
  };

  gridDoubleClick(event: any): void {
    //event.detail.row.data
    console.log(event);
    if(this.doubleClickCallback) {
      this.doubleClickCallback(event.detail.row.data);
    }else {
      this.router.navigate([ `${this.targetResource}/${this.targetResource}-detail/${event.detail.row.data.id}` ]);
    }
  }

  btMenuClicked(event: MouseEvent, type: string): void {
    let targetElement = event.target;
    if (targetElement) {
      if (targetElement['localName'] == 'i')
        targetElement = targetElement['parentElement']['parentElement'];
      let target = <Element>targetElement;
      let rect = target.getBoundingClientRect();
      switch (type) {
        case 'query': {
          this.menuQuery.open(
            rect.left,
            rect.top + rect.height + window.scrollY
          );
          break;
        }
        case 'action': {
          this.menuAction.open(
            rect.left,
            rect.top + rect.height + window.scrollY
          );
          break;
        }
        case 'view': {
          this.menuView.open(
            rect.left,
            rect.top + rect.height + window.scrollY
          );
          break;
        }
        case 'print': {
          this.menuPrint.open(
            rect.left,
            rect.top + rect.height + window.scrollY
          );
          break;
        }
        case 'relate': {
          this.menuRelate.open(
            rect.left,
            rect.top + rect.height + window.scrollY
          );
          break;
        }
        case 'simpleSearch': {
          this.menuSimpleSearch.open(
            rect.left,
            rect.top + rect.height + window.scrollY
          );
          break;
        }
      }
    }
  }

  simpleFilterChange(): void {
    if (this.simpleFilterValue !== '') {
      //Add filter value to history
      let index = this.simpleFilterHistory.findIndex((element) => {
        return element.value == this.simpleFilterValue;
      });
      if (index == -1)
        this.simpleFilterHistory.push({
          label: this.simpleFilterValue,
          value: this.simpleFilterValue,
        });
      console.log(this.simpleFilterHistory);
      this.menuSimpleSearch.dataSource = [];
      this.menuSimpleSearch.dataSource = this.simpleFilterHistory;
      this.browseState.searchHistory = this.simpleFilterHistory;

      //run query
      let queryString = `simpleFilter=${this.simpleFilterValue}`;
      if (this.baseQueryString != '') queryString += `&${this.baseQueryString}`;
      this.dataService.getData(
        this.targetResource,
        queryString,
        this.gridSetToken,
        null,
        null,
        true
      );
    }
  }

  async menuItemClick(event: any, target: string) {
    console.log(event);

    this.smartGrid.getSelectedRowIndexes().then(async (rows) => {
      let rowIndexes: number[] = [];
      rows.forEach((e) => {
        if (e === 0 || e) rowIndexes.push(e);
      });

      let page = 1;
      let totalPages = 1;
      let selectedData = [];
      const pageSize = 1000;
      const subSetRequest = { subset: rowIndexes };
      if (target === 'action' || target === 'print' || target === 'relate') {
        do {
          let queryString = `page=${page}&pagesize=${pageSize}&selectToken=${
            this.browseState.selectToken
          }${this.baseQueryString != '' ? `&${this.baseQueryString}` : ``}`;
          let response = await this.dataService.getSubsetData(
            this.targetResource,
            queryString,
            subSetRequest,
            'subset'
          );
          totalPages = response.response.pageCount;
          if (response.response[this.targetResource])
            selectedData = selectedData.concat(
              ...response.response[this.targetResource]
            );
          page++;
        } while (page <= totalPages);
      }

      let eventData = {
        param: event.detail.value,
        data: selectedData,
      };

      switch (target) {
        case 'action': {
          this.actionSelected.emit(eventData);
          break;
        }
        case 'print': {
          this.printSelected.emit(eventData);
          break;
        }
        case 'view': {
          switch (eventData.param) {
            case 'newview': {
              this.viewEditor.openModal('', 'newview');
              break;
            }
            case 'editview': {
              if (this.gridDef.viewData.fk_user === this.userData.id) {
                this.viewEditor.openModal(
                  this.gridDef.viewData.id,
                  eventData.param
                );
              } else {
                this.messageBox.showWarning(
                  'Cannot Edit View',
                  'This view was created by another user. Try duplicating!'
                );
              }
              break;
            }
            case 'dupeview': {
              this.viewEditor.openModal(
                this.gridDef.viewData.id,
                eventData.param
              );
              break;
            }
            case 'deleteview': {
              if (this.gridDef.viewData.fk_user === this.userData.id) {
                if (
                  confirm(
                    `Are you sure you wish to delete the view ${this.gridDef.viewData.name}?`
                  )
                ) {
                  if (this.gridDef.viewData.id) {
                    this.dataService.deleteData(
                      'interface',
                      this.gridDef.viewData.id,
                      (data) => {
                        this.messageBox.showSuccess('View Deleted');
                        this.applyView();
                      },
                      null
                    );
                  }
                }
              } else {
                this.messageBox.showWarning(
                  'Cannot Delete View',
                  'This view was created by another user!'
                );
              }
              break;
            }
            case 'exportview':
            case 'excel':
            case 'csv': {
              if (!(eventData.param == 'exportview')) {
                let queryStr = `selectToken=${this.browseState.selectToken}&viewId=${this.gridDef.viewData.id}&format=${eventData.param}`;
                this.dataService.getData('exportView', queryStr, (response) => {
                  if (response.filename) {
                    const link = `${window.location.origin}/reports/${response.filename}`;
                    this.atag_Link.href = link;
                    this.atag_Link.download = response.filename;
                    this.atag_Link.click();
                  }
                });
              }
              break;
            }
            default: {
              if (this.gridDef.viewData.id !== eventData.param)
                this.applyView(eventData.param);
            }
          }
          break;
        }
        case 'query': {
          if (event.detail.value === 'query') {
            //Open advanced Query editor
            this.queryEditor.open();
          } else {
            //Callback to parent
            this.querySelected.emit(eventData);
          }
          break;
        }
        case 'simpleSearch': {
          this.simpleFilterValue = eventData.param;
          let queryString = `simpleFilter=${this.simpleFilterValue}`;
          if (this.baseQueryString != '')
            queryString += `&${this.baseQueryString}`;
          this.dataService.getData(
            this.targetResource,
            queryString,
            this.gridSetToken,
            null,
            null,
            true
          );
          break;
        }
        case 'relate': {
          let relateIdx = this.relateCount.findIndex(element => { return element.table === eventData.param });
          let targetBrowseState = this.dataService.getStoredData(`${eventData.param}browseState`);
          if(!targetBrowseState) {
            targetBrowseState = {
              lastQuery: { targetResource: this.targetResource, query: [] },
              selectToken: '',
              scrollIndex: 0,
              viewId: '',
              searchHistory: []
            }
          }else {
            targetBrowseState.scrollIndex = 0;
          }

          //Get selectToken for target table
          this.dataService.getData(eventData.param, `relateToken=${this.browseState.selectToken}&sourceTable=${this.targetResource}`, (response) => {
            targetBrowseState.selectToken = response.selectToken;
            this.dataService.setStoredData(`${eventData.param}browseState`, targetBrowseState);
            this.router.navigate([ this.relateCount[relateIdx].listing ]);
          }, null, null, true);
          break;
        }
      }
    });
  }

  resizeend = () => {
    if (+new Date() - +this.rTime < this.delta) {
      setTimeout(this.resizeend, this.delta);
    } else {
      this.timeout = false;
      this.gridHeight = `${minResult(
        window.innerHeight - environment.usedHeight,
        250
      )}px`;
    }
  };

  queryComplete(event: IQueryLine[]): void {
    if (event) {
      this.smartGrid.ensureVisible(0);
      this.browseState.lastQuery.query = event;
      this.dataService.getData(
        this.targetResource,
        this.baseQueryString,
        this.gridSetToken,
        null,
        this.browseState.lastQuery,
        true
      );
    }
  }

  viewEditComplete(event: IView): void {
    if (event) this.applyView(event.id);
  }

  private applyView(viewId: string = ''): void {
    const queryString = `table=${this.targetResource}${
      viewId ? `&viewId=${viewId}` : ``
    }`;
    this.dataService.getData(
      `gridDef`,
      queryString,
      (data) => {
        this.gridDef = data;
        // this.viewUpdate = true;
        if (this.gridDef.viewList) {
          this.gridDef.viewList.forEach((element) => {
            if (element.value === this.gridDef.viewData.id) {
              element.label = `<i style="float: right" class="far fa-check"></i>${element.name}`;
            } else {
              if (element.name)
                element.label = `<span style="margin-left: 14px">${element.name}</span>`;
            }
          });
        }
        this.smartGrid.columns = this.gridDef.viewData.detail.columns;
        this.smartGrid.dataSource = new Smart.DataAdapter({
          mapChar: '.',
          dataFields: this.gridDef.viewData.detail.datafields,
          id: 'id',
          virtualDataSourceCache: true,
          virtualDataSource: this.virtualDataSource,
          virtualDataSourceLength: this.recordCount,
        });
        this.menuView.dataSource = this.gridDef.viewList;
        this.browseState.viewId = viewId;
      },
      null
    );
  }
}
