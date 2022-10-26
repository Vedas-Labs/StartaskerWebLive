import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { HeaderComponent } from '../header/header.component';
import { LoginService } from 'src/app/services/login.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.css']
})
export class ForgotpasswordComponent implements OnInit {
  forgotForm:FormGroup;
  otpForm:FormGroup;
  newPasswordForm:FormGroup;
  loading:boolean = false;
  heading:string = "Forgot Password"
  showForgotScreen:boolean = true;
  showOtpScreen:boolean = false;
  showNewPasswordScreen:boolean
  userId:string;
  constructor(private fb:FormBuilder,private dialogRef: MatDialogRef<HeaderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,private loginService:LoginService,private snackBar:MatSnackBar) {
      this.loginService.gotOtp.subscribe(val=>{
        if(val == true){
          this.showForgotScreen = false;
          this.showOtpScreen = true;
          this.heading = "Verification"
          this.userId = localStorage.getItem('userID')
        }
      })
     }

  ngOnInit() {
    this.forgotForm = this.fb.group({
      userID :["",[Validators.required,Validators.email]],
      isReSendOtp:[false]
    })
    this.otpForm = this.fb.group({
      userID:[""],
      otp:["",[Validators.required,Validators.pattern(/^\+?\d+$/)]]
    })
    this.newPasswordForm = this.fb.group({
      userID:[""],
      password:["",Validators.required],
      confirmPassword:["",Validators.required]
    },
    {validators : this.passwordConfirming})
  }
  passwordConfirming(c: AbstractControl) { //: { invalid: boolean }

if (c.get('password').value !== c.get('confirmPassword').value) {
c.get('confirmPassword').setErrors({ NoPassswordMatch: true });
//return { invalid: true };
}
}
// Snackbar Messages
openSnackBar(message: string, action: string) {
  this.snackBar.open(message, action, {
     duration: 3000,
     panelClass:"red-snackbar"
  });
}
closeTab(){
  this.dialogRef.close()
}
  sendEmail(){
    if(this.forgotForm.valid){
      this.loading = true;
      this.loginService.forgotPassword(this.forgotForm.value).subscribe((posRes)=>{
        console.log("PosRes",posRes);
        
        if(posRes.response === 3){
          this.loading = false
          this.showForgotScreen = false;
          this.showOtpScreen = true;
          this.heading = "Verification"
          this.userId = this.forgotForm.value.userID
          this.openSnackBar(posRes.message,"")
        }else{
          this.loading = false
          this.openSnackBar(posRes.message,"")
        }
      },(err)=>{
        this.loading = false
        console.log("Err",err);
      })
    }else{
      this.openSnackBar("Enter Valid Email","")
    }
  }
  resendOtp(){
    let id= {
      userID : this.userId,
      isReSendOtp: true
    }
    this.loginService.forgotPassword(id).subscribe((posRes)=>{
      if(posRes.response == 3){
        this.showOtpScreen = true;
        this.heading = "Verification"
        this.openSnackBar(posRes.message,"")
      }else{
        this.openSnackBar(posRes.message,"")
      }
    },(err:HttpErrorResponse)=>{
      if(err.error instanceof Error){
        console.log("CSE",err);
      }else{
        console.log("SSE",err);
        
      }
    })
  }
  sendOtp(){
    this.otpForm.patchValue({
      userID:this.userId
    })
    if(this.otpForm.valid){
      this.loading = true;
      this.loginService.verify(this.otpForm.value).subscribe((posRes)=>{
        if(posRes.response == 3){
          this.loading = false;
          this.openSnackBar(posRes.message,"")
          this.showNewPasswordScreen = true;
          this.showOtpScreen = false;
          this.heading = "New Password"
        }else{
          this.loading = false;
          this.openSnackBar(posRes.message,"")
        }
      },(err:HttpErrorResponse)=>{
        this.openSnackBar(err.message,"")
      })
    }else{
      console.log("Value of otp",this.otpForm.value);
    }
  }
  sendNewPass(){
    this.newPasswordForm.patchValue({
      userID:this.userId
    })
    let payLoad = {...this.newPasswordForm.value};
    delete payLoad.confirmPassword
    console.log("New Pass",payLoad);
    if(this.newPasswordForm.valid){
      this.loginService.resetPassword(payLoad).subscribe((posRes)=>{
        if(posRes.response == 3){
          this.openSnackBar(posRes.message,"")
          this.dialogRef.close()
        }else{
          this.openSnackBar(posRes.message,"")
        }
      },(err:HttpErrorResponse)=>{
        if(err.error instanceof Error){
          console.log("CSE",err);
          
        }else{
          console.log("SSE",err);
          
        }
        
      })
    }
  }
}
