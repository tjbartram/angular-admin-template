import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnDestroy, ViewEncapsulation } from '@angular/core';
import { IView, IUser, IPropertyList, IField, IUserSettings, IColumn, IDataField } from 'src/app/interfaces/smart-data-list';
import { GridComponent, Smart, GridColumn } from 'smart-webcomponents-angular/grid';
import { SmartViewEditorColumnComponent } from '../smart-view-editor-column/smart-view-editor-column.component';
import { environment } from 'src/environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from 'src/app/services/data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-smart-view-editor',
  templateUrl: './smart-view-editor.component.html',
	styleUrls: ['./smart-view-editor.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class SmartViewEditorComponent implements OnInit, OnDestroy {

  @ViewChild('gridFields', { static: false, read: GridComponent }) gridFields: GridComponent;
	@ViewChild('gridColumns', { static: false, read: GridComponent }) gridColumns: GridComponent;
	@ViewChild('columnEdit', { static: false, read: SmartViewEditorColumnComponent }) columnEdit: SmartViewEditorColumnComponent;

	@Output() viewEditComplete = new EventEmitter();

  @Input('targetResource') targetResource: string = '';
	@Input('adminEdit') adminEdit: boolean = false;

  // public VIEWEDITOR: { TITLE: 'View Management', CANCEL: 'Cancel', RESET: 'Reset', OK: 'OK', SAVECLOSE: 'Save & Close', DEFAULT: 'Default View', VIEWNAME: 'View Name', USER: 'User' };
	public viewData: IView = { name: '', fk_user: '', default: false, type: 1, handle: this.targetResource, detail: { editColumns: [], columns: [], datafields: [] } };
  public propertyList: IPropertyList[] = [];
	public displayFields: IField[] = [];
	public smartTheme: string = environment.smartTheme;
	public vb_showColumnDetail: boolean = false;
	public usersLookup: Partial<IUser>[] = [];
	public selectedUser: Partial<IUser> = { id: '', selectTag: 'System' };
	public fieldMenuList = [];
	public gridAppearance = {
		alternationCount: 2,
		alternationStart: 0
	};
	public gridColumnsBehavior = {
		allowRowReorder: true
	};
	public gridColumnsAppearance = {
		alternationCount: 2,
		alternationStart: 0,
		showRowHeaderDragIcon: true,
		showRowHeader: true
	};
	public gridSelection = {
		enabled: true,
		mode: 'one'
	};
	public gridHeight = '400px';

  private componentSubs: Subscription = new Subscription();
	private selectedTableIndex: number = 0;
	private userData: IUserSettings;

  constructor(private translate: TranslateService, private dataService: DataService) { }

  ngOnInit(): void {
    // this.componentSubs.add(this.translate.get("VIEWEDITOR").subscribe((data) => {
		// 	this.VIEWEDITOR = data;
		// }));
		this.userData = this.dataService.getStoredData("userSettings");
  }

  ngAfterViewInit() {
		this.componentSubs.add(this.dataService.getData("propertyList", `table=${this.targetResource}`, (data) => {
			this.buildPropertyList(this.targetResource, data.fields);
		}, null));
		if(this.adminEdit) {
			this.usersLookup.push({ id: '', selectTag: 'System' });
			this.getUsers(1);
		}
		console.log(this.gridColumns);
	}

	ngOnDestroy() {
		this.componentSubs.unsubscribe();
	}

/**
	 * Opens modal window after reseting values according to given viewId / Action
	 * @param viewId UUID of the view to edit / dupe. Pass as empty string when creating new
	 * @param action Action view editor is performing, supports 'newview', 'editview', 'dupeview'
	 */
	public openModal(viewId: string | undefined = '', action: 'newview' | 'editview' | 'dupeview', newTarget: string = ''): void {
		if(newTarget != '') {
			this.propertyList = [];
			this.displayFields = [];
			this.targetResource = newTarget;
			this.componentSubs.add(this.dataService.getData("propertyList", `table=${this.targetResource}`, (data) => {
				this.buildPropertyList(this.targetResource, data.fields);
				this.openModal(viewId, action);
			}, null));
		}else {
			this.vb_showColumnDetail = false;
			if(action === 'newview'){
				this.viewData = {
					name: `New View for ${this.targetResource}`,
					fk_user: this.dataService.getStoredData('userSettings').id,
					default: false,
					type: 1,
					handle: this.targetResource,
					detail: {
						columns: [],
						datafields: [],
						editColumns: []
					}
				}
				if(this.adminEdit) this.viewData.fk_user = '';

				this.gridColumnsSource.dataSource = this.viewData.detail.editColumns;
				// this.gridColumns.refresh();
				this.populateFields();	
				this.modal('show');
			}else{
				this.dataService.getData("interface", `id=${viewId}`, (data) => {
					this.viewData = data.response["interface"][0];
					if(action === 'dupeview'){
						this.viewData.name = `${this.viewData.name} - Copy`;
						this.viewData.fk_user = (this.adminEdit) ? '' : this.userData.id;
						delete this.viewData.id;
					}
					if(this.adminEdit) {
						let idx = this.usersLookup.findIndex((element) => {
							return element.id === this.viewData.fk_user;
						});
						if(idx >= 0) this.selectedUser = this.usersLookup[idx];
					}
					this.gridColumnsSource.dataSource = this.viewData.detail.editColumns;
					// this.gridColumns.refresh();
					this.populateFields();
					this.modal('show');
				}, null);
			}
		}
	}

	/**
     * Opens / Closes window according to param
     * @param action Action to take, accepted values: 'show', 'hide'
     */
    public modal(action: 'show' | 'hide'): void {
        $('#view-editor-modal').modal(action);
	}

	public selectTableChanged(event: any) {
		let selOptions = event.target.selectedOptions;
		if(selOptions.length > 0) {
			this.selectedTableIndex = selOptions[0].index;
			this.populateFields();
		}
	}
	
	public gridFieldsDoubleClick(event: any) {
		let index = this.displayFields.findIndex(e => { return e.name === event.detail.id });
		if(index >= 0) {
			let rowData = this.displayFields[index];
			let column: IColumn = {
				id: `${this.propertyList[this.selectedTableIndex].table}-${rowData.fieldNumber}`,
				header: rowData.fieldName,
				fieldName: rowData.fieldName,
				fieldNumber: rowData.fieldNumber,
				table: this.propertyList[this.selectedTableIndex].table,
				fieldType: rowData.type,
				width: 10,
				widthUnit: '%',
				alignment: 'left',
				sum: false,
				min: false,
				max: false,
				avg: false
			}
			if(rowData.relation) column.relation = rowData.relation;
			if(rowData.type === 'object') column.attribute = '';

			this.viewData.detail.editColumns.push(column);
			this.gridColumnsSource.dataSource = this.viewData.detail.editColumns;
			this.populateFields();
		}
		//need to check for `relation` property on field for the sake of `map` datafield property
		//need to somehow hide fields that are already in columns
	}

	public gridColumnsDoubleClick(event: any) {
		//open modal containing column options
		let index = this.viewData.detail.editColumns.findIndex(e => { return e.id === event.detail.id });
		if(index >= 0) {
			this.columnEdit.loadData(this.viewData.detail.editColumns[index], index);
			this.vb_showColumnDetail = true;
		}
	}

	public selectUserChange(event: any): void {
		console.log(event);
	}

	public btSaveClick(event: any): void {
		//Post view to server, pass to parent to apply to current grid
		//Loop editColumns and build columns and datafields for use by jqxGrid

		this.viewData.detail.columns = [];
		this.viewData.detail.datafields = [];
		const regex = />/gi;

		this.viewData.detail.editColumns.forEach((element) => {
			let datafield: IDataField = { name: '', type: '' };
			let column: Partial<GridColumn> = {};

			datafield.type = element.fieldType;
			column.label = element.header;
			column.width = `${element.width}${element.widthUnit}`;
			column.cellsAlign = element.alignment;
			
			if((element.relation) && (element.attribute) && (element.attribute !== '')) {
				datafield.name = `${element.relation.replace(regex, '.')}.${element.fieldName}.${element.attribute}`;
				datafield.map = `${element.relation}>${element.fieldName}>${element.attribute}`;
				column.dataField = `${element.relation.replace(regex, '.')}.${element.fieldName}.${element.attribute}`;
			}else if(element.relation) {
				datafield.name = `${element.relation.replace(regex, '.')}.${element.fieldName}`;
				datafield.map = `${element.relation}>${element.fieldName}`;
				column.dataField = `${element.relation.replace(regex, '.')}.${element.fieldName}`;
			}else if((element.attribute) && (element.attribute !== '')) {
				datafield.name = `${element.fieldName}.${element.attribute}`;
				datafield.map = `${element.fieldName}>${element.attribute}`;
				column.dataField = `${element.fieldName}.${element.attribute}`;
			}else {
				datafield.name = element.fieldName;
				column.dataField = element.fieldName;
			}

      let aggre: string[] = [];
			if(element.max) aggre.push('max');
			if(element.min) aggre.push('min');
			if(element.sum)	aggre.push('sum');
			if(element.avg) aggre.push('avg');
			if(aggre.length > 0) column.summary = aggre;
			
			this.viewData.detail.columns.push(column);
			this.viewData.detail.datafields.push(datafield);
		});

		if((this.adminEdit) && (this.selectedUser.id)){
			this.viewData.fk_user = this.selectedUser.id;
		}

		//Post View
		this.dataService.postData('interface', this.viewData, (data) => {
			this.viewEditComplete.emit(data);
		}, null);

		this.modal('hide');
	}

	public btAddClick(event: any): void {
		//Intended to allow adding of custom fields, like i.LEVEL's ESM InStock for [Stock]
	}

	public btRemoveClick(event: any): void {
		this.gridColumns.getSelectedRowIndexes().then(rows => {
			 if(rows.length > 0) {
				let index = rows[0];
				const msg = `Are you sure you wish to delete the column ${this.viewData.detail.editColumns[index].header}?`;
				if(confirm(msg)) {
					this.viewData.detail.editColumns.splice(index, 1);
					this.gridColumnsSource.dataSource = this.viewData.detail.editColumns;
					// this.gridColumns.refresh();
					this.populateFields();
				}	
			 }
		});
		// const index = this.gridColumns.getselectedrowindex();
		// if(index >= 0) {
		// 	const msg = `Are you sure you wish to delete the column ${this.viewData.detail.editColumns[index].header}?`;
		// 	if(confirm(msg)) {
		// 		this.viewData.detail.editColumns.splice(index, 1);
		// 		this.gridColumnsSource.dataSource = this.viewData.detail.editColumns;
		// 		this.gridColumns.refresh();
		// 		this.populateFields();
		// 	}
		// }
	}

	public columnEditComplete(event: any): void {
		if(event) {
			this.viewData.detail.editColumns[event.index] = event.data;
			this.gridColumnsSource = new Smart.DataAdapter({
				datafields: [
					{ name: 'id', type: 'string' },
					{ name: 'header', type: 'string' },
					{ name: 'fieldName', type: 'string' }
				],
				datatype: 'json',
				id: 'id',
				dataSource: this.viewData.detail.editColumns
			});
		}
		this.vb_showColumnDetail = false;
		
	}

	private buildPropertyList(resource: string, fields: IField[], relation?: string) {
		let propList: IPropertyList = { table: resource, fields: [] };
		fields.forEach((element) => {
			if(element.kind === 'storage'){
				let field: IField = {
					fieldName: element.fieldName,
					name: element.name,
					kind: element.kind,
					type: element.type,
					fieldNumber: element.fieldNumber
				};
				if(relation) field.relation = relation;
				propList.fields.push(field);
			}else if(element.kind === 'relatedEntity'){
				this.componentSubs.add(this.dataService.getData("propertyList", `table=${element.relatedDataClass}`, (data) => {
					if(element.relatedDataClass) this.buildPropertyList(element.relatedDataClass, data.fields, (relation) ? `${relation}>${element.fieldName}` : element.fieldName);
				}, null));
			}
		});
		let index = this.propertyList.findIndex((element) => {
			return element.table === propList.table;
		});
		if(index === -1) this.propertyList.push(propList);
		if(resource === this.targetResource) {
			this.selectedTableIndex = 0;
			this.populateFields();
		}
	}

	private populateFields(): void {
		this.displayFields = [];
		this.propertyList[this.selectedTableIndex].fields.forEach((field) => {
			let idx = this.viewData.detail.editColumns.findIndex((column) => {
				return ((field.fieldNumber === column.fieldNumber) && (this.propertyList[this.selectedTableIndex].table === column.table));
			});
			if((idx == -1) || (field.type == 'object')){
				this.displayFields.push(field);
			}
		});
		this.gridFieldsSource.dataSource = this.displayFields;
		// this.gridFields.refresh();
	}

	private getUsers(page: number) {
		this.dataService.getData('user', `pagesize=1000&page=${page}`, (response) => {
			if(response.response.user) {
				let users = response.response.user;
				users.forEach(element => {
					element.selectTag = `${element.name} - ${element.email}`;
				});
				this.usersLookup = this.usersLookup.concat(users);
				if(response.pageCount > page) this.getUsers(page++);
			}
		});
	}

  public gridFieldsSource = new Smart.DataAdapter({
		datafields: [
			{ name: 'name', type: 'string' },
			{ name: 'fieldName', type: 'string' },
			{ name: 'kind', type: 'string' },
			{ name: 'type', type: 'string' },
			{ name: 'relation', type: 'string' },
			{ name: 'fieldNumber', type: 'int' }
		],
		datatype: 'json',
		id: 'name',
		dataSource: this.displayFields
	});

	public gridFieldsColumns: GridColumn[] = [
		{ label: 'Field Name', dataField: 'name', width: '100%' }
	];

	public gridColumnsSource = new Smart.DataAdapter({
		datafields: [
			{ name: 'id', type: 'string' },
			{ name: 'header', type: 'string' },
			{ name: 'fieldName', type: 'string' }
		],
		datatype: 'json',
		id: 'id',
		dataSource: this.viewData.detail.editColumns
	});

	public gridColumnsColumns: GridColumn[] = [
		{ label: 'Header', dataField: 'header' },
		{ label: 'Field Name', dataField: 'fieldName' }
	];


}
