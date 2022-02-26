import { TestBed } from '@angular/core/testing';

import { NotifyUserService } from './notify-user.service';

describe('NotifyUserService', () => {
  let service: NotifyUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotifyUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
