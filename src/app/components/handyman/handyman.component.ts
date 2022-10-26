import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-handyman',
  templateUrl: './handyman.component.html',
  styleUrls: ['./handyman.component.css']
})
export class HandymanComponent implements OnInit {

  constructor(private loginService:LoginService) { }

  ngOnInit() {
  }
  openPostJob(){
    this.loginService.callPostJob.next(true) 
   }
}
