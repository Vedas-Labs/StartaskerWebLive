import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { JobsService } from "src/app/services/jobs.service";
import { Subscription } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { PostAJobComponent } from "../post-ajob/post-ajob.component";
import { MatDialogRef, MatDialog, MatSnackBar } from "@angular/material";
import { MakeAnOfferComponent } from "../make-an-offer/make-an-offer.component";
import { th } from "date-fns/locale";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import { ReplyDialogComponent } from "../reply-dialog/reply-dialog.component";
import { ReportComponent } from "../report/report.component";
import { AttachmentSwiperComponent } from "../attachment-swiper/attachment-swiper.component";
import { WithdrawComponent } from "../withdraw/withdraw.component";
import { UserServiceService } from "src/app/services/user-service.service";
import { LoginService } from "src/app/services/login.service";
import { ContactUsComponent } from "../contact-us/contact-us.component";

@Component({
  selector: "app-job-details",
  templateUrl: "./job-details.component.html",
  styleUrls: ["./job-details.component.css"],
})
export class JobDetailsComponent implements OnInit {
  totalSubscribe: Subscription;
  baseUrl: any;
  id: string;
  rawData: any;
  offers: any;
  commentForm: FormGroup;
  comments: any = [];
  date: any;
  routeSub: any;
  user: any;
  isPostedByMe: boolean = false;
  amIAppliedThisTask: boolean = false;
  cuttingAmount: number = 0;
  receivedAmount: any = 0;
  myOfferInfo: any = {};
  taskUserInfo: any;
  image: string;
  isTaskOpen: boolean = false;
  userImage: string = "https://liveapi.startasker.com/user.png";
  showOptions: boolean = false;
  loggedIn: boolean = false;
  shareUrl: string = "";
  shareTaskTitle: string = "";
  faceBookUrl: string = "";
  twitterUrl: string = "";
  linkedInUrl: string = "";
  emailUrl: string = "";
  amIHired: boolean = false;
  isWordThere: boolean = false;
  queryParams: any;
  openChat: boolean = true;
  @ViewChild("txtArea", { static: true }) someInput: ElementRef;
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
    ".tech",
    "http",
    "@gmail.com",
    ".com",
  ];
  constructor(
    private jobService: JobsService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private userService: UserServiceService,
    private loginService: LoginService,
    private router: Router
  ) {}

  ngOnInit() {
    this.baseUrl = this.loginService.baseUrl;
    this.routeSub = this.activatedRoute.params.subscribe((params) => {
      //log the entire params object
      this.id = params["id"];
      this.getTaskDetails();
    });
    this.activatedRoute.queryParamMap.subscribe((params) => {
      this.queryParams = { ...params };
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

    this.commentForm = this.fb.group({
      postID: [""],
      author_url: [""],
      author: [""],
      author_comment: ["", Validators.required],
      author_email: [""],
      author_ip: [""],
      timeStamp: [""],
      gmt_timeStamp: [""],
    });
  }

  //message alerts showing
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: "red-snackbar",
    });
  }

  showUserProfile(id) {
    this.router.navigate(["/profile", btoa(id)], {
      queryParams: { isEncpt: "y" },
    });
  }

  getTaskDetails() {
    this.loginService.showLoader.next(true);
    let obj = {
      userID: this.id,
    };
    this.amIHired = false;
    this.loginService.showLoader.next(true);
    // let token = localStorage.getItem('token')
    this.totalSubscribe = this.jobService.getMyTasks(obj).subscribe(
      (posRes) => {
        this.loginService.showLoader.next(false);
        if (posRes.response == 3) {
          this.rawData = posRes.jobsData[0];
          this.offers = this.rawData.offers;
          this.shareUrl =
            "https://www.startasker.com/#/browsejobs/job/" +
            this.rawData.postID;
          this.shareTaskTitle = this.rawData.postTitle;
          this.loginService.showLoader.next(false);
          this.isTaskOpen = this.rawData.post_Status == "Open" ? true : false;
          if (this.rawData && this.rawData.userInfo) {
            this.taskUserInfo = this.rawData.userInfo;
            let num = this.rawData.userInfo.phoneNumber
              .replace(/[^0-9 ]/g, "")
              .replace(/ /g, "");
            if (num.substring(0, 2) != "60") {
              num = "+60" + num;
            }
            this.rawData.userInfo.phoneNumber = num;

            if (this.taskUserInfo.profilePic != "") {
              this.image =
                "https://liveapi.startasker.com" + this.taskUserInfo.profilePic;
            }
          }
          if (this.rawData.budget.budgetType.Total == false) {
            let num: number = parseInt(this.rawData.budget.Hours);
            this.rawData.budget.budget = num * this.rawData.budget.pricePerHour;
          }
          this.offers.forEach((val, index) => {
            if (this.offers[index] && this.offers[index].phoneNumber) {
              let number = this.offers[index].phoneNumber
                .replace(/[^0-9 ]/g, "")
                .replace(/ /g, "");
              if (number.substring(0, 2) != "60") {
                number = "+60" + number;
              }
              this.offers[index].phoneNumber = number;
            }
            val.authorMessages.forEach((x, i) => {
              this.offers[index].authorMessages[i].timestamp = new Date(
                x.timestamp * 1
              );
            });
          });
          if (this.loggedIn) {
            this.rawData.userID == this.user.userID
              ? (this.isPostedByMe = true)
              : (this.isPostedByMe = false);
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
              if (
                this.queryParams &&
                this.queryParams.params &&
                this.queryParams.params.openChat == "true" &&
                this.openChat
              ) {
                this.openChat = false;
                this.replyMsg(this.myOfferInfo);
                let url: string = this.router.url.substring(
                  0,
                  this.router.url.indexOf("?")
                );
                this.router.navigateByUrl(url);
              }
            } else {
              this.amIAppliedThisTask = false;
              this.myOfferInfo = {};
              this.cuttingAmount = 0;
              this.receivedAmount = 0;
            }
          }
          if (this.rawData.comments.length >= 1) {
            this.comments = this.rawData.comments;
            this.comments.forEach((val, index) => {
              this.comments[index].comment_date = new Date(
                val.comment_date * 1
              );
            });
          } else {
            this.comments = [];
          }
          this.date = new Date(posRes.jobsData[0].postedDate * 1);
        } else {
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

  copyTask() {
    if (this.loggedIn) {
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
          } else {
            this.openSnackBar(res.message, "");
          }
        }
      });
    } else {
      this.openSnackBar("You should logged in to performe this operation.", "");
    }
  }
  reportTask() {
    if (this.loggedIn) {
      let dialogRef = this.dialog.open(ReportComponent, {
        panelClass: "col-md-4",
        hasBackdrop: true,
        disableClose: true,
        data: this.rawData,
      });
      dialogRef.afterClosed().subscribe((res) => {
        if (res != undefined) {
          if (res.response == 3) {
            this.openSnackBar(res.message, "");
          } else {
            this.openSnackBar(res.message, "");
          }
        }
      });
    } else {
      this.openSnackBar("You should logged in to performe this operation.", "");
    }
  }

  openOptions() {
    if (this.loggedIn) {
      this.showOptions = !this.showOptions;
    } else {
      this.loginService.callLogin.next(true);
    }
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
  openMakeOffer() {
    if (this.loggedIn) {
      console.log(this.user);
      if (this.user.accountVerificationStatus != "Verified") {
        let message =
          this.user.accountVerificationStatus == "Unverified"
            ? "Verify Your Account Before Applying any Job"
            : "Your Account Verification is in Progress Contact us for status";

        this.openSnackBar(message, "");
        let dialogRef = this.dialog.open(ContactUsComponent, {
          panelClass: "col-md-4",
          hasBackdrop: true,
          disableClose: true,
          data: { type: "contact" },
        });
        return;
      }
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
    } else {
      this.loginService.callLogin.next(true);
    }
  }
  setSpace() {
    this.commentForm
      .get("author_comment")
      .setValue(this.commentForm.value.author_comment.trim());
  }
  sendComment() {
    this.isWordThere = false;
    let strArray = this.commentForm.value.author_comment.split(" ");
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
    if (this.loggedIn && this.commentForm.valid) {
      this.commentForm.patchValue({
        postID: this.rawData.postID,
        author_url: this.user.profilePic,
        author: this.user.firstName,
        author_email: this.user.userID,
        timeStamp: "" + new Date().getTime(),
        gmt_timeStamp: "" + new Date().getTime(),
      });
      console.log("Comment", this.commentForm.value);
      let token = localStorage.getItem("token");
      this.jobService.addComments(this.commentForm.value, token).subscribe(
        (posRes) => {
          if (posRes.response == 3) {
            this.getTaskDetails();
            this.commentForm.get("author_comment").setValue("");
            this.openSnackBar(posRes.message, "");
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
    } else {
      this.loginService.callLogin.next(true);
    }
  }
  focusTextArea() {
    this.someInput.nativeElement.focus();
  }
  replyMsg(msg) {
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
    if (this.isPostedByMe) {
      if (msg.posterCount != 0) {
        obj.isPoster = true;
        this.callMsgCountApi(obj, msg);
      } else {
        this.openRply(msg);
      }
    } else {
      if (msg.providerCount != 0) {
        obj.isPoster = false;
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
      debugger;
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
}
