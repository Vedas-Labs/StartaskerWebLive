import { Injectable } from "@angular/core";
import { AngularFireMessaging } from "@angular/fire/messaging";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class PushMessagingService {
  fcmToken: any = null;
  currentMessage = new BehaviorSubject(null);

  constructor(private angularFireMessaging: AngularFireMessaging) {
    this.angularFireMessaging.messaging.subscribe((_messaging) => {
      _messaging.onMessage = _messaging.onMessage.bind(_messaging);
      _messaging.onTokenRefresh = _messaging.onTokenRefresh.bind(_messaging);
    });
  }

  requestPermission() {
    this.angularFireMessaging.requestToken.subscribe(
      (token) => {
        this.fcmToken = token;
        console.log("Token", token);
      },
      (err) => {
        console.error("Unable to get permission to notify.", err);
      }
    );
  }

  receiveMessage() {
    this.angularFireMessaging.messages.subscribe((payload) => {
      this.currentMessage.next(payload);
      this.showCustomNotification(payload);
    });
  }

  showCustomNotification(payload: any) {
    let notify_data = payload["notification"];
    let title = notify_data["title"];
    let options = {
      body: notify_data["body"],
    };
    console.log("new Message Recieved", notify_data);
    let notify: Notification = new Notification(title, options);
    notify.onclick = (event) => {
      event.preventDefault();
      window.location.href = "http://startaskerdemo.surge.sh/#/browsejobs";
    };
  }
}
