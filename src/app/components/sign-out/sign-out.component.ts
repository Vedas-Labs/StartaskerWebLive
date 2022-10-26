import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-sign-out',
  templateUrl: './sign-out.component.html',
  styleUrls: ['./sign-out.component.css']
})
export class SignOutComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<HeaderComponent>) { }

  ngOnInit() {
  }
submit(){
  this.dialogRef.close(true)
}
close(){
  this.dialogRef.close(false)
}
}
