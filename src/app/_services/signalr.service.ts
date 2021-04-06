import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { AlertifyService } from './alertify.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  constructor(private alertifyService: AlertifyService, private authService: AuthService){}

  hubConnection: signalR.HubConnection;

  startConnection = () => {
    this.hubConnection = new signalR.HubConnectionBuilder()
    .withUrl('http://localhost:5000/mysignal', {
      skipNegotiation: true,
      transport: signalR.HttpTransportType.WebSockets //to avoid cors issues
    })
    .build();

    this.hubConnection.start().then(() => {
      console.log('Zapoceta konekcija...');
    })
    .catch(error => console.log('Doslo o greske pri uspostavljanju konekcije: '+error));
  }

  askServer(message: string) {
    this.hubConnection.invoke("askServer", message) //saljem argument string
    .catch(error => console.log("Greska kod invoke-a metode: "+error));
  }

  askServiceListener(){
    this.hubConnection.on("askServerResponse", (mess) => {
      if(this.authService.loggedIn()){
        this.alertifyService.message(mess);
      }
    })
  }
}
