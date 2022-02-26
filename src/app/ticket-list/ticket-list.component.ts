import { Component, OnInit } from '@angular/core';
import { combineLatest, merge, Observable, of, ReplaySubject } from 'rxjs';
import { distinctUntilChanged, map, mapTo, skip, switchMap, take, tap } from 'rxjs/operators';
import { BackendService } from '../backend.service';
import { NotifyUserService } from '../notify-user.service';

type TicketViewModel = {
  id: number;
  completed: boolean;
  description: string;
  assignee: string;
};

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.css'],
})
export class TicketListComponent implements OnInit {
  refresh$ = new ReplaySubject(1);

  tickets$ = this.refresh$.pipe(switchMap(() => this.backend.tickets()));
  users$ = this.refresh$.pipe(switchMap(() => this.backend.users()));
  updatingTicket: Record<number, boolean> = {};

  ticketsVM$: Observable<TicketViewModel[]> = combineLatest([this.tickets$, this.users$]).pipe(
    map(([ts, us]) =>
      ts.map((t) => ({
        id: t.id,
        completed: t.completed,
        description: t.description,
        assignee: us.some((u) => u.id === t.assigneeId) ? us.find((u) => u.id === t.assigneeId).name : 'unassigned',
      }))
    )
  );

  loading$ = merge(of(true), this.ticketsVM$.pipe(mapTo(false))).pipe(distinctUntilChanged());

  constructor(private backend: BackendService, private notify: NotifyUserService) {}

  ngOnInit(): void {
    this.refresh$.next();
  }

  onToggleTicket(id: number): void {
    if (!this.updatingTicket[id]) {
      this.updatingTicket[id] = true;

      // get the latest ticket info from be
      combineLatest([this.tickets$.pipe(take(1)), this.backend.ticket(id).pipe(take(1))])
        .pipe(
          switchMap(([ticketsOnClient, ticketOnServer]) => {
            const ticketOnClient = ticketsOnClient.find((t) => t.id === id);
            if (ticketOnServer == null || ticketOnClient == null) {
              this.notify.error('It looks like this ticket has been deleted. Please refresh the app and try again.');

              return of('no action');
            } else if (ticketOnClient.completed !== ticketOnServer.completed) {
              this.notify.error('Seems this ticket has been modified elsewhere. Please refresh the app and try again.');

              return of('no action');
            }

            return this.backend.update(id, { completed: !ticketOnServer.completed }).pipe(
              take(1),
              tap(() => {
                this.refresh$.next();
              }),

              switchMap(
                // when the next batch arrives - stop the update (below)
                () => this.ticketsVM$.pipe( take(1))
              )
            );
          })
        )
        .subscribe(() => {
          this.updatingTicket[id] = false;
        });
    }
  }
}
