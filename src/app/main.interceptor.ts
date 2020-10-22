import {Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {Router} from '@angular/router';
import {catchError, filter, switchMap, take} from 'rxjs/operators';

import {AuthService} from './modules/auth/services';
import {IToken} from './modules/auth/interfaces';

@Injectable()
export class MainInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService, private router: Router) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isAuthenticated = this.authService.isAuthenticated();
    if (this.isRefreshing) {
      request = this.addToken(request, this.authService.getRefreshToken());
    } else if (isAuthenticated) {
      request = this.addToken(request, this.authService.getAccessToken());
    }
    return next.handle(request).pipe(catchError((res: HttpErrorResponse) => {
      if (res && res.error) {
        if (res instanceof HttpErrorResponse && res.status === 401) {
          return this.handle401Error(request, next);
        }
        console.log(res.error.detail);
      }
      if (res.status === 403) {
        this.isRefreshing = false;
        this.router.navigate(['login'], {
          queryParams: {
            sessionFiled: true
          }
        });
      }
    })) as any;
  }

  addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({setHeaders: {Authorization: `Bearer ${token}`}});
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): any {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((token: IToken) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token.access);
          return next.handle(this.addToken(request, token.access));
        })
      );
    }
    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(jwt => next.handle(this.addToken(request, jwt)))
    );
  }
}
