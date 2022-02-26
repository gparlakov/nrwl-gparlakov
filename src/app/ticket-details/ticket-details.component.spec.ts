import { ActivatedRoute, ParamMap, convertToParamMap } from '@angular/router';
import { BackendService } from '../backend.service';
import { TicketDetailsComponent } from './ticket-details.component';
import { autoSpy } from 'autoSpy';
import { BehaviorSubject, ReplaySubject } from 'rxjs';

describe('TicketDetailsComponent', () => {
  it('when ngOnInit is called it should', () => {
    // arrange
    const { build } = setup().default();
    const t = build();
    // act
    t.ngOnInit();
    // assert
    // expect(t).toEqual
  });
});

function setup() {
  const paramMap$ = new BehaviorSubject<ParamMap>(convertToParamMap({}));
  const route = autoSpy(ActivatedRoute, { paramMap: paramMap$ });
  const backend = autoSpy(BackendService);
  const builder = {
    route,
    backend,
    default() {
      return builder;
    },
    build() {
      return new TicketDetailsComponent(route, backend);
    },
  };

  return builder;
}
