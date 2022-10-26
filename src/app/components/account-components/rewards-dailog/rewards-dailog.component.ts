import { Component, OnInit, Inject } from '@angular/core';
import { RewardsComponent } from '../rewards/rewards.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-rewards-dailog',
  templateUrl: './rewards-dailog.component.html',
  styleUrls: ['./rewards-dailog.component.css']
})
export class RewardsDailogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<RewardsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }
closeTab(){
  this.dialogRef.close()
}
}
