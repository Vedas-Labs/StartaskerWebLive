import { Component, OnInit } from '@angular/core';
import { MyTaskDetailsComponent } from '../my-task-details/my-task-details.component';
import { MatDialogRef } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-cancel',
  templateUrl: './cancel.component.html',
  styleUrls: ['./cancel.component.css']
})
export class CancelComponent implements OnInit {
  reasonForm:FormGroup;
  reasons:Array<any> = [];
  defaultSelected:number;
  isOthersSelected:boolean = false;
  constructor(private dialogRef: MatDialogRef<MyTaskDetailsComponent>, private fb:FormBuilder) { }

  ngOnInit() {
    this.reasons = [
      "I miswrote the task details.",
      "My order need to be confirmed again.",
      "All the workers who applied my task doesn’t fulfill my requirement.",
      "No worker apply my task.",
      "The price from workers are not acceptable.",
      "Others"
    ]
this.reasonForm = this.fb.group({
  reason :["",Validators.required]
})
  }
close(){
  let obj ={
    reason : "",
    isReason : false
  }
  this.dialogRef.close(obj)
}
submit(){
  let obj ={
    reason : this.reasonForm.get('reason').value,
    isReason : true
  }
   this.dialogRef.close(obj)
}
selectedReason(reason){
if(reason != "Others"){
  this.isOthersSelected = false;
  this.reasonForm.get('reason').setValue(reason)
}else{
  this.isOthersSelected = true;
  this.reasonForm.get('reason').setValue(null)
}
}
}
