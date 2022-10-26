import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { InboxComponent } from '../inbox/inbox.component';

@Component({
  selector: 'app-inbox-messages',
  templateUrl: './inbox-messages.component.html',
  styleUrls: ['./inbox-messages.component.css']
})
export class InboxMessagesComponent implements OnInit {
  inboxForm:FormGroup;
  isInboxChat:boolean = false;
  notificationData:any;
  constructor(private fb:FormBuilder, private dailogRef:MatDialogRef<InboxComponent>,
    @Inject(MAT_DIALOG_DATA) public data:any) { }

  ngOnInit() {
    this.notificationData = this.data.notification
    this.inboxForm = this.fb.group({
      message:[""]
    })
  }
  closeTab(){
    this.dailogRef.close()
  }
  sendReply(){
    this.closeTab()
  }
}
