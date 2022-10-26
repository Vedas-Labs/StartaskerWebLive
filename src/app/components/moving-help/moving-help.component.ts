import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-moving-help',
  templateUrl: './moving-help.component.html',
  styleUrls: ['./moving-help.component.css']
})
export class MovingHelpComponent implements OnInit {

  constructor(private loginService:LoginService) { }

  ngOnInit() {
  }
  openPostJob(){
    this.loginService.callPostJob.next(true) 
   }
}
