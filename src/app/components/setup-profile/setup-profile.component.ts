import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
  Inject,
} from "@angular/core";
import { Validators, FormGroup, FormBuilder } from "@angular/forms";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatSnackBar,
  MatDialog,
} from "@angular/material";
import { HeaderComponent } from "../header/header.component";
import { LoginService } from "src/app/services/login.service";
import { PushMessagingService } from "src/app/services/push-messaging.service";
import { JobsService } from "src/app/services/jobs.service";
import { PrefferedListComponent } from "../preffered-list/preffered-list.component";

@Component({
  selector: "app-setup-profile",
  templateUrl: "./setup-profile.component.html",
  styleUrls: ["./setup-profile.component.css"],
})
export class SetupProfileComponent implements OnInit {
  previewUrl: any;
  loading: boolean = false;
  isSuggestionsSelected: boolean = false;
  setProfileForm: FormGroup;
  token: any;
  maxDate: any;
  minDate: any;
  @ViewChild("fileInput", { static: true }) el: ElementRef;
  formatedAddress = "";
  isWorkerSelected: boolean = true;
  selectedCat: Array<any> = [];
  options = {
    componentRestrictions: {
      country: ["MY"],
    },
  };
  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    private http: HttpClient,
    private cd: ChangeDetectorRef,
    private dialogRef: MatDialogRef<HeaderComponent>,
    private loginService: LoginService,
    private jobService: JobsService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar,
    private pushMessageService: PushMessagingService
  ) {}

  ngOnInit() {
    let eighteenYearsFromNow = new Date();
    this.maxDate = new Date(
      eighteenYearsFromNow.setFullYear(eighteenYearsFromNow.getFullYear() - 18)
    );
    this.minDate = new Date(
      eighteenYearsFromNow.setFullYear(eighteenYearsFromNow.getFullYear() - 82)
    );
    this.token = localStorage.getItem("token");
    this.previewUrl = "https://liveapi.startasker.com/user.png";
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
    this.http
      .get(this.previewUrl, { responseType: "blob" })
      .subscribe((file) => {
        let imgFile = new File([file], "userImg.jpg");
        this.setProfileForm.get("profilePic").setValue(imgFile);
      });
    this.setupProfile();
  }

  //message alerts showing
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: "red-snackbar",
      verticalPosition: "top",
    });
  }
  setupProfile() {
    if (this.data.register_type) {
      if (
        this.data.register_type.toLowerCase() == "google" ||
        this.data.register_type.toLowerCase() == "facebook"
      ) {
        this.setProfileForm.patchValue({
          userID: this.data.userID,
          firstName: this.data.firstName,
          lastName: this.data.lastName,
        });
        this.previewUrl = this.data.profilePic;
        this.http
          .get(this.previewUrl, { responseType: "blob" })
          .subscribe((file) => {
            let imgFile = new File([file], "userImg.jpg");
            this.setProfileForm.get("profilePic").setValue(imgFile);
          });
      } else {
        this.setProfileForm.patchValue({
          userID: this.data.userID,
        });
      }
    } else {
      this.setProfileForm.patchValue({
        userID: this.data.userID,
        firstName: this.data.firstName,
        lastName: this.data.lastName,
      });
      this.previewUrl = this.data.profilePic;
      this.http
        .get(this.previewUrl, { responseType: "blob" })
        .subscribe((file) => {
          let imgFile = new File([file], "userImg.jpg");
          this.setProfileForm.get("profilePic").setValue(imgFile);
        });
    }
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
  // Adding formated Address
  onBlurMethod() {
    let str = this.setProfileForm.get("address").value;
    this.formatedAddress = str;
    this.jobService.getLat(str.replace("\\s+", " ")).subscribe(
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
          debugger;
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
  closeTab() {
    this.dialogRef.close();
  }
  onWorkerSelected(event) {
    this.isWorkerSelected = event.checked;
    if (!event.checked) {
      this.selectedCat = [];
    }
  }
  // Submit profile method
  submitProfile() {
    if (
      this.setProfileForm.value.postTask == true ||
      this.setProfileForm.value.completeTask == true
    ) {
      if (this.setProfileForm.value.completeTask == true) {
        if (!this.selectedCat.length) {
          this.openSnackBar("Select atleast one Prefered Task Category", "");
          this.loading = false;
          return;
        }
      }

      if (this.setProfileForm.get("latitude").valid) {
        this.loading = true;

        this.setProfileForm.patchValue({
          completeTask: "" + this.setProfileForm.value.completeTask,
          postTask: "" + this.setProfileForm.value.postTask,
        });

        let formData = new FormData();
        if (this.setProfileForm.value.profilePic != "") {
          formData.append(
            "profilePic",
            this.setProfileForm.get("profilePic").value
          );
        }
        let deviceID = this.pushMessageService.fcmToken;
        if (deviceID != null) {
          this.setProfileForm.patchValue({
            deviceToken: this.pushMessageService.fcmToken,
          });
        }
        let payLoad = { ...this.setProfileForm.value };
        payLoad.dob = new Date(payLoad.dob).toLocaleDateString();
        payLoad.phoneNumber = "+60" + payLoad.phoneNumber;
        payLoad.category = this.selectedCat;
        delete payLoad.profilePic;
        formData.append("profileInfo", JSON.stringify(payLoad));
        // End Here
        this.loginService.setProfile(formData, this.token).subscribe(
          (posRes) => {
            console.log("Set Profile", posRes);
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
          (err: HttpErrorResponse) => {
            this.loading = false;
            console.log("Set Profile", err);
            if (err.error instanceof Error) {
              this.openSnackBar(err.message, "Client Error");
            } else {
              this.openSnackBar(err.message, "Server Error");
            }
          }
        );
      } else {
        this.openSnackBar("Enter Valid Address", "");
      }
    }
  }
}
