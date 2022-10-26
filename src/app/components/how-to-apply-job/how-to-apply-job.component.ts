import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-how-to-apply-job',
  templateUrl: './how-to-apply-job.component.html',
  styleUrls: ['./how-to-apply-job.component.css']
})
export class HowToApplyJobComponent implements OnInit {
user:any;
isLoggedIn:boolean = false;
  constructor(private loginService:LoginService, private router:Router) { }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('user'));
    this.isLoggedIn = this.user && this.user.userID ? true : false;
  }
  openPostJob(){
if(this.isLoggedIn){
this.router.navigateByUrl('/browsejobs')
}else{
  this.loginService.callLogin.next(true)
}
   }
}
