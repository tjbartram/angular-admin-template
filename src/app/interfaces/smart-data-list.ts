import { GridColumn } from 'smart-webcomponents-angular/grid';

export interface IGridDefiniton {
	actionList: IMenuDefinition[];
	printList: IMenuDefinition[];
	queryList: IMenuDefinition[];
	viewList?: IMenuDefinition[];
	viewData: IView;
}

export interface IMenuDefinition {
	label?: string;
	value: string;
	html?: string;
	name?: string;
	disabled?: boolean;
	separator?: boolean;
	items?: IMenuDefinition[];
}

export interface IView {
	id?: string,
	name: string,
	fk_user: string,
	handle: string,
	type: number,
	default: boolean,
	detail: IViewDetail;
	interface_user?: Partial<IUser>;
}

export interface IViewDetail {
	editColumns: IColumn[];
	columns: GridColumn[];
	datafields: { name: string, dataType: string }[];
}

export interface IColumn {
	header: string;
	fieldName: string;
	fieldNumber: number;
	table: string;
	relation?: string;
	fieldType: string;
	width: number;
	widthUnit: string;
	alignment: string;
	min: boolean;
	max: boolean;
	sum: boolean;
	avg: boolean;
	attribute?: string;
}

export interface IUser {

}

export interface IUserSettings {
	id: string;
}

export interface IRelateCount {
	table: string;
	listing: string;
	label: string;
	count: number;
}

export interface IBrowseState {
	viewId: string;
	lastQuery: IQueryData;
	selectToken: string;
	scrollIndex: number;
	searchHistory: { html: string, value: string }[];
}

export interface IQueryLine {
    field: string;
    operator: string;
    value: any;

    bracket?: string;
    conjunction?: string;
    attribute?: string;
}

export interface IQueryData {
    targetResource: string;
    query: IQueryLine[];
    querywitharray?: { field: string, values: [] } 
}

export interface IUserQuery {
    id?: string,
	name: string,
	fk_user: string,
	handle: string,
	type: number,
	default: boolean,
	detail: { query: IQueryData };
}

export interface IUserQueryResponse {
    response: IUserQuery[];
}

export interface ITableDefinition {
    dataClass?: string;
    relationName?: string;
    fields: IFieldDefinition[];
}

export interface IFieldDefinition {
    name: string;
    type: string;
    kind: string;
    unique: boolean;
    invisible: boolean;
    indexed?: boolean;
    length?: number;
    relatedDataClass?: string;
}
