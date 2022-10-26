import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
} from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { LoginService } from "src/app/services/login.service";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { MatSnackBar, MatDialog, MatBottomSheet } from "@angular/material";
import { Router } from "@angular/router";
import { UserServiceService } from "src/app/services/user-service.service";
import { JobsService } from "src/app/services/jobs.service";
import { DeleteDialogComponent } from "../delete-dialog/delete-dialog.component";
import { AttachmentSwiperComponent } from "../attachment-swiper/attachment-swiper.component";
import { SidebarComponent } from "../sidebar/sidebar.component";
import { PrefferedListComponent } from "../preffered-list/preffered-list.component";
@Component({
  selector: "app-profile-settings",
  templateUrl: "./profile-settings.component.html",
  styleUrls: ["./profile-settings.component.css"],
})
export class ProfileSettingsComponent implements OnInit {
  user: any;
  loading: boolean = false;
  setProfileForm: FormGroup;
  profilePicForm: FormGroup;
  galleryForm: FormGroup;
  maxDate: any;
  minDate: any;
  previewUrl: any;
  token: any;
  isFileUploaded: boolean = true;
  isGalleryUpdated: boolean = false;
  initialValues: any;
  baseUrl: any;
  videoFileCount: number = 0;
  selectedCat: Array<any> = [];
  isWorkerSelected: boolean = true;
  @ViewChild("fileInput", { static: true }) el: ElementRef;
  formatedAddress = "";
  isSuggestionsSelected: boolean = false;
  options = {
    componentRestrictions: {
      country: ["MY"],
    },
  };
  listOfVideos: Array<any> = [];
  galleryImages: Array<any> = [];
  isWordThere: boolean = false;
  restrictedKeys: Array<string> = [
    "emailid",
    "email",
    "contact me",
    "mail",
    "mailid",
    "whatsapp",
    "gmailid",
    "gmail",
    " my no",
    "contact no",
    "contact number",
    "site",
    "website",
    "link",
    "address",
    "my location",
    "number",
    "id",
    "phone",
    "phone number",
    "fb",
    "facebook",
    "fb id",
    "+60",
    "60",
    "contact details",
    "phone details",
    "weblink",
    "web site",
    "Instagram",
  ];
  websiteKeys: Array<string> = [
    "https",
    ".in",
    ".org",
    ".edu",
    ".mil",
    ".net",
    ".io",
    ".gov",
    "http",
    "@gmail.com",
    ".com",
  ];
  constructor(
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog,
    private loginService: LoginService,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router,
    private jobService: JobsService,
    private userService: UserServiceService
  ) {
    this.userService.isFetchUser.subscribe((val) => {
      if (val) {
        this.fetchData();
      }
    });
  }

  ngOnInit() {
    this.baseUrl = this.loginService.baseUrl;
    let eighteenYearsFromNow = new Date();
    this.maxDate = new Date(
      eighteenYearsFromNow.setFullYear(eighteenYearsFromNow.getFullYear() - 18)
    );
    this.minDate = new Date(
      eighteenYearsFromNow.setFullYear(eighteenYearsFromNow.getFullYear() - 82)
    );
    this.listOfVideos = [];
    this.galleryImages = [];
    this.profilePicForm = this.fb.group({
      userID: [""],
      profilePic: ["", Validators.required],
    });
    this.previewUrl = "https://liveapi.startasker.com/user.png";
    this.user = JSON.parse(localStorage.getItem("user"));
    this.token = localStorage.getItem("token");
    this.setProfileForm = this.fb.group({
      userID: [""],
      firstName: ["", Validators.required],
      lastName: ["", Validators.required],
      latitude: ["", Validators.required],
      longitude: ["", Validators.required],
      businessNumber: ["", Validators.required],
      address: ["", Validators.required],
      birthDay: [""],
      aboutMe: [""],
      postTask: [false],
      completeTask: [false],
      gallery: [""],
    });
    this.galleryForm = this.fb.group({
      updateInfo: this.fb.group({
        userID: [""],
      }),
    });
    if (this.user != null) {
      this.fetchData();
    } else {
      this.router.navigateByUrl("/home");
    }
  }

  //message alerts showing
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: "red-snackbar",
      verticalPosition: "top",
    });
  }
  onBlurMethod() {
    let str = this.setProfileForm.get("address").value;
    this.formatedAddress = str;
    this.jobService.getLat(str.replace(/\g/, "+")).subscribe(
      (res) => {
        console.log("Address", res.results[0]);
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
            console.log("Form Value", this.setProfileForm.value);
          } else {
            this.setProfileForm.patchValue({
              latitude: "",
              longitude: undefined,
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
    let lat = address.geometry.location.lat();
    let lang = address.geometry.location.lng();
    this.setProfileForm.patchValue({
      latitude: "" + lat,
      longitude: "" + lang,
    });
    this.formatedAddress = address.formatted_address;
    this.setProfileForm.get("address").setValue(this.formatedAddress);
  }
  openVerifyPhone() {
    this.userService.openVerifyPhone.next(true);
  }
  fetchData() {
    this.loginService.showLoader.next(true);
    let id = { userID: this.user.userID };
    this.loginService.fetchUserDetails(id).subscribe(
      (posRes) => {
        if (posRes.response == 3) {
          this.loginService.showLoader.next(false);
          this.userService.isFetchUser.next(false);
          localStorage.setItem("user", JSON.stringify(posRes.customerInfo[0]));
          this.setValues(posRes.customerInfo[0]);
        } else {
          this.loginService.showLoader.next(false);
        }
      },
      (err: HttpErrorResponse) => {
        this.loginService.showLoader.next(false);
        if (err.error instanceof Error) {
          console.log("CSE", err.message);
        } else {
          console.log("SSE", err.message);
        }
      }
    );
  }
  removeImg(img, ind) {
    let isVideo: boolean = false;
    let dailogRef = this.dialog.open(DeleteDialogComponent, {
      panelClass: "col-md-3",
      hasBackdrop: true,
      disableClose: true,
      data: "Do you want to delete this file",
    });
    dailogRef.afterClosed().subscribe((res) => {
      if (res) {
        let path = "";
        if (img.substring(img.lastIndexOf(".") + 1) == "png") {
          let arr = img.split(".");
          path = arr[0] + ".mp4";
          isVideo = true;
        } else {
          path = img;
        }
        this.loginService.showLoader.next(true);
        let obj = {
          userID: this.user.userID,
          path: path,
        };
        let token = localStorage.getItem("token");
        this.userService.deleteGalleryFiles(obj, token).subscribe(
          (posRes) => {
            this.loginService.showLoader.next(false);
            this.openSnackBar(posRes.message, "");
            if (posRes.response == "3") {
              this.galleryImages.splice(ind, 1);
              if (isVideo) {
                let i = -1;
                i = this.listOfVideos.findIndex((val) => {
                  return val == path;
                });
                if (i != -1) {
                  this.listOfVideos.splice(i, 1);
                }
              }
            }
          },
          (err: HttpErrorResponse) => {
            this.openSnackBar(err.message, "");
            this.loginService.showLoader.next(false);
          }
        );
      }
    });
    this.isGalleryUpdated = true;
  }
  setValues(info) {
    this.videoFileCount = 0;
    this.galleryImages = [];
    this.listOfVideos = [];
    this.galleryForm.patchValue({
      updateInfo: {
        userID: info.userID,
      },
    });
    this.isWorkerSelected = info.completeTask;
    this.setProfileForm.patchValue({
      userID: info.userID,
      firstName: info.firstName,
      lastName: info.lastName,
      businessNumber: info.phoneNumber,
      address: info.address,
      postTask: info.postTask,
      completeTask: info.completeTask,
      latitude: "" + info.loc[0],
      longitude: "" + info.loc[1],
      aboutMe: info.aboutMe,
    });
    const date = new Date(info.dob);
    if (isNaN(date.getTime())) {
      if (info.dob) {
        const dateArray = info.dob.split("/");
        console.log("Dates Array", dateArray);

        if (dateArray && dateArray.length === 3) {
          const newDateFormat = `${dateArray[1]}/${dateArray[0]}/${dateArray[2]}`;
          console.log("New Date Formate", newDateFormat);

          if (newDateFormat) {
            this.setProfileForm
              .get("birthDay")
              .setValue(new Date(newDateFormat));
          }
        }
      }
    } else {
      this.setProfileForm.get("birthDay").setValue(new Date(info.dob));
    }
    this.selectedCat = info.category;
    if (info.gallery.length != 0) {
      info.gallery.forEach((val, index) => {
        if (val.substring(val.lastIndexOf(".") + 1) == "mp4") {
          this.videoFileCount += 1;
          this.listOfVideos.push(val);
        } else {
          this.galleryImages.push(val);
        }
      });
      this.initialValues = this.setProfileForm.value;
    }
    this.previewUrl = this.baseUrl + info.profilePic;
    this.http
      .get(this.previewUrl, { responseType: "blob" })
      .subscribe((data) => {
        let file = new File([data], "sample.jpg");
        this.profilePicForm.get("profilePic").setValue(file);
        this.loginService.profilePic.next(this.previewUrl);
        this.loginService.checkIsImgUpdated.next(true);
      });
    this.isGalleryUpdated = false;
    if (!info.category.length && this.isWorkerSelected) {
      this.openCategories();
    }
  }
  onWorkerSelected(event) {
    this.isWorkerSelected = event.checked;
  }
  openCategories() {
    let dailogRef = this.dialog.open(PrefferedListComponent, {
      panelClass: "col-md-3",
      hasBackdrop: true,
      disableClose: true,
      data: this.selectedCat,
    });
    dailogRef.afterClosed().subscribe((res) => {
      if (res && res.length) {
        this.setProfileForm.markAsDirty();
        this.selectedCat = [...res];
      } else {
        if (!this.user.category.length && this.isWorkerSelected) {
          this.openSnackBar(
            "Please select the preferred tasks, you choosed as a worker",
            ""
          );
        }
      }
    });
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
        this.profilePicForm.get("profilePic").setValue(file);
        this.isFileUploaded = true;
      };
      // ChangeDetectorRef since file is loading outside the zone
      this.cd.markForCheck();
    }
  }
  // Images to gallery
  addToGallery(event) {
    if (this.galleryImages.length <= 5) {
      let reader = new FileReader(); // HTML5 FileReader API
      let file = event.target.files[0];
      if (event.target.files && event.target.files[0]) {
        reader.readAsDataURL(file);
        this.isGalleryUpdated = true;
        // When file uploads set it to file formcontrol
        let formData = new FormData();
        formData.append(
          "updateInfo",
          JSON.stringify(this.galleryForm.get("updateInfo").value)
        );
        if (file.size <= 20971520) {
          reader.onload = () => {
            if (file.type == "video/mp4") {
              formData.append("video", file);
              if (this.videoFileCount <= 1) {
                this.loginService.showLoader.next(true);
                this.userService.uploadGalleryFiles(formData).subscribe(
                  (posRes) => {
                    console.log("Gallery Responce", posRes);
                    this.loginService.showLoader.next(false);
                    if (posRes.response == 3) {
                      this.galleryImages.push(posRes.thumblerPath);
                      this.listOfVideos.push(posRes.videoPath);
                      this.videoFileCount += 1;
                      console.log("List of Videos", this.listOfVideos);
                    } else {
                      this.openSnackBar("posRes.message", "");
                    }
                  },
                  (err: HttpErrorResponse) => {
                    console.log(err);
                    this.loginService.showLoader.next(false);
                    if (err.error instanceof Error) {
                      console.warn("ERROR", err.message);
                    } else {
                      console.warn("ERROR", err.message);
                    }
                  }
                );
              } else {
                this.openSnackBar("You can upload only 2 videos", "");
              }
            } else {
              formData.append("image", file);
              this.loginService.showLoader.next(true);
              this.userService.uploadGalleryFiles(formData).subscribe(
                (posRes) => {
                  this.loginService.showLoader.next(false);
                  if (posRes.response == 3) {
                    setTimeout(() => {
                      this.galleryImages.push(posRes.imagePath);
                    }, 100);
                  } else {
                    this.openSnackBar(posRes.message, "");
                    this.openSnackBar("posRes.message", "");
                  }
                },
                (err: HttpErrorResponse) => {
                  this.openSnackBar(err.error, "");
                  this.loginService.showLoader.next(false);
                  if (err.error instanceof Error) {
                    console.warn("ERROR", err.message);
                  } else {
                    console.warn("ERROR", err.message);
                  }
                }
              );
            }
            // if(this.listOfVideos.length <= 5){
            //   this.listOfVideos.push(file);
            //   this.galleryImages.push(reader.result);
            // }else{
            //   this.openSnackBar("Max upload count is 6 only","")
            // }
            this.isFileUploaded = true;
          };
        } else {
          this.openSnackBar("Uploaded File Should bellow 20MB", "");
        }
        // ChangeDetectorRef since file is loading outside the zone
        this.cd.markForCheck();
      }
    } else {
      this.openSnackBar("You can't upload more than 6 files..", "");
    }
  }
  // Function to remove uploaded file
  removeUploadedFile() {
    let newFileList = Array.from(this.el.nativeElement.files);
    this.previewUrl = "https://liveapi.startasker.com/user.png";
    this.setProfileForm.get("profilePic").setValue(null);
  }
  sendPhoto() {
    this.loginService.showLoader.next(true);
    let formData = new FormData();
    formData.append("userID", this.user.userID);
    formData.append("profilePic", this.profilePicForm.get("profilePic").value);
    let token = localStorage.getItem("token");
    this.jobService.updatePhoto(formData, token).subscribe(
      (posRes) => {
        if (posRes.response == 3) {
          this.fetchData();
          this.loginService.showLoader.next(false);
          this.openSnackBar(posRes.message, "");
        } else {
          this.loginService.showLoader.next(false);
          this.openSnackBar(posRes.message, "");
        }
      },
      (err: HttpErrorResponse) => {
        this.loginService.showLoader.next(false);
        if (err.error instanceof Error) {
          console.log("Client Side Error", err.message);
        } else {
          console.log("server Side Error", err.message);
        }
      }
    );
  }
  setSpace() {
    this.setProfileForm
      .get("aboutMe")
      .setValue(this.setProfileForm.value.aboutMe.trim());
  }
  aboutMeValidation() {
    this.isWordThere = false;
    let patt = new RegExp(/^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/);
    if (patt.test(this.setProfileForm.value.aboutMe)) {
      this.isWordThere = true;
      return false;
    }
    let strArray = this.setProfileForm.value.aboutMe.split(" ");
    strArray.forEach((element, index: number) => {
      let matchPattern = element.match(/\d+/g);
      if (matchPattern != null) {
        var withNoDigits = "";
        withNoDigits = element.replace(/[0-9]/g, "");

        var numb = element.match(/\d/g);
        numb = numb.join("");
        let word = withNoDigits.toLocaleLowerCase();
        if (
          word == "rm" ||
          word == "am" ||
          word == "pm" ||
          word == "year" ||
          word == "years" ||
          word == "hour" ||
          word == "hours"
        ) {
          this.isWordThere = false;
        } else {
          let nextWord = strArray[index + 1];
          let str = ["hours", "hour", "am", "pm", "year", "years"];
          if (!str.includes(nextWord)) {
            this.isWordThere = true;
            return false;
          }
        }
        if (numb.length > 5) {
          this.isWordThere = true;
          return false;
        }

        // if (element.substring(0, 2).toLowerCase() == "rm") {
        //   let num = element.substring(2);
        //   if (!isNaN(+num)) {
        //     if (num.length > 5) {
        //       this.isWordThere = true;
        //       return false;
        //     }
        //   } else {
        //     this.isWordThere = true;
        //     return;
        //   }
        // } else {
        //   this.isWordThere = true;
        //   return;
        // }
      }
    });
    strArray.forEach((key) => {
      this.restrictedKeys.forEach((wordKey) => {
        if (key == wordKey) {
          this.isWordThere = true;
          return false;
        }
      });
    });
    if (this.isWordThere) {
      return false;
    }
    this.websiteKeys.forEach((wordKey) => {
      if (this.setProfileForm.value.aboutMe.indexOf(wordKey) > -1) {
        this.isWordThere = true;
        return false;
      }
    });
    let str = this.setProfileForm.value.aboutMe;
    str = str.split(" ");
    str.forEach((val) => {
      if (!isNaN(val)) {
        if (val.length > 5) {
          this.isWordThere = true;
          return false;
        }
      }
    });
    if (this.isWordThere) {
      return false;
    }
    return true;
  }
  async submitProfile() {
    this.loginService.showLoader.next(true);
    console.log(this.setProfileForm.get("birthDay"));

    if (this.setProfileForm.valid) {
      if (
        this.setProfileForm.value.postTask == true ||
        this.setProfileForm.value.completeTask == true
      ) {
        this.loading = true;
        let formData = new FormData();
        if (!this.isWorkerSelected) {
          this.selectedCat = [];
        } else if (!this.selectedCat.length) {
          this.loginService.showLoader.next(false);
          this.loading = false;
          this.openSnackBar(
            "Please select the preferred tasks, you choosed as a worker",
            ""
          );
          return;
        }
        this.setProfileForm.patchValue({
          postTask: "" + this.setProfileForm.value.postTask,
          completeTask: "" + this.setProfileForm.value.completeTask,
        });
        let totalGallery = [];
        this.galleryImages.forEach((val) => {
          return totalGallery.push(val);
        });
        if (this.videoFileCount >= 1) {
          this.listOfVideos.forEach((val) => {
            return totalGallery.push(val);
          });
        }
        // About Me Validation
        let isValid = await this.aboutMeValidation();
        console.log("About Me", isValid);
        if (!isValid) {
          this.loginService.showLoader.next(false);
          this.setProfileForm.get("aboutMe").setErrors({ content: true });
          return;
        } else {
          this.setProfileForm.get("aboutMe").setErrors({ content: false });
        }
        let payLoad = { ...this.setProfileForm.value };
        payLoad.category = this.selectedCat;
        payLoad.gallery = totalGallery;
        if (this.setProfileForm.value.birthDay != "") {
          payLoad.birthDay = new Date(
            this.setProfileForm.value.birthDay
          ).toLocaleDateString();
        }

        this.userService.updateUserInfo(payLoad, this.token).subscribe(
          (posRes) => {
            if (posRes.response == 3) {
              this.loading = false;
              this.loginService.showLoader.next(false);
              this.openSnackBar(posRes.message, "");
              this.fetchData();
            } else {
              this.loading = false;
              this.loginService.showLoader.next(false);
              this.openSnackBar(posRes.message, "");
            }
          },
          (err: HttpErrorResponse) => {
            this.loginService.showLoader.next(false);
            this.loading = false;
            if (err.error instanceof Error) {
              console.warn("CSE", err.message);
            } else {
              console.warn("SSE", err.message);
            }
          }
        );
      }
    } else {
      this.loginService.showLoader.next(false);
      if (this.setProfileForm.get("latitude").valid) {
        this.openSnackBar("Enter all required fields..!", "");
      } else {
        this.openSnackBar("Enter valid location..!", "");
      }
    }
  }
  showGallery() {
    let dialogRef = this.dialog.open(AttachmentSwiperComponent, {
      panelClass: "col-md-4",
      hasBackdrop: true,
      disableClose: false,
      width: "40rem",
      data: this.galleryImages,
    });
  }
}
