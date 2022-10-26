import { Component, OnInit, Inject } from "@angular/core";
import { RefferEarnComponent } from "../reffer-earn/reffer-earn.component";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { LoginService } from "src/app/services/login.service";
import { JobsService } from "src/app/services/jobs.service";

@Component({
  selector: "app-edit-refferal",
  templateUrl: "./edit-refferal.component.html",
  styleUrls: ["./edit-refferal.component.css"],
})
export class EditRefferalComponent implements OnInit {
  baseUrl: string = "";
  image: string;
  date: any;
  rawData: any;
  totalSubscribe: any;
  taskUserInfo: any;
  asPoster: boolean = false;
  earnData: any;
  constructor(
    private dialogRef: MatDialogRef<RefferEarnComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private loginService: LoginService,
    private jobService: JobsService
  ) {}

  ngOnInit() {
    this.baseUrl = this.loginService.baseUrl;
    this.rawData = this.data.jobData;
    this.earnData = this.data.earnData;
    this.asPoster = !this.earnData.isTaskar;
    this.getJobDetails();
    console.log(this.data);
  }

  closeTab() {
    this.dialogRef.close();
  }
  getJobDetails() {
    if (this.rawData && this.rawData.userInfo) {
      this.taskUserInfo = this.rawData.userInfo;
      if (this.taskUserInfo.profilePic != "") {
        this.image =
          "https://liveapi.startasker.com" + this.taskUserInfo.profilePic;
      }
    }
    if (this.rawData.budget.budgetType.Total == false) {
      let num: number = parseInt(this.rawData.budget.Hours);
      this.rawData.budget.budget = num * this.rawData.budget.pricePerHour;
    }
    this.date = new Date(this.rawData.postedDate * 1);
    //   this.loginService.showLoader.next(true);
    // // let token = localStorage.getItem('token')
    //   this.totalSubscribe = this.jobService.getMyTasks(obj).subscribe((posRes)=>{
    //     this.loginService.showLoader.next(false);
    //     if(posRes.response == 3){
    //       this.rawData = posRes.jobsData[0];
    //      this.loginService.showLoader.next(false);
    //       if(this.rawData && this.rawData.userInfo){
    //         this.taskUserInfo = this.rawData.userInfo;
    //         if(this.taskUserInfo.profilePic != ""){
    //           this.image = "https://liveapi.startasker.com"+this.taskUserInfo.profilePic
    //         }
    //       }
    //       if(this.rawData.budget.budgetType.Total == false){
    //         let num:number = parseInt(this.rawData.budget.Hours)
    //         this.rawData.budget.budget = num * this.rawData.budget.pricePerHour;
    //       }
    //  this.date = new Date(posRes.jobsData[0].postedDate * 1);
    //     }else{
    //       alert(posRes.message)
    //     }
    //   },(err)=>{
    //     this.loginService.showLoader.next(false);
    //     alert("Server Failure please try after few minutes")
    //     console.log("Error",err);

    //   })
  }
  submit() {
    this.dialogRef.close();
  }
}
