import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanJobDetailComponent } from './scan-job-detail.component';

describe('ScanJobDetailComponent', () => {
  let component: ScanJobDetailComponent;
  let fixture: ComponentFixture<ScanJobDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScanJobDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScanJobDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
