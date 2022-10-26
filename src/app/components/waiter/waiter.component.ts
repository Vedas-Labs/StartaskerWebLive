import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-waiter',
  templateUrl: './waiter.component.html',
  styleUrls: ['./waiter.component.css']
})
export class WaiterComponent implements OnInit {

  constructor(private loginService:LoginService) { }

  ngOnInit() {
  }
  openPostJob(){
    this.loginService.callPostJob.next(true) 
   }
}
