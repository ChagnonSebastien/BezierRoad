import { TestBed, inject } from '@angular/core/testing';

import { CameraControlService } from './camera-control.service';

describe('CameraControlService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CameraControlService]
    });
  });

  it('should be created', inject([CameraControlService], (service: CameraControlService) => {
    expect(service).toBeTruthy();
  }));
});
