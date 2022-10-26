import { Component, OnInit, Inject } from '@angular/core';
import { LoginComponent } from '../login/login.component';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-set-password',
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.css']
})
export class SetPasswordComponent implements OnInit {
  id:any;
  message:string;
  constructor(private dialogRef: MatDialogRef<LoginComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,private loginService:LoginService,private snackBar:MatSnackBar) { }

  ngOnInit() {
    this.id = this.data.userID;
    this.message = this.data.message;
  }
close(){
  this.dialogRef.close(false)
}
   //message alerts showing
   openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
       duration: 3000,
       panelClass:"bg-danger"
    });
  }
submit(){
  let userId = {
    userID : this.id
  }
  this.loginService.forgotPassword(userId).subscribe((posRes)=>{
    console.log("PosRes",posRes);
    
    if(posRes.response === 3){
      localStorage.setItem('userID',this.id)
      this.openSnackBar(posRes.message,"")
      this.dialogRef.close(true)
      this.loginService.gotOtp.next(true)
this.loginService.callForgotPass.next(true)
    }else{
      alert(posRes.message)
    }
  },(err)=>{
    console.log("Err",err);
  })
}

}
