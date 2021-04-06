import { Component, OnDestroy } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthService } from './_services/auth.service';
import { Employee } from './_model/employee';
import { AlertifyService } from './_services/alertify.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SignalRService } from './_services/signalr.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy{
  title = 'FPIS-SPA';
  jwtHelper = new JwtHelperService();

  constructor(private authService: AuthService, public signalRService: SignalRService) {}

  ngOnInit() {
    this.signalRService.startConnection();

    // setTimeout(() => {
      this.signalRService.askServiceListener();
      // this.signalRService.askServer("neki projekat");
    // }, 2000);
    const token = localStorage.getItem('token');
    if (token) {
      this.authService.decodedToken = this.jwtHelper.decodeToken(token);
      const employee: Employee = JSON.parse(localStorage.getItem('employee'));
      if(employee) {
        this.authService.employee = employee;
        // this.signalRService.askServiceListener();
      }
    }
  }

  ngOnDestroy(){
    this.signalRService.hubConnection.off("askServerResponse");
  }

  loggedIn() {
    return this.authService.loggedIn();
  }
}
