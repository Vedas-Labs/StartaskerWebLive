import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { NgbCarouselConfig } from "@ng-bootstrap/ng-bootstrap";
import Swiper from "swiper";
import { LoginService } from "src/app/services/login.service";
import { ActivatedRoute, Router } from "@angular/router";
import { sha256, sha224 } from "js-sha256";
import { JobsService } from "src/app/services/jobs.service";
import { HttpErrorResponse } from "@angular/common/http";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { V } from "@angular/cdk/keycodes";
import { PrefferedListComponent } from "../preffered-list/preffered-list.component";
import { MatDialog, MatSnackBar } from "@angular/material";
@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements OnInit {
  mySwiper: any = null;
  user: any;
  isLoggedIn: boolean = false;
  searchTermForm: FormGroup;
  refferObj: any;
  shareUrl: any = "https://www.startasker.com/#/home";
  shareTaskTitle: any = "Startasker";
  isSocialBtnsHidden: boolean = false;
  jobsCount: any;
  currentDate: any = new Date();
  selectedCat: Array<any> = [];
  constructor(
    private config: NgbCarouselConfig,
    private loginService: LoginService,
    private router: Router,
    private jobService: JobsService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.loginService.checkIsLoggedIn.subscribe((val) => {
      if (!val) {
        this.isLoggedIn = false;
      } else {
        this.isLoggedIn = true;
      }
    });
  }

  ngOnInit() {
    this.fetchJobsDoneCount();
    this.activatedRoute.queryParamMap.subscribe((params) => {
      this.refferObj = { ...params };
    });

    this.searchTermForm = this.fb.group({
      keyword: ["", Validators.required],
    });
    this.config.showNavigationArrows = true;
    this.config.showNavigationIndicators = true;
    this.config.pauseOnHover = false;
    this.initiateSwiper();
    this.user = JSON.parse(localStorage.getItem("user"));
    this.isLoggedIn = this.user && this.user.userID ? true : false;
    if (this.refferObj.params && this.refferObj.params.postId) {
      this.router.navigate([
        "/browsejobs",
        "job",
        this.refferObj.params.postId,
      ]);
    }
    if (this.isLoggedIn) {
      this.getShortLink();
      if (this.user && this.user.completeTask && !this.user.category.length) {
        this.openCategories();
      }
    }
    if (
      !this.isLoggedIn &&
      this.refferObj.params &&
      this.refferObj.params.invitedby
    ) {
      localStorage.setItem("refferal", JSON.stringify(this.refferObj.params));
      let url: string = this.router.url.substring(
        0,
        this.router.url.indexOf("?")
      );
      this.router.navigateByUrl(url);
      this.loginService.callSignUp.next(true);
    }
  }
  searchJobs() {
    if (this.isLoggedIn) {
      this.router.navigate(["/browsejobs"], {
        queryParams: { search_term: this.searchTermForm.value.keyword },
      });
    } else {
      this.loginService.callLogin.next(true);
    }
  }
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: "red-snackbar",
    });
  }
  // Select Preffered Categories
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
        let obj = {
          userID: this.user.userID,
          category: this.selectedCat,
        };
        this.loginService.addCategories(obj).subscribe(
          (posRes) => {
            if (posRes.response == 3) {
              this.openSnackBar(posRes.message, "");
            }
          },
          (err: HttpErrorResponse) => {
            console.warn(err.error);
          }
        );
      } else {
        this.openSnackBar(
          "Please select the preferred tasks, you choosed as a worker",
          ""
        );
      }
    });
  }
  showBtns() {
    this.isSocialBtnsHidden = true;
  }
  close() {
    this.isSocialBtnsHidden = false;
  }
  //  SHare refferal code in social media
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
      },
      (err: HttpErrorResponse) => {
        this.loginService.showLoader.next(false);
        if (err.error instanceof Error) {
          console.warn("Client Error", err.error);
        } else {
          console.warn("Server Error", err.error);
        }
      }
    );
  }
  fetchJobsDoneCount() {
    this.loginService.showLoader.next(true);
    this.loginService.getCompletedJobsCount().subscribe(
      (posRes) => {
        if (posRes.response == 3) {
          this.jobsCount = posRes.count;
        }
      },
      (err: HttpErrorResponse) => {
        console.log("err", err.message);
      }
    );
    this.loginService.showLoader.next(false);
  }
  shareOnFaceBook() {
    this.isSocialBtnsHidden = false;
    let faceBookUrl = `https://www.facebook.com/sharer.php?u=${encodeURIComponent(
      this.shareUrl
    )}?t=${encodeURIComponent(this.shareTaskTitle)}`;
    window.open(faceBookUrl, "_blank");
  }
  shareOnWhatsApp() {
    this.isSocialBtnsHidden = false;
    let url =
      "https://api.whatsapp.com/send?" +
      "&text=" +
      encodeURIComponent(this.shareUrl);
    window.open(url, "_blank");
  }
  shareOnTwiter() {
    this.isSocialBtnsHidden = false;
    let twitterUrl = `https://twitter.com/share?url=${encodeURIComponent(
      this.shareUrl
    )}&amp;text=${encodeURIComponent(
      this.shareTaskTitle
    )}&amp;via=fabienb&amp;hashtags=koandesign`;
    window.open(twitterUrl, "_blank");
  }
  shareOnLinkedIn() {
    this.isSocialBtnsHidden = false;
    let linkedInUrl = `https://www.linkedin.com/shareArticle?url=${encodeURIComponent(
      this.shareUrl
    )}&amp;title=${encodeURIComponent(this.shareTaskTitle)}`;
    window.open(linkedInUrl, "_blank");
  }
  shareOnPinterest() {
    this.isSocialBtnsHidden = false;

    let pinterestLink = `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(
      this.shareUrl
    )}share&description=${encodeURIComponent(this.shareTaskTitle)}`;
    window.open(pinterestLink, "_blank");
  }
  //Swiper
  initiateSwiper() {
    this.mySwiper = new Swiper(".s1", {
      slidesPerView: 1,
      spaceBetween: 10,
      // init: false,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      loop: true,
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      autoplay: {
        delay: 2500,
        disableOnInteraction: false,
      },
      breakpoints: {
        640: {
          slidesPerView: 2,
          spaceBetween: 10,
        },
        768: {
          slidesPerView: 4,
          spaceBetween: 30,
        },
        1024: {
          slidesPerView: 6,
          spaceBetween: 40,
        },
      },
      // And if we need scrollbar
    });
  }
  openPostJob() {
    this.loginService.callPostJob.next(true);
  }
  openBrowseJobs() {
    this.router.navigateByUrl("/browsejobs");
  }
}
