import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { JobsService } from "src/app/services/jobs.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Notification, Subscription } from "rxjs";
import { PaymentDialogComponent } from "../payment-dialog/payment-dialog.component";
import { MatDialog, MatSnackBar } from "@angular/material";
import { PostAJobComponent } from "../post-ajob/post-ajob.component";
import { HttpErrorResponse } from "@angular/common/http";
import { FormGroup, FormBuilder } from "@angular/forms";
import { ReplyDialogComponent } from "../reply-dialog/reply-dialog.component";
import { CancelComponent } from "../cancel/cancel.component";
import { AttachmentSwiperComponent } from "../attachment-swiper/attachment-swiper.component";
import { LoginService } from "src/app/services/login.service";
import { MakeAnOfferComponent } from "../make-an-offer/make-an-offer.component";
import { WithdrawComponent } from "../withdraw/withdraw.component";
import { sha256, sha224 } from "js-sha256";
import { PaymentStatusComponent } from "../payment-dialog/payment-status/payment-status.component";
import { combineLatest } from "rxjs";
import { setDate } from "date-fns";

@Component({
  selector: "app-my-task-details",
  templateUrl: "./my-task-details.component.html",
  styleUrls: ["./my-task-details.component.css"],
})
export class MyTaskDetailsComponent implements OnInit {
  id: any;
  showOptions: boolean = false;
  amount: number = 0;
  routeSub: Subscription;
  showDetails: boolean = false;
  selectedOffersLength: number = 0;
  totalSubscribe: Subscription;
  rawData: any = {};
  sampleData: any = {};
  offers: any = [];
  date: any;
  commentForm: FormGroup;
  isMakeOffersCounteReached: boolean = false;
  user: any;
  cuttingAmount: number = 0;
  receivedAmount: any = 0;
  myOfferInfo: any = {};
  couponAmount: string = "";
  loggedIn: boolean = false;
  amIAppliedThisTask: boolean = false;
  amIHired: boolean = false;
  comments: any;
  baseUrl: string = "https://liveapi.startasker.com";
  image: string;
  selected: string = "More Options";
  postStatus: any = [];
  shareTaskTitle: string = "";
  shareUrl: string = "";
  isOfferedJob: boolean = false;
  isOfferedExpired: boolean = false;
  isTaskOpen: boolean = false;
  faceBookUrl: string = "";
  twitterUrl: string = "";
  linkedInUrl: string = "";
  public coupon: any;
  // Payment Variables
  public OrderNumber: any;
  public PaymentID: any;
  public orderDesc = "Purchasing";
  public merchantReturnURL = "http://startaskerdemo.surge.sh/#/home";
  public merchantCallBackURL = "";
  public custName = "John Doe";
  public custEmail = "Jason@gmail.com";
  public custPhone = "60126902328";
  public PageTimeout = 500;
  public custIP: any;
  public currencyCode = "MYR";
  public custOCP = "OCP";
  public PaymentDesc = "testing";
  public TransactionType = "SALE";
  public PymtMethod = "ANY";
  public merchantName = "Startasker";
  public merchantTermsURL = "https://www.startasker.com/terms/";
  public pass = "H71BRDU8";
  // H71BRDU8 old is CLS1234
  paymentObj: any;
  // PAyment variables End
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
    "my no",
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
    ,
    "contact details",
    "phone details",
    "weblink",
    "web site",
    "Instagram",
  ];
  websiteKeys: Array<string> = [
    "https",
    "http",
    "www.",
    ".in",
    ".org",
    ".edu",
    ".mil",
    ".net",
    ".io",
    ".gov",
    ".tech",
    "@gmail.com",
    ".com",
  ];
  @ViewChild("txtArea", { static: false }) someInput: ElementRef;
  constructor(
    private jobService: JobsService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private router: Router,
    private loginService: LoginService
  ) {}

  ngOnInit() {
    this.getIP();
    this.loggedIn = true;
    this.routeSub = this.activatedRoute.params.subscribe((params) => {
      //log the entire params object
      this.id = params["id"];
      this.getTaskDetails();
    });

    this.activatedRoute.queryParamMap.subscribe((params) => {
      this.paymentObj = { ...params };
    });
    this.user = JSON.parse(localStorage.getItem("user"));
    this.image = this.baseUrl + this.user.profilePic;
    this.commentForm = this.fb.group({
      postID: [""],
      author_url: [""],
      author: [""],
      author_comment: [""],
      author_email: [""],
      author_ip: [""],
      timeStamp: [""],
      gmt_timeStamp: [""],
    });
  }

  getIP() {
    this.loginService.getIPAddress().subscribe((res: any) => {
      this.custIP = res.ip;
    });
  }
  //message alerts showing
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: "red-snackbar",
    });
  }
  focusTextArea() {
    this.someInput.nativeElement.focus();
  }
  getTaskDetails() {
    let obj = {
      userID: this.id,
    };
    this.loginService.showLoader.next(true);
    this.showOptions = false;
    //  let token = localStorage.getItem('token')
    this.totalSubscribe = this.jobService.getMyTasks(obj).subscribe(
      (posRes) => {
        this.loginService.showLoader.next(false);
        if (posRes.response == 3) {
          this.rawData = posRes.jobsData[0];
          this.isOfferedJob =
            this.rawData.userID == this.user.userID ? false : true;
          this.isTaskOpen = this.rawData.post_Status == "Open" ? true : false;
          this.sampleData = posRes.jobsData[0];
          this.orderDesc = this.rawData.postTitle;
          let paymentStatusObj = JSON.parse(
            localStorage.getItem("paymentStatus")
          );
          if (
            this.rawData &&
            this.rawData.userInfo &&
            this.rawData.userInfo.phoneNumber
          ) {
            let num = this.rawData.userInfo.phoneNumber
              .replace(/[^0-9 ]/g, "")
              .replace(/ /g, "");
            if (num.substring(0, 2) != "60") {
              num = "+60" + num;
            }
            this.rawData.userInfo.phoneNumber = num;
          }
          if (paymentStatusObj && paymentStatusObj.paymentID) {
            this.paymentStatus();
          }
          this.loginService.showLoader.next(false);
          this.shareUrl =
            "https://www.startasker.com/#/browsejobs/job/" +
            this.rawData.postID;
          this.shareTaskTitle = this.rawData.postTitle;
          this.selectedOffersLength = 0;
          this.offers = this.rawData.offers;
          if (this.isOfferedJob) {
            let index = -1;
            index = this.offers.findIndex((val) => {
              return val.offeredUserID == this.user.userID;
            });
            if (index != -1) {
              this.myOfferInfo = this.offers[index];
              this.amIAppliedThisTask = true;
              this.amIHired = this.myOfferInfo.isTaskerHired;
              this.cuttingAmount = (20 / 100) * this.myOfferInfo.budget;
              this.receivedAmount =
                this.myOfferInfo.budget - this.cuttingAmount;
            } else {
              this.amIAppliedThisTask = false;
              this.myOfferInfo = {};
              this.cuttingAmount = 0;
              this.receivedAmount = 0;
            }
          }
          if (this.rawData.budget.budgetType.Total == false) {
            let num: number = parseInt(this.rawData.budget.Hours);
            this.rawData.budget.budget = num * this.rawData.budget.pricePerHour;
          }
          this.offers.forEach((val, index) => {
            val.isSelected = false;
            if (this.offers[index] && this.offers[index].phoneNumber) {
              let num = this.offers[index].phoneNumber
                .replace(/[^0-9 ]/g, "")
                .replace(/ /g, "");
              if (num.substring(0, 2) != "60") {
                num = "+60" + num;
              }
              this.offers[index].phoneNumber = num;
            }
            if (val.isTaskerHired && !val.isTaskerWithDraw) {
              this.selectedOffersLength += 1;
            }
            val.authorMessages.forEach((x, i) => {
              this.offers[index].authorMessages[i].timestamp = new Date(
                x.timestamp * 1
              );
            });
          });
          if (this.rawData.post_Status == "Expired") {
            this.postStatus = ["Copy"];
          } else if (this.rawData.post_Status == "Cancel") {
            this.postStatus = ["Copy"];
          } else if (this.rawData.post_Status == "Open") {
            this.postStatus = ["Edit", "Copy"];
          } else if (this.rawData.post_Status == "Assigned") {
            this.postStatus = ["Copy"];
          } else {
            this.postStatus = ["Edit"];
          }
          if (this.selectedOffersLength == 0) {
            this.postStatus.push("Cancel Task");
          }
          if (this.rawData.comments.length >= 1) {
            this.comments = this.rawData.comments;
            this.comments.forEach((val, index) => {
              this.comments[index].comment_date = new Date(
                val.comment_date * 1
              );
            });
          }
          this.date = new Date(posRes.jobsData[0].postModifyDate * 1);
        }
      },
      (err: HttpErrorResponse) => {
        this.loginService.showLoader.next(false);
        console.log("Error", err.error);
        this.openSnackBar(err.error, "");
      }
    );
  }
  openMakeOffer() {
    if (this.rawData.post_Status == "Open") {
      let data = {};
      if (this.amIAppliedThisTask) {
        data = {
          totalData: this.rawData,
          mydata: this.myOfferInfo,
        };
      } else {
        data = {
          totalData: this.rawData,
        };
      }
      let dialogRef = this.dialog.open(MakeAnOfferComponent, {
        panelClass: "col-md-4",
        hasBackdrop: true,
        disableClose: true,
        data: data,
      });
      this.showOptions = false;
      dialogRef.afterClosed().subscribe((res) => {
        console.log(res);
        if (res != undefined) {
          if (res.response == 3) {
            this.openSnackBar(res.message, "");
            this.getTaskDetails();
          }
        }
      });
    } else {
      this.openSnackBar(
        `You cannot make offer for ${this.rawData.post_Status} task`,
        ""
      );
    }
  }
  withDrawOffer() {
    let message = " You want to withdraw from this Job?";
    let data = {
      isTaskWithdraw: true,
      message: message,
    };
    let obj = {
      postID: this.rawData.postID,
      offeredUserID: this.user.userID,
    };

    let dailogRef = this.dialog.open(WithdrawComponent, {
      panelClass: "col-md-3",
      hasBackdrop: true,
      disableClose: true,
      data: data,
    });

    dailogRef.afterClosed().subscribe((res) => {
      if (res == true) {
        let token = localStorage.getItem("token");
        this.jobService.withDrawOffer(obj, token).subscribe(
          (posRes) => {
            if (posRes.response == 3) {
              this.openSnackBar(posRes.message, "");
              this.getTaskDetails();
            } else {
              this.openSnackBar(posRes.message, "");
            }
          },
          (err: HttpErrorResponse) => {
            if (err.error instanceof Error) {
              console.warn("CSE", err.message);
            } else {
              console.warn("SSE", err.message);
            }
          }
        );
      } else {
        console.log(obj);
      }
    });
  }
  showAttachmentPop(image) {
    let dialogRef = this.dialog.open(AttachmentSwiperComponent, {
      panelClass: "col-md-4",
      hasBackdrop: true,
      disableClose: false,
      data: image,
      height: "50vh",
    });
  }
  changeCategory() {
    let payLoad = { ...this.rawData };
    payLoad.type = "Edit";
    let dialogRef = this.dialog.open(PostAJobComponent, {
      panelClass: "col-md-4",
      hasBackdrop: true,
      disableClose: true,
      data: payLoad,
    });
    this.showOptions = !this.showOptions;
    dialogRef.afterClosed().subscribe((res) => {
      if (res != undefined) {
        if (res.response == 3) {
          this.openSnackBar(res.message, "");
          this.getTaskDetails();
        } else {
          this.openSnackBar(res.message, "");
        }
      }
    });
  }
  updatePost(status) {
    if (status == "Cancel Task") {
      let dialogRef = this.dialog.open(CancelComponent, {
        panelClass: "col-md-4",
        hasBackdrop: true,
        disableClose: true,
      });
      dialogRef.afterClosed().subscribe((res) => {
        if (res.isReason == true) {
          this.delete(res.reason);
        }
      });
    }
    if (status == "Edit") {
      this.changeCategory();
    }
    if (status == "Copy") {
      this.copyTask();
    }
  }
  delete(reason) {
    let obj = {
      postID: this.id,
      reason: reason.trim(),
    };
    let token = localStorage.getItem("token");
    this.jobService.cancelTask(obj, token).subscribe(
      (posRes) => {
        if (posRes.response == 3) {
          this.getTaskDetails();
          this.openSnackBar(posRes.message, "");
        } else {
          this.openSnackBar(posRes.message, "");
        }
      },
      (err: HttpErrorResponse) => {
        this.openSnackBar(err.message, "");
        if (err.error instanceof Error) {
          console.log(err.message);
        } else {
          console.log(err.message);
        }
      }
    );
  }
  copyTask() {
    let payLoad = { ...this.rawData };
    payLoad.type = "Copy";
    let dialogRef = this.dialog.open(PostAJobComponent, {
      panelClass: "col-md-4",
      hasBackdrop: true,
      disableClose: true,
      data: payLoad,
    });
    this.showOptions = !this.showOptions;
    dialogRef.afterClosed().subscribe((res) => {
      if (res != undefined) {
        if (res.response == 3) {
          this.openSnackBar(res.message, "");
          this.getTaskDetails();
        } else {
          this.openSnackBar(res.message, "");
        }
      }
    });
  }
  verifyChecked(event, id) {
    if (this.selectedOffersLength <= this.rawData.numberOfWorkers) {
      let index = -1;
      index = this.offers.findIndex((item) => {
        return item.offeredUserID == id;
      });
      if (index != -1) {
        this.isMakeOffersCounteReached = false;
        if (event.checked) {
          this.selectedOffersLength += 1;
        } else {
          this.selectedOffersLength -= 1;
        }
        this.offers[index].isSelected = event.checked;
      }
      if (this.selectedOffersLength === this.rawData.numberOfWorkers) {
        this.isMakeOffersCounteReached = true;
      } else {
        this.isMakeOffersCounteReached = false;
      }
    } else {
      this.isMakeOffersCounteReached = true;
    }
  }
  reviewOffers() {
    if (this.selectedOffersLength >= 1) {
      let selectedOffers = this.offers.filter((val) => {
        return val.isSelected;
      });
      if (selectedOffers.length >= 1) {
        let dailogRef = this.dialog.open(PaymentDialogComponent, {
          panelClass: "col-md-4",
          hasBackdrop: true,
          disableClose: true,
          data: { taskTitle: this.rawData.postTitle, offers: selectedOffers },
        });
        dailogRef.afterClosed().subscribe((res) => {
          if (res !== false) {
            this.amount = 0;
            console.log("Selected Offers", res);
            let bookedTaskers = [];
            res.offers.forEach((val) => {
              debugger;
              let obj: any = {
                offeredUserID: val.offeredUserID,
                offeredUserName: val.authorName,
                budget: val.budget,
                offeredUserProfilePic: val.authorProfilePic,
                isCustomerCompletedTask: false,
                isTaskerCompletedTask: false,
                paymentStatusToProviderByAdmin: false,
                isWithDraw: false,
                ratingsToProvider: false,
                ratingsToPoster: false,
                isWithDrawCustomer: false,
              };
              if (val && val.phoneNumber) {
                obj.phoneNumber = val.phoneNumber;
              }
              this.amount += val.budget;
              bookedTaskers.push(obj);
            });
            if (res.isCouponApplied) {
              this.amount -= parseInt(res.couponObj.couponAmount);
              this.couponAmount = "-" + res.couponObj.couponAmount;
              localStorage.setItem("couponAmount", this.couponAmount);
            }
            localStorage.setItem("coupon", JSON.stringify(res.couponObj));
            localStorage.setItem(
              "selectedUsers",
              JSON.stringify(bookedTaskers)
            );
            this.hireTaskers(bookedTaskers);
            // this.makePayment()
          }
        });
      } else {
        this.openSnackBar("Select providers to proceed", "");
      }
    } else {
      this.openSnackBar("Select providers to proceed", "");
    }
  }
  // Payment to startasker
  makePayment() {
    // http://www.startasker.com/#/my-tasks/task/${this.rawData.postID}
    this.merchantReturnURL = `https://www.startasker.com/#/my-tasks/task/${this.rawData.postID}`;
    this.OrderNumber = this.PaymentID;
    // this.PaymentID = "CLS" + new Date().getTime();
    let money = this.amount.toFixed(2);
    let creatHash =
      this.pass +
      "CLS" +
      this.PaymentID +
      this.merchantReturnURL +
      money +
      this.currencyCode +
      this.custIP +
      this.PageTimeout;
    let hash = sha256(creatHash);
    let obj = {
      paymentID: this.PaymentID,
      amount: money,
    };
    localStorage.setItem("paymentStatus", JSON.stringify(obj));
    // https://test2pay.ghl.com/IPGSG/Payment.aspx
    // https://securepay.e-ghl.com/IPG/payment.aspx
    let form = `  <form name="frmPayment" method="post" action="https://securepay.e-ghl.com/IPG/payment.aspx">
     <input type="hidden" name="TransactionType" value="SALE">
     <input type="hidden" name="PymtMethod" value="ANY">
     <input type="hidden" name="custOCP" value="OCP">
     <input type="hidden" name="ServiceID" value="CLS">
     <input type="hidden" name="PaymentID" value="${this.PaymentID}">
     <input type="hidden" name="OrderNumber" value="${this.OrderNumber}">
     <input type="hidden" name="PaymentDesc" value="${this.orderDesc}">
     <input type="hidden" name="MerchantName" value="startasker">
     <input type="hidden" name="MerchantReturnURL"
            value="${this.merchantReturnURL}">
     <input type="hidden" name="Amount" value="${money}">
     <input type="hidden" name="CurrencyCode" value="${this.currencyCode}">
     <input type="hidden" name="CustIP" value="${this.custIP}">
     <input type="hidden" name="CustName" value="${this.user.firstName}">
     <input type="hidden" name="CustEmail" value="${this.user.userID}">
     <input type="hidden" name="CustPhone" value="${this.user.phoneNumber}">
     <input type="hidden" name="HashValue" value="${hash}">
     <input type="hidden" name="MerchantTermsURL"
            value="${this.merchantTermsURL}">
     <input type="hidden" name="LanguageCode" value="en">
     <input type="hidden" name="PageTimeout" value="${this.PageTimeout}">`;

    document.querySelector(".payment").innerHTML = form;
    document["frmPayment"].submit();
  }
  paymentStatus() {
    let paymentparams = JSON.parse(localStorage.getItem("paymentStatus"));
    let creatHash =
      "H71BRDU8" +
      "CLS" +
      paymentparams.paymentID +
      paymentparams.amount +
      "MYR";
    let hash = sha256(creatHash);
    let obj = {
      TransactionType: "QUERY",
      PymtMethod: "ANY",
      ServiceID: "CLS",
      PaymentID: paymentparams.paymentID,
      Amount: paymentparams.amount,
      CurrencyCode: "MYR",
      HashValue: hash,
    };
    this.jobService.checkStatus(obj).subscribe(
      (posRes) => {
        localStorage.removeItem("paymentStatus");
        this.QueryStringToJSON(posRes);
      },
      (err: HttpErrorResponse) => {
        console.log(" payment ERRor", err);
        if (err.error instanceof Error) {
          console.log("CSE", err.error);
        } else {
          console.log("CSE", err.error);
        }
      }
    );
  }
  QueryStringToJSON(query) {
    var pairs = query.split("&");
    var result = {};
    pairs.forEach((pair: any) => {
      pair = pair.split("=");
      result[pair[0]] = decodeURIComponent(pair[1] || "");
    });
    this.paymentObj = { params: JSON.parse(JSON.stringify(result)) };

    // Here calling hire providers api after successfully payment transaction is done
    if (
      this.paymentObj &&
      this.paymentObj.params &&
      this.paymentObj.params.TxnStatus
    ) {
      // let selectedProviders = JSON.parse(localStorage.getItem('selectedUsers'));
      if (this.paymentObj.params.TxnStatus == 0) {
        this.completeHiring();
        // if (selectedProviders && selectedProviders.length) {
        //    this.hireTaskers(selectedProviders);
        // }
      } else {
        // Remove Comment for deleteBooking method
        this.deleteBooking();
        // this.completeHiring()
        localStorage.removeItem("paymentStatus");
        localStorage.removeItem("selectedUsers");
        localStorage.removeItem("coupon");
        let url: string = this.router.url.substring(
          0,
          this.router.url.indexOf("?")
        );
        this.router.navigateByUrl(url);
      }
    }
  }
  completeHiring() {
    this.loginService.showLoader.next(true);
    let bookingID = localStorage.getItem("bookingID");
    let payLoad = { ...this.paymentObj.params };
    delete payLoad.Param6;
    delete payLoad.Param7;
    let obj = {
      bookingID: bookingID,
      paymentData: payLoad,
    };
    let token = localStorage.getItem("token");
    this.jobService.fullHire(obj, token).subscribe(
      (posRes) => {
        this.loginService.showLoader.next(false);
        if (posRes.response == 3) {
          let obj = {
            isSuccess: true,
          };
          let dialog = this.dialog.open(PaymentStatusComponent, {
            panelClass: "col-md-4",
            hasBackdrop: true,
            disableClose: true,
            data: obj,
          });
          this.getTaskDetails();
        } else {
          this.openSnackBar(posRes.message, "");
        }
      },
      (err: HttpErrorResponse) => {
        this.loginService.showLoader.next(true);
        this.openSnackBar(err.message, "");
        if (err.error instanceof Error) {
          console.warn("Client Error", err.error);
        } else {
          console.warn("Server Error", err.error);
        }
      }
    );
  }
  deleteBooking() {
    let obj = {
      isSuccess: false,
    };
    let bookingID = localStorage.getItem("bookingID");
    let delObj = {
      bookingID: bookingID,
    };
    let token = localStorage.getItem("token");

    this.jobService.deleteBooking(delObj, token).subscribe(
      (posRes) => {
        localStorage.removeItem("bookingID");
        if (posRes.response == 3) {
          this.openSnackBar("Your booking deleted..", "");
          let dialog = this.dialog.open(PaymentStatusComponent, {
            panelClass: "col-md-4",
            hasBackdrop: true,
            disableClose: true,
            data: obj,
          });
        } else {
          this.openSnackBar(posRes.message, "");
        }
      },
      (err: HttpErrorResponse) => {
        localStorage.removeItem("bookingID");
        this.openSnackBar(err.message, "");
        if (err.error instanceof Error) {
          console.warn("Client Error", err.error);
        } else {
          console.warn("Server Error", err.error);
        }
      }
    );
  }
  hireTaskers(details) {
    let amount = localStorage.getItem("couponAmount");
    if (amount != null) {
      this.couponAmount = amount;
    }
    let coupon = JSON.parse(localStorage.getItem("coupon"));
    // let payLoad = { ...this.paymentObj.params };
    // delete payLoad.Param6;
    // delete payLoad.Param7;
    let bookingID = "STR" + new Date().getTime();
    this.PaymentID = "Pid" + new Date().getTime();
    let hireTaskObj = {
      describeTaskInDetails: this.sampleData.describeTaskInDetails,
      taskDate: this.sampleData.taskDate,
      attachments: this.sampleData.attachments,
      taskTotalBudget: this.amount,
      paymentID: this.PaymentID,
      mustHaves: this.sampleData.mustHaves,
      convenientTimings: this.sampleData.convenientTimings,
      userID: this.user.userID,
      bookingID: bookingID,
      postID: this.sampleData.postID,
      customerProfilePic: this.sampleData.userInfo.profilePic,
      location: this.sampleData.location,
      loc: this.sampleData.loc,
      serviceCategory: this.sampleData.category.categoryName,
      taskTitle: this.sampleData.postTitle,
      customerName: this.sampleData.userInfo.firstName,
      paymentStatus: "Pending",
      bookedTaskers: details,
      couponCode: coupon.couponCode,
      couponAmount: coupon.couponAmount,
      couponDiscount: this.couponAmount,
      phoneNumber: this.rawData.userInfo.phoneNumber,
    };
    let token = localStorage.getItem("token");
    console.log("Hire Tasker Obj", hireTaskObj);
    this.loginService.showLoader.next(true);
    this.jobService.partialHire(hireTaskObj, token).subscribe(
      (posRes) => {
        this.loginService.showLoader.next(true);
        if (posRes.response == 3) {
          localStorage.removeItem("selectedUsers");
          localStorage.removeItem("coupon");
          localStorage.setItem("bookingID", bookingID);
          // let url: string = this.router.url.substring(0, this.router.url.indexOf("?"));
          // this.router.navigateByUrl(url);
          this.makePayment();
          this.openSnackBar(posRes.message, "");
        } else {
          this.openSnackBar(posRes.message, "");
        }
      },
      (err: HttpErrorResponse) => {
        this.loginService.showLoader.next(true);
        this.openSnackBar(err.message, "");
        if (err.error instanceof Error) {
          console.warn("CSE", err.error);
        } else {
          console.warn("SSE", err.message);
        }
      }
    );
  }
  shareOnFaceBook() {
    this.faceBookUrl = `https://www.facebook.com/sharer.php?u=${encodeURIComponent(
      this.shareUrl
    )}?t=${encodeURIComponent(this.shareTaskTitle)}`;
    window.open(this.faceBookUrl, "_blank");
  }
  shareOnTwiter() {
    this.twitterUrl = `https://twitter.com/share?url=${encodeURIComponent(
      this.shareUrl
    )}&amp;text=${encodeURIComponent(
      this.shareTaskTitle
    )}&amp;via=fabienb&amp;hashtags=koandesign`;
    window.open(this.twitterUrl, "_blank");
  }
  shareOnLinkedIn() {
    this.linkedInUrl = `https://www.linkedin.com/shareArticle?url=${encodeURIComponent(
      this.shareUrl
    )}&amp;title=${encodeURIComponent(this.shareTaskTitle)}`;
    window.open(this.linkedInUrl, "_blank");
  }
  openOptions() {
    this.showOptions = !this.showOptions;
  }
  setSpace() {
    this.commentForm
      .get("author_comment")
      .setValue(this.commentForm.value.author_comment.trim());
  }
  sendComment() {
    this.isWordThere = false;
    let strArray = this.commentForm.value.author_comment.split(" ");
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
          let nextWord = strArray[index + 1];
          let str = ["hours", "hour", "am", "pm", "year", "years"];
          if (!str.includes(nextWord)) {
            this.isWordThere = true;
            return;
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
      if (this.commentForm.value.author_comment.indexOf(wordKey) > -1) {
        this.isWordThere = true;
        return;
      }
    });

    if (this.isWordThere) {
      return;
    }

    this.commentForm.patchValue({
      postID: this.rawData.postID,
      author_url: this.user.profilePic,
      author: this.user.firstName,
      author_email: this.user.userID,
      timeStamp: "" + new Date().getTime(),
      gmt_timeStamp: "" + new Date().getTime(),
    });
    let token = localStorage.getItem("token");
    this.jobService.addComments(this.commentForm.value, token).subscribe(
      (posRes) => {
        if (posRes.response == 3) {
          this.commentForm.patchValue({
            author_comment: "",
          });
          this.openSnackBar(posRes.message, "");
          this.getTaskDetails();
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          console.log("CSE", err.message);
        } else {
          console.log("SSE", err.message);
        }
      }
    );
  }
  showUserProfile(id) {
    this.router.navigate(["/profile", btoa(id)], {
      queryParams: { isEncpt: "y" },
    });
  }
  replyMsg(msg) {
    console.log(msg);
    debugger;
    if (
      this.rawData.post_Status === "Expired" ||
      this.rawData.post_Status === "Cancel" ||
      this.rawData.post_Status === "Completed"
    ) {
      this.openSnackBar(
        `Sorry this task has been ${this.rawData.post_Status}`,
        ""
      );
      return;
    }
    let obj = {
      isPoster: false,
      postID: this.rawData.postID,
      userID: msg.offeredUserID,
    };
    if (!this.amIAppliedThisTask) {
      if (msg.posterCount != 0) {
        obj.isPoster = true;
        this.callMsgCountApi(obj, msg);
      } else {
        this.openRply(msg);
      }
    } else {
      if (msg.providerCount != 0) {
        obj.isPoster = true;
        this.callMsgCountApi(obj, msg);
      } else {
        this.openRply(msg);
      }
    }
  }
  callMsgCountApi(obj, msg) {
    let token = localStorage.getItem("token");
    this.jobService.messageReadUpdate(obj, token).subscribe(
      (posRes) => {
        this.openRply(msg);
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          this.openSnackBar(err.message, "");
          console.warn("Server Failure ::", err.error);
        } else {
          console.warn("Server Failure ::", err.error);
        }
      }
    );
  }
  openRply(msg) {
    if (this.loggedIn) {
      let payLoad = { ...msg };
      payLoad.userID = this.user.userID;
      payLoad.postID = this.rawData.postID;
      let dialogRef = this.dialog.open(ReplyDialogComponent, {
        panelClass: "col-md-4",
        hasBackdrop: true,
        disableClose: true,
        data: payLoad,
      });
      this.showOptions = false;
      dialogRef.afterClosed().subscribe((res) => {
        console.log(res);
        if (res != undefined) {
          if (res.response == 3) {
            this.openSnackBar(res.message, "");
          } else {
            this.openSnackBar(res.message, "");
          }
        }
        this.getTaskDetails();
      });
    } else {
      this.loginService.callLogin.next(true);
    }
  }
}
