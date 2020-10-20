import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {AuthService} from '../../../services';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  error: any;

  constructor(private authService: AuthService, private router: Router) {
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      username: new FormControl(''),
      password: new FormControl('')
    });
  }

  login(form: FormGroup): void {
    this.authService.login(form.getRawValue()).subscribe(() => {
      this.router.navigate(['main']);
    }, error => this.error = error.error);
  }
}
