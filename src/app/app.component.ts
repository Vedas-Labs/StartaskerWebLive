import { Component, ViewChild, ElementRef, HostListener } from "@angular/core";
import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
import { MatSidenav } from "@angular/material";
import { LoginService } from "./services/login.service";
import { PushMessagingService } from "./services/push-messaging.service";
import { environment } from "../environments/environment";

import * as SmartBanner from "../../node_modules/smart-app-banner/dist/smart-app-banner.js";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  title = "startaskerwebapp";
  isLoggedIn = false;
  loading: boolean = false;
  refferObj: any;
  SmartBanner: any;
  @ViewChild("sidenav", { static: true }) sideNav: MatSidenav;
  @ViewChild("sideNavContainer", { static: true }) sideNavContainer: ElementRef;
  constructor(
    private router: Router,
    private loginService: LoginService,
    private messagingService: PushMessagingService,
    private activatedRoute: ActivatedRoute
  ) {
    new SmartBanner({
      // daysHidden: 1,   // days to hide banner after close button is clicked (defaults to 15)
      // daysReminder: 1, // days to hide banner after "VIEW" button is clicked (defaults to 90)
      appStoreLanguage: "us", // language code for the App Store (defaults to user's browser language)
      title: "Open with Startasker App",
      author: "startasker.com",
      button: "VIEW",
      bgColor: "#fff",
      store: {
        ios: "On the App Store",
        android: "In Google Play",
        windows: "In Windows store",
      },
      price: {
        ios: "FREE",
        android: "FREE",
        windows: "FREE",
      },
      theme: "ios", // put platform type ('ios', 'android', etc.) here to force single theme on all device
      icon: "../assets/ic_launcher.png", // full path to icon image if not using website icon image
      // , force: 'ios' // Uncomment for platform emulation
    });
    this.loginService.showLoader.subscribe((flag: boolean) => {
      if (this.loading !== flag) {
        this.loading = flag;
      }
    });
    this.loginService.checkIsLoggedIn.subscribe((val) => {
      if (val == true) {
        this.isLoggedIn = true;
      } else {
        this.isLoggedIn = false;
      }
    });
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
    window.onscroll = () => {
      this.scrollCheck();
    };
  }
  ngOnInit() {
    this.initializeSmartAppBanner();
    this.activatedRoute.queryParamMap.subscribe((params) => {
      this.refferObj = { ...params };
    });

    this.messagingService.requestPermission();
    this.messagingService.receiveMessage();
  }
  closedStart() {
    document.body.style.overflow = "auto";
  }
  initializeSmartAppBanner() {}
  openedStart() {
    document.body.style.overflow = "hidden";
  }
  toggleSideNav() {
    this.sideNav.toggle();
    setTimeout(() => {
      // const sideNavContainer = document.getElementById('sideNavContainer');
      // if (sideNavContainer && sideNavContainer.classList.contains('mat-drawer-container-has-open')) {
      //   document.body.style.overflow = 'hidden';
      // } else {
      //   document.body.style.overflow = 'auto';
      // }
    }, 2000);
  }
  scrollCheck() {
    let mybutton = document.getElementById("myBtn");
    if (
      document.body.scrollTop > 300 ||
      document.documentElement.scrollTop > 300
    ) {
      mybutton.style.opacity = "1";
    } else {
      mybutton.style.opacity = "0";
    }
  }
  scroll() {
    window.scroll(0, 0);
  }
  toggle() {
    this.sideNav.toggle();
  }
  openLogin() {
    this.toggleSideNav();
    this.loginService.callLogin.next(true);
  }
  openSignUp() {
    this.toggleSideNav();
    this.loginService.callSignUp.next(true);
  }
  openEhire() {
    this.toggleSideNav();
    this.loginService.callEhire.next(true);
  }
  openSignOut() {
    this.toggleSideNav();
    this.loginService.callSignOut.next(true);
  }
  openPostJob() {
    this.toggleSideNav();
    this.loginService.callPostJob.next(true);
  }
}
