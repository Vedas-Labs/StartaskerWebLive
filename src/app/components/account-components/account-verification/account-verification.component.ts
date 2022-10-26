import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserServiceService } from 'src/app/services/user-service.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { AccountVerifyStatusComponent } from '../account-verify-status/account-verify-status.component';

@Component({
  selector: 'app-account-verification',
  templateUrl: './account-verification.component.html',
  styleUrls: ['./account-verification.component.css']
})
export class AccountVerificationComponent implements OnInit {
  isMalasiayan: boolean = true;
  nationality: string = "Malasian"
  category: Array<any> = [];
  id: any = "../../../assets/Add.png";
  selfie: any = "../../../assets/Add.png";
  isIDUploaded: boolean = false;
  isSelfieUploaded: boolean = false;
  user: any;
  accountData:any;
  isSubmited: boolean = false;
  isVerified:boolean = false;
  accountVerificationForm: FormGroup;
  isLoggedIn: boolean = false;
  baseUrl:string =""
  constructor(private loginService: LoginService, private fb: FormBuilder, private router: Router, private userService: UserServiceService,
    private snackBar: MatSnackBar, private dialog: MatDialog, private http: HttpClient) { }

  ngOnInit() {
    this.baseUrl = this.userService.baseUrl;
    this.category = ["Mykad", "Passport", "Driving lisence", "Others"];
    this.user = JSON.parse(localStorage.getItem('user'));
    if (this.user == null) {
      this.router.navigateByUrl('/home')
    } else {
      this.isLoggedIn = true;
      if(this.user.accountVerificationStatus == "Unverified"){
        this.fetchData()
      }else{
        this.isSubmited = true;
        this.getAccountVerifyDetails()
      }
    }
    this.accountVerificationForm = this.fb.group({
      IDPhoto: ["", Validators.required],
      profilePhoto: ["", Validators.required],
      isCheck: ["", [Validators.requiredTrue]],
      verificationData: this.fb.group({
        userID: [""],
        Nationality: ["Malasia"],
        IDType: ["Mykad"],
        Email: [""],
        DOB: [""],
        Address: ["Anantapur"],
        PostCode: ["515004"],
        City: ["Anantapur"],
        State: ["Andhra Pradesh"],
        CountryRegion: ["India"],
        phoneNumber: [""],
        firstName: [""],
        lastName: [""]
      })
    })
  }
  getAccountVerifyDetails(){
    let obj = {
      userID : this.user.userID
    }
    let token = localStorage.getItem('token');
    this.userService.accountVerifyfetch(obj,token).subscribe((posRes)=>{
      if(posRes.response == 3){
        console.log(posRes.accountData);
        this.accountData = posRes.accountData;
        this.id = this.baseUrl+this.accountData.IDPhoto;
        this.selfie = this.baseUrl+this.accountData.profilePhoto;
        this.isMalasiayan = this.accountData.Nationality == "Malasia"? true : false;
        this.accountVerificationForm.patchValue({
          verificationData: {
            userID: this.accountData.userID,
            Email: this.accountData.userID,
            DOB: this.accountData.DOB,
            phoneNumber: this.accountData.phoneNumber,
            firstName: this.accountData.firstName,
            lastName: this.accountData.lastName,
            IDType: this.accountData.IDType
          }
        });
        if(this.accountData.isVerified == "Pending"){
          this.openStatus("Pending")
       }else if(this.accountData.isVerified == "Verified"){
         this.isVerified = true;
         this.accountVerificationForm.patchValue({
           isCheck : true
         })
        this.openStatus("Verified")
       }else{
        this.openStatus("Rejected")
       }
      }
    },(err:HttpErrorResponse)=>{
      if(err.error instanceof Error){
        console.warn("Error",err.error)
      }else{
        console.warn("Server Error",err.error)
      }
    })
  }
  takeID(event) {
    let file = event.target.files[0]
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.id = reader.result;
      this.isIDUploaded = true;
      this.accountVerificationForm.get('IDPhoto').setValue(file)
    }
  }
  takeSelfie(event) {
    let file = event.target.files[0]
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.selfie = reader.result;
      this.isSelfieUploaded = true;
      this.accountVerificationForm.get('profilePhoto').setValue(file)
    }
  }
  //message alerts showing
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: "red-snackbar",
      verticalPosition: 'top'
    });
  }
  fetchData() {
    if (this.isLoggedIn == true) {
      this.loginService.showLoader.next(true);
      let id = { "userID": this.user.userID }
      this.loginService.fetchUserDetails(id).subscribe((posRes) => {
        if (posRes.response == 3) {
          this.loginService.showLoader.next(false);
          localStorage.setItem('user', JSON.stringify(posRes.customerInfo[0]))
          this.user = posRes.customerInfo[0];
          if(this.user.accountVerificationStatus == "Unverified"){
            this.setValues(posRes.customerInfo[0]);
          }
        } else {
          this.loginService.showLoader.next(false);
        }
      }, (err: HttpErrorResponse) => {
        this.loginService.showLoader.next(false);
        if (err.error instanceof Error) {
          console.log("CSE", err.message);
        } else {
          console.log("SSE", err.message);
        }
      })
    }
  }
  setValues(info) {
    this.accountVerificationForm.patchValue({
      verificationData: {
        userID: info.userID,
        Email: info.userID,
        DOB: info.dob,
        phoneNumber: info.phoneNumber,
        firstName: info.firstName,
        lastName: info.lastName
      }
    })
  }
  openStatus(status){
    let progress = {
      progress : status
    }
    let dialogRef = this.dialog.open(AccountVerifyStatusComponent, {
      panelClass: 'col-md-4',
      hasBackdrop: true,
      disableClose: true,
      data: progress
    })
    dialogRef.afterClosed().subscribe(res=>{
      this.fetchData()
      if(res.retry){
        this.isSubmited = false;
    this.http.get(this.id, { responseType: "blob" }).subscribe((data) => {
      let file = new File([data], "identity.jpg");
      this.accountVerificationForm.get('IDPhoto').setValue(file)
    })
    this.http.get(this.selfie, { responseType: "blob" }).subscribe((data) => {
      let file = new File([data], "selfie.jpg");
      this.accountVerificationForm.get('profilePhoto').setValue(file)
    })
      }
    })
  }
  verify() {
    if (this.accountVerificationForm.valid) {
      this.loginService.showLoader.next(true);
      if (!this.isMalasiayan) {
        this.accountVerificationForm.patchValue({
          verificationData: {
            Nationality: "Foreigner"
          }
        })
      } else {
        this.accountVerificationForm.patchValue({
          verificationData: {
            Nationality: "Malasia"
          }
        })
      }
      let payLoad = { ...this.accountVerificationForm.value }
      delete payLoad.isCheck;
      let formData = new FormData();
      formData.append("IDPhoto", payLoad.IDPhoto);
      formData.append("profilePhoto", payLoad.profilePhoto);
      formData.append("verificationData", JSON.stringify(payLoad.verificationData))
      let token = localStorage.getItem('token');
      this.userService.verifyAccount(formData, token).subscribe((posRes) => {
        this.loginService.showLoader.next(false);
        if (posRes.response == 3) {
          this.isSubmited = true;
          this.openStatus("submited")
        } else {
          this.openSnackBar(posRes.message, "")
        }
      }, (err: HttpErrorResponse) => {
        this.loginService.showLoader.next(false);
        if (err.error instanceof Error) {
          console.warn("Error", err.message);
        } else {
          console.warn("Error", err.message);
        }
      })
    } else {
      if (this.accountVerificationForm.get('IDPhoto').invalid) {
        this.openSnackBar("Upload your Id Proof", "")
      } else if (this.accountVerificationForm.get('profilePhoto').invalid) {
        this.openSnackBar("Upload your Selfie Pic..", "")
      } else {
        this.openSnackBar("Accept our Terms & Conditions..", "")
      }
    }
  }
}
