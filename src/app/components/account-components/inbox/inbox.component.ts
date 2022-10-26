import { Component, OnInit } from "@angular/core";
import { UserServiceService } from "src/app/services/user-service.service";
import { HttpErrorResponse } from "@angular/common/http";
import { InboxMessagesComponent } from "../inbox-messages/inbox-messages.component";
import { MatDialog, MatSnackBar } from "@angular/material";
import { Router } from "@angular/router";
import { DeleteDialogComponent } from "../../delete-dialog/delete-dialog.component";
import { LoginService } from "src/app/services/login.service";

@Component({
  selector: "app-inbox",
  templateUrl: "./inbox.component.html",
  styleUrls: ["./inbox.component.css"],
})
export class InboxComponent implements OnInit {
  inboxNotifications: Array<any> = [];
  user: any;
  inboxSubscribe: any;
  baseUrl: string = "";
  ConfirmDelete: boolean = false;
  deleteId: any = "";
  statusMsg: string = "Fetching Messages...";
  notifications: Array<any> = [];
  chatMessages: Array<any> = [];
  constructor(
    private userService: UserServiceService,
    private dialog: MatDialog,
    private router: Router,
    private snackBar: MatSnackBar,
    private loginService: LoginService
  ) {}

  ngOnInit() {
    this.baseUrl = "https://liveapi.startasker.com";
    this.user = JSON.parse(localStorage.getItem("user"));
    this.getInboxMessage();
  }
  getInboxMessage() {
    this.statusMsg = "Fetching Messages...";
    this.loginService.showLoader.next(true);
    let token = localStorage.getItem("token");
    let obj = {
      userID: this.user.userID,
    };
    this.inboxSubscribe = this.userService
      .fetchInboxMessages(obj, token)
      .subscribe(
        (posRes) => {
          this.loginService.showLoader.next(false);
          if (posRes.response == 3) {
            if (posRes && posRes.customerInbox && posRes.customerInbox.length) {
              this.inboxNotifications = posRes.customerInbox[0].notifyInbox;
              this.chatMessages = this.inboxNotifications.filter((val) => {
                return (
                  val.data.type === "OfferReplayToPoster" ||
                  val.data.type === "OfferReplayToProvider"
                );
              });
              this.notifications = this.inboxNotifications.filter((val) => {
                return (
                  val.data.type !== "OfferReplayToPoster" &&
                  val.data.type !== "OfferReplayToProvider"
                );
              });
            } else {
              this.inboxNotifications = [];
            }
          } else {
            this.openSnackBar(posRes.message, "");
          }
          this.statusMsg = "You dont have any notifications";
        },
        (err: HttpErrorResponse) => {
          this.loginService.showLoader.next(false);
          this.openSnackBar("Please try after some time..", "");
          if (err.error instanceof Error) {
            console.warn("CSE", err.message);
          } else {
            console.warn("SSE", err.message);
          }
        }
      );
  }
  opendetails(details) {
    let obj = {
      notifyID: details.notifyID,
      userID: this.user.userID,
    };
    let token = localStorage.getItem("token");
    if (!details.isRead) {
      this.loginService.showLoader.next(true);
      this.userService.readInboxMessages(obj, token).subscribe(
        (posRes) => {
          this.loginService.showLoader.next(false);
          if (posRes.response == 3) {
            this.openRelatedScreens(details);
          } else {
            this.openSnackBar(posRes.message, "");
          }
        },
        (err: HttpErrorResponse) => {
          this.loginService.showLoader.next(false);
          this.openSnackBar(err.message, "");
          if (err.error instanceof Error) {
            console.warn("Server Failure", err.error);
          } else {
            console.warn("Server Failure", err.error);
          }
        }
      );
    } else {
      this.openRelatedScreens(details);
    }
  }
  openRelatedScreens(details) {
    debugger;
    if (details.data.type == "Offer") {
      this.router.navigate(["my-tasks", "task", details.data.postID]);
    }
    if (details.data.type == "OfferReplayToProvider") {
      this.router.navigate(["browsejobs", "job", details.data.postID], {
        queryParams: { openChat: true },
      });
    }
    if (details.data.type == "OfferReplayToPoster") {
      this.router.navigate(["my-tasks", "task", details.data.postID]);
    }
    if (details.data.type == "Booking") {
      this.router.navigate([
        "bookings",
        "booking-job-details",
        details.data.bookingID,
      ]);
    }
    if (details.data.type == "WithDrawn") {
      this.router.navigate([
        "bookings",
        "booking-job-details",
        details.data.bookingID,
      ]);
    }
    if (details.data.type == "PostJob") {
      this.router.navigate(["browsejobs", "job", details.data.postID]);
    }
    if (details.data.type == "AccountVerification") {
      this.router.navigate(["profile", this.user.userID]);
    }
    if (details.data.type == "AdminPaymentDoneToProvider") {
      this.router.navigate([
        "bookings",
        "booking-job-details",
        details.data.bookingID,
      ]);
    }
    if (details.data.type == "TaskReminder") {
      this.router.navigate([
        "bookings",
        "booking-job-details",
        details.data.bookingID,
      ]);
    }
    if (details.data.type == "Earnings") {
      this.router.navigateByUrl("/my-account/reffer-earn");
    }
    if (details.data.type == "AdminOffers") {
      let dailogRef = this.dialog.open(InboxMessagesComponent, {
        panelClass: "col-md-4",
        data: details,
        hasBackdrop: true,
        disableClose: true,
      });
    }

    if (details.data.type == "Ratings") {
      this.router.navigate(["browsejobs", "job", details.data.postID]);
    }
  }
  deleteOne(event) {
    this.deleteId = event.value;
    this.ConfirmDelete = true;
  }
  //message alerts showing
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: "red-snackbar",
    });
  }
  delete() {
    let dailogRef = this.dialog.open(DeleteDialogComponent, {
      panelClass: "col-md-3",
      hasBackdrop: true,
      disableClose: true,
      data: "Do you want to delete selected notification",
    });
    dailogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.loginService.showLoader.next(true);
        let obj = {
          userID: this.user.userID,
          notifyID: this.deleteId,
        };
        let token = localStorage.getItem("token");
        this.userService.deleteOneNotification(obj, token).subscribe(
          (posRes) => {
            this.loginService.showLoader.next(false);
            this.openSnackBar(posRes.message, "");
            if (posRes.response == "3") {
              this.getInboxMessage();
            }
          },
          (err: HttpErrorResponse) => {
            this.openSnackBar(err.message, "");
            this.loginService.showLoader.next(false);
          }
        );
      }
    });
  }
  deleteAll() {
    let dailogRef = this.dialog.open(DeleteDialogComponent, {
      panelClass: "col-md-3",
      hasBackdrop: true,
      disableClose: true,
      data: "Do you want to delete All notifications",
    });
    dailogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.loginService.showLoader.next(true);
        let obj = {
          userID: this.user.userID,
        };
        let token = localStorage.getItem("token");
        this.userService.deleteAllNotification(obj, token).subscribe(
          (posRes) => {
            this.loginService.showLoader.next(false);
            this.openSnackBar(posRes.message, "");
            if (posRes.response == "3") {
              this.getInboxMessage();
            }
          },
          (err: HttpErrorResponse) => {
            this.openSnackBar(err.message, "");
            this.loginService.showLoader.next(false);
          }
        );
      }
    });
  }
}
