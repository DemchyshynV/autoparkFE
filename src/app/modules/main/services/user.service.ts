import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

import {IUser} from '../interfaces';
import {URL} from '../../../config';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private httpClient: HttpClient) {
  }

  getCurrentUser(): Observable<IUser> {
    return this.httpClient.get<IUser>(`${URL}/users/current`);
  }
}
