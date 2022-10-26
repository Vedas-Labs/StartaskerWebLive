import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { TaskAlerDialogeComponent } from '../task-aler-dialoge/task-aler-dialoge.component';
import { UserServiceService } from 'src/app/services/user-service.service';
import { HttpErrorResponse } from '@angular/common/http';
import { LoginService } from 'src/app/services/login.service';
import { JobsService } from 'src/app/services/jobs.service';

@Component({
  selector: 'app-task-alert',
  templateUrl: './task-alert.component.html',
  styleUrls: ['./task-alert.component.css']
})
export class TaskAlertComponent implements OnInit {
alertSettings:any;
customAlerts:Array<any> = [];
isChecked:boolean = false;
category:any;
  constructor(private dialog:MatDialog, private userService:UserServiceService, 
    private snackBar:MatSnackBar, private loginService:LoginService, private jobsService:JobsService) { }
user:any;
  ngOnInit() {
    this.getdetails()
    this.browseCategory()
  }
  // Browse Category
  browseCategory(){
    this.loginService.showLoader.next(true);
    this.jobsService.browseCategory().subscribe((posRes)=>{
      if(posRes.response == 3){
        this.category = posRes.categoriesList;
        this.loginService.showLoader.next(false);
      }else{
        this.loginService.showLoader.next(false);
      }
    },(err:HttpErrorResponse)=>{
      this.loginService.showLoader.next(false);
      this.openSnackBar("Server Failure please try after few minutes","")
      if(err.error instanceof Error){
        console.warn("CSE",err.message);
      }else{
        console.warn("SSE",err.message);
        
      }
    })
  }
getdetails(){
  this.user = JSON.parse(localStorage.getItem('user'));
    this.alertSettings = this.user.Settings[0].taskAlerts;
    this.customAlerts = this.alertSettings.customAlerts;
    this.isChecked = this.alertSettings.alerts;
    console.log("Custom Alerts",this.customAlerts);
}
  openCustomAlert(){
    let payLoad = {
      userID: this.user.userID,
      isUpdate: false,
      Category: this.category
    }
    let dailogRef = this.dialog.open(TaskAlerDialogeComponent, {
      panelClass: 'col-md-4',
      hasBackdrop: true,
      disableClose: true,
      data : payLoad
    })
    dailogRef.afterClosed().subscribe(res=>{
      if(res != undefined){
       if(res.response == 3){
         this.fetchUserData()
         this.openSnackBar(res.message,"")
       }else{ 
         this.openSnackBar(res.message,"")
       }
      }
     })
  }
  updateAlert(details){
    let payLoad = {
      userID: this.user.userID,
      isUpdate: true,
      alertData: details,
      Category: this.category
    }
    let dailogRef = this.dialog.open(TaskAlerDialogeComponent, {
      panelClass: 'col-md-4',
      hasBackdrop: true,
      disableClose: true,
      data : payLoad
    })
    dailogRef.afterClosed().subscribe(res=>{
      if(res != undefined){
       if(res.response == 3){
         this.fetchUserData()
         this.openSnackBar(res.message,"")
       }else{ 
         this.openSnackBar(res.message,"")
       }
      }
     })

  }
     //message alerts showing
 openSnackBar(message: string, action: string) {
  this.snackBar.open(message, action, {
     duration: 3000,
     panelClass:"red-snackbar"
     
  });
}
  turnOnAlerts(event){
    let alertObj = {
      userID: this.user.userID,
      taskAlert:""+ event.checked
    }
    this.isChecked = event.checked
    let token = localStorage.getItem('token')
    this.userService.taskAlert(alertObj,token).subscribe((posRes)=>{
      if(posRes.response == 3){
        this.fetchUserData()
        this.openSnackBar(posRes.message,"")
      }else{
        this.openSnackBar(posRes.message,"")
      }
    },(err:HttpErrorResponse)=>{
      if(err.error instanceof Error){
        console.log("CSE",err.message);
      }else{
        console.log("sSE",err.message); 
      }
    })    
  }
  deleteTask(alert){
    let obj = {
      userID: this.user.userID,
      alertID: alert.alertID
    }
    let token = localStorage.getItem('token')
    this.userService.deleteCustomTaskAlert(obj,token).subscribe((posRes)=>{
      if(posRes.response == 3){
        this.fetchUserData()
        this.openSnackBar(posRes.message,"")
      }else{
        this.openSnackBar(posRes.message,"")
      }
    },(err:HttpErrorResponse)=>{
      if(err.error instanceof Error){
        console.log("CSE",err.message);
      }else{
        console.log("sSE",err.message); 
      }
    }) 
  }
  fetchUserData(){
    let id={"userID": this.user.userID}
    this.loginService.fetchUserDetails(id).subscribe((posRes)=>{
      if(posRes.response == 3){
       localStorage.setItem('user',JSON.stringify(posRes.customerInfo[0]))
       this.getdetails()
       this.userService.user = posRes.customerInfo[0];
      }
    },(err:HttpErrorResponse)=>{
      if(err.error instanceof Error){
        console.log("Client Side Error",err.message);
      }else{
        console.log("Server Side Error",err.message);
      }
    })
  }
}
