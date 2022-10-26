import { Component, OnInit, Inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { HeaderComponent } from "../header/header.component";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
  MatSnackBar,
} from "@angular/material";
import {
  AuthService,
  FacebookLoginProvider,
  SocialUser,
  GoogleLoginProvider,
} from "angularx-social-login";
import { LoginService } from "src/app/services/login.service";
import { HttpErrorResponse } from "@angular/common/http";
import { Router } from "@angular/router";
import { SetPasswordComponent } from "../set-password/set-password.component";
import { AccountAlertDialogComponent } from "../account-alert-dialog/account-alert-dialog.component";
import { PushMessagingService } from "src/app/services/push-messaging.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  user: SocialUser;
  loggedIn: boolean;
  loading = false;
  socialLoginForm: FormGroup;
  hide = true;
  lat: any = "3.091210";
  lang: any = "101.677101";
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<HeaderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService,
    private router: Router,
    private loginService: LoginService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private pushMessageService: PushMessagingService,
    private pushService: PushMessagingService
  ) {}

  ngOnInit() {
    this.getLatLang();
    this.socialLoginForm = this.fb.group({
      ID: [""],
      userID: [""],
      firstName: [""],
      lastName: [""],
      register_type: [""],
      latitude: [""],
      longitude: [""],
      tokenID: [""],
      profilePic: [""],
      deviceToken: [""],
      deviceType: ["web"],
    });
    this.loginForm = this.fb.group({
      userID: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(8)]],
      deviceToken: [""],
      deviceType: ["web"],
    });

    this.authService.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = user != null;
      console.log("user", this.user);
      if (this.user != null) {
        this.loggedIn = true;
        //this.dialogRef.close(this.user)
        this.pathchSocialLoginDetails(this.user);
        this.logout();
      } else {
        this.loading = false;
      }
    });
  }
  closeTab() {
    this.dialogRef.close();
  }
  //message alerts showing
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: "red-snackbar",
    });
  }
  logout() {
    this.authService.signOut().then((data) => {
      console.log("Signout", data);
    });
  }
  pathchSocialLoginDetails(user) {
    console.log("Social login User Details", user);
    this.loading = true;
    let providerType = user.provider.toLowerCase();
    let pType = providerType.charAt(0).toUpperCase() + providerType.slice(1);
    this.socialLoginForm.patchValue({
      ID: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      register_type: pType,
      latitude: this.lat,
      longitude: this.lang,
      tokenID: user.authToken,
      profilePic: user.photoUrl,
    });
    if (user.email == undefined) {
      this.socialLoginForm.patchValue({
        userID: "",
      });
    } else {
      this.socialLoginForm.patchValue({
        userID: user.email,
      });
    }

    if (!user.email) {
      this.openSnackBar("This social media dont have email details", "");
      return;
    }
    let obj = { userID: user.email };
    this.loginService.checkUserAvailability(obj).subscribe(
      (res) => {
        if (res.isActive) {
          this.submitSocialMedia();
        } else {
          this.openSnackBar(res.message, "");
        }
      },
      (err: HttpErrorResponse) => {
        this.openSnackBar(err.message, "");
        if (err.error instanceof Error) {
          console.log("Client Side Error", err.headers);
        } else {
          console.log("Server side Error", err.message);
        }
      }
    );
    // End Here
    let deviceID = this.pushService.fcmToken;
    if (deviceID != null) {
      this.socialLoginForm.patchValue({
        deviceToken: deviceID,
      });
    }
  }
  submitSocialMedia() {
    this.loginService.socialLogin(this.socialLoginForm.value).subscribe(
      (posRes) => {
        console.log("SocialRes", posRes);
        if (posRes.response == 3) {
          this.loading = false;
          // this.loginService.isManualLogin = false;

          localStorage.setItem("token", posRes.tokenID);
          if (posRes.customerInfo) {
            this.dialogRef.close(posRes);
          } else {
            this.dialogRef.close(this.socialLoginForm.value);
          }
        } else {
          this.loading = false;
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          this.loading = false;
          this.openSnackBar(err.message, "");
          console.log("Cse", err);
        } else {
          this.loading = false;
          this.openSnackBar(err.message, "");
          console.log("SSE", err);
        }
      }
    );
  }
  getLatLang() {
    this.loginService.getPosition().then((pos) => {
      this.lat = pos.lat;
      this.lang = pos.lng;
      console.log(`Positon: ${pos.lng} ${pos.lat}`);
    });
  }
  submitDetails() {
    if (this.loginForm.valid) {
      this.loading = true;
      let deviceID = this.pushMessageService.fcmToken;
      console.log("device id login", this.pushMessageService.fcmToken);
      if (deviceID != null) {
        this.loginForm.patchValue({
          deviceToken: this.pushMessageService.fcmToken,
        });
      }
      this.loginService.login(this.loginForm.value).subscribe(
        (posRes) => {
          if (posRes.response == 3) {
            this.loading = false;
            // this.loginService.isManualLogin = true;
            // this.loginService.faceBookLoginImg = false;
            localStorage.setItem("token", posRes.access_token);
            //this.loginService.profilePic = posRes.customerInfo.profilePic
            this.dialogRef.close(posRes);
          } else if (
            posRes.message ==
            "You have already logged in from social media so please set your password"
          ) {
            this.openConfirmDialog();
          } else if (
            posRes.message == "No data found with us. Please register with us"
          ) {
            this.loading = false;
            this.openAlertDialog();
          } else if (
            posRes.response == 5 &&
            posRes.message ==
              "Customer is registered but verification is pending"
          ) {
            this.loading = false;
            this.openOTP();
          } else {
            this.loading = false;
            this.openSnackBar(posRes.message, "");
          }
        },
        (err: HttpErrorResponse) => {
          this.loading = false;
          if (err.error instanceof Error) {
            this.openSnackBar(err.message, "");
            console.log("CSE");
          } else {
            this.openSnackBar(err.message, "");
            console.log("SSE");
          }
        }
      );
    } else {
      this.openSnackBar("enter all required fields", "");
    }
  }
  openOTP() {}
  openAlertDialog() {
    let dailogRef2 = this.dialog.open(AccountAlertDialogComponent, {
      panelClass: "col-md-3",
      hasBackdrop: false,
      data: {
        userID: this.loginForm.value.userID,
        message: "No data found with us. Please register with us",
      },
    });
    dailogRef2.afterClosed().subscribe((res) => {
      if (res == true) {
        localStorage.setItem("userId", this.loginForm.value.userID);
        this.loginService.setUserId.next(true);
        this.openSignUp();
      }
    });
  }

  openConfirmDialog() {
    let dailogRef1 = this.dialog.open(SetPasswordComponent, {
      panelClass: "col-md-3",
      hasBackdrop: false,
      data: {
        userID: this.loginForm.value.userID,
        message:
          "You have already logged in from social media so please set your password",
      },
    });
    dailogRef1.afterClosed().subscribe((res) => {
      if (res == true) {
        this.dialogRef.close();
      }
    });
  }
  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }
  signInWithFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
  }
  openSignUp() {
    this.loginService.callSignUp.next(true);
    this.dialogRef.close();
  }
  openForgotDialog() {
    this.dialogRef.close();
    this.loginService.callForgotPass.next(true);
  }
}
