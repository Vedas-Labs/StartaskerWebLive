import { Component, OnInit } from "@angular/core";
import { Location } from "@angular/common";
import { JobsService } from "src/app/services/jobs.service";
import { Subscription } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { LoginService } from "src/app/services/login.service";
import { HttpErrorResponse } from "@angular/common/http";
import { MatSnackBar } from "@angular/material";

@Component({
  selector: "app-my-tasks",
  templateUrl: "./my-tasks.component.html",
  styleUrls: ["./my-tasks.component.css"],
})
export class MyTasksComponent implements OnInit {
  user: any;
  jobs: any = [];
  image: any;
  rawData: any;
  date: any;
  offers: any = [];
  filteredData: any = [];
  term: any;
  myTaskType: string = "POSTED TASKS";
  isOfferedJobs: boolean = false;
  offeredJobs: Array<any> = [];
  isSelected: boolean = false;
  searchText: any;
  showDetails: boolean = false;
  userSubscribe: any;
  taskStatus: string = "All";
  jobsFetching: string = "Searching for Jobs...";
  private routeSub: Subscription;
  constructor(
    private jobsService: JobsService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private loginService: LoginService,
    private snackBar: MatSnackBar,
    private _location: Location
  ) {
    this.jobsService.isJobPosted.subscribe((val) => {
      if (val) {
        this.getAllMyTasks();
        this.jobsService.isJobPosted.next(false);
      }
    });
  }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem("user"));
    if (this.user && this.user.userID) {
      this.fetchUserDetails();
      this.getAllMyTasks();
    } else {
      this.router.navigateByUrl("/home");
    }

    this.routeSub = this.activatedRoute.params.subscribe((params) => {
      //log the entire params object
      console.log(this.activatedRoute.firstChild);
      if (this.activatedRoute.firstChild == null) {
        this.showDetails = false;
      } else {
        this.isSelected = true;
        this.showDetails = true;
      }
    });
  }
  //message alerts showing
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: "red-snackbar",
    });
  }
  fetchUserDetails() {
    let user = { userID: this.user.userID };
    this.userSubscribe = this.loginService.fetchUserDetails(user).subscribe(
      (posRes) => {
        if (posRes.response == 3) {
          this.user = posRes.customerInfo[0];
          localStorage.setItem("user", JSON.stringify(this.user));
          if (this.user.profilePic != "") {
            this.image =
              "https://liveapi.startasker.com/" + this.user.profilePic;
          } else {
            this.image = "https://liveapi.startasker.com/user.png";
          }
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
  showOffered() {
    let token = localStorage.getItem("token");
    let obj = {
      userID: this.user.userID,
    };
    this.isOfferedJobs = true;
    this.myTaskType = "OFFERED TASKS";
    if (this.offeredJobs.length) {
      this.filteredData = this.offeredJobs;
      this.taskStatus = "Applied";
    } else {
      this.loginService.showLoader.next(true);
      this.jobsService.getMyOfferedTasks(obj, token).subscribe(
        (posRes) => {
          console.log("posRes", posRes);
          if (posRes.response == 3) {
            this.taskStatus = "Applied";
            this.jobsFetching = "No Jobs Found";
            this.offeredJobs = posRes.jobsData;
            this.loginService.showLoader.next(false);
            this.date = new Date(posRes.jobsData[0].postedDate * 1);
            this.offeredJobs.forEach((val, i) => {
              this.offeredJobs[i].postedDate = new Date(val.postedDate * 1);
              if (val.budget.budgetType.Total == false) {
                let num: number = parseInt(val.budget.Hours);
                this.offeredJobs[i].budget.budget =
                  num * val.budget.pricePerHour;
              }
            });
            this.filteredData = this.offeredJobs;
          }
        },
        (err) => {
          console.log("MyTask Err", err);
        }
      );
    }
  }
  getAllMyTasks() {
    this.isOfferedJobs = false;
    let token = localStorage.getItem("token");
    let obj = {
      userID: this.user.userID,
    };
    this.loginService.showLoader.next(true);
    this.jobsService.getMyTasks(obj).subscribe(
      (posRes) => {
        this.loginService.showLoader.next(false);
        if (posRes.response == 3) {
          this.jobsFetching = "No Jobs Found";
          this.jobs = posRes.jobsData;
          this.date = new Date(posRes.jobsData[0].postedDate * 1);
          this.jobs.forEach((val, i) => {
            this.jobs[i].postModifyDate = new Date(val.postModifyDate * 1);
            if (val.budget.budgetType.Total == false) {
              let num: number = parseInt(val.budget.Hours);
              this.jobs[i].budget.budget = num * val.budget.pricePerHour;
            }
          });
          this.filteredData = this.jobs;
        }
      },
      (err: HttpErrorResponse) => {
        this.loginService.showLoader.next(false);
        console.log("MyTask Err", err);
        this.openSnackBar(err.error, "Server Failure");
      }
    );
  }
  navigateToBack() {
    this.isSelected = false;
    this.router.navigateByUrl("/my-tasks");
  }
  open(t) {}
  viewDetails(index) {
    this.router.navigate(["my-tasks", "task", index.postID]);
    setTimeout(() => {
      if (this.activatedRoute.firstChild == null) {
        this.showDetails = false;
      } else {
        console.log(this.activatedRoute.firstChild.snapshot.params["id"]);
        this.isSelected = true;
        this.showDetails = true;
      }
    }, 100);
  }
  applyFilter(term: string) {
    if (!term) {
      if (this.isOfferedJobs) {
        this.filteredData = this.offeredJobs;
        this.taskStatus = "All";
      } else {
        this.filteredData = this.jobs;
        this.taskStatus = "All";
      }
    } else {
      this.filteredData = this.filteredData.filter((x) =>
        x.postTitle.trim().toLowerCase().includes(term.trim().toLowerCase())
      );
    }
  }
  filterExpired() {
    if (this.isOfferedJobs) {
      this.filteredData = this.offeredJobs;
      this.filteredData = this.filteredData.filter((val) => {
        let string = "Expired";
        return val.post_Status == string;
      });
      this.taskStatus = "Expired";
    } else {
      this.filteredData = this.jobs;
      this.filteredData = this.filteredData.filter((val) => {
        let string = "Expired";
        return val.post_Status == string;
      });
      this.taskStatus = "Expired";
    }
  }
  openPostJob() {
    this.loginService.callPostJob.next(true);
  }
  allTaskFilter() {
    if (this.isOfferedJobs) {
      this.filteredData = this.offeredJobs;
      this.taskStatus = "All";
    } else {
      this.filteredData = this.jobs;
      this.taskStatus = "All";
    }
  }
  openTasksFilter() {
    if (this.isOfferedJobs) {
      this.filteredData = this.offeredJobs;
      this.filteredData = this.filteredData.filter((val) => {
        let string = "Open";
        return val.post_Status == string;
      });
      this.taskStatus = "Open";
    } else {
      this.filteredData = this.jobs;
      this.filteredData = this.filteredData.filter((val) => {
        let string = "Open";
        return val.post_Status == string;
      });
      this.taskStatus = "Open";
    }
  }
  postedTasks() {
    this.isOfferedJobs = false;
    this.myTaskType = "POSTED TASKS";
    this.filteredData = this.jobs;
    this.taskStatus = "All";
  }
  assignedTasksFilter() {
    if (this.isOfferedJobs) {
      this.filteredData = this.offeredJobs;
      console.log(this.filteredData);
      this.filteredData = this.filteredData.filter((val) => {
        let string = "Assigned";
        return val.post_Status == string;
      });
      this.taskStatus = "Assigned";
    } else {
      this.filteredData = this.jobs;
      console.log(this.filteredData);
      this.filteredData = this.filteredData.filter((val) => {
        let string = "Assigned";
        return val.post_Status == string;
      });
      this.taskStatus = "Assigned";
    }
  }
  draftTasksFilter() {
    this.filteredData = this.jobs;
    this.filteredData = this.filteredData.filter((val) => {
      let string = "Draft";
      return val.post_Status == string;
    });
    this.taskStatus = "Draft";
  }
  filterCompleted() {
    debugger;
    if (this.isOfferedJobs) {
      this.filteredData = this.offeredJobs;
      this.filteredData = this.filteredData.filter((val) => {
        let string = "Completed";
        return val.post_Status == string;
      });
      this.taskStatus = "Completed";
    } else {
      this.filteredData = this.jobs;
      this.filteredData = this.filteredData.filter((val) => {
        let string = "Completed";
        return val.post_Status == string;
      });
      this.taskStatus = "Completed";
    }
  }
  filterCanceled() {
    this.filteredData = this.jobs;
    this.filteredData = this.filteredData.filter((val) => {
      let string = "Cancel";
      return val.post_Status == string;
    });
    this.taskStatus = "Cancel";
  }
}
