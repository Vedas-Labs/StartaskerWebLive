import {
  Component,
  OnInit,
  HostListener,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from "@angular/core";
import { JobsService } from "src/app/services/jobs.service";
import { Router, ActivatedRoute, NavigationStart } from "@angular/router";
import { FormGroup, FormBuilder } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import { LoginService } from "src/app/services/login.service";
import { Options } from "ng5-slider";
import { NavigationEvent } from "@ng-bootstrap/ng-bootstrap/datepicker/datepicker-view-model";
import { MatSnackBar } from "@angular/material";
import { IfStmt } from "@angular/compiler";
import { Location } from "@angular/common";
import { CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
import { debounceTime } from "rxjs/operators";

@Component({
  selector: "app-browse-jobs",
  templateUrl: "./browse-jobs.component.html",
  styleUrls: ["./browse-jobs.component.css"],
})
export class BrowseJobsComponent implements OnInit {
  filterForm: FormGroup;
  stateName: string = "Andhra Pradesh";
  isGotJobDetails: boolean = false;
  jobs: any = [];
  filteredData: any = [];
  showDetails: boolean = false;
  routeSub: any;
  searchTextForm: FormGroup;
  slideChecked: boolean = false;
  jobsSubscription: any;
  locationPopUp: Boolean = false;
  pricePopUp: boolean = false;
  taskTypePopUp: boolean = false;
  taskStatus: string = "All";
  jobsFetching: string = "Searching for Jobs...";
  formatedAddress: any = "";
  value: number = 0;
  price: number = 5;
  minPrice: number = 0;
  maxPrice: number = 0;
  user: any;
  filterType: string = "In Person";
  states: Array<any> = [
    "Sabah",
    "Sarawak",
    "Selangor",
    "perak",
    "Johor",
    "Kedah",
    "Negeri Sembilan",
    "Pahang",
    "Terengganu",
    "Penang",
    "Perlis",
    "Maleka",
  ];
  lat: any;
  long: any;
  pageNo: number = 1;
  totalPageCount: number = 1;
  isFilteredJobs: boolean = false;
  isSearchTextFilter: boolean = false;
  loggedIn: boolean = false;
  isSelected: boolean = false;
  searchText: string = "";
  keywordSearch: any;
  userSubscribe: any;
  infoWindow: any;
  totalItemsCount: number = 49;
  debounceTime = null;
  isFetchingJobs: boolean = false;
  sliderOptions: Options = {
    floor: 5,
    ceil: 30000,
  };

  @ViewChild(CdkVirtualScrollViewport, { static: false })
  viewPort: CdkVirtualScrollViewport;
  // MAP Settings
  @ViewChild("mapContainer", { static: false }) gmap: ElementRef;
  map: google.maps.Map;
  markers: Array<any> = [];
  //Coordinates to set the center of the map
  coordinates = new google.maps.LatLng(3.45028, 102.414322);

  mapOptions: google.maps.MapOptions = {
    center: this.coordinates,
    zoom: 7,
  };

  image: string = "https://liveapi.startasker.com/user.png";
  // Auto Complete Options
  autoCompleteOptions = {
    types: [],
    componentRestrictions: { country: ["MY"] },
  };
  constructor(
    private jobsService: JobsService,
    private loginService: LoginService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private elem: ElementRef,
    private snackBar: MatSnackBar,
    private location: Location,
    private cd: ChangeDetectorRef
  ) {
    this.router.events.subscribe((event: NavigationStart) => {
      if (event.navigationTrigger === "popstate") {
        setTimeout(() => {
          if (this.router.url == "/browsejobs") {
            this.ngOnInit();
          } else {
          }
        }, 100);
      }
    });
    //Default Marker
    let marker = new google.maps.Marker({
      position: this.coordinates,
      map: this.map,
      title: "",
    });
  }

  ngOnInit() {
    this.getLatLang();
    this.searchText = "";
    this.user = JSON.parse(localStorage.getItem("user"));
    if (this.user != null) {
      this.loggedIn = true;
      this.fetchUserDetails();
    } else {
      this.loggedIn = false;
      this.jobsFetching =
        "Sign in to StarTasker to see jobs near your location..!";
    }
    this.activatedRoute.queryParamMap.subscribe((params) => {
      this.keywordSearch = { ...params };
    });

    this.routeSub = this.activatedRoute.params.subscribe((params) => {
      //log the entire params object
      if (this.activatedRoute.firstChild == null) {
        this.showDetails = false;
      } else {
        this.isSelected = true;
        this.showDetails = true;
      }
    });
    this.searchTextForm = this.fb.group({
      searchText: [""],
    });
    this.filterForm = this.fb.group({
      userID: [""],
      taskTypes: [""],
      lat: [""],
      long: [""],
      radius: [""],
      maxPrice: [""],
      minPrice: [""],
      locationName: [""],
      hideAssignedTask: [""],
      search_term: [""],
      pageNo: [""],
      size: [""],
    });
    if (
      this.keywordSearch &&
      this.keywordSearch.params &&
      this.keywordSearch.params.search_term
    ) {
      this.pageNo = 1;
      this.searchTextForm.patchValue({
        searchText: this.keywordSearch.params.search_term,
      });
      this.searchText = this.keywordSearch.params.search_term;
      this.getFilteredJobs();
      // this.getSearchTermJobs(this.keywordSearch.params.search_term);
    } else {
      //  this.getJobs()
    }
  }
  getLatLang() {
    this.loginService.getPosition().then((pos) => {
      console.log(`Positon: ${pos.lng} ${pos.lat}`);
      let obj = { longitude: pos.lng, latitude: pos.lat };
      this.getPosition(obj);
    });
  }
  getPosition(position) {
    this.loginService.getLocation(position).subscribe(
      (pos) => {
        debugger;
        console.log("Pos", pos);
      },
      (err) => {
        console.log("ERR", err);
      }
    );
  }
  navigateToBack() {
    this.isSelected = false;
    this.router.navigateByUrl("/browsejobs");
  }

  fetchUserDetails() {
    this.loginService.showLoader.next(true);
    let user = { userID: this.user.userID };
    this.userSubscribe = this.loginService.fetchUserDetails(user).subscribe(
      (posRes) => {
        this.loginService.showLoader.next(false);
        if (posRes.response == 3) {
          this.user = posRes.customerInfo[0];
          this.getFilteredJobs();
          localStorage.setItem("user", JSON.stringify(this.user));
          this.image = "https://liveapi.startasker.com/user.png";
          //  this.getFilteredJobs()
        } else {
          this.openSnackBar(posRes.message, "");
        }
      },
      (err: HttpErrorResponse) => {
        this.loginService.showLoader.next(false);
        this.openSnackBar("Server failure Please try after some time", "");
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
  getAllJobs() {
    this.pageNo = 1;
    this.filteredData = [];
    this.markers = [];
    this.getJobs();
  }
  getSearchTermJobs(term) {
    this.isSearchTextFilter = true;
    this.isFilteredJobs = false;
    this.loginService.showLoader.next(true);
    let token = localStorage.getItem("token");
    let obj = {
      keyword: term,
      location: "",
      categories: [],
      pageNo: this.pageNo,
      size: 20,
    };
    this.jobsService.searchTermJobs(obj, token).subscribe(
      (posRes) => {
        this.loginService.showLoader.next(false);
        if (posRes.response == 3) {
          this.jobsFetching = `No jobs Found..!  Search in different locations`;
          this.jobs = posRes.jobsData;
          this.totalPageCount = posRes.totalPageCount;
          this.loginService.showLoader.next(false);
          this.jobs.forEach((val, i) => {
            // this.jobs.taskDate = new Date(parseFloat(val.taskDate));
            this.jobs[i].postedDate = new Date(val.postedDate * 1);
            if (val.budget.budgetType.Total == false) {
              let num: number = parseInt(val.budget.Hours);
              this.jobs[i].budget.budget = num * val.budget.pricePerHour;
            }
          });
          this.filteredData = this.filteredData.concat(this.jobs);
          this.addMarkers(this.filteredData);
          this.cd.detectChanges();
        } else {
          this.openSnackBar(posRes.message, "");
        }
      },
      (err: HttpErrorResponse) => {
        this.loginService.showLoader.next(false);
        this.openSnackBar("Server failure please try after some time", "");
        if (err.error instanceof Error) {
          console.warn("CSError", err.error);
        } else {
          console.warn("SSError", err.error);
        }
      }
    );
  }
  selectState(state) {
    debugger;
    this.stateName = state;
    this.getAllJobs();
  }
  onScrollEnd() {
    if (this.viewPort) {
      this.viewPort.elementScrolled().subscribe((res) => {
        clearTimeout(this.debounceTime);
        this.debounceTime = setTimeout(() => {
          if (
            (res as any).srcElement.scrollTop +
              (res as any).srcElement.offsetHeight >=
              (res as any).srcElement.scrollHeight &&
            !this.isFetchingJobs &&
            this.totalPageCount > this.pageNo
          ) {
            console.log("View Port", this.viewPort);
            this.pageNo = this.pageNo + 1;
            if (this.isFilteredJobs && !this.isSearchTextFilter) {
              this.callFilteredJobsApi();
            } else if (!this.isFilteredJobs && this.isSearchTextFilter) {
              this.getSearchTermJobs(this.searchTextForm.value.searchText);
            } else {
              this.getJobs();
            }
          }
        }, 100);
      });
    }
  }
  // Waste Code Need to Remove
  getJobs() {
    debugger;
    this.loginService.showLoader.next(true);
    this.isFilteredJobs = false;
    this.isSearchTextFilter = false;
    this.isFetchingJobs = true;
    let obj = {
      pageNo: this.pageNo,
      size: 20,
      location: this.stateName,
    };
    console.log("Pagination", obj);

    this.jobsService.browsJobs(obj).subscribe(
      (posRes) => {
        this.loginService.showLoader.next(false);
        if (posRes.response == 3) {
          this.jobsFetching = "No jobs Found";
          this.jobs = posRes.jobsData;
          this.totalPageCount = posRes.totalPageCount;
          this.jobs.forEach((val, i) => {
            // this.jobs.taskDate = new Date(parseFloat(val.taskDate));
            this.jobs[i].postedDate = new Date(val.postedDate * 1);
            if (val.budget.budgetType.Total == false) {
              let num: number = parseInt(val.budget.Hours);
              this.jobs[i].budget.budget = num * val.budget.pricePerHour;
            }
          });
          this.filteredData = this.filteredData.concat(this.jobs);
          this.cd.detectChanges();
          this.isFetchingJobs = false;
          this.addMarkers(this.filteredData);
        } else {
          this.loginService.showLoader.next(false);
          this.openSnackBar(posRes.message, "");
          this.isFetchingJobs = false;
        }
      },
      (err: HttpErrorResponse) => {
        this.isFetchingJobs = false;
        this.loginService.showLoader.next(false);
        this.openSnackBar("Server failure please try after some time", "");
        if (err.error instanceof Error) {
          console.warn("CSError", err.error);
        } else {
          console.warn("SSError", err.error);
        }
      }
    );
  }
  // End Here
  getFilteredJobs() {
    console.log("Search", this.user.search_Configurations);
    this.searchTextForm.patchValue({
      searchText: "",
    });
    this.filterType = this.user.search_Configurations.taskTypes;
    this.lat = this.user.loc[0];
    this.long = this.user.loc[1];
    this.slideChecked = this.user.search_Configurations.hideAssignedTask;
    this.value = this.user.search_Configurations.radius / 100;
    this.minPrice = this.user.search_Configurations.minPrice;
    this.maxPrice = 30000;
    this.formatedAddress = this.user.search_Configurations.locationName;
    this.filterForm.patchValue({
      userID: this.user.userID,
      taskTypes: this.user.search_Configurations.taskTypes,
      lat: "" + this.user.loc[0],
      long: "" + this.user.loc[1],
      radius: this.user.search_Configurations.radius,
      maxPrice: this.maxPrice,
      minPrice: this.user.search_Configurations.minPrice,
      locationName: this.user.search_Configurations.locationName,
      hideAssignedTask: "" + this.user.search_Configurations.hideAssignedTask,
      search_term: this.searchText,
      pageNo: this.pageNo,
      size: 20,
    });
    console.log("filtered Jobs value", this.filterForm.value);
    this.callFilteredJobsApi();
  }
  callFilteredJobsApi() {
    this.filterForm.patchValue({
      pageNo: this.pageNo,
    });
    this.isFilteredJobs = true;
    this.isSearchTextFilter = false;
    this.loginService.showLoader.next(true);
    let token = localStorage.getItem("token");
    this.jobsSubscription = this.jobsService
      .getFilteredJobs(this.filterForm.value, token)
      .subscribe(
        (posRes) => {
          this.loginService.showLoader.next(false);
          if (posRes.response == 3) {
            this.jobsFetching =
              " No jobs Found..!  Search in different locations";
            this.jobs = posRes.jobsData;
            this.totalPageCount = posRes.totalPageCount;
            this.jobs.forEach((val, i) => {
              this.jobs.taskDate = new Date(val.taskDate).toLocaleDateString();
              this.jobs[i].postModifyDate = new Date(val.postModifyDate * 1);
              if (val.budget.budgetType.Total == false) {
                let num: number = parseInt(val.budget.Hours);
                this.jobs[i].budget.budget = num * val.budget.pricePerHour;
              }
            });
            this.filteredData = this.filteredData.concat(this.jobs);
            this.cd.detectChanges();
            this.addMarkers(this.filteredData);
          } else {
            this.openSnackBar(posRes.message, "");
          }
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
  applyLocationFilter() {
    if (this.loggedIn) {
      this.markers = [];
      this.pageNo = 1;
      this.filteredData = [];
      this.filterForm.patchValue({
        taskTypes: this.filterType,
        lat: "" + this.lat,
        long: "" + this.long,
        radius: this.value * 100,
        hideAssignedTask: "" + this.slideChecked,
        maxPrice: this.maxPrice,
        minPrice: this.minPrice,
        search_term: "",
        locationName: this.formatedAddress,
      });
      this.searchText = "";
      console.log(this.filterForm.value);
      this.callFilteredJobsApi();
      this.locationPopUp = false;
    } else {
      this.openSnackBar("You should logged in to performe this operation.", "");
    }
  }

  assignedTaskOnly(event) {
    this.slideChecked = event.checked;
  }
  // applyAssignedTaskFilter(){
  //  if(this.loggedIn){
  //   this.filterForm.patchValue({
  //     hideAssignedTask:""+ this.slideChecked
  //   })
  //   this.taskTypePopUp = false;
  //   this.callFilteredJobsApi()
  //  }else{
  //   this.openSnackBar("You should logged in to performe this operation","")
  //  }
  // }
  searchTextFilter() {
    if (this.loggedIn) {
      this.pageNo = 1;
      this.filteredData = [];
      this.markers = [];
      this.searchText = this.searchTextForm.value.searchText;
      // this.getSearchTermJobs(this.searchTextForm.value.searchText);
      this.getFilteredJobs();
    } else {
      this.openSnackBar("You should logged in to performe this operation", "");
    }
  }
  filterTypeSetTo(text) {
    this.filterType = text;
  }
  showLocationPop() {
    this.locationPopUp = !this.locationPopUp;
    this.taskTypePopUp = false;
    this.pricePopUp = false;
  }
  handleAddressChange(address) {
    this.formatedAddress = address.formatted_address;
    this.lat = address.geometry.location.lat();
    this.long = address.geometry.location.lng();
  }
  // showPricePop(){
  //   this.pricePopUp = !this.pricePopUp
  //   this.taskTypePopUp = false;
  //   this.locationPopUp = false;
  // }
  // showTaskTypePop(){
  //   this.taskTypePopUp = !this.taskTypePopUp
  //   this.pricePopUp = false;
  //   this.locationPopUp = false;
  // }
  viewDetails(postID) {
    this.router.navigate(["browsejobs", "job", postID]);
    this.isSelected = true;
    setTimeout(() => {
      if (this.activatedRoute.firstChild == null) {
        this.showDetails = false;
      } else {
        this.showDetails = true;
      }
    }, 100);
  }
  addMarkers(jobData) {
    jobData.forEach((val, i) => {
      if (!val.canThisTaskRemote) {
        this.markers.push({
          position: new google.maps.LatLng(val.loc[0], val.loc[1]),
          map: this.map,
          title: val.postTitle,
          postid: val.postID,
        });
      }
    });
    this.mapInitializer();
  }

  mapInitializer(): void {
    if (!this.gmap) {
      return;
    }
    try {
      this.map = new google.maps.Map(this.gmap.nativeElement, this.mapOptions);
      //Adding Click event to default marker
      // this.marker.addListener("click", () => {
      //   const infoWindow = new google.maps.InfoWindow({
      //     content: this.marker.getTitle()
      //   });
      //   infoWindow.open(this.marker.getMap(), this.marker);
      // });

      //Adding default marker to map
      // this.marker.setMap(this.map);
      //Adding other markers
      this.loadAllMarkers();
    } catch (e) {
      console.warn("ERROR", e);
    }
  }

  loadAllMarkers(): void {
    this.markers.forEach((markerInfo) => {
      //Creating a new marker object
      const marker = new google.maps.Marker({
        ...markerInfo,
      });

      //creating a new info window with markers info
      this.infoWindow = new google.maps.InfoWindow({
        content: " ",
      });
      //Add click event to open info window on marker
      google.maps.event.addListener(this.infoWindow, "domready", () => {
        //now my elements are ready for dom manipulation
        var clickableItem = document.getElementById("clickableItem");
        clickableItem.addEventListener("click", (event) => {
          this.show(event.target["dataset"].postid);
          this.infoWindow.close();
        });
      });
      google.maps.event.addListener(marker, "click", () => {
        this.infoWindow.close();
        this.infoWindow
          .setContent(`<div class="d-flex justify-content-around"><h6 class="mx-2 mt-1 align-self-center">${marker["title"]}</h6>
        <img src="../../../assets/info.png" id='clickableItem' width="20" data-postId=${marker["postid"]} class="hover align-self-center " height="20"> </div>`);
        this.infoWindow.open(marker.getMap(), marker);
      });
      //Adding marker to google map
      marker.setMap(this.map);
    });
  }
  show(data) {
    this.viewDetails(data);
  }
}
