import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { Subscription } from "rxjs";
import { FormGroup } from "@angular/forms";
import { MatDialog, MatSnackBar } from "@angular/material";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { UserServiceService } from "src/app/services/user-service.service";
import { STEPPER_GLOBAL_OPTIONS } from "@angular/cdk/stepper";
import { WithdrawComponent } from "../withdraw/withdraw.component";
import { GiveRatingsComponent } from "../give-ratings/give-ratings.component";
import { CompleteTaskDialogComponent } from "../complete-task-dialog/complete-task-dialog.component";
import { HttpErrorResponse } from "@angular/common/http";
import { LoginService } from "src/app/services/login.service";
import { AttachmentSwiperComponent } from "../attachment-swiper/attachment-swiper.component";
import { sha256, sha224 } from "js-sha256";
import { JobsService } from "src/app/services/jobs.service";
export interface Withdraw {
  bookingID: string;
  offeredUserID: string;
  isWithDraw: boolean;
  withDrawnByPoster: boolean;
  withDrawReason: string;
}

@Component({
  selector: "app-booking-details",
  templateUrl: "./booking-details.component.html",
  styleUrls: ["./booking-details.component.css"],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
  ],
})
export class BookingDetailsComponent implements OnInit {
  totalSubscribe: Subscription;
  id: string;
  rawData: any;
  offers: any;
  commentForm: FormGroup;
  comments: any = [];
  date: any;
  routeSub: any;
  user: any;
  isPendingBooking: boolean = false;
  taskUserInfo: any;
  iamPoster: boolean = false;
  image: string;
  one: boolean = false;
  two: boolean = false;
  three: boolean = false;
  four: boolean = false;
  five: boolean = false;
  bookedTaskers: any;
  faceBookUrl: any;
  linkedInUrl: any;
  twitterUrl: any = "";
  shareUrl: any = "";
  shareTaskTitle: any = "";
  showCheckBoxes: boolean = false;
  selectedTaskers: Array<any> = [];
  isBookingWithDrawnByAllTaskers: boolean = false;
  userImage: string = "https://liveapi.startasker.com/user.png";
  showOptions: boolean = false;
  loggedIn: boolean = false;
  isTaskerWithdrawn: boolean = false;
  isTaskerCompleted: boolean = false;
  isTaskerGivenRating: boolean = false;
  isCustomerCompled: boolean = false;
  isPosterCompletedTask: boolean = false;
  // Payment Variables
  public OrderNumber: any;
  public PaymentID: any;
  public orderDesc = "Purchasing";
  public merchantReturnURL = "https://www.startasker.com/#/my-tasks";
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
  constructor(
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private userService: UserServiceService,
    private loginService: LoginService,
    private jobService: JobsService,
    private router: Router
  ) {
    this.router.events.subscribe((val) => {});
  }
  ngOnInit() {
    this.onLoad();
  }
  showUserProfile(id) {
    this.router.navigate(["/profile", btoa(id)], {
      queryParams: { isEncpt: "y" },
    });
  }
  onLoad() {
    this.showOptions = false;
    this.loggedIn = false;
    this.isTaskerWithdrawn = false;
    this.isTaskerCompleted = false;
    this.isTaskerGivenRating = false;
    this.isCustomerCompled = false;
    this.isPosterCompletedTask = false;
    this.getIP();
    this.routeSub = this.activatedRoute.params.subscribe((params) => {
      //log the entire params object
      this.id = params["id"];
      this.getTaskDetails();
    });
    this.user = JSON.parse(localStorage.getItem("user"));
    if (this.user != null) {
      this.loggedIn = true;
      if (this.user.profilePic !== "") {
        this.userImage =
          "https://liveapi.startasker.com" + this.user.profilePic;
      }
    } else {
      this.loggedIn = false;
    }
    this.image = "https://liveapi.startasker.com/user.png";
  }
  //message alerts showing
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: "red-snackbar",
    });
  }

  getIP() {
    this.loginService.getIPAddress().subscribe((res: any) => {
      this.custIP = res.ip;
    });
  }
  getTaskDetails() {
    this.two = false;
    this.three = false;
    this.four = false;
    this.five = false;
    this.isBookingWithDrawnByAllTaskers = false;
    this.loginService.showLoader.next(true);
    let obj = {
      bookingID: this.id,
    };
    this.selectedTaskers = [];
    let token = localStorage.getItem("token");
    this.totalSubscribe = this.userService.bookingDetails(obj, token).subscribe(
      (posRes) => {
        this.loginService.showLoader.next(false);
        if (posRes.response == 3) {
          this.rawData = posRes.bookingData;
          if (this.rawData && this.rawData.phoneNumber) {
            let num = this.rawData.phoneNumber
              .replace(/[^0-9 ]/g, "")
              .replace(/ /g, "");
            if (num.substring(0, 2) != "60") {
              num = "+60" + num;
            }
            this.rawData.phoneNumber = num;
          }

          if (this.rawData.paymentStatus == "Pending") {
            this.isPendingBooking = true;
          } else {
            this.isPendingBooking = false;
          }
          this.shareUrl =
            "http://www.startasker.com/#/browsejobs/job/" + this.rawData.postID;
          this.shareTaskTitle = this.rawData.postTitle;
          if (this.rawData.customerProfilePic != "") {
            this.image =
              "https://liveapi.startasker.com" +
              this.rawData.customerProfilePic;
          }
          if (this.rawData.userID == this.user.userID) {
            this.iamPoster = true;
            this.bookedTaskers = this.rawData.bookedTaskers;

            this.bookedTaskers = this.bookedTaskers.map((tasker) => {
              if (tasker && tasker.phoneNumber) {
                tasker.phoneNumber = tasker.phoneNumber
                  .replace(/[^0-9 ]/g, "")
                  .replace(/ /g, "");
              }
              return tasker;
            });
            // Start from this
            // Removing withdrawn providers
            let activeProviders = this.bookedTaskers.filter((val) => {
              return !val.isWithDraw && !val.isWithDrawCustomer;
            });
            if (activeProviders.length) {
              let taskCompletedProviders = activeProviders.filter((val) => {
                return val.isCustomerCompletedTask === true;
              });
              if (taskCompletedProviders.length == activeProviders.length) {
                this.isPosterCompletedTask = true;
                this.one = true;
                this.two = true;
                this.three = true;
                this.four = true;
                let paymentCompletedProviders = activeProviders.filter(
                  (val) => {
                    return val.paymentStatusToProviderByAdmin;
                  }
                );
                if (
                  paymentCompletedProviders.length == activeProviders.length
                ) {
                  this.five = true;
                } else {
                  this.five = false;
                }
              } else {
                this.two = false;
                this.three = false;
                this.four = false;
                let selfCompletedProviders = activeProviders.filter((val) => {
                  return val.isTaskerCompletedTask;
                });
                if (selfCompletedProviders.length == activeProviders.length) {
                  this.one = true;
                  this.two = true;
                } else {
                  this.two = false;
                }
              }
            }
            if (activeProviders.length == 0) {
              this.isBookingWithDrawnByAllTaskers = true;
            } else {
              this.isBookingWithDrawnByAllTaskers = false;
            }

            // End here
          } else {
            this.userService.isTasker.next(true);
            this.iamPoster = false;
            if (this.rawData && this.rawData.phoneNumber) {
              this.rawData.phoneNumber = this.rawData.phoneNumber
                .replace(/[^0-9 ]/g, "")
                .replace(/ /g, "");
            }
            let index = -1;
            index = this.rawData.bookedTaskers.findIndex((val) => {
              return val.offeredUserID == this.user.userID;
            });
            if (index != -1) {
              this.bookedTaskers = this.rawData.bookedTaskers[index];
              if (this.bookedTaskers.paymentStatusToProviderByAdmin) {
                this.isTaskerWithdrawn = false;
                this.one = true;
                this.two = true;
                this.three = true;
                this.four = true;
                this.five = true;
                this.isTaskerCompleted = true;
                if (this.bookedTaskers.ratingsToPoster) {
                  this.isTaskerGivenRating = true;
                } else {
                  this.isTaskerGivenRating = false;
                }
              } else {
                this.isTaskerWithdrawn = false;
                this.one = false;
                this.two = false;
                this.three = false;
                this.four = false;
                this.five = false;
                this.isTaskerCompleted = false;
                if (this.bookedTaskers.isWithDraw) {
                  this.isTaskerWithdrawn = true;
                } else {
                  this.isTaskerWithdrawn = false;
                  if (this.bookedTaskers.isCustomerCompletedTask) {
                    this.one = true;
                    this.two = true;
                    this.three = true;
                    this.four = true;
                    this.isTaskerCompleted = true;
                    this.isPosterCompletedTask = true;
                    if (this.bookedTaskers.ratingsToPoster) {
                      this.isTaskerGivenRating = true;
                    } else {
                      this.isTaskerGivenRating = false;
                    }
                  } else if (this.bookedTaskers.isTaskerCompletedTask) {
                    this.one = true;
                    this.two = true;
                    this.isTaskerCompleted = true;
                    this.isPosterCompletedTask = false;
                    if (this.bookedTaskers.ratingsToPoster) {
                      this.isTaskerGivenRating = true;
                    } else {
                      this.isTaskerGivenRating = false;
                    }
                  } else {
                    this.isTaskerWithdrawn = false;
                    this.one = true;
                    this.two = false;
                    this.three = false;
                    this.four = false;
                    this.isTaskerCompleted = false;
                    this.isPosterCompletedTask = false;
                  }
                }
              }
            }
          }
        } else {
          this.loginService.showLoader.next(false);
          this.openSnackBar(posRes.message, "");
        }
      },
      (err) => {
        this.loginService.showLoader.next(false);
        this.openSnackBar("Server Failure please try after few minutes", "");
        console.log("Error", err);
      }
    );
  }
  getWhatsappUrl(tasker) {
    let number = tasker.phoneNumber.replace(/[^0-9 ]/g, "").replace(/ /g, "");
    if (number.substring(0, 2) !== "60") {
      number = "+60" + tasker.phoneNumber;
    }
    return `https://wasap.my/${number}`;
  }
  getCallUrl(tasker) {
    let number = tasker.phoneNumber.replace(/[^0-9 ]/g, "").replace(/ /g, "");
    if (number.substring(0, 2) !== "60") {
      number = "+60" + tasker.phoneNumber;
    }
    return `tel:${number}`;
  }
  retryPayMent() {
    // http://www.startasker.com/#/my-tasks/task/${this.rawData.postID}
    this.merchantReturnURL = `https://www.startasker.com/#/my-tasks/task/${this.rawData.postID}`;
    this.OrderNumber = "Order" + new Date().getTime();
    this.PaymentID = "Pid" + new Date().getTime();
    let money = this.rawData.taskTotalBudget.toFixed(2);
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
  deleteBooking() {
    let delObj = {
      bookingID: this.rawData.bookingID,
    };
    let token = localStorage.getItem("token");

    this.jobService.deleteBooking(delObj, token).subscribe(
      (posRes) => {
        localStorage.removeItem("bookingID");
        if (posRes.response == 3) {
          this.openSnackBar("Your booking deleted..", "");
          this.router.navigateByUrl("/bookings");
          this.userService.isBookingDeleted.next(true);
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
  showAttachmentPop(image) {
    let dialogRef = this.dialog.open(AttachmentSwiperComponent, {
      panelClass: "col-md-4",
      hasBackdrop: true,
      disableClose: false,
      data: image,
      height: "50vh",
    });
  }
  selectTasker(event, tasker, i) {
    if (event.checked) {
      let obj = {
        offeredUserID: tasker,
      };
      this.selectedTaskers.push(obj);
    } else {
      this.selectedTaskers.splice(i, 1);
    }
  }
  completeTask() {
    let modalText = "";
    if (this.iamPoster) {
      if (!this.selectedTaskers.length) {
        this.openSnackBar("Please Select Taskers To Complete", "");
        return;
      }
      modalText = "Request for send payment to provider..";
    } else {
      modalText = "Request for release payment from Customer..";
    }
    let dailogRef = this.dialog.open(CompleteTaskDialogComponent, {
      panelClass: "col-md-3",
      hasBackdrop: true,
      disableClose: true,
      data: modalText,
    });
    dailogRef.afterClosed().subscribe((res) => {
      if (res) {
        let obj = {};
        if (this.iamPoster) {
          obj = {
            bookingID: this.rawData.bookingID,
            bookedTaskers: this.selectedTaskers,
            isCompletedByPoster: true,
            isTaskerCompletedTask: true,
          };
          this.completeByPoster(obj);
        } else {
          obj = {
            bookingID: this.rawData.bookingID,
            bookedTaskers: [
              {
                offeredUserID: this.bookedTaskers.offeredUserID,
              },
            ],
            isCompletedByPoster: false,
            isTaskerCompletedTask: true,
          };
          this.completeByTasker(obj);
        }
      }
    });
  }

  completeByTasker(details) {
    let token = localStorage.getItem("token");
    if (details.bookedTaskers.length >= 1) {
      this.loginService.showLoader.next(true);
      this.userService.completeTaskByTasker(details, token).subscribe(
        (posRes) => {
          if (posRes.response == 3) {
            this.loginService.showLoader.next(true);
            this.openSnackBar(posRes.message, "");
            this.getTaskDetails();
          } else {
            this.loginService.showLoader.next(true);
            this.openSnackBar(posRes.message, "");
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            this.loginService.showLoader.next(true);
            this.openSnackBar(
              "Server failure please try after few minutes",
              ""
            );
            console.warn("CSE", err.message);
          } else {
            console.warn("SSE", err.message);
          }
        }
      );
    } else {
      this.openSnackBar("Select Taskers to Complete", "");
    }
  }
  completeByPoster(details) {
    console.log("POSTer", details);

    let token = localStorage.getItem("token");
    if (details.bookedTaskers.length >= 1) {
      this.userService.completeTaskByPoster(details, token).subscribe(
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
      this.openSnackBar("Select Taskers to Complete", "");
    }
  }
  withdraw(details) {
    let message = " You want to withdraw from this Job?";
    let obj: Withdraw = {
      bookingID: this.rawData.bookingID,
      offeredUserID: details.offeredUserID,
      isWithDraw: true,
      withDrawnByPoster: true,
      withDrawReason: "",
    };
    if (this.iamPoster) {
      message = "Do you want withdraw him/her from this job?";
      obj = {
        bookingID: this.rawData.bookingID,
        offeredUserID: details.offeredUserID,
        isWithDraw: true,
        withDrawnByPoster: true,
        withDrawReason: "",
      };
    } else {
      obj = {
        bookingID: this.rawData.bookingID,
        offeredUserID: this.user.userID,
        isWithDraw: true,
        withDrawnByPoster: false,
        withDrawReason: "",
      };
    }
    let data = {
      isTaskWithdraw: false,
      message: message,
    };
    let dailogRef = this.dialog.open(WithdrawComponent, {
      panelClass: "col-md-3",
      hasBackdrop: true,
      disableClose: true,
      data: message,
    });
    dailogRef.afterClosed().subscribe((res) => {
      console.log(res);

      if (res.withdraw) {
        let payLoad = { ...obj };
        payLoad.withDrawReason = res.reason;
        let token = localStorage.getItem("token");
        this.userService.withdrawFromJob(payLoad, token).subscribe(
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
      }
    });
  }
  giveRatings(details) {
    let obj = {};
    console.log("Cheputho kodatga", this.rawData);

    if (this.iamPoster) {
      obj = {
        postTitle: this.rawData.taskTitle,
        iamPoster: true,
        bookingID: this.rawData.bookingID,
        postID: this.rawData.postID,
        body: "",
        ratingsAsAProvider: 0,
        ratingsGivenBy: {
          userID: this.user.userID,
          name: this.rawData.customerName,
          profilePic: this.rawData.customerProfilePic,
        },
        ratingsGivenTo: {
          userID: details.offeredUserID,
          name: details.offeredUserName,
          profilePic: details.offeredUserProfilePic,
        },
      };
    } else {
      obj = {
        postTitle: this.rawData.taskTitle,
        iamPoster: false,
        bookingID: this.rawData.bookingID,
        postID: this.rawData.postID,
        body: "",
        ratingsAsAPoster: 0,
        ratingsGivenBy: {
          userID: details.offeredUserID,
          name: details.offeredUserName,
          profilePic: details.offeredUserProfilePic,
        },
        ratingsGivenTo: {
          userID: this.rawData.userID,
          name: this.rawData.customerName,
          profilePic: this.rawData.customerProfilePic,
        },
      };
    }
    let dailogRef = this.dialog.open(GiveRatingsComponent, {
      panelClass: "col-md-4",
      hasBackdrop: true,
      disableClose: true,
      data: obj,
    });
    dailogRef.afterClosed().subscribe((res) => {
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
}
