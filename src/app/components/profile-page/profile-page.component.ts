import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { LoginService } from "src/app/services/login.service";
import { HttpErrorResponse } from "@angular/common/http";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { MatDialog } from "@angular/material";
import { AttachmentSwiperComponent } from "../attachment-swiper/attachment-swiper.component";

@Component({
  selector: "app-profile-page",
  templateUrl: "./profile-page.component.html",
  styleUrls: ["./profile-page.component.css"],
})
export class ProfilePageComponent implements OnInit {
  user: any;
  image: string;
  one: number = 0;
  two: number = 0;
  three: number = 0;
  four: number = 0;
  five: number = 0;
  totalReviews: number = 0;
  isVerified: boolean = false;
  isLoggedIn: boolean = false;
  fiveStar: Array<any> = [1, 2, 3, 4, 5];
  fourStar: Array<number> = [1, 2, 3, 4];
  threeStar: Array<number> = [1, 2, 3];
  twoStar: Array<number> = [1, 2];
  asPoster: boolean = false;
  isCurrentUser: boolean = false;
  posterDetails: any = {};
  posterOneStar: Array<any> = [];
  posterTwoStar: Array<any> = [];
  posterThreeStar: Array<any> = [];
  posterFourStar: Array<any> = [];
  posterFiveStar: Array<any> = [];
  taskerDetails: any = {};
  taskerOneStar: Array<any> = [];
  taskerTwoStar: Array<any> = [];
  taskerThreeStar: Array<any> = [];
  taskerFourStar: Array<any> = [];
  taskerFiveStar: Array<any> = [];
  authorRatings: number = 0;
  UserDetails: any;
  gallery: Array<any> = [];
  skills: any;
  id: any;
  uthiNumber: number = 0;
  queryStr: any;
  userReviews: any = {
    TaskCompletedCount: 0,
    completedPercentage: "",
  };
  routeSub: any;
  constructor(
    private loginService: LoginService,
    private cd: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private activateRoute: ActivatedRoute
  ) {
    //   router.events.subscribe((val) => {
    //     // see also
    //     this.onLoad();
    // });
  }

  ngOnInit() {
    this.activateRoute.params.subscribe((params) => {
      this.onLoad();
    });
  }
  onLoad() {
    this.activatedRoute.queryParamMap.subscribe((params) => {
      this.queryStr = { ...params };
    });
    this.one = 0;
    this.two = 0;
    this.three = 0;
    this.four = 0;
    this.five = 0;
    this.totalReviews = 0;
    this.isVerified = false;
    this.isLoggedIn = false;
    this.fiveStar = [1, 2, 3, 4, 5];
    this.fourStar = [1, 2, 3, 4];
    this.threeStar = [1, 2, 3];
    this.twoStar = [1, 2];
    this.asPoster = false;
    this.isCurrentUser = false;
    this.posterDetails = {};
    this.posterOneStar = [];
    this.posterTwoStar = [];
    this.posterThreeStar = [];
    this.posterFourStar = [];
    this.posterFiveStar = [];
    this.taskerDetails = {};
    this.taskerOneStar = [];
    this.taskerTwoStar = [];
    this.taskerThreeStar = [];
    this.taskerFourStar = [];
    this.taskerFiveStar = [];
    this.authorRatings = 0;
    this.UserDetails = {};
    this.gallery = [];
    this.skills = [];
    this.id = "";
    this.userReviews = {
      TaskCompletedCount: 0,
      completedPercentage: "",
    };

    this.routeSub = this.activatedRoute.params.subscribe((params) => {
      //log the entire params object
      this.id = params["id"];
    });
    if (this.queryStr.params.isEncpt == "y") {
      this.id = atob(this.id);
      this.fetchData(this.id);
    } else {
      this.fetchData(this.id);
    }
    this.user = JSON.parse(localStorage.getItem("user"));
    this.isLoggedIn = this.user != null ? true : false;
  }
  changeView(event) {
    if (event.value == "poster") {
      this.asPoster = true;
      if (this.posterDetails && this.posterDetails.rating5) {
        this.userReviews = this.posterDetails.posterTaskCompletedDetails;
        this.one = this.posterOneStar.length;
        this.two = this.posterTwoStar.length;
        this.three = this.posterThreeStar.length;
        this.four = this.posterFourStar.length;
        this.five = this.posterFiveStar.length;
        this.totalReviews =
          this.one + this.two + this.three + this.four + this.five;
      } else {
        this.one = 0;
        this.two = 0;
        this.three = 0;
        this.four = 0;
        this.five = 0;
        this.totalReviews = 0;
        this.userReviews = {
          TaskCompletedCount: 0,
          completedPercentage: "",
        };
      }
    } else {
      this.asPoster = false;
      if (this.taskerDetails && this.taskerDetails.rating5) {
        this.one = this.taskerOneStar.length;
        this.two = this.taskerTwoStar.length;
        this.three = this.taskerThreeStar.length;
        this.four = this.taskerFourStar.length;
        this.five = this.taskerFiveStar.length;
        setTimeout(() => {
          this.userReviews = this.taskerDetails.providerTaskCompletedDetails;
        }, 100);
        this.totalReviews =
          this.one + this.two + this.three + this.four + this.five;
      } else {
        this.totalReviews = 0;
        this.one = 0;
        this.two = 0;
        this.three = 0;
        this.four = 0;
        this.five = 0;
        this.userReviews = {
          TaskCompletedCount: 0,
          completedPercentage: "",
        };
      }
    }
  }
  userProfile(user) {
    this.router.navigate(["/profile", btoa(user.ratingsGivenBy.userID)], {
      queryParams: { isEncpt: "y" },
    });
  }
  showGallery() {
    let dialogRef = this.dialog.open(AttachmentSwiperComponent, {
      panelClass: "col-md-4",
      hasBackdrop: true,
      disableClose: false,
      width: "40rem",
      data: this.gallery,
    });
  }
  //  User Details
  fetchData(userID) {
    this.gallery = [];
    this.id = userID;
    let id = { userID: userID };
    this.loginService.showLoader.next(true);
    this.loginService.fetchUserDetails(id).subscribe(
      (posRes) => {
        if (posRes.response == 3) {
          this.loginService.showLoader.next(false);
          this.UserDetails = posRes.customerInfo[0];
          if (this.UserDetails.accountVerificationStatus == "Verified") {
            this.isVerified = true;
          } else {
            this.isVerified = false;
          }
          if (this.isLoggedIn) {
            this.isCurrentUser =
              this.UserDetails.userID == this.user.userID ? true : false;
          }
          this.image =
            "https://liveapi.startasker.com" + this.UserDetails.profilePic;
          if (this.UserDetails.gallery.length != 0) {
            this.UserDetails.gallery.forEach((val, index) => {
              if (val.substring(val.lastIndexOf(".") + 1) !== "mp4") {
                this.gallery.push(val);
              }
            });
          }
          this.skills = this.UserDetails.Settings[0].skills;
          setTimeout(() => {
            this.fetchReviews();
          }, 400);
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
  fetchReviews() {
    let id = { userID: this.id };
    this.loginService.showLoader.next(true);
    let token = localStorage.getItem("token");
    this.loginService.fetchUserReviews(id, token).subscribe(
      (posRes) => {
        if (posRes.response == 3) {
          console.log("posRes", posRes);

          this.taskerDetails = posRes.asAProvider;
          this.loginService.showLoader.next(false);
          if (this.taskerDetails && this.taskerDetails.rating5) {
            this.userReviews = this.taskerDetails.providerTaskCompletedDetails;
            this.taskerFiveStar = this.taskerDetails.rating5;
            this.taskerFourStar = this.taskerDetails.rating4;
            this.taskerThreeStar = this.taskerDetails.rating3;
            this.taskerTwoStar = this.taskerDetails.rating2;
            this.taskerOneStar = this.taskerDetails.rating1;
          } else {
            this.userReviews = {
              TaskCompletedCount: 0,
              completedPercentage: "",
            };
          }
          let event = {
            value: "tasker",
          };
          this.changeView(event);
          this.posterDetails = posRes.asAPoster;
          console.log("As poster", this.posterDetails);
          if (this.posterDetails && this.posterDetails.rating5) {
            this.userReviews = this.posterDetails.posterTaskCompletedDetails;
            this.posterFiveStar = this.posterDetails.rating5;
            this.posterFourStar = this.posterDetails.rating4;
            this.posterThreeStar = this.posterDetails.rating3;
            this.posterTwoStar = this.posterDetails.rating2;
            this.posterOneStar = this.posterDetails.rating1;
          } else {
            this.userReviews = {
              TaskCompletedCount: 0,
              completedPercentage: "",
            };
          }
        } else {
          this.loginService.showLoader.next(false);
          alert(posRes.message);
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
