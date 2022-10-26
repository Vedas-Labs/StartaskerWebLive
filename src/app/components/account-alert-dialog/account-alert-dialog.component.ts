import { Component, OnInit, Inject } from '@angular/core';
import { LoginComponent } from '../login/login.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-account-alert-dialog',
  templateUrl: './account-alert-dialog.component.html',
  styleUrls: ['./account-alert-dialog.component.css']
})
export class AccountAlertDialogComponent implements OnInit {
  message:string;
  constructor(private dialogRef: MatDialogRef<LoginComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,private loginService:LoginService) { }

  ngOnInit() {
    this.message = this.data.message
  }
close(){
  this.dialogRef.close(false)
}
submit(){
  this.dialogRef.close(true)
}
}
