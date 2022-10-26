import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Inject,
  ViewEncapsulation,
  ChangeDetectorRef,
} from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
  FormGroupDirective,
} from "@angular/forms";
import { LoginService } from "src/app/services/login.service";
import { HttpErrorResponse, HttpClient } from "@angular/common/http";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatSnackBar,
  MatDialog,
} from "@angular/material";
import { HeaderComponent } from "../header/header.component";
import { Router } from "@angular/router";
import {
  AuthService,
  FacebookLoginProvider,
  SocialUser,
  GoogleLoginProvider,
} from "angularx-social-login";
import { PushMessagingService } from "src/app/services/push-messaging.service";
import { JobsService } from "src/app/services/jobs.service";
import { PrefferedListComponent } from "../preffered-list/preffered-list.component";

@Component({
  selector: "app-sign-up",
  templateUrl: "./sign-up.component.html",
  styleUrls: ["./sign-up.component.css"],
})
export class SignUpComponent implements OnInit {
  customerSignUpForm: FormGroup;
  verificationForm: FormGroup;
  socialLoginForm: FormGroup;
  setProfileForm: FormGroup;
  showProfileForm: boolean = false;
  tabIndex: number = 0;
  confirmPassword: boolean = false;
  showLoginForm: boolean = true;
  token: any;
  isRefferalSignUp: boolean = false;
  refferalObj: any = {};
  user: SocialUser;
  lat: number = 3.09121;
  lang: number = 101.677101;
  loading: boolean = false;
  serverOtp: any;
  @ViewChild("fileInput", { static: true }) el: ElementRef;
  previewUrl: any = "https://liveapi.startasker.com/user.png";
  @ViewChild("mtg", { static: true }) mtg: ElementRef;
  heading: string = "Create Your Account";
  userId: string;
  formatedAddress = "";
  checkError: boolean = false;
  isSuggestionsSelected: boolean = false;
  isWorkerSelected: boolean = true;
  selectedCat: Array<any> = [];
  maxDate: any;
  minDate: any;
  hide = true;
  hide2 = true;
  options = {
    componentRestrictions: {
      country: ["MY"],
    },
  };
  acceptTask: boolean = false;
  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    private loginService: LoginService,
    private dialogRef: MatDialogRef<HeaderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cd: ChangeDetectorRef,
    private router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private pushMessageService: PushMessagingService,
    private jobService: JobsService
  ) {
    this.loginService.setUserId.subscribe((val) => {
      if (val == true) {
        this.setUserId();
      }
    });
  }

  ngOnInit() {
    this.refferalObj = JSON.parse(localStorage.getItem("refferal"));
    if (this.refferalObj && this.refferalObj.invitedby) {
      this.isRefferalSignUp = true;
    } else {
      this.isRefferalSignUp = false;
    }
    let eighteenYearsFromNow = new Date();
    this.maxDate = new Date(
      eighteenYearsFromNow.setFullYear(eighteenYearsFromNow.getFullYear() - 18)
    );
    this.minDate = new Date(
      eighteenYearsFromNow.setFullYear(eighteenYearsFromNow.getFullYear() - 82)
    );
    this.customerSignUpForm = this.fb.group(
      {
        userID: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, Validators.minLength(8)]],
        confirmPassword: ["", Validators.required],
        register_type: ["Manual"],
        isCheck: ["", Validators.required],
      },
      {
        validators: this.passwordConfirming,
      }
    );

    this.setProfileForm = this.fb.group({
      profilePic: ["", Validators.required],
      userID: [""],
      firstName: ["", Validators.required],
      lastName: ["", Validators.required],
      latitude: ["", Validators.required],
      longitude: ["", Validators.required],
      phoneNumber: ["", Validators.required],
      address: ["", Validators.required],
      postTask: [true],
      completeTask: [true],
      deviceToken: [""],
      deviceType: ["web"],
      dob: ["", Validators.required],
    });
    this.verificationForm = this.fb.group({
      userID: [""],
      otp: ["", [Validators.required]],
    });
    this.http
      .get(this.previewUrl, { responseType: "blob" })
      .subscribe((file) => {
        let imgFile = new File([file], "userImg.jpg");
        this.setProfileForm.get("profilePic").setValue(imgFile);
      });
    // social Media login
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

    this.authService.authState.subscribe((user) => {
      this.user = user;
      if (this.user != null) {
        //this.dialogRef.close(this.user)
        this.loading = false;
        this.pathchSocialLoginDetails(this.user);
        this.logout();
      } else {
        this.loading = false;
      }
    });
    let id = localStorage.getItem("userId");
    if (id != null) {
      this.customerSignUpForm.patchValue({
        userID: id,
      });
      localStorage.removeItem("userId");
    }
  }
  setUserId() {}
  logout() {
    this.authService.signOut().then((data) => {
      console.log("Signout", data);
    });
  }
  getLatLang() {
    this.loginService.getPosition().then((pos) => {
      this.lat = pos.lat;
      this.lang = pos.lng;
      console.log(`Co_Ordinates: ${pos.lng} ${pos.lat}`);
    });
  }

  pathchSocialLoginDetails(user) {
    this.loading = true;
    console.log("Social login User Details", user);
    let providerType = user.provider.toLowerCase();
    let pType = providerType.charAt(0).toUpperCase() + providerType.slice(1);
    this.socialLoginForm.patchValue({
      ID: user.id,
      userID: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      register_type: pType,
      latitude: this.lat,
      longitude: this.lang,
      tokenID: user.authToken,
      profilePic: user.photoUrl,
    });
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
  }
  submitSocialMedia() {
    let payLoad = { ...this.socialLoginForm.value };
    if (this.isRefferalSignUp) {
      payLoad.signupReferralBy = this.refferalObj.invitedby;
    }
    this.loginService.socialLogin(payLoad).subscribe(
      (posRes) => {
        if (posRes.response == 3) {
          this.loginService.isSocilaLogin = true;
          this.loading = false;
          console.log("Sign up social media", posRes);
          localStorage.setItem("token", posRes.tokenID);
          if (posRes.customerInfo) {
            this.dialogRef.close(posRes);
          } else {
            this.dialogRef.close(this.socialLoginForm.value);
          }
        }
      },
      (err: HttpErrorResponse) => {
        this.loading = false;
        this.openSnackBar(err.message, "");
        if (err.error instanceof Error) {
          console.log("Cse", err.message);
        } else {
          console.log("SSE", err.message);
        }
      }
    );
  }
  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }
  signInWithFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
  }
  //message alerts showing
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: "red-snackbar",
      verticalPosition: "top",
    });
  }
  // Adding Address by reverse Geo coding
  onBlurMethod() {
    let str = this.setProfileForm.get("address").value;
    this.formatedAddress = str;
    this.jobService.getLat(str.replace(/\g/, "+")).subscribe(
      (res) => {
        if (!this.isSuggestionsSelected) {
          if (
            res &&
            res.results.length &&
            res.results[0].geometry &&
            res.results[0].geometry.location
          ) {
            this.setProfileForm.patchValue({
              latitude: "" + res.results[0].geometry.location.lat,
              longitude: "" + res.results[0].geometry.location.lng,
            });
          } else {
            this.setProfileForm.patchValue({
              latitude: "",
              longitude: "",
            });
          }
        } else {
          this.isSuggestionsSelected = false;
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          console.warn("Client Error", err.message);
        } else {
          console.warn("Server Error", err.message);
        }
      }
    );
  }
  public handleAddressChange(address: any) {
    this.isSuggestionsSelected = true;
    this.formatedAddress = address.formatted_address;
    this.setProfileForm.get("address").setValue(this.formatedAddress);
    let lat = address.geometry.location.lat();
    let lang = address.geometry.location.lng();
    this.setProfileForm.patchValue({
      latitude: "" + lat,
      longitude: "" + lang,
    });
  }

  // Password checking
  passwordConfirming(c: AbstractControl) {
    //: { invalid: boolean }

    if (c.get("password").value !== c.get("confirmPassword").value) {
      c.get("confirmPassword").setErrors({ NoPassswordMatch: true });
      //return { invalid: true };
    }
    return null;
  }
  resendOtp() {
    this.sendDetails();
  }
  checkAvailability() {
    if (
      this.customerSignUpForm.valid &&
      this.customerSignUpForm.value.isCheck == true
    ) {
      let payload = { ...this.customerSignUpForm.value };
      let obj = { userID: payload.userID };
      this.loginService.checkUserAvailability(obj).subscribe(
        (res) => {
          if (res.isActive) {
            this.sendDetails();
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
    } else {
      if (this.customerSignUpForm.value.isCheck == false) {
        this.checkError = true;
      }
    }
  }
  sendDetails() {
    if (
      this.customerSignUpForm.valid &&
      this.customerSignUpForm.value.isCheck == true
    ) {
      this.checkError = false;
      this.loading = true;
      let payLoad = { ...this.customerSignUpForm.value };
      delete payLoad.confirmPassword;
      delete payLoad.isCheck;
      if (this.isRefferalSignUp) {
        payLoad.signupReferralBy = this.refferalObj.referralCode;
      }
      this.loginService.customerSignup(payLoad).subscribe(
        (posRes) => {
          console.log("res sign up", posRes);
          if (posRes.response === 3) {
            this.loading = false;
            this.openSnackBar(posRes.message, "");
            localStorage.setItem("user", JSON.stringify(posRes.customerInfo));
            this.showLoginForm = false;
            this.showProfileForm = false;
            this.confirmPassword = true;
            this.heading = "Verification";
          } else {
            this.loading = false;
            this.openSnackBar(posRes.message, "");
            this.showProfileForm = false;
          }
        },
        (err: HttpErrorResponse) => {
          this.loading = false;
          if (err.error instanceof Error) {
            console.log("Client Side Error", err.headers);
          } else {
            console.log("Server side Error", err.message);
          }
        }
      );
    } else {
      if (this.customerSignUpForm.value.isCheck == false) {
        this.checkError = true;
      }
    }
  }
  //File Upload

  fileProgress(event) {
    let reader = new FileReader(); // HTML5 FileReader API
    let file = event.target.files[0];
    if (event.target.files && event.target.files[0]) {
      reader.readAsDataURL(file);

      // When file uploads set it to file formcontrol
      reader.onload = () => {
        this.previewUrl = reader.result;
        this.setProfileForm.get("profilePic").setValue(file);
      };
      // ChangeDetectorRef since file is loading outside the zone
      this.cd.markForCheck();
    }
  }

  // Function to remove uploaded file
  removeUploadedFile() {
    let newFileList = Array.from(this.el.nativeElement.files);
    this.previewUrl = "../../../assets/add-profile.png";

    this.setProfileForm.get("profilePic").setValue(null);
  }
  openCategories() {
    let dailogRef = this.dialog.open(PrefferedListComponent, {
      panelClass: "col-md-3",
      hasBackdrop: true,
      disableClose: true,
      data: this.selectedCat,
    });
    dailogRef.afterClosed().subscribe((res) => {
      if (res.length) {
        this.selectedCat = [...res];
      } else {
      }
    });
  }
  onWorkerSelected(event) {
    this.isWorkerSelected = event.checked;
    if (!event.checked) {
      this.selectedCat = [];
    }
  }
  submitProfile() {
    if (
      this.setProfileForm.value.postTask == true ||
      this.setProfileForm.value.completeTask == true
    ) {
      if (this.setProfileForm.value.completeTask == true) {
        if (!this.selectedCat.length) {
          this.openSnackBar("Select atleast one Prefered Task Category", "");
          return;
        }
      }
      if (this.setProfileForm.get("latitude").valid) {
        this.loading = true;
        let deviceID = this.pushMessageService.fcmToken;
        if (deviceID != null) {
          this.setProfileForm.patchValue({
            deviceToken: this.pushMessageService.fcmToken,
          });
        }
        this.setProfileForm.patchValue({
          userID: this.customerSignUpForm.value.userID,
          completeTask: "" + this.setProfileForm.value.completeTask,
          postTask: "" + this.setProfileForm.value.postTask,
        });
        let formData = new FormData();
        formData.append(
          "profilePic",
          this.setProfileForm.get("profilePic").value
        );
        let payLoad = { ...this.setProfileForm.value };
        payLoad.dob = new Date(payLoad.dob).toLocaleDateString();
        payLoad.phoneNumber = "+60" + payLoad.phoneNumber;
        payLoad.category = this.selectedCat;
        delete payLoad.profilePic;
        formData.append("profileInfo", JSON.stringify(payLoad));
        // End Here
        // formData.append("userID", this.setProfileForm.get("userID").value);
        // formData.append(
        //   "firstName",
        //   this.setProfileForm.get("firstName").value
        // );
        // formData.append("lastName", this.setProfileForm.get("lastName").value);
        // formData.append("address", this.setProfileForm.get("address").value);
        // formData.append("latitude", this.setProfileForm.get("latitude").value);
        // formData.append(
        //   "longitude",
        //   this.setProfileForm.get("longitude").value
        // );
        // formData.append(
        //   "phoneNumber",
        //   this.setProfileForm.get("phoneNumber").value
        // );
        // formData.append(
        //   "completeTask",
        //   this.setProfileForm.get("completeTask").value
        // );
        // formData.append("postTask", this.setProfileForm.get("postTask").value);
        // Below line is already commented
        // formData.append("deviceID",this.setProfileForm.get('deviceID').value)
        // formData.append(
        //   "deviceToken",
        //   this.setProfileForm.get("deviceToken").value
        // );
        // formData.append(
        //   "deviceType",
        //   this.setProfileForm.get("deviceType").value
        // );
        // formData.append(
        //   "dob",
        //   new Date(this.setProfileForm.value.dob).toLocaleDateString()
        // );
        this.loginService.setProfile(formData, this.token).subscribe(
          (posRes) => {
            if (posRes.response == 3) {
              this.loading = false;
              this.openSnackBar(posRes.message, "");
              localStorage.setItem("user", JSON.stringify(posRes.customerInfo));
              this.dialogRef.close(posRes);
            } else {
              this.loading = false;
              this.openSnackBar(posRes.message, "");
            }
          },
          (err) => {
            this.loading = false;
            console.log("Set Profile", err);
          }
        );
      } else {
        this.openSnackBar("Enter Valid address", "");
      }
    }
  }
  closeTab() {
    if (this.isRefferalSignUp) {
      localStorage.removeItem("refferal");
    }
    this.dialogRef.close();
  }
  submit() {
    this.showProfileForm = true;
  }
  openLogin() {
    this.dialogRef.close();
    this.loginService.callLogin.next(true);
  }

  sendOtp() {
    this.loading = true;
    this.verificationForm.patchValue({
      userID: this.customerSignUpForm.value.userID,
    });
    console.log(this.verificationForm.value);
    this.loginService.verify(this.verificationForm.value).subscribe(
      (posRes) => {
        if (posRes.response == 3) {
          this.loading = false;
          this.heading = "Profile";
          localStorage.setItem("token", posRes.access_token);
          this.token = posRes.access_token;
          this.confirmPassword = false;
          this.showProfileForm = true;
        } else {
          this.loading = false;
          this.openSnackBar(posRes.message, "");
        }
      },
      (err) => {
        this.loading = false;
        console.log("Err", err);
      }
    );
  }
}
