import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotifyUserService {
  error(message: string) {
    alert(message);
  }

  constructor() { }
}
