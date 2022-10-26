import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl, Validators } from '@angular/forms';
import { UserProfileComponent } from '../../user-profile/user-profile.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { UserServiceService } from 'src/app/services/user-service.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm:FormGroup;
  loading:boolean = false;
  constructor(private fb:FormBuilder,private dialogRef: MatDialogRef<UserProfileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,private userService:UserServiceService) { }

  ngOnInit() {
    this.changePasswordForm = this.fb.group({
      userID:[""],
      oldPassword:[""],
      newPassword:["",[Validators.required,Validators.minLength(8)]],
      confirmPassword:["",Validators.required]
    },
    {
      validators: this.passwordConfirming
    })
  }
// Password checking
passwordConfirming(c: AbstractControl) { //: { invalid: boolean }

if (c.get('newPassword').value !== c.get('confirmPassword').value) {
c.get('confirmPassword').setErrors({ NoPassswordMatch: true });
//return { invalid: true };
}
return null;
}
closeTab(){
  this.dialogRef.close()
}
changePassword(){
  this.loading = true;
  let token = localStorage.getItem('token');
  let payLoad = {...this.changePasswordForm.value};
  payLoad.userID = this.data.userID
  delete payLoad.confirmPassword;
  this.userService.changePassword(payLoad,token).subscribe((posRes)=>{
    this.loading = false;
    this.dialogRef.close(posRes)
  },(err:HttpErrorResponse)=>{
    this.dialogRef.close()
    this.loading = false;
    if(err.error instanceof Error){
      console.log("CSE",err.message);
    }else{
      console.log("SSE",err.message);
    }
  })
  
}
}
