import { Component, OnInit, Inject, ChangeDetectorRef } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { JobDetailsComponent } from "../job-details/job-details.component";
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from "@angular/material";
import { LoginService } from "src/app/services/login.service";
import { HttpErrorResponse } from "@angular/common/http";
import { JobsService } from "src/app/services/jobs.service";

@Component({
  selector: "app-make-an-offer",
  templateUrl: "./make-an-offer.component.html",
  styleUrls: ["./make-an-offer.component.css"],
})
export class MakeAnOfferComponent implements OnInit {
  user: any;
  userSubscribe: any;
  imageUpdate: boolean = false;
  bankAccountDetails: any;
  billingDetails: any;
  userUrl: any;
  baseUrl: string = "";
  maxDate: any = new Date();
  minDate: any;
  headings: string = "Make an Offer";
  index: number = 0;
  BankUpdated: boolean = false;
  dobUpdated: boolean = false;
  phoneUpdated: boolean = false;
  allUpdated: boolean = false;
  previewUrl: any;
  budgetValue: number = 0;
  serviceFee: number = 0;
  userReceivedFee: number = 0;
  isImageUploaded: boolean = false;
  billingAddressUpdated: boolean = false;
  isSuggestionsSelected: boolean = false;
  config = {
    allowNumbersOnly: true,
    length: 4,
    isPasswordInput: false,
    disableAutoFocus: false,
    placeholder: "",
    inputStyles: {
      width: "40px",
      height: "40px",
    },
  };
  profilePicForm: FormGroup;
  bankAccountForm: FormGroup;
  billingAddressForm: FormGroup;
  dobForm: FormGroup;
  phoneNumberForm: FormGroup;
  makeOfferForm: FormGroup;
  userId: string;
  token: string;
  offerStatus: string = "Confirmed";
  submitText: string = "Submit";
  isUpdateOffer: boolean = false;
  serverRes: any;
  loading: boolean = false;
  formatedAddress: any = "";
  isWordThere: boolean = false;
  shortLink: string = "";
  options = {
    componentRestrictions: {
      country: ["MY"],
    },
  };
  restrictedKeys: Array<string> = [
    "emailid",
    "email",
    "contact me",
    "mail",
    "mailid",
    "whatsapp",
    "gmailid",
    "gmail",
    "my no",
    "my number",
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
  websiteKeys: Array<any> = [
    "https",
    ".in",
    ".org",
    ".edu",
    ".mil",
    ".net",
    ".io",
    ".gov",
    "@gmail.com",
    ".com",
    "http",
  ];
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<JobDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private loginService: LoginService,
    private cd: ChangeDetectorRef,
    private jobService: JobsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    console.log("Data", this.data);
    this.getShortLink();
    this.baseUrl = this.loginService.baseUrl;
    let eighteenYearsFromNow = new Date();
    this.maxDate = new Date(
      eighteenYearsFromNow.setFullYear(eighteenYearsFromNow.getFullYear() - 18)
    );
    this.minDate = new Date(
      eighteenYearsFromNow.setFullYear(eighteenYearsFromNow.getFullYear() - 82)
    );
    if (this.data && this.data.mydata) {
      this.isUpdateOffer = true;
    }
    let userId = JSON.parse(localStorage.getItem("user"));
    if (userId.userID) {
      this.getUserDetails(userId.userID);
    }
    this.token = localStorage.getItem("token");
    this.profilePicForm = this.fb.group({
      userID: [""],
      profilePic: ["", Validators.required],
    });
    this.bankAccountForm = this.fb.group({
      userID: [""],
      Accountholdername: ["", Validators.required],
      Accountnumber: ["", [Validators.required, Validators.pattern("[0-9]*")]],
      BSB: ["", Validators.required],
    });
    this.billingAddressForm = this.fb.group({
      userID: [""],
      AddressLine1: ["", Validators.required],
      State: ["", Validators.required],
      Country: ["", [Validators.required]],
      Postcode: ["", Validators.required],
    });
    this.dobForm = this.fb.group({
      userID: [""],
      dob: ["", Validators.required],
    });
    this.phoneNumberForm = this.fb.group({
      userID: [""],
      phoneNumber: ["", Validators.required],
    });
    this.makeOfferForm = this.fb.group({
      postID: [""],
      offeredUserID: [""],
      authorName: [""],
      authorProfilePic: [""],
      budget: ["", [Validators.required, Validators.pattern("[0-9]*")]],
      message: ["", Validators.required],
    });
    this.makeOfferForm.patchValue({
      authorProfilePic: userId.profilePic,
    });
  }
  getUserDetails(user) {
    this.loginService.showLoader.next(true);
    let obj = { userID: user };
    let token = localStorage.getItem("token");
    this.userSubscribe = this.loginService.fetchUserDetails(obj).subscribe(
      (posRes) => {
        if (posRes.response == 3) {
          this.loginService.showLoader.next(false);
          this.user = posRes.customerInfo[0];
          this.checkUserDetails(this.user);
        } else {
          this.loginService.showLoader.next(false);
        }
      },
      (err: HttpErrorResponse) => {
        this.loginService.showLoader.next(false);
        this.openSnackBar("Server Failure please try after few minutes", "");
        if (err.error instanceof Error) {
          console.log("Clisent Side Error", err.message);
        } else {
          console.log("Server Side Error", err.message);
        }
      }
    );
  }
  checkUserDetails(user) {
    this.profilePicForm.patchValue({
      userID: user.userID,
    });
    this.bankAccountForm.patchValue({
      userID: user.userID,
    });
    this.billingAddressForm.patchValue({
      userID: user.userID,
    });
    this.dobForm.patchValue({
      userID: user.userID,
    });
    this.phoneNumberForm.patchValue({
      userID: user.userID,
    });
    this.makeOfferForm.patchValue({
      postID: this.data.totalData.postID,
      offeredUserID: user.userID,
      authorName: user.firstName,
    });
    if (this.data && this.data.mydata) {
      this.makeOfferForm.patchValue({
        budget: this.data.mydata.budget,
        message: this.data.mydata.authorMessages[0].message,
      });
      this.submitText = "Update";
    }
    if (user.profilePic != "") {
      this.imageUpdate = true;
      this.userUrl = "https://liveapi.startasker.com" + user.profilePic;
    } else {
      this.imageUpdate = false;
    }
    if (user.BankAccountDetailes != null) {
      this.BankUpdated = true;
      this.bankAccountDetails = user.BankAccountDetailes;
      this.bankAccountForm.patchValue({
        Accountholdername: this.bankAccountDetails.Accountholdername,
        Accountnumber: this.bankAccountDetails.Accountnumber,
        BSB: this.bankAccountDetails.BSB,
      });
    } else {
      this.BankUpdated = false;
    }
    if (user.BillingAddress != null) {
      this.billingAddressUpdated = true;
      this.billingDetails = user.BillingAddress;
    }
    if (user.dob != "") {
      this.dobUpdated = true;
    }
    if (user.phoneNumber != "") {
      this.phoneUpdated = true;
    }
    if (
      this.imageUpdate &&
      this.BankUpdated &&
      this.billingAddressUpdated &&
      this.phoneUpdated &&
      this.dobUpdated
    ) {
      this.allUpdated = true;
    } else {
      this.allUpdated = false;
    }
  }
  // Image Upload
  fileProgress(event) {
    let reader = new FileReader(); // HTML5 FileReader API
    let file = event.target.files[0];
    if (event.target.files && event.target.files[0]) {
      reader.readAsDataURL(file);

      // When file uploads set it to file formcontrol
      reader.onload = () => {
        this.previewUrl = reader.result;
        this.isImageUploaded = true;
        this.profilePicForm.get("profilePic").setValue(file);
      };
      // ChangeDetectorRef since file is loading outside the zone
      this.cd.markForCheck();
    }
  }
  sendPhoto() {
    this.loading = true;
    this.loginService.showLoader.next(true);
    let formData = new FormData();
    formData.append("userID", this.profilePicForm.get("userID").value);
    formData.append("profilePic", this.profilePicForm.get("profilePic").value);
    this.jobService.updatePhoto(formData, this.token).subscribe(
      (posRes) => {
        if (posRes.response == 3) {
          this.loginService.showLoader.next(false);
          this.loading = false;
          this.getUserDetails(this.user.userID);
          this.index = 0;
        } else {
          this.loginService.showLoader.next(false);
          this.loading = false;
          this.openSnackBar(posRes.message, "");
        }
      },
      (err: HttpErrorResponse) => {
        this.loginService.showLoader.next(true);
        this.openSnackBar("Server Failure please try after few minutes", "");
        if (err.error instanceof Error) {
          console.log("Client Side Error", err.message);
        } else {
          console.log("server Side Error", err.message);
        }
      }
    );
  }
  sendBankDetails() {
    this.loading = true;
    this.loginService.showLoader.next(true);
    let formData = new FormData();
    formData.append("userID", this.bankAccountForm.get("userID").value);
    formData.append(
      "Accountholdername",
      this.bankAccountForm.get("Accountholdername").value
    );
    formData.append(
      "Accountnumber",
      this.bankAccountForm.get("Accountnumber").value
    );
    formData.append("BSB", this.bankAccountForm.get("BSB").value);
    this.jobService.updateBankAccount(formData, this.token).subscribe(
      (posRes) => {
        if (posRes.response == 3) {
          this.getUserDetails(this.user.userID);
          this.loginService.showLoader.next(false);
          this.index = 0;
          this.loading = false;
        } else {
          this.loginService.showLoader.next(false);
          this.loading = false;
          this.openSnackBar(posRes.message, "");
        }
      },
      (err: HttpErrorResponse) => {
        this.loading = false;
        this.openSnackBar("Server Failure please try after few minutes", "");
        if (err.error instanceof Error) {
          console.log("CSE", err.message);
        } else {
          console.log("SSE", err.message);
        }
      }
    );
  }
  // Adding Address by reverse Geo coding
  onBlurMethod() {
    let str = this.billingAddressForm.get("AddressLine1").value;
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
            // this.billingAddressForm.patchValue({
            //   AddressLine1: res.results[0].formatted_address
            // })
            let address = res.results[0];
            address.address_components.forEach((val, index) => {
              if (val.types[0] == "postal_code") {
                this.billingAddressForm.patchValue({
                  Postcode: val.long_name,
                });
              }
              if (val.types[0] == "country") {
                this.billingAddressForm.patchValue({
                  Country: val.long_name,
                });
              }
              if (val.types[0] == "administrative_area_level_1") {
                this.billingAddressForm.patchValue({
                  State: val.long_name,
                });
              }
            });
          } else {
            this.billingAddressForm.patchValue({
              AddressLine1: "",
              Postcode: "",
              Country: "",
              State: "",
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
  handleAddressChange(address) {
    console.log("Adress", address);
    this.isSuggestionsSelected = true;
    address.address_components.forEach((val, index) => {
      if (val.types[0] == "postal_code") {
        this.billingAddressForm.patchValue({
          Postcode: val.long_name,
        });
      }
      if (val.types[0] == "country") {
        this.billingAddressForm.patchValue({
          Country: val.long_name,
        });
      }
      if (val.types[0] == "administrative_area_level_1") {
        this.billingAddressForm.patchValue({
          State: val.long_name,
        });
      }
    });
    this.formatedAddress = address.formatted_address;
    this.billingAddressForm.patchValue({
      AddressLine1: address.formatted_address,
    });
  }
  sendBillingAddressDetails() {
    this.loading = true;
    let formData = new FormData();
    formData.append("userID", this.billingAddressForm.get("userID").value);
    formData.append(
      "AddressLine1",
      this.billingAddressForm.get("AddressLine1").value
    );
    formData.append("State", this.billingAddressForm.get("State").value);
    formData.append("Country", this.billingAddressForm.get("Country").value);
    formData.append("Postcode", this.billingAddressForm.get("Postcode").value);
    this.jobService.updateAddress(formData, this.token).subscribe(
      (posRes) => {
        if (posRes.response == 3) {
          this.loading = false;
          this.getUserDetails(this.user.userID);
          this.index = 0;
        } else {
          this.loading = false;
          alert(posRes.message);
        }
      },
      (err: HttpErrorResponse) => {
        this.loading = false;
        if (err.error instanceof Error) {
          console.log("CSE", err.message);
        } else {
          console.log("SSE", err.message);
        }
      }
    );
  }
  sendDob() {
    this.loading = true;
    let formData = new FormData();
    formData.append("userID", this.dobForm.get("userID").value);
    formData.append(
      "dob",
      new Date(this.dobForm.value.dob).toLocaleDateString()
    );
    this.jobService.updateDob(formData, this.token).subscribe(
      (posRes) => {
        if (posRes.response == 3) {
          this.getUserDetails(this.user.userID);
          this.index = 0;
          this.loading = false;
        } else {
          this.loading = false;
          alert(posRes.message);
        }
      },
      (err: HttpErrorResponse) => {
        this.loading = false;
        if (err.error instanceof Error) {
          console.log("CSE", err.message);
        } else {
          console.log("SSE", err.message);
        }
      }
    );
  }
  sendMobileNumber() {
    this.loading = true;
    let formData = new FormData();
    formData.append("userID", this.phoneNumberForm.get("userID").value);
    formData.append(
      "phoneNumber",
      this.phoneNumberForm.get("phoneNumber").value
    );
    this.jobService.updateMobileNumber(formData, this.token).subscribe(
      (posRes) => {
        if (posRes.response == 3) {
          this.index = 6;
          this.loading = false;
        } else {
          this.loading = false;
          alert(posRes.message);
        }
      },
      (err: HttpErrorResponse) => {
        this.loading = false;
        if (err.error instanceof Error) {
          console.log("CSE", err.message);
        } else {
          console.log("SSE", err.message);
        }
      }
    );
  }
  closeWithRes() {
    this.dialogRef.close(this.serverRes);
  }
  //message alerts showing
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: "red-snackbar",
    });
  }
  getShortLink(): any {
    this.loginService.showLoader.next(true);
    let { userID, postID } = this.data.totalData;
    let obj = {
      dynamicLinkInfo: {
        domainUriPrefix: "https://startasker.page.link",
        link: `https://www.startasker.com/#/home/?postedby=${userID}&postId=${postID}`,
        androidInfo: {
          androidPackageName: "com.star.startasker",
        },
        iosInfo: {
          iosBundleId: "com.startasker.StarTasker",
        },
        socialMetaTagInfo: {
          socialTitle: this.data.totalData.postTitle,
          socialDescription: `Check this Task`,
          socialImageLink:
            "https://www.startasker.com/assets/startasker-new-logo.png",
        },
      },
    };

    this.loginService.getShortLink(obj).subscribe(
      (posRes) => {
        this.loginService.showLoader.next(false);
        this.shortLink = posRes.shortLink;
      },
      (err: HttpErrorResponse) => {
        this.loginService.showLoader.next(false);
        // this.errHandler(err);
      }
    );
  }
  makeAnOffer() {
    if (!this.isUpdateOffer) {
      this.loginService.showLoader.next(true);
      let payLoad = { ...this.makeOfferForm.value };
      payLoad.phoneNumber = this.user.phoneNumber;
      payLoad.profileLink = `https://www.staging.startasker.com/#/profile/${this.user._id}`;
      payLoad.taskLink = this.shortLink;
      payLoad.customerName = this.user.firstName;
      this.jobService.makeAnOffer(payLoad, this.token).subscribe(
        (posRes) => {
          this.loginService.showLoader.next(false);
          if (posRes.response == 3) {
            this.serverRes = posRes;
            this.index = 8;
          } else {
            this.openSnackBar(posRes.message, "");
            this.dialogRef.close();
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
    } else {
      let obj = {
        postID: this.makeOfferForm.value.postID,
        offeredUserID: this.makeOfferForm.value.offeredUserID,
        budget: this.makeOfferForm.value.budget,
        message: this.makeOfferForm.value.message,
      };

      this.loginService.showLoader.next(true);
      this.jobService.updateAnOffer(obj, this.token).subscribe(
        (posRes) => {
          this.loginService.showLoader.next(false);
          if (posRes.response == 3) {
            this.serverRes = posRes;
            this.index = 8;
            this.offerStatus = "Updated";
          } else {
            this.openSnackBar(posRes.message, "");
            this.dialogRef.close();
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
  }
  back() {
    this.index = 7;
    this.headings = "Make Offer";
  }
  previewOffer() {
    this.isWordThere = false;
    let patt = new RegExp(/^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/);
    if (patt.test(this.makeOfferForm.value.message)) {
      this.isWordThere = true;
      return;
    }
    let strArray = this.makeOfferForm.value.message.split(" ");
    strArray.forEach((element, index) => {
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
          if (word === "") {
            let nextWord = strArray[index + 1];
            let str = ["hours", "hour", "am", "pm", "year", "years"];
            if (!str.includes(nextWord)) {
              this.isWordThere = true;
              return;
            }
          }
        }
        if (numb.length > 5) {
          this.isWordThere = true;
          return;
        }
        // if (element.substring(0, 2).toLowerCase() == "rm") {
        //   let num = element.substring(2);
        //   if (!isNaN(+num)) {
        //     if (num.length > 5) {
        //       this.isWordThere = true;
        //       return;
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
          return;
        }
      });
    });
    if (this.isWordThere) {
      return;
    }
    this.websiteKeys.forEach((wordKey) => {
      if (this.makeOfferForm.value.message.indexOf(wordKey) > -1) {
        this.isWordThere = true;
        return;
      }
    });
    let str = this.makeOfferForm.value.message;
    str = str.split(" ");
    str.forEach((val) => {
      if (!isNaN(val)) {
        if (val.length >= 5) {
          this.isWordThere = true;
          return;
        }
      }
    });
    if (this.isWordThere) {
      return;
    }
    this.budgetValue = this.makeOfferForm.value.budget;
    this.serviceFee = (20 / 100) * this.budgetValue;
    this.userReceivedFee = this.budgetValue - this.serviceFee;
    this.index = 9;
    this.headings = "Preview Offer";
  }
  onOtpChange(event) {}
  backToZero() {
    this.index = 0;
    this.headings = "Make an Offer";
  }
  closeTab() {
    this.dialogRef.close();
  }
  addPhoto() {
    this.index = 1;
    this.headings = "Profile Photo";
  }
  addBankDetails() {
    this.index = 2;
    this.headings = "Add Bank Account";
  }
  addAddress() {
    this.index = 3;
    this.headings = "Billing Address";
  }
  addDob() {
    this.index = 4;
    this.headings = "Date of Birth";
  }
  addPhoneNumber() {
    // this.index = 5;
    // this.headings = "Mobile Number"
  }
  showMakeOffer() {
    this.index = 7;
  }
}
