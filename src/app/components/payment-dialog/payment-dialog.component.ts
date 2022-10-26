import { Component, OnInit, Inject } from '@angular/core';
import { MyTaskDetailsComponent } from '../my-task-details/my-task-details.component';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatSnackBar } from '@angular/material';
import { UserServiceService } from 'src/app/services/user-service.service';
import { CouponComponent } from '../coupon/coupon.component';

@Component({
  selector: 'app-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.css']
})
export class PaymentDialogComponent implements OnInit {
  bookingFee:number
  total:number = 0;
  offers:Array<any>= []
  baseUrl:string= "";
  user:any;
  taskPrice:number = 0;
  isCouponApplied:boolean = false;
  couponCode:any = {
    couponAmount: "",
    couponCode: ""
  }
  constructor(private dialogRef: MatDialogRef<MyTaskDetailsComponent>, private dialog:MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any, private userService:UserServiceService,private snackBar:MatSnackBar) { }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('user'))
   this.baseUrl = this.userService.baseUrl;
    this.offers = this.data.offers;
    this.offers.forEach(val=>{
      this.total += val.budget;
      this.taskPrice +=val.budget;
    }) 

  }
  closeTab(){
    this.dialogRef.close(false);
  }
        //message alerts showing
 openSnackBar(message: string, action: string) {
  this.snackBar.open(message, action, {
     duration: 3000,
     panelClass:"text-white",
     verticalPosition: 'top'
  });
}
  showCoupons(){
    if(this.taskPrice >= 50){
      let dialogRef = this.dialog.open(CouponComponent,{
        panelClass: 'col-md-4',
        hasBackdrop: true,
        disableClose: true,
        data: this.user.coupons
      })
      dialogRef.afterClosed().subscribe(res=>{
        if(res != null){
          this.total -= parseInt(res.couponAmount)
          this.isCouponApplied = true;
          this.couponCode.couponAmount = res.couponAmount;
          this.couponCode.couponCode = res.couponCode;
          
        }else{
          this.isCouponApplied = false;
        }
      })
    }else{
    this.openSnackBar("Task price should be minimum RM50 to use this coupons.","")
    }
  }
  removeCoupon(coupon){
    this.total += parseInt(this.couponCode.couponAmount)
    this.couponCode.couponAmount = "";
    this.couponCode.couponCode = ""
    this.isCouponApplied = false;
  }
  removeOffer(index){
    if(this.offers.length >= 2){
      this.taskPrice -= this.offers[index].budget
     this.total -= this.offers[index].budget;
      this.offers.splice(index,1);
    }
  }
  submit(){
    let obj = {
      isCouponApplied: this.isCouponApplied,
      couponObj : this.couponCode,
      offers: this.offers,
      budjet : this.total
    }
    this.dialogRef.close(obj);
  }
}
