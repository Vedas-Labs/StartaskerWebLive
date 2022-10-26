import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-how-to-post-job',
  templateUrl: './how-to-post-job.component.html',
  styleUrls: ['./how-to-post-job.component.css']
})
export class HowToPostJobComponent implements OnInit {

  constructor(private loginService:LoginService) { }

  ngOnInit() {
  }
  openPostJob(){
    this.loginService.callPostJob.next(true) 
   }
}
