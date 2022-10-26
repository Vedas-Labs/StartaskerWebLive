import { Component, OnInit, Inject } from '@angular/core';
import { AccountVerificationComponent } from '../account-verification/account-verification.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-account-verify-status',
  templateUrl: './account-verify-status.component.html',
  styleUrls: ['./account-verify-status.component.css']
})
export class AccountVerifyStatusComponent implements OnInit {

  constructor(private dailogRef:MatDialogRef<AccountVerificationComponent>,
    @Inject(MAT_DIALOG_DATA) public data:any) { }

  ngOnInit() {
    console.log(this.data);
  }
  closeTab(){
    let obj = {
      retry : false
    }
this.dailogRef.close(obj)
  }
  retry(){
    let obj = {
      retry : true
    }
this.dailogRef.close(obj)
  }
}
