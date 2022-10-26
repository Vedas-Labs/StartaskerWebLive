import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { RewardsDailogComponent } from '../rewards-dailog/rewards-dailog.component';

@Component({
  selector: 'app-rewards',
  templateUrl: './rewards.component.html',
  styleUrls: ['./rewards.component.css']
})
export class RewardsComponent implements OnInit {
showRewards:boolean = true;

  constructor(private dialog:MatDialog) { }

  ngOnInit() {
  }
  openReward(){
let dialogRef = this.dialog.open(RewardsDailogComponent,{
  panelClass: 'col-md-4',
  hasBackdrop: true,
  disableClose:true
})
  }
}
