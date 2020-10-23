import {Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import {catchError, switchMap} from 'rxjs/operators';

import {AuthService} from './modules/auth/services';
import {IToken} from './modules/auth/interfaces';

@Injectable()
export class MainInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private router: Router) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isAuthenticated = this.authService.isAuthenticated(); // определяем есть ли у нас access токен в localstorage
    if (isAuthenticated) { // если есть то сетаем его в header
      request = this.addToken(request, this.authService.getAccessToken());
    }
    return next.handle(request).pipe(catchError((res: HttpErrorResponse) => { // отсылаем реквест на сервер попутно отслеживаем ошибки
      if (res && res.error) {
        if (res instanceof HttpErrorResponse && res.status === 401) {
          return this.handle401Error(request, next); // если 401 ошибка переходим в метод обработки ошибки
        }
        console.log(res.error.detail);
      }
      if (res.status === 403) { // если 403 ошибка переходим на страницу логинации
        this.router.navigate(['login'], {
          queryParams: {
            sessionFiled: true
          }
        });
      }
    })) as any;
  }

  addToken(request: HttpRequest<any>, token: string): HttpRequest<any> { // метод для добавления в request header с токеном
    return request.clone({setHeaders: {Authorization: `Bearer ${token}`}});
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): any { // метод для обработки 401 ошибки
    return this.authService.refreshToken().pipe( // отсылаем запрос на бек на рефреш
      switchMap((token: IToken) => {
        return next.handle(this.addToken(request, token.access)); // передаем дальше реквест с новым accessToken
      })
    );
  }
}
