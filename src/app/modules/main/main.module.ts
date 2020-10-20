import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {MainRoutingModule} from './main-routing.module';
import {UserService} from './services';
import {MainComponent} from './components/main/main.component';


@NgModule({
  declarations: [MainComponent],
  imports: [
    CommonModule,
    MainRoutingModule,
  ],
  providers: [UserService]
})
export class MainModule {
}
