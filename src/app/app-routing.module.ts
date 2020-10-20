import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

const routes: Routes = [
  {path: '', loadChildren: () => import('./modules/auth/auth.module').then(value => value.AuthModule)},
  {path: 'main', loadChildren: () => import('./modules/main/main.module').then(value => value.MainModule)}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
