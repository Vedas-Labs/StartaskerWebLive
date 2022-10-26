import { Component, OnInit } from '@angular/core';
import { UserServiceService } from 'src/app/services/user-service.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
userId:string = "";
mobileNumber:string = ""
user:any;
notifications:any;
  constructor(private userService:UserServiceService, private snackBar:MatSnackBar,private loginService:LoginService) { }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('user'));
    console.log(this.user);
    this.notifications = this.user.Settings[0].notifications
    
  }
    //message alerts showing
 openSnackBar(message: string, action: string) {
  this.snackBar.open(message, action, {
     duration: 3000,
     panelClass:"red-snackbar"
  });
}
  addNotifications(){
    let obj ={
      userID :this.user.userID,
      helpfullInfo:{
        Email : ""+ this.notifications.helpfullInfo.Email,
        Push :  ""+ this.notifications.helpfullInfo.Push
      },
      startaskerAlerts:{
        Email : ""+ this.notifications.startaskerAlerts.Email,
        Push :  ""+ this.notifications.startaskerAlerts.Push
      },
      taskRecommendations:{
        Email : ""+ this.notifications.taskRecommendations.Email,
        Push :  ""+ this.notifications.taskRecommendations.Push
      },
      taskReminders:{
        Email : ""+ this.notifications.taskReminders.Email,
        Push :  ""+ this.notifications.taskReminders.Push
      },
      taskUpdates:{
        Email : ""+ this.notifications.taskUpdates.Email,
        Push : ""+ this.notifications.taskUpdates.Push
      },
      transactional:{
        Email : ""+ this.notifications.transactional.Email,
        Push :  ""+ this.notifications.transactional.Push
      },
      updateNewsletters:{
        Email : ""+ this.notifications.updateNewsletters.Email,
        Push :  ""+ this.notifications.updateNewsletters.Push
      }
    }
    let token = localStorage.getItem('token')
    this.loginService.showLoader.next(true);
    this.userService.notificationSettings(obj,token).subscribe((posRes)=>{
      this.loginService.showLoader.next(false);
      if(posRes.response == 3){
        this.openSnackBar(posRes.message,"")
      }else{
        this.openSnackBar(posRes.message,"")
      }
    },(err:HttpErrorResponse)=>{
      this.loginService.showLoader.next(false);
      if(err.error instanceof Error){
        console.log("CSE",err.message);
      }else{
        console.log("SSE",err.message);
      }
    })

    
  }
}
