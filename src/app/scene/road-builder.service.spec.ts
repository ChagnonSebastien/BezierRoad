import { TestBed, inject } from '@angular/core/testing';

import { RoadBuilderService } from './road-builder.service';

describe('RoadBuilderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RoadBuilderService]
    });
  });

  it('should be created', inject([RoadBuilderService], (service: RoadBuilderService) => {
    expect(service).toBeTruthy();
  }));
});
