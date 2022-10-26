import { Component, OnInit, Inject } from '@angular/core';
import { MyTaskDetailsComponent } from '../../my-task-details/my-task-details.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-payment-status',
  templateUrl: './payment-status.component.html',
  styleUrls: ['./payment-status.component.css']
})
export class PaymentStatusComponent implements OnInit {
isSuccess:boolean = false;
imgPath:string;
  constructor(private dialogRef: MatDialogRef<MyTaskDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    if(this.data.isSuccess){
      this.imgPath = "assets/ticked.png"
      this.isSuccess = true;
      setTimeout(()=>{
        this.closeTab()
      },3000)
    }else{
      this.imgPath = "assets/paymentcancel.png"
      this.isSuccess = false;
      setTimeout(()=>{
        this.closeTab()
      },3000)
    }
  }
  closeTab(){
let obj = {
  retry : false
}
this.dialogRef.close(obj)
  }
  retryPayment(){
    let obj = {
      retry : true
    }
    this.dialogRef.close(obj);
  }
}
