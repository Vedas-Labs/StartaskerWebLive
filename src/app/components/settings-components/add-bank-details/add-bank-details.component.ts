import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { JobsService } from 'src/app/services/jobs.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { UserProfileComponent } from '../../user-profile/user-profile.component';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-add-bank-details',
  templateUrl: './add-bank-details.component.html',
  styleUrls: ['./add-bank-details.component.css']
})
export class AddBankDetailsComponent implements OnInit {
  bankAccountForm:FormGroup
  loading:boolean = false;
  user:any;
  bankAccountDetails:any;
  constructor(private fb:FormBuilder,private jobService:JobsService,private dialogRef: MatDialogRef<UserProfileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,private loginService:LoginService) { }

  ngOnInit() {
    this.bankAccountForm = this.fb.group({
      userID : [""],
      Accountholdername:["",Validators.required],
      Accountnumber: ["",[Validators.required,Validators.pattern('[0-9]*')]],
      BSB: ["",Validators.required]
    })
    this.user = JSON.parse(localStorage.getItem('user'))
    if(this.user.BankAccountDetailes != null){
      this.bankAccountDetails = this.user.BankAccountDetailes
      this.bankAccountForm.patchValue({
        Accountholdername: this.bankAccountDetails.Accountholdername,
        Accountnumber: this.bankAccountDetails.Accountnumber,
        BSB : this.bankAccountDetails.BSB
      })
    }
  }

  sendBankDetails(){
    this.loading =  true;
  let formData = new FormData()
  formData.append('userID',this.data.userID);
  formData.append('Accountholdername',this.bankAccountForm.get('Accountholdername').value);
  formData.append('Accountnumber',this.bankAccountForm.get('Accountnumber').value);
  formData.append('BSB',this.bankAccountForm.get('BSB').value);
  let token = localStorage.getItem('token')
  this.jobService.updateBankAccount(formData,token).subscribe((posRes)=>{
    this.loading = false;
    this.dialogRef.close(posRes)
  },(err:HttpErrorResponse)=>{
    this.loading = false
    if(err.error instanceof Error){
      this.loading = false;
      console.log("CSE",err.message);
    }else{
      console.log("SSE",err.message);
    }
  })
  }
closeTab(){
  this.dialogRef.close()
}
}
