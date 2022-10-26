import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import {
  MatPaginator,
  MatSort,
  MatTableDataSource,
  MatSnackBar,
} from "@angular/material";
import { Router, ActivatedRoute } from "@angular/router";
import { FormBuilder } from "@angular/forms";
import { UserServiceService } from "src/app/services/user-service.service";
import { LoginService } from "src/app/services/login.service";
import { HttpErrorResponse } from "@angular/common/http";
import { BookingDetailsComponent } from "../booking-details/booking-details.component";

@Component({
  selector: "app-user-bookings",
  templateUrl: "./user-bookings.component.html",
  styleUrls: ["./user-bookings.component.css"],
})
export class UserBookingsComponent implements OnInit {
  user: any;
  loggedIn: boolean = false;
  routeSub: any;
  selectedTab: number = 0;
  showDetails: boolean = false;
  isSelected: boolean = false;
  userSubscribe: any;
  postID: string = "";
  jobsFetching: string = "Searching for jobs";
  jobs: Array<any> = [];
  posterJobs: Array<any> = [];
  taskerJobs: Array<any> = [];
  image: string = "";
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private userService: UserServiceService,
    private fb: FormBuilder,
    private elem: ElementRef,
    private snackBar: MatSnackBar,
    private loginService: LoginService
  ) {
    this.userService.isTasker.subscribe((val) => {
      if (val) {
        this.selectedTab = 1;
      } else {
        this.selectedTab = 0;
      }
    });
    this.userService.isBookingDeleted.subscribe((val) => {
      if (val) {
        this.onLoad();
      }
    });
  }

  ngOnInit() {
    this.onLoad();
  }
  onLoad() {
    this.loggedIn = false;
    this.selectedTab = 0;
    this.showDetails = false;
    this.isSelected = false;
    this.postID = "";
    this.jobsFetching = "Searching for jobs";
    this.jobs = [];
    this.posterJobs = [];
    this.taskerJobs = [];
    this.image = "https://liveapi.startasker.com/user.png";
    this.user = JSON.parse(localStorage.getItem("user"));
    if (this.user != null) {
      this.loggedIn = true;
      this.fetchUserDetails();
    } else {
      this.loggedIn = false;
      this.router.navigateByUrl("/home");
    }

    this.routeSub = this.activatedRoute.params.subscribe((params) => {
      //log the entire params object

      if (this.activatedRoute.firstChild == null) {
        this.showDetails = false;
      } else {
        this.isSelected = true;
        this.showDetails = true;
      }
    });
    this.getJobs();
  }
  navigateToBack() {
    this.isSelected = false;
    this.router.navigateByUrl("/bookings");
  }

  fetchUserDetails() {
    let user = { userID: this.user.userID };
    this.userSubscribe = this.loginService.fetchUserDetails(user).subscribe(
      (posRes) => {
        if (posRes.response == 3) {
          this.user = posRes.customerInfo[0];
          localStorage.setItem("user", JSON.stringify(this.user));
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          console.log("Clien side error");
        } else {
          console.log("Server side error");
        }
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
  getJobs() {
    this.loginService.showLoader.next(true);
    let user = { userID: this.user.userID };
    let token = localStorage.getItem("token");
    this.userService.userBookings(user, token).subscribe(
      (posRes) => {
        this.loginService.showLoader.next(false);
        if (posRes.response == 3) {
          this.jobsFetching = "No jobs Found";
          this.jobs = posRes.bookingData.reverse();
          this.jobs.forEach((val, i) => {
            this.jobs[i].paymentDate = new Date(val.paymentDate * 1);
          });
          this.posterJobs = this.jobs.filter((val) => {
            return val.userID == this.user.userID;
          });
          this.taskerJobs = this.jobs.filter((val) => {
            return (
              val.userID !== this.user.userID && val.paymentStatus != "Pending"
            );
          });
        } else {
          console.log("no jobs available right now");
          this.openSnackBar(posRes.message, "");
        }
      },
      (err: HttpErrorResponse) => {
        this.loginService.showLoader.next(false);
        this.openSnackBar("Server Failure please try after some time", "");
        if (err.error instanceof Error) {
          console.warn("CSE", err.message);
        } else {
          console.warn("SSE", err.message);
        }
      }
    );
  }
  viewDetails(index) {
    this.router.navigate(["bookings", "booking-job-details", index.bookingID]);
    this.isSelected = true;
    setTimeout(() => {
      if (this.activatedRoute.firstChild == null) {
        this.showDetails = false;
      } else {
        this.showDetails = true;
      }
    }, 100);
  }
}
