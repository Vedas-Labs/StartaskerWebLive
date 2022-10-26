import { Component, OnInit, Inject } from '@angular/core';
import { PaymentDialogComponent } from '../payment-dialog/payment-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-coupon',
  templateUrl: './coupon.component.html',
  styleUrls: ['./coupon.component.css']
})
export class CouponComponent implements OnInit {
coupounCode:any = "";
coupons:Array<any> = []
  constructor(private dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,private snackBar:MatSnackBar) { }

  ngOnInit() {
    this.coupons = this.data;
    this.coupons.forEach(val=>{
      return val.applied == false;
    })
    console.log("data",this.coupons);
  }
  getColors(index){
    switch (index%5){
      case 1:
        return '#52453C';
        case 2: return '#F8914B';
        case 3: return '#9CC165';
        case 4: return '#5478AF';
        case 0: return '#27384a';
    }
  }
  selectCoupon(coupon){
    this.coupounCode = coupon.couponCode 
  }
      //message alerts showing
 openSnackBar(message: string, action: string) {
  this.snackBar.open(message, action, {
     duration: 3000,
     panelClass:"text-white",
     verticalPosition:'top'
  });
}
  applyCoupon(coupon){
    if(coupon != ""){
      let index = -1;
   index = this.coupons.findIndex(val=>{
      return val.couponCode == coupon;
    })
    if(index != -1){
      this.dialogRef.close(this.coupons[index])
    }else{
      this.openSnackBar("Invalid Coupon Code","")
    }
    }else{
      this.openSnackBar("Enter Coupon Code","")
    }
  }
  confirmCoupon(coupon){
    this.dialogRef.close(coupon)
  }
  closeTab(){
    this.dialogRef.close()
  }
}
