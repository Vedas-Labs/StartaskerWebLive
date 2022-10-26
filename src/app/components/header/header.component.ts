import { Component, OnInit } from "@angular/core";
import { MatDialog, MatSnackBar } from "@angular/material";
import { LoginComponent } from "../login/login.component";
import { SocialUser, AuthService } from "angularx-social-login";
import { Router } from "@angular/router";
import { SignUpComponent } from "../sign-up/sign-up.component";
import { LoginService } from "src/app/services/login.service";
import { ForgotpasswordComponent } from "../forgotpassword/forgotpassword.component";
import { SetupProfileComponent } from "../setup-profile/setup-profile.component";
import { PostAJobComponent } from "../post-ajob/post-ajob.component";
import { HttpErrorResponse } from "@angular/common/http";
import { SignOutComponent } from "../sign-out/sign-out.component";
import { WelcomeGiftComponent } from "../welcome-gift/welcome-gift.component";
import { JobsService } from "src/app/services/jobs.service";
import { PushMessagingService } from "src/app/services/push-messaging.service";
import { DigitalHiringComponent } from "../digital-hiring/digital-hiring.component";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent implements OnInit {
  user: any;
  loggedIn: boolean;
  obj: any;
  userId: any;
  previewUrl: any = "https://liveapi.startasker.com/user.png";
  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
    private loginService: LoginService,
    private snackBar: MatSnackBar,
    private jobService: JobsService,
    private pushService: PushMessagingService
  ) {
    this.loginService.callSignUp.subscribe((val) => {
      if (val === true) {
        this.openSignUpdialog();
      }
    });
    this.loginService.callEhire.subscribe((val) => {
      if (val === true) {
        this.openEHiring();
      }
    });
    this.loginService.callSignOut.subscribe((val) => {
      if (val == true) {
        this.signOut();
      }
    });
    this.loginService.callLogin.subscribe((val) => {
      if (val === true) {
        this.openLogindialog();
      }
    });
    this.loginService.callForgotPass.subscribe((val) => {
      if (val === true) {
        this.openForgotdialog();
      }
    });
    this.loginService.profilePic.subscribe((img) => {
      this.previewUrl = "";
      setTimeout(() => {
        this.previewUrl = img;
      }, 100);
    });
    this.loginService.callPostJob.subscribe((val) => {
      if (val == true) {
        this.openPostJob();
      }
    });
    this.loginService.isLoggedIn.subscribe((val) => {
      if (!val) {
        this.loggedIn = false;
      }
    });
  }

  ngOnInit() {
    this.getCategories();
    this.user = JSON.parse(localStorage.getItem("user"));
    if (this.user != null) {
      this.loggedIn = true;
      this.fetchData(this.user.userID);
      this.loginService.checkIsLoggedIn.next(true);
      this.loginService.userID = this.user.userID;
    } else {
      this.loggedIn = false;
      this.loginService.checkIsLoggedIn.next(false);
    }
  }
  signOut(): void {
    let dailogRef = this.dialog.open(SignOutComponent, {
      panelClass: "col-md-4",
      hasBackdrop: true,
      disableClose: true,
    });
    dailogRef.afterClosed().subscribe((res) => {
      if (res == true) {
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
              localStorage.clear();
              this.loginService.checkIsLoggedIn.next(false);
              this.previewUrl = "https://liveapi.startasker.com/user.png";
              this.loggedIn = false;
              this.router.navigateByUrl("/home");
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
    });
  }

  openForgotdialog() {
    let dailogRef = this.dialog.open(ForgotpasswordComponent, {
      panelClass: "col-md-4",
      hasBackdrop: true,
      disableClose: true,
    });
    dailogRef.afterClosed().subscribe((res) => {
      this.loginService.gotOtp.next(false);
      if (res != null) {
        this.router.navigateByUrl("/home");
      }
    });
  }
  openLogindialog() {
    let dailogRef = this.dialog.open(LoginComponent, {
      panelClass: "col-md-4",
      hasBackdrop: true,
      disableClose: true,
    });
    dailogRef.afterClosed().subscribe((res) => {
      if (res != null) {
        this.user = res;
        if (res.customerInfo) {
          this.user = res.customerInfo;
          if (res.customerInfo.isProfileUpdate == true) {
            this.loggedIn = true;
            this.loginService.checkIsLoggedIn.next(true);
            localStorage.setItem("user", JSON.stringify(this.user));
            this.loginService.userID = this.user.userID;
            this.router.navigateByUrl("/my-account");
          } else {
            this.openSetupProfileDialog();
          }
        } else {
          this.openSetupProfileDialog();
        }
      }
    });
  }
  fetchData(uId) {
    let id = { userID: uId };
    this.loginService.showLoader.next(true);
    this.loginService.fetchUserDetails(id).subscribe(
      (posRes) => {
        if (posRes.response == 3) {
          this.loginService.showLoader.next(false);
          if (posRes.customerInfo[0].isProfileUpdate == true) {
            this.previewUrl =
              "https://liveapi.startasker.com" +
              posRes.customerInfo[0].profilePic;
            localStorage.setItem("user", JSON.stringify(this.user));
          } else {
            this.loginService.showLoader.next(false);
            this.openSnackBar(posRes.message, "");
          }
        }
      },
      (err: HttpErrorResponse) => {
        this.loginService.showLoader.next(false);
        this.openSnackBar("Server Failure please try after few minutes ", "");
        if (err.error instanceof Error) {
          console.log("CSE", err.message);
        } else {
          console.log("SSE", err.message);
        }
      }
    );
  }
  openSetupProfileDialog() {
    let dailogRef = this.dialog.open(SetupProfileComponent, {
      panelClass: "col-md-4",
      hasBackdrop: true,
      disableClose: true,
      data: this.user,
    });
    dailogRef.afterClosed().subscribe((res) => {
      if (res && res.response == 3) {
        this.loggedIn = true;
        let rewardDialog = this.dialog.open(WelcomeGiftComponent, {
          panelClass: "col-md-4",
          hasBackdrop: true,
          disableClose: true,
        });
        this.loginService.checkIsLoggedIn.next(true);
        this.router.navigateByUrl("/my-account");
      }
    });
  }

  openSignUpdialog() {
    let dailogRef = this.dialog.open(SignUpComponent, {
      panelClass: "col-md-4",
      hasBackdrop: true,
      disableClose: true,
    });
    dailogRef.afterClosed().subscribe((res) => {
      if (res != null) {
        this.user = res;
        if (res.customerInfo) {
          this.user = res.customerInfo;
          if (res.customerInfo.register_type == "Manual") {
            if (this.loginService.isSocilaLogin == false) {
              this.loggedIn = true;
              this.loginService.checkIsLoggedIn.next(true);
              localStorage.setItem("user", JSON.stringify(this.user));
              let rewardDialog = this.dialog.open(WelcomeGiftComponent, {
                panelClass: "col-md-4",
                hasBackdrop: true,
                disableClose: true,
              });
              this.router.navigateByUrl("/my-account");
              this.loginService.isSocilaLogin = false;
            } else {
              this.openSetupProfileDialog();
            }
          } else if (res.customerInfo.isProfileUpdate == true) {
            this.loggedIn = true;
            this.loginService.checkIsLoggedIn.next(true);
            localStorage.setItem("user", JSON.stringify(this.user));
            let rewardDialog = this.dialog.open(WelcomeGiftComponent, {
              panelClass: "col-md-4",
              hasBackdrop: true,
              disableClose: true,
            });
            this.router.navigateByUrl("/my-account");
          } else {
            this.openSetupProfileDialog();
          }
        } else {
          this.openSetupProfileDialog();
        }
      }
    });
  }
  goToMyTasks() {
    if (this.loggedIn == true) {
      this.router.navigateByUrl("my-tasks");
    } else {
      this.loginService.callLogin.next(true);
    }
  }
  gotoBookings() {
    if (this.loggedIn == true) {
      this.router.navigateByUrl("bookings");
    } else {
      this.loginService.callLogin.next(true);
    }
  }
  getCategories() {
    this.loginService.showLoader.next(true);
    this.jobService.browseCategory().subscribe(
      (res) => {
        this.loginService.showLoader.next(false);
        if (res.response == 3) {
          debugger;
          this.loginService.categoriesList = res;
        } else {
          this.openSnackBar(res.message, "");
        }
      },
      (err: HttpErrorResponse) => {
        this.loginService.showLoader.next(false);
        this.openSnackBar(err.message, "");

        console.log("Error", err);
      }
    );
  }
  //message alerts showing
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: "red-snackbar",
    });
  }
  openPostJob() {
    if (this.loggedIn == true) {
      let dailogRef = this.dialog.open(PostAJobComponent, {
        panelClass: "col-md-4",
        hasBackdrop: true,
        disableClose: true,
        data: { userID: this.user.userID },
      });
      dailogRef.afterClosed().subscribe((res) => {
        if (res != undefined) {
          if (res.response == 3) {
            if (
              this.router.url == "/my-tasks" ||
              this.router.url.indexOf("/my-tasks/task") !== -1
            ) {
              this.jobService.isJobPosted.next(true);
            } else {
              this.router.navigateByUrl("/my-tasks");
            }
            this.openSnackBar(res.message, "");
          } else {
            this.openSnackBar(res.message, "");
          }
        }
      });
    } else {
      this.loginService.callLogin.next(true);
    }
  }
  showUserProfile(id) {
    this.router.navigate(["/profile", btoa(id)], {
      queryParams: { isEncpt: "y" },
    });
  }
  // Ehiring
  openEHiring() {
    let dailogRef = this.dialog.open(DigitalHiringComponent, {
      panelClass: "col-md-3",
      hasBackdrop: true,
      disableClose: true,
      data: this.user,
    });
  }
}
