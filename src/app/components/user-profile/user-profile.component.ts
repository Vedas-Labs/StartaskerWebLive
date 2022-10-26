import { Component, OnInit } from "@angular/core";
import { LoginService } from "src/app/services/login.service";
import { is } from "date-fns/locale";
import { ChangePasswordComponent } from "../settings-components/change-password/change-password.component";
import { MatDialog, MatSnackBar } from "@angular/material";
import { UserServiceService } from "src/app/services/user-service.service";
import { AddBankDetailsComponent } from "../settings-components/add-bank-details/add-bank-details.component";
import { HttpErrorResponse } from "@angular/common/http";
import { Router } from "@angular/router";
import { EmergencyContactsComponent } from "../account-components/emergency-contacts/emergency-contacts.component";
import { UpdatePhoneComponent } from "../settings-components/update-phone/update-phone.component";
import { DeleteDialogComponent } from "../delete-dialog/delete-dialog.component";
import { PushMessagingService } from "src/app/services/push-messaging.service";

@Component({
  selector: "app-user-profile",
  templateUrl: "./user-profile.component.html",
  styleUrls: ["./user-profile.component.css"],
})
export class UserProfileComponent implements OnInit {
  user: any;
  userName: string = "";
  showSettingsSubMenu: boolean = false;
  showHelpCenter: boolean = false;
  previewUrl: any;
  isSideNavOpen: boolean = false;
  isLoggedIn: boolean = false;
  constructor(
    private loginService: LoginService,
    private dialog: MatDialog,
    private userService: UserServiceService,
    private snackBar: MatSnackBar,
    private router: Router,
    private pushService: PushMessagingService
  ) {
    this.loginService.checkIsImgUpdated.subscribe((isUpdated) => {
      if (isUpdated == true) {
        this.loginService.profilePic.subscribe((img) => {
          this.previewUrl = "";
          setTimeout(() => {
            this.previewUrl = img;
          }, 100);
        });
      }
    });
    this.userService.openVerifyPhone.subscribe((val) => {
      if (val) {
        this.mobileVerification();
      }
    });
  }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.user != null ? this.fetchData() : this.router.navigateByUrl("/home");
  }
  fetchData() {
    let id = { userID: this.user.userID };
    this.loginService.fetchUserDetails(id).subscribe(
      (posRes) => {
        if (posRes.response == 3) {
          this.setValues(posRes.customerInfo[0]);
          localStorage.setItem("user", JSON.stringify(posRes.customerInfo[0]));
          this.user = posRes.customerInfo[0];
          this.userService.user = posRes.customerInfo[0];
          console.log("User", this.user);
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          console.log("Client Side Error", err.message);
        } else {
          console.log("Server Side Error", err.message);
        }
      }
    );
  }
  addEmergencyContacts() {
    let dailogRef = this.dialog.open(EmergencyContactsComponent, {
      panelClass: "col-md-4",
      hasBackdrop: true,
      disableClose: true,
      data: { userID: this.user.userID },
    });
  }
  openSideNav() {
    this.isSideNavOpen = !this.isSideNavOpen;
  }
  deleteAccount() {
    let obj = {
      userID: this.user.userID,
    };
    this.loginService.isThisAccountElegibleToDelete(obj).subscribe(
      (res) => {
        if (res.response == 3) {
          this.showDeleteAlert();
        } else {
          this.openSnackBar(res.message, "");
        }
      },
      (err: HttpErrorResponse) => {
        this.openSnackBar(err.message, "");
      }
    );
  }
  logOut() {
    this.loginService.showLoader.next(true);
    let obj = {
      userID: this.user.userID,
      deviceToken: "",
      deviceType: "web",
    };
    let deviceToken = this.pushService.fcmToken;
    if (deviceToken != null) {
      obj.deviceToken = deviceToken;
    } else {
      obj.deviceToken = "";
    }
    let token = localStorage.getItem("token");
    this.loginService.logOut(obj, token).subscribe(
      (posRes) => {
        this.loginService.showLoader.next(false);
        if (posRes.response == 3) {
          this.loginService.checkIsLoggedIn.next(false);
          this.previewUrl = "https://liveapi.startasker.com/user.png";
          this.confirmDelete();
        } else {
          this.openSnackBar(posRes.message, "");
        }
      },
      (err: HttpErrorResponse) => {
        this.loginService.showLoader.next(false);
        this.openSnackBar(err.message, "");
        if (err.error instanceof Error) {
          console.warn("Client Error", err.error);
        } else {
          console.warn("Server Error", err.error);
        }
      }
    );
  }
  showDeleteAlert() {
    let dailogRef = this.dialog.open(DeleteDialogComponent, {
      panelClass: "col-md-4",
      hasBackdrop: true,
      disableClose: true,
      data: "Do you want to delete your account..?",
    });
    dailogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.logOut();
      }
    });
  }
  confirmDelete() {
    let obj = { userID: this.user.userID };
    console.log("Delete Api Call Here");
    let token = localStorage.getItem("token");
    this.loginService.deleteMyAccount(obj, token).subscribe(
      (res) => {
        if (res.response === 3) {
          localStorage.clear();
          this.loginService.isLoggedIn.next(false);
          this.router.navigateByUrl("/home");
        }
      },
      (err: HttpErrorResponse) => {
        this.openSnackBar(err.message, "");
        localStorage.clear();
        this.router.navigateByUrl("/home");
      }
    );
  }
  setValues(info) {
    this.userName = info.firstName + " " + info.lastName;
    if (info.profilePic == "") {
      this.previewUrl = "https://liveapi.startasker.com/user.png";
    } else {
      this.previewUrl = "https://liveapi.startasker.com" + info.profilePic;
    }
  }
  //message alerts showing
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3500,
      panelClass: "red-snackbar",
    });
  }
  changePassword() {
    let dailogRef = this.dialog.open(ChangePasswordComponent, {
      panelClass: "col-md-4",
      hasBackdrop: true,
      disableClose: true,
      data: { userID: this.user.userID },
    });
    dailogRef.afterClosed().subscribe((res) => {
      if (res != undefined) {
        if (res.response == 3) {
          this.openSnackBar(res.message, "");
        } else {
          this.openSnackBar(res.message, "");
        }
      }
    });
  }
  mobileVerification() {
    let dailogRef = this.dialog.open(UpdatePhoneComponent, {
      panelClass: "col-md-4",
      hasBackdrop: true,
      disableClose: true,
      data: { userID: this.user.userID, number: this.user.phoneNumber },
    });
    dailogRef.afterClosed().subscribe((res) => {
      if (res != undefined) {
        this.openSnackBar("Phone Verification Success", "");
        this.userService.isFetchUser.next(true);
        return;
        if (res.response == 3) {
          this.openSnackBar(res.message, "");
          this.fetchData();
        } else {
          this.openSnackBar(res.message, "");
        }
      } else {
        this.openSnackBar("Phone Verification Failed", "");
      }
    });
  }
  addBankDetails() {
    let dailogRef = this.dialog.open(AddBankDetailsComponent, {
      panelClass: "col-md-4",
      hasBackdrop: true,
      disableClose: true,
      data: { userID: this.user.userID },
    });
    dailogRef.afterClosed().subscribe((res) => {
      if (res != undefined) {
        if (res.response == 3) {
          this.openSnackBar(res.message, "");
        } else {
          this.openSnackBar(res.message, "");
        }
      }
    });
  }
}
