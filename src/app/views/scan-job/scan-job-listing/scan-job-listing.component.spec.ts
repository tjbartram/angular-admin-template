import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanJobListingComponent } from './scan-job-listing.component';

describe('ScanJobListingComponent', () => {
  let component: ScanJobListingComponent;
  let fixture: ComponentFixture<ScanJobListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScanJobListingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScanJobListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
