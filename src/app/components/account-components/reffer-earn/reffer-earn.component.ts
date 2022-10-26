import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { MatDialog, MatSnackBar } from "@angular/material";
import { JobsService } from "src/app/services/jobs.service";
import { LoginService } from "src/app/services/login.service";
import { EditRefferalComponent } from "../edit-refferal/edit-refferal.component";

@Component({
  selector: "app-reffer-earn",
  templateUrl: "./reffer-earn.component.html",
  styleUrls: ["./reffer-earn.component.css"],
})
export class RefferEarnComponent implements OnInit {
  user: any;
  baseUrl: string;
  faceBookUrl: string = "";
  twitterUrl: string = "";
  linkedInUrl: string = "";
  shareUrl: string = "";
  selectedMonth: any;
  referralUsers: Array<any> = [];
  earningsData: Array<any> = [];
  shareTaskTitle: string =
    "Have you tried StarTasker? Sign up with my link ad you will get up to RM25 off your task.";
  refferalCode: string = "";
  maxDate: any;
  rawData: any;
  totalEarned: number = 0;
  totalDue: number = 0;
  totalInProgress: number = 0;
  totalSettled: number = 0;
  earnMsg: string = "All";
  showDateRange: boolean = false;
  filterEarnData: Array<any> = [];
  minWithdrawAmnt: number = 0;
  constructor(
    private dialog: MatDialog,
    private loginService: LoginService,
    private jobService: JobsService,
    private snackBar: MatSnackBar
  ) {}
  ngOnInit() {
    this.onLoad();
    this.getCategory();
  }
  getCategory() {
    this.loginService.showLoader.next(true);
    this.jobService.browseCategory().subscribe(
      (posRes) => {
        this.loginService.showLoader.next(false);
        if (posRes.response == 3) {
          this.minWithdrawAmnt =
            posRes.isUpdate[0].amount.Setminimumwithdrawamount;
        }
      },
      (err: HttpErrorResponse) => {
        this.loginService.showLoader.next(false);
        this.errHandler(err);
      }
    );
  }
  onLoad() {
    let month = new Date().getMonth() + 1;
    this.maxDate = new Date().getFullYear() + "-" + month;
    this.user = JSON.parse(localStorage.getItem("user"));
    this.baseUrl = this.loginService.baseUrl;
    console.log("User", this.user);
    this.refferalCode = this.user.referralCode;
    this.getShortLink();
  }
  setAll() {
    this.earnMsg = "All";
    this.showDateRange = false;
  }
  setMonthly() {
    this.earnMsg = "Monthly Earned";
    this.showDateRange = true;
  }
  getShortLink(): any {
    this.loginService.showLoader.next(true);
    let obj = {
      dynamicLinkInfo: {
        domainUriPrefix: "https://startasker.page.link",
        link: `https://www.startasker.com/#/home/?invitedby=${this.user.firstName}&referralCode=${this.user.referralCode}`,
        androidInfo: {
          androidPackageName: "com.star.startasker",
        },
        iosInfo: {
          iosBundleId: "com.startasker.StarTasker",
        },
        socialMetaTagInfo: {
          socialTitle: this.user.firstName,
          socialDescription: `Have you tried StarTasker? Sign up with my link ad you will get up to RM25 off your task.`,
          socialImageLink:
            "https://www.startasker.com/assets/startasker-new-logo.png",
        },
      },
    };
    this.loginService.getShortLink(obj).subscribe(
      (posRes) => {
        console.log("Reffeal Link", posRes.shortLink);
        this.loginService.showLoader.next(false);
        this.shareUrl = posRes.shortLink;
        this.getRefferalData();
      },
      (err: HttpErrorResponse) => {
        this.loginService.showLoader.next(false);
        this.errHandler(err);
      }
    );
  }
  errHandler(err) {
    if (err.error instanceof Error) {
      console.warn("Client Error", err.error);
    } else {
      console.warn("Server Error", err.error);
    }
  }
  getRefferalData() {
    this.totalDue = 0;
    this.totalEarned = 0;
    this.loginService.showLoader.next(true);
    let obj = {
      referralCode: this.user.referralCode,
    };
    let token = localStorage.getItem("token");
    this.loginService.getRefferalData(obj, token).subscribe(
      (posRes) => {
        this.loginService.showLoader.next(false);
        if (posRes.response == 3) {
          this.earningsData = posRes.earningsData;

          this.earningsData.forEach((val) => {
            this.totalEarned += val.earnAmount;
            if (val.isTransferStatus) {
              this.totalSettled += val.earnAmount;
            } else {
              if (!val.isTransferStatus && val.isRequestedStatus) {
                this.totalInProgress += val.earnAmount;
              } else {
                this.totalDue += val.earnAmount;
              }
            }
          });
          this.filterEarnData = this.earningsData;
          this.referralUsers = posRes.referralUsers;
          console.log("Pos Res", posRes);
        } else {
        }
      },
      (err: HttpErrorResponse) => {
        this.loginService.showLoader.next(false);
        if (err.error instanceof Error) {
          console.warn("Clent Error", err.error);
        } else {
          console.warn("Server Error", err.error);
        }
      }
    );
  }
  monthSelected(event) {
    console.log("Selected", this.selectedMonth);
    this.filterEarnData = this.earningsData.filter((val) => {
      let year = new Date(parseInt(val.earningTimeStamp)).getFullYear();
      let month = new Date(parseInt(val.earningTimeStamp)).getMonth() + 1;
      let selected = year + "-" + month;
      console.log(this.selectedMonth, selected);

      return this.selectedMonth == selected;
    });
  }
  withDrawAmount() {
    let ids = this.earningsData
      .filter((val) => {
        return !val.isRequestedStatus;
      })
      .map((x) => {
        return x._id;
      });
    if (this.totalDue >= 100 && ids.length) {
      this.loginService.showLoader.next(true);
      let obj = {
        userID: this.user.userID,
        amount: "" + this.totalDue,
        name: this.user.firstName + this.user.lastName,
        profilePic: this.user.profilePic,
        IDs: ids,
      };
      let token = localStorage.getItem("token");
      this.loginService.withdrawAmountApi(obj, token).subscribe(
        (posRes) => {
          this.loginService.showLoader.next(false);
          if (posRes.response == 3) {
            this.openSnackBar(posRes.message, "");
            this.getRefferalData();
          } else {
            this.openSnackBar(posRes.message, "");
          }
        },
        (err: HttpErrorResponse) => {
          this.loginService.showLoader.next(false);
          this.openSnackBar("Server Failure try after some time..", "");
          console.warn("Server Failure", err);
        }
      );
    } else {
      this.openSnackBar("Total Due should be atleast 100RM...", "");
    }
  }
  shareOnFaceBook() {
    this.faceBookUrl = `https://www.facebook.com/sharer.php?u=${encodeURIComponent(
      this.shareUrl
    )}?t=${encodeURIComponent(this.shareTaskTitle)}`;
    window.open(this.faceBookUrl, "_blank");
  }
  shareOnWhatsApp() {
    let url =
      "https://api.whatsapp.com/send?" +
      "&text=" +
      encodeURIComponent(this.shareUrl);
    window.open(url, "_blank");
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

  editRefferal(data) {
    let obj = {
      userID: data.postID,
    };
    this.loginService.showLoader.next(true);
    // let token = localStorage.getItem('token')
    this.jobService.getMyTasks(obj).subscribe(
      (posRes) => {
        this.loginService.showLoader.next(false);
        if (posRes.response == 3) {
          this.rawData = posRes.jobsData[0];
          this.loginService.showLoader.next(false);
          let refferData = {
            jobData: this.rawData,
            user: this.user,
            earnData: data,
          };
          let dailogRef = this.dialog.open(EditRefferalComponent, {
            panelClass: "col-md-4",
            hasBackdrop: true,
            disableClose: true,
            data: refferData,
          });
        } else {
          this.openSnackBar(posRes.message, "");
        }
      },
      (err: HttpErrorResponse) => {
        this.loginService.showLoader.next(false);
        this.openSnackBar(err.message, "");
        console.log("Error", err.error);
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
}
