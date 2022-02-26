import { autoSpy } from 'autoSpy';
import { EMPTY, Observable, of, Subject } from 'rxjs';
import { BackendService, Ticket, User } from '../backend.service';
import { NotifyUserService } from '../notify-user.service';
import { subscribeInTest } from '../subscribe-in-test';
import { TicketListComponent } from './ticket-list.component';

describe('TicketListComponent', () => {
  it('when ngOnInit is called and ticketsVM$ subscribed to it should show the tickets', () => {
    // arrange
    const { build } = setup().default();
    const t = build();
    // act
    t.ngOnInit();
    const [tickets] = subscribeInTest(t.ticketsVM$);
    // assert
    expect(tickets).toEqual([{ id: 1, completed: false, description: 'test', assignee: 'me' }]);
  });


  it('when ngOnInit is called and ticketsVM$ subscribed to it should show the loading true while tickets are loading', () => {
    // arrange
    const tickets$ = new Subject<Ticket[]>();
    const { build } = setup().default().withTickets(tickets$);
    const t = build();
    // act
    t.ngOnInit();
    const loading = subscribeInTest(t.loading$, 2);
    // assert
    expect(loading).toEqual([true]);
    // act - users loaded
    tickets$.next([]);
    // assert now loading is false
    expect(loading).toEqual([true, false]);
  });

  it('when onToggleTicket is called it should call the update on backend service', () => {
    // arrange
    const { build, backend } = setup().default().withUpdateResponse().withTicketResponse();
    const t = build();
    t.ngOnInit();
    // act
    t.onToggleTicket(1);
    // assert
    expect(backend.update).toHaveBeenCalledTimes(1);
    expect(backend.update).toHaveBeenCalledWith(1, {completed: true});
  });

  it('when onToggleTicket is called it should toggle the updating ticket to true and back to false after update succeeds', () => {
    // arrange
    const u$ = new Subject<Partial<Ticket>>()
    const { build } = setup().default().withUpdateResponse(u$).withTicketResponse();
    const t = build();
    t.ngOnInit();
    // act
    t.onToggleTicket(1);
    // assert
    expect(t.updatingTicket[1]).toEqual(true);

    u$.next({})
    expect(t.updatingTicket[1]).toEqual(false);
  });

  it('when onToggleTicket is called but the ticket on server has been updated it should not toggle and notify user', () => {
    // arrange
    const u$ = new Subject<Partial<Ticket>>()
    const { build, backend, notify  } = setup().default().withUpdateResponse(u$).withTicketResponse(of({completed: true}));
    const t = build();
    t.ngOnInit();
    // act
    t.onToggleTicket(1);
    // assert
    expect(notify.error).toHaveBeenCalledWith('Seems this ticket has been modified elsewhere. Please refresh the app and try again.');
    expect(backend.update).not.toHaveBeenCalled();
  });
});

function setup() {
  const backend = autoSpy(BackendService);
  const notify = autoSpy(NotifyUserService);
  const builder = {
    backend,
    notify,
    default() {
      return builder.withTickets().withUsers();
    },
    build() {
      return new TicketListComponent(backend, notify);
    },
    withTickets(
      ts$: Observable<Partial<Ticket>[]> = of([{ id: 1, assigneeId: 1, description: 'test', completed: false }])
    ) {
      backend.tickets.and.returnValue(ts$);
      return builder;
    },
    withUsers(us$: Observable<Partial<User>[]> = of([{ id: 1, name: 'me' }])) {
      backend.users.and.returnValue(us$);
      return builder;
    },
    withUpdateResponse(r$: Observable<Partial<Ticket>> = of({ id: 1, assigneeId: 1, description: 'test', completed: false })) {
      backend.update.and.returnValue(r$);
      return builder;
    },
    withTicketResponse(r$: Observable<Partial<Ticket>> = of({ id: 1, assigneeId: 1, description: 'test', completed: false })) {
      backend.ticket.and.returnValue(r$);
      return builder;
    }
  };

  return builder;
}
