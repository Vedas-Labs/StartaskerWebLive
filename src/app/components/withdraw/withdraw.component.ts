import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { BookingDetailsComponent } from '../booking-details/booking-details.component';
import { UserServiceService } from 'src/app/services/user-service.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-withdraw',
  templateUrl: './withdraw.component.html',
  styleUrls: ['./withdraw.component.css']
})
export class WithdrawComponent implements OnInit {
message:string = '';
reasonForm:FormGroup;
isFromBookings:boolean = false;
  constructor(private dialogRef: MatDialogRef<BookingDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private userService:UserServiceService, private fb:FormBuilder) { }

  ngOnInit() {
    this.reasonForm = this.fb.group({
      reason:["",Validators.required],
      withdraw:[""]
    })
    this.message = this.data.message;
  }
  close(){
    if(!this.data.isTaskWithdraw){
      this.reasonForm.patchValue({
        withdraw: false
      })
      this.dialogRef.close(this.reasonForm.value)
    }else{
      this.dialogRef.close(false)
    }
  }
  submit(){
   if(!this.data.isTaskWithdraw){
    this.reasonForm.patchValue({
      withdraw: true
    })
    this.dialogRef.close(this.reasonForm.value)
  }else{
    this.dialogRef.close(true)
  } 
  }
}
