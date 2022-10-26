import { Component, OnInit, Inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { JobsService } from "src/app/services/jobs.service";
import { HttpErrorResponse } from "@angular/common/http";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { UserProfileComponent } from "../../user-profile/user-profile.component";
import { LoginService } from "src/app/services/login.service";
import { WindowService } from "src/app/services/window.service";
// FIre Base
// Firebase services + enviorment module
// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";
// If you are using v7 or any earlier version of the JS SDK, you should import firebase using namespace import
// import * as firebase from "firebase/app"
// If you enabled Analytics in your project, add the Firebase SDK for Analytics
import "firebase/analytics";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-update-phone",
  templateUrl: "./update-phone.component.html",
  styleUrls: ["./update-phone.component.css"],
})
export class UpdatePhoneComponent implements OnInit {
  phoneNumberForm: FormGroup;
  loading: boolean = false;
  windowRef: any;
  public isOtpReceived: boolean = false;
  showAlert: boolean = false;
  otpLength: number = 0;
  alertMsg: string = "";
  alertType: string = "danger";
  otp: number = 0;
  isError: boolean = false;
  config = {
    allowNumbersOnly: true,
    length: 6,
    isPasswordInput: false,
    disableAutoFocus: false,
    placeholder: "",
    inputStyles: {
      width: "40px",
      height: "40px",
    },
  };
  constructor(
    private fb: FormBuilder,
    private jobService: JobsService,
    private dialogRef: MatDialogRef<UserProfileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private loginService: LoginService,
    private win: WindowService
  ) {
    // firebase.initializeApp(environment.firebase);
  }

  ngOnInit() {
    this.phoneNumberForm = this.fb.group({
      userID: [""],
      phoneNumber: ["", [Validators.required, Validators.pattern("[0-9]*")]],
    });
    this.phoneNumberForm.patchValue({
      userID: this.data.userID,
      phoneNumber: this.data.number.replace(/[^0-9 ]/g, "").replaceAll(" ", ""),
    });
    this.windowRef = this.win.windowRef;
    this.windowRef.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      "recaptcha-container",
      {
        size: "invisible",
      }
    );
    this.windowRef.recaptchaVerifier.render();
  }
  closeTab() {
    this.dialogRef.close();
  }
  sendMobileNumber() {
    const appVerifier = this.windowRef.recaptchaVerifier;
    const num = this.phoneNumberForm.get("phoneNumber").value;

    firebase
      .auth()
      .signInWithPhoneNumber("+60" + num, appVerifier)
      .then((result) => {
        this.windowRef.confirmationResult = result;
        this.isOtpReceived = true;
      })
      .catch((error) => {
        this.isOtpReceived = false;
        console.log("login", error);
        this.alertType = "danger";
        this.alertMsg = "Incorrect Mobile Number?";
        this.showAlert = true;
        console.log("login", error);
      });
  }
  updatePhoneToUser() {
    this.loading = true;
    this.loginService.showLoader.next(true);
    let formData = new FormData();
    formData.append("userID", this.phoneNumberForm.get("userID").value);
    formData.append(
      "phoneNumber",
      this.phoneNumberForm.get("phoneNumber").value
    );
    let token = localStorage.getItem("token");
    this.jobService.updateMobileNumber(formData, token).subscribe(
      (posRes) => {
        debugger;
        this.loginService.showLoader.next(false);
        this.loading = false;
        this.sendMobileNumber();
      },
      (err: HttpErrorResponse) => {
        this.errorHandler(err);
      }
    );
  }
  errorHandler(err) {
    if (err.error instanceof Error) {
      this.loginService.showLoader.next(false);
      this.loading = false;
      this.dialogRef.close();
      console.log("CSE", err.message);
    } else {
      console.log("SSE", err.message);
    }
  }
  onOtpChange(event) {
    this.otp = event;
    this.otpLength = event.length;
    if (event.length == 6) {
      this.isError = false;
    }
  }
  verify() {
    console.log("mylog", "called");
    if (this.otpLength != 6) {
      this.alertType = "danger";
      this.alertMsg = "Incorrect code entered..!";
      this.showAlert = true;
      return;
    }
    this.windowRef.confirmationResult
      .confirm(this.otp)
      .then((result) => {
        console.log("Phone OtP", result);
        this.updateStatus();
      })
      .catch((error) => {
        this.alertType = "danger";
        this.alertMsg = "Incorrect code entered?";
        this.showAlert = true;
        console.warn(error, "Wrong Code entered..");
      });
  }
  updateStatus() {
    let token = localStorage.getItem("token");

    let obj = {
      userID: this.data.userID,
    };
    this.loginService.updatePhoneVerificationStatus(obj, token).subscribe(
      (posRes: any) => {
        if (posRes.response == 3) {
          this.dialogRef.close(true);
        }
      },
      (err: HttpErrorResponse) => {
        this.errorHandler(err);
      }
    );
  }
}
