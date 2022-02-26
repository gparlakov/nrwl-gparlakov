import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { BackendService, Ticket } from '../backend.service';
import { ticketIdParam } from '../ticket';

@Component({
  selector: 'app-ticket-details',
  templateUrl: './ticket-details.component.html',
  styleUrls: ['./ticket-details.component.css']
})
export class TicketDetailsComponent implements OnInit {

  ticket$: Observable<Ticket>;

  constructor(route: ActivatedRoute, backend: BackendService) {
    this.ticket$ = route.paramMap.pipe(
      map(params => params.get(ticketIdParam)),
      filter(id => isNumber(parseInt(id))),
      switchMap((id: string) => backend.ticket(parseInt(id)))
    )
  }

  ngOnInit(): void {
  }

}

function isNumber(o: Object): o is number {
  return o != null && typeof o === 'number';
}
