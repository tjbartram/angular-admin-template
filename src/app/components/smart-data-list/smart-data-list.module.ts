import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SmartDataListComponent } from './smart-data-list.component';

import { GridModule } from 'smart-webcomponents-angular/grid';
import { MenuModule } from 'smart-webcomponents-angular/menu';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { QueryEditorModule } from 'src/app/components/query-editor/query-editor.module';
import { SmartViewEditorModule } from 'src/app/components/smart-view-editor/smart-view-editor.module';

@NgModule({
  declarations: [
    SmartDataListComponent
  ],
  imports: [
    CommonModule,
    GridModule,
    MenuModule,
    FormsModule,
    TranslateModule,
    QueryEditorModule,
    SmartViewEditorModule
  ],
  exports: [
    SmartDataListComponent
  ]
})
export class SmartDataListModule { }
