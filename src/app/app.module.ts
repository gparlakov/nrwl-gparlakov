import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { BackendService } from './backend.service';
import { TicketListComponent } from './ticket-list/ticket-list.component';
import { TicketDetailsComponent } from './ticket-details/ticket-details.component';
import { ticketIdParam } from './ticket';

@NgModule({
  declarations: [AppComponent, TicketDetailsComponent, TicketListComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      {
        path: '',
        component: TicketListComponent,
      },
      { path: `:${ticketIdParam}`, component: TicketDetailsComponent }
    ]),
  ],
  providers: [BackendService],
  bootstrap: [AppComponent],
})
export class AppModule {}
