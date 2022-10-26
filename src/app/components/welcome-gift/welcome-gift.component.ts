import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-welcome-gift',
  templateUrl: './welcome-gift.component.html',
  styleUrls: ['./welcome-gift.component.css']
})
export class WelcomeGiftComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<HeaderComponent>) { }

  ngOnInit() {
   setTimeout(()=>{
     this.dialogRef.close()
   },3000) 
  }
}
