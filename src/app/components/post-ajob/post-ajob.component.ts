import { Component, OnInit, Inject, ViewEncapsulation } from "@angular/core";
import { NgxMaterialTimepickerTheme } from "ngx-material-timepicker";
import { FormBuilder, FormGroup, Validators, FormArray } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from "@angular/material";
import { HeaderComponent } from "../header/header.component";
import { JobsService } from "src/app/services/jobs.service";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { LoginService } from "src/app/services/login.service";
import { UserServiceService } from "src/app/services/user-service.service";

@Component({
  selector: "app-post-ajob",
  templateUrl: "./post-ajob.component.html",
  styleUrls: ["./post-ajob.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class PostAJobComponent implements OnInit {
  indexNumber: any = 0;
  loading: boolean = false;
  selectedFile: File;
  fileList: File[] = [];
  listOfFiles: any[] = [];
  convinientTimings: any = [];
  isEarlyMorningSelected: boolean = false;
  daysSelected: any[] = [];
  event: any;
  isMorningSelected: boolean = false;
  isAfternoonSelected: boolean = false;
  isEveningSelected: boolean = false;
  showHourly: boolean = false;
  showTaskLocation: boolean = true;
  taskNameCount: number;
  describeCount: number;

  postTaskForm: FormGroup;
  index: any = 0;
  firstIndexError: boolean = false;
  secondIndexError: boolean = false;
  category: any = [];
  postTitleValidation: boolean;
  categoryValidation: boolean;
  describeValidation: boolean;
  taskDateValidation: boolean;
  locationValidation: boolean;
  attachmentsValidation: boolean;
  mustHaveValidation: boolean;
  totalBudgetValidation: boolean;
  hourlyBudgetValidation: boolean;
  hoursValidation: boolean;
  radioButtonValidation: boolean = true;
  previewImg: any;
  showDraftBtn: boolean = true;
  datesArray: any = [];
  isDraftPost: boolean = false;
  serverResponce: any;
  mustHavesActivities: any = [];
  formatedAddress: any = "";
  user: any = "";
  options = {
    componentRestrictions: {
      country: ["MY"],
    },
  };
  jobBudget: string;
  checkValue: boolean = true;
  jobBudgetInHours: number;
  mustHaveLimit: boolean = false;
  minDate: any = new Date();
  isSuggestionsSelected: boolean = false;
  minPrice: number = 10;
  categoryRes: any = {};
  attachments: Array<any> = [];
  baseUrl: string = "";
  videoFilesCount: number = 0;
  selectedDatesTimestamps: Array<any> = [];
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<HeaderComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private jobsService: JobsService,
    private loginService: LoginService,
    private http: HttpClient,
    private userService: UserServiceService
  ) {}

  ngOnInit() {
    this.baseUrl = this.loginService.baseUrl;
    // this.baseUrl = "http://54.255.17.53:5000";
    this.user = JSON.parse(localStorage.getItem("user"));
    console.log(this.user);

    this.postTaskForm = this.fb.group({
      userID: [""],
      postTitle: ["", [Validators.required, Validators.minLength(10)]],
      category: this.fb.group({
        categoryId: [""],
        categoryName: ["", Validators.required],
      }),
      describeTaskInDetails: [
        "",
        [Validators.required, Validators.minLength(20)],
      ],
      numberOfWorkers: [1, Validators.required],
      canThisTaskRemote: ["false"],
      location: ["", Validators.required],
      latitude: ["", Validators.required],
      longitude: [""],
      mustHaves: [""],
      taskDate: ["", Validators.required],
      convenientTimings: [""],
      budgetType: this.fb.group({
        Total: ["true"],
        HourlyRate: ["false"],
      }),
      budget: [""],
      Hours: ["1"],
      pricePerHour: [""],
      post_Status: ["Open"],
    });

    this.onChanges();
    this.browseCategory();
    if (this.data.postID) {
      this.updatePostValues();
    } else {
      // this.formatedAddress = user.address;
      this.postTaskForm.patchValue({
        userID: this.data.userID,
        Hours: 1,
        // location:user.address,
        // latitude:user.loc[0],
        // longitude:user.loc[1]
      });
    }
  }
  // Multiple Dates selection
  isSelected = (event: any) => {
    const date = new Date(event).toLocaleDateString();
    // event.getFullYear() +
    // "/" +
    // ("00" + (event.getMonth() + 1)).slice(-2) +
    // "/" +
    // ("00" + event.getDate()).slice(-2);
    return this.daysSelected.find((x) => x == date) ? "selected" : null;
  };

  select(event: any, calendar: any) {
    let date = new Date(event);
    let currentDate = new Date();
    date = new Date(date.setHours(0, 0, 0, 0));
    currentDate = new Date(currentDate.setHours(0, 0, 0, 0));
    const timeStampIndex = this.selectedDatesTimestamps.findIndex(
      (x) => x == new Date(event).getTime().toString()
    );
    if (timeStampIndex < 0) {
      this.selectedDatesTimestamps.push(date.getTime().toString());
    } else {
      this.selectedDatesTimestamps.splice(timeStampIndex, 1);
    }
    if (date >= currentDate) {
      const index = this.daysSelected.findIndex(
        (x) => x == date.toLocaleDateString()
      );
      if (index < 0) {
        this.daysSelected.push(date.toLocaleDateString());
        this.postTaskForm.patchValue({
          taskDate: this.daysSelected,
        });
      } else {
        this.daysSelected.splice(index, 1);
      }
    }
    // event.getFullYear() +
    // "/" +
    // ("00" + (event.getMonth() + 1)).slice(-2) +
    // "/" +
    // ("00" + event.getDate()).slice(-2);

    calendar.updateTodaysDate();
  }
  updatePostValues() {
    this.postTitleValidation = true;
    this.categoryValidation = true;
    this.describeValidation = true;
    if (this.data.type == "Edit") {
      this.showDraftBtn = false;
      this.taskDateValidation = true;
      this.data.taskDate.forEach((val) => {
        this.daysSelected.push(new Date(parseFloat(val)).toLocaleDateString());
      });
      this.selectedDatesTimestamps = [...this.data.taskDate];
    }
    this.postTaskForm.patchValue({
      taskDate: this.daysSelected,
      postTitle: this.data.postTitle,
      describeTaskInDetails: this.data.describeTaskInDetails,
      numberOfWorkers: this.data.numberOfWorkers,
      category: {
        categoryId: this.data.category.categoryId,
        categoryName: this.data.category.categoryName,
      },
      canThisTaskRemote: "" + this.data.canThisTaskRemote,
      post_Status: "Open",
      budgetType: {
        Total: "" + this.data.budget.budgetType.Total,
        HourlyRate: "" + this.data.budget.budgetType.HourlyRate,
      },
    });
    if (this.data.budget.budgetType.HourlyRate == true) {
      this.showHourly = true;
      this.postTaskForm.get("Hours").setValidators([Validators.required]);
      this.postTaskForm
        .get("pricePerHour")
        .setValidators([Validators.required]);
      this.postTaskForm.get("budget").clearValidators();
      this.postTaskForm.get("budget").updateValueAndValidity();
      this.postTaskForm.patchValue({
        Hours: this.data.budget.Hours,
        pricePerHour: this.data.budget.pricePerHour,
      });
    } else {
      this.postTaskForm
        .get("budget")
        .setValidators([
          Validators.required,
          Validators.pattern(/^-?(0|[1-9]\d*)?$/),
          Validators.min(this.minPrice),
          Validators.max(9999),
        ]);
      this.showHourly = false;
      this.postTaskForm.patchValue({
        budget: this.data.budget.budget,
      });
    }
    if (this.data.convenientTimings.length >= 1) {
      for (let timings of this.data.convenientTimings) {
        this.convinientTimings.push(timings);
      }
      let array = this.data.convenientTimings;
      if (array.indexOf("Morning") > -1) {
        this.isEarlyMorningSelected = true;
      }
      if (array.indexOf("Midday") > -1) {
        this.isMorningSelected = true;
      }
      if (array.indexOf("Afternoon") > -1) {
        this.isAfternoonSelected = true;
      }
      if (array.indexOf("Evening") > -1) {
        this.isEveningSelected = true;
      }
    }
    let event = {
      value: "" + this.data.canThisTaskRemote,
    };
    this.attachments = [...this.data.attachments];
    if (this.data.attachments.length >= 1) {
      for (let image of this.data.attachments) {
        this.listOfFiles.push("https://liveapi.startasker.com" + image);
      }
      for (let i = 0; i <= this.data.attachments.length - 1; i++) {
        this.http
          .get("https://liveapi.startasker.com" + this.data.attachments[i], {
            responseType: "blob",
          })
          .subscribe((file) => {
            let imgFile = new File([file], "attachment" + [i] + ".jpg");
            this.fileList.push(imgFile);
          });
      }
    }
    if (this.data.mustHaves.length >= 1) {
      for (let must of this.data.mustHaves) {
        this.mustHavesActivities.push({ string1: must });
      }
    }
    this.listOfFiles = [...this.attachments];
    this.postStatusChecking(event);
    if (this.data.canThisTaskRemote == false) {
      this.radioButtonValidation = true;
      this.formatedAddress = this.data.location;
      this.postTaskForm.patchValue({
        latitude: this.data.loc[0],
        longitude: this.data.loc[1],
      });
      this.locationValidation = true;
    } else {
      this.radioButtonValidation = false;
    }
  }
  saveToDraft() {
    this.postTaskForm.patchValue({
      post_Status: "Draft",
    });
    this.isDraftPost = true;
    this.submitDetails();
  }
  postOpenTask() {
    this.postTaskForm.patchValue({
      post_Status: "Open",
    });
    this.isDraftPost = false;
    if (this.postTaskForm.value.budgetType.HourlyRate == "true") {
      if (this.jobBudgetInHours >= 10 && this.jobBudgetInHours < 10000) {
        this.submitDetails();
      } else {
        this.openSnackBar("Total allowed price is Min 10 - Max 9999", "");
      }
    } else {
      this.submitDetails();
    }
  }
  closeDailog() {
    this.dialogRef.close(this.serverResponce);
  }
  onChanges() {
    this.taskNameCount = 0;
    this.describeCount = 0;
    this.postTaskForm.get("postTitle").valueChanges.subscribe((val) => {
      this.taskNameCount = val.length;
      if (this.postTaskForm.get("postTitle").valid) {
        this.postTitleValidation = true;
      }
    });
    this.postTaskForm.get("describeTaskInDetails").valueChanges.subscribe(
      (val) => {
        this.describeCount = val.length;
        if (this.postTaskForm.get("describeTaskInDetails").valid) {
          this.describeValidation = true;
        }
      },
      (err) => {
        console.warn(err);
      }
    );
    this.postTaskForm.get("location").valueChanges.subscribe((val) => {
      if (val.length <= 4) {
        this.locationValidation = false;
      }
    });
    this.postTaskForm.get("taskDate").valueChanges.subscribe((val) => {
      if (this.postTaskForm.get("taskDate").valid) {
        this.taskDateValidation = true;
      } else {
        this.taskDateValidation = false;
      }
    });
    this.postTaskForm
      .get("budget")
      .setValidators([
        Validators.required,
        Validators.pattern(/^-?(0|[1-9]\d*)?$/),
        Validators.min(this.minPrice),
        Validators.max(9999),
      ]);
    this.postTaskForm.get("budget").valueChanges.subscribe((val) => {
      if (this.postTaskForm.get("budget").valid && val.toString().length >= 1) {
        if (val >= this.categoryRes.amount.Setminimumtaskamount) {
          this.totalBudgetValidation = true;
        }
      } else {
        this.totalBudgetValidation = false;
      }
      this.jobBudget = val;
    });
    let hours: number = 0;
    let price: number = 0;
    this.postTaskForm.get("Hours").valueChanges.subscribe((val) => {
      if (this.postTaskForm.get("Hours").valid && val.toString().length >= 1) {
        this.hoursValidation = true;
      } else {
        this.hoursValidation = false;
      }
      if (this.showHourly) {
        this.postTaskForm
          .get("pricePerHour")
          .setValidators([
            Validators.required,
            Validators.pattern(/^-?(0|[1-9]\d*)?$/),
            Validators.min(
              this.minPrice / parseInt(this.postTaskForm.get("Hours").value)
            ),
          ]);
      }
      if (val != null) {
        hours = val;
        this.jobBudgetInHours = hours * price;
      } else {
        hours = 0;
      }
    });
    this.postTaskForm.get("pricePerHour").valueChanges.subscribe((val) => {
      if (
        this.minPrice <=
          parseInt(this.postTaskForm.get("Hours").value) *
            parseInt(this.postTaskForm.get("pricePerHour").value) &&
        val.toString().length >= 1 &&
        val.toString().length <= 4
      ) {
        this.hourlyBudgetValidation = true;
      } else {
        this.hourlyBudgetValidation = false;
      }
      if (val != null) {
        price = val;
        this.jobBudgetInHours = hours * price;
      } else {
        price = 0;
      }
    });
  }
  // Browse Category
  browseCategory() {
    this.loginService.showLoader.next(true);
    if (
      this.loginService.categoriesList &&
      this.loginService.categoriesList.categoriesList.length
    ) {
      this.category = this.loginService.categoriesList.categoriesList;
      this.categoryRes = this.loginService.categoriesList.isUpdate[0];
      this.loginService.showLoader.next(false);
      this.minPrice = this.categoryRes.amount.Setminimumtaskamount;
      if (!this.data.postID) {
        this.postTaskForm
          .get("budget")
          .setValidators([
            Validators.required,
            Validators.pattern(/^-?(0|[1-9]\d*)?$/),
            Validators.min(this.minPrice),
            Validators.max(9999),
          ]);
      }
      return;
    }
    this.jobsService.browseCategory().subscribe(
      (posRes) => {
        if (posRes.response == 3) {
          this.categoryRes = posRes.isUpdate[0];
          this.category = posRes.categoriesList;
          this.minPrice = this.categoryRes.amount.Setminimumtaskamount;
          this.loginService.showLoader.next(false);
          if (!this.data.postID) {
            this.postTaskForm
              .get("budget")
              .setValidators([
                Validators.required,
                Validators.pattern(/^-?(0|[1-9]\d*)?$/),
                Validators.min(this.minPrice),
                Validators.max(9999),
              ]);
          }
        } else {
          this.loginService.showLoader.next(false);
          alert(posRes.message);
          this.dialogRef.close();
        }
      },
      (err: HttpErrorResponse) => {
        this.loginService.showLoader.next(false);
        this.dialogRef.close();
        this.openSnackBar("Server Failure please try after few minutes", "");
        if (err.error instanceof Error) {
          console.warn("CSE", err.message);
        } else {
          console.warn("SSE", err.message);
        }
      }
    );
  }
  postStatusChecking(event) {
    if (event.value == "false") {
      this.showTaskLocation = true;
      this.postTaskForm.controls["location"].setValidators([
        Validators.required,
      ]);
      this.postTaskForm.controls["latitude"].setValidators([
        Validators.required,
      ]);
      this.radioButtonValidation = true;
    } else {
      this.showTaskLocation = false;
      this.postTaskForm.controls["location"].clearValidators();
      this.postTaskForm.controls["latitude"].clearValidators();
      this.postTaskForm.get("location").updateValueAndValidity();
      this.postTaskForm.get("latitude").updateValueAndValidity();
      this.radioButtonValidation = false;
    }
  }
  addActivity(text) {
    if (text != "") {
      if (this.mustHavesActivities.length <= 2) {
        this.mustHaveValidation = true;
        this.mustHavesActivities.push({ string1: text });
        this.postTaskForm.patchValue({
          mustHaves: "",
        });
      } else {
        this.mustHaveLimit = true;
        setTimeout(() => {
          this.mustHaveLimit = false;
        }, 2000);
      }
    }
  }
  showConvinientTimings(event) {
    this.checkValue = event.checked;
  }
  // Increse or decrease workers
  incrementWorker() {
    if (this.postTaskForm.value.numberOfWorkers <= 19) {
      this.postTaskForm.patchValue({
        numberOfWorkers: this.postTaskForm.value.numberOfWorkers + 1,
      });
    }
  }
  decrementWorker() {
    if (this.postTaskForm.value.numberOfWorkers >= 2) {
      this.postTaskForm.patchValue({
        numberOfWorkers: this.postTaskForm.value.numberOfWorkers - 1,
      });
    }
  }
  changeCategory(e) {
    let index = -1;
    this.categoryValidation = false;
    index = e.target.selectedIndex - 1;
    if (index != -1) {
      this.postTaskForm.patchValue({
        category: {
          categoryId: this.category[index].categoryId,
          categoryName: this.category[index].categoryName,
        },
      });

      if (this.category[index].categoryName == "Cleaning") {
        this.postTaskForm.get("describeTaskInDetails").setValue(
          `Bedroom Room : 
Bathroom: 
House size : ? Sqf 
House type : condo/double storey 

Standard cleaning tasks should include: 
 - Everywhere in the house: Wiping down furniture and visible surfaces; Mop and vacuum floors; Throw rubbish \n - Bathrooms: Cleaning showers, bathtub and toilets; \n - Kitchen: Cabinets, surface etc`
        );
      } else if (this.category[index].categoryName === "Painter") {
        this.postTaskForm.get("describeTaskInDetails").setValue(
          `Size of the house(sqft): 
Area to paint: 
Tools that I will provide:  Ladder, Paint, Brush?? 
Things to take note: 
          `
        );
      } else if (this.category[index].categoryName === "Handyman") {
        this.postTaskForm.get("describeTaskInDetails").setValue(
          `I will need...:Repair or installation? 
Tools that I will provide : Ladder, Electrical drill, Tools box? 
How many item need to fix? : 
Things to take note: 
          `
        );
      } else if (this.category[index].categoryName === "Moving") {
        this.postTaskForm.get("describeTaskInDetails").setValue(
          `I am looking for… : Helper or lorry? 
My place is… : House/Office/Factory/Event place 
How many box item : 
How many big items : refrigerator/bed/shelves/washing machine/sofa/TV/table/chair 
Location where to where:  
Things to take note : 
          `
        );
      } else if (this.category[index].categoryName === "Plumber") {
        this.postTaskForm.get("describeTaskInDetails").setValue(
          `I will need… : Repair or installation? 
Problem : Leaking/Clogged drain/Lower water/Fixture not draining/Not sure
Fittings need to fix : Toilet bowl/Sink/Bathtub/Water pump 
My place is… : Condo/Landed/Office/Factory 
Tools that I will provide : Ladder, Electrical drill, Tools box? 
Things to take note: 
          `
        );
      } else if (this.category[index].categoryName === "Furniture Assembling") {
        this.postTaskForm.get("describeTaskInDetails").setValue(
          `Types of furniture : Desk/Bed frame/Chair/TV stand/Shelves/Cabinet/Outdoor furniture 
Number of item :  
Tools that I will provide : Ladder, Electrical drill, Tools box?
Things to take note: 
          `
        );
      } else if (this.category[index].categoryName === "Electrician") {
        this.postTaskForm.get("describeTaskInDetails").setValue(
          `I need wiring work for… : Repair/Installation/Relocate 
What item need to fix : Fan/Lighting/Air con/Water heater/Wall socket
Number of item : 
Tools that I will provide : Ladder, Electrical drill, Tools box? 
My place is… : Condo/Landed/Office/Factory
Things to take note: 
          `
        );
      } else if (this.category[index].categoryName === "Baby Sitting") {
        this.postTaskForm.get("describeTaskInDetails").setValue(
          `How many children : 
What is the age of children :
What is the religion of children : 
Is the food need to be halal : Yes/No  
How many hours for babysitting : 
Tools that I will provide:  Ladder, Paint, Brush?? \nThings to take note: 
          `
        );
      } else if (this.category[index].categoryName === "AC") {
        this.postTaskForm.get("describeTaskInDetails").setValue(
          `You will need : Service/Relocate/Install
How many unit air con :  
Air Con HP : 1.0 HP/2.0 HP/ 3.0 HP
My place is… : Condo/Landed/Office/Factory  
Tools that I will provide:  Ladder, Paint, Brush?? 
Things to take note: 
          `
        );
      } else if (this.category[index].categoryName === "Waiter/Waitress") {
        this.postTaskForm.get("describeTaskInDetails").setValue(
          `Venue : Restaurant/Hotel/Private event/Public event
How many hours :  
Halal food to be served : Yes/No
Staff meal provided : Yes/No
Looking for : Newbie/Experienced worker 
Things to take note: 
          `
        );
      } else if (this.category[index].categoryName === "Photographer") {
        this.postTaskForm.get("describeTaskInDetails").setValue(
          `Purpose for : Corporate function/Family event/ Public event 
Photoshoot location : Outdoor/Photo studio/Home/Office 
Photo format : Online download/CD/Pendrive/Album 
How many hours :  
Things to take note: 
          `
        );
      } else if (this.category[index].categoryName === "Promoter") {
        this.postTaskForm.get("describeTaskInDetails").setValue(
          `Venue : Shopping mall/Hotel/Event/Public area/Market 
How many hours :  
Halal product : Yes/No 
Staff meal provided : Yes/No
Looking for : Newbie/Experienced worker 
Attire : T-Shirt/Collar/Jeans/Sport shoes/Uniform provided          
Things to take note: 
          `
        );
      } else if (this.category[index].categoryName === "Mini Task") {
        this.postTaskForm.get("describeTaskInDetails").setValue(
          `Venue : Home/Private area/Shopping mall/Public area/Market/Other 
How many hours :  
What need to do :  
Things to take note: 
          `
        );
      } else if (this.category[index].categoryName === "Design") {
        this.postTaskForm.get("describeTaskInDetails").setValue(
          `I need design for : House/Room/Art/Logo/2D or 3D 
How many days to be done : 
I need revision : 1/2/3 times 
Design format : Online download/Pendrive/PDF/PNG
Things to take note: 
          `
        );
      } else if (this.category[index].categoryName === "Admin") {
        this.postTaskForm.get("describeTaskInDetails").setValue(
          `I need for : Online/Physical
Venue : Home/Office/Factory/Event place 
How many days :
How many hours per day : 
Staff meal provided : Yes/No 
Attire : T-Shirt/Collar/Jeans/Sport shoes/Uniform provided
Job scope : Data entry/Key in/Documentary/Facebook enquiry/Email reply/Others 
Things to take note: 
          `
        );
      } else {
        this.describeValidation = false;
        this.postTaskForm.get("describeTaskInDetails").setValue("");
      }
      if (this.postTaskForm.get(["category", "categoryName"]).valid) {
        this.categoryValidation = true;
      } else {
        this.categoryValidation = false;
      }
    }
  }
  deleteActivity(index) {
    this.mustHavesActivities.splice(index, 1);
    if (this.mustHavesActivities.length == 0) {
      this.mustHaveValidation = false;
    }
  }
  increaseIndex() {
    if (this.index == 0) {
      if (
        this.postTaskForm.get("postTitle").valid &&
        this.postTaskForm.get("describeTaskInDetails").valid &&
        this.postTaskForm.get("category.categoryName").valid
      ) {
        this.index += 1;
        if (this.data.location) {
          this.postTaskForm.patchValue({
            location: this.data.location,
          });
        }
      } else {
        this.firstIndexError = true;
      }
    } else if (this.index == 1) {
      setTimeout(() => {
        if (
          this.postTaskForm.get("location").valid &&
          this.postTaskForm.get("latitude").valid
        ) {
          this.index += 1;
          this.locationValidation = true;
        } else {
          this.openSnackBar("Enter Valid Address..", "");
          this.secondIndexError = true;
          this.locationValidation = false;
        }
      }, 1000);
    } else if (this.index == 2) {
      if (this.postTaskForm.get("taskDate").valid) {
        this.index += 1;
        this.taskDateValidation = true;
      } else {
        this.taskDateValidation = false;
        this.postTaskForm.get("taskDate").markAsTouched();
      }
    } else if (this.index == 3) {
      this.index += 1;
    }
  }
  decreaseIndex() {
    if (this.index != 0) {
      this.index -= 1;
    }
    if (this.index == 1) {
      this.postTaskForm.patchValue({
        location: this.formatedAddress,
      });
    }
  }
  fileProgress(event) {
    let file = event.target.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(file);
    if (this.fileList.length <= 7) {
      this.fileList.push(file);
      // File Upload
      let formData = new FormData();
      formData.append(
        "updateInfo",
        JSON.stringify({ userID: this.user.userID })
      );
      if (file.size <= 20971520) {
        reader.onload = () => {
          this.previewImg = reader.result;
          this.attachmentsValidation = true;
          if (file.type == "video/mp4") {
            if (this.videoFilesCount < 2) {
              formData.append("video", file);
              this.loginService.showLoader.next(true);
              this.userService.uploadGalleryFiles(formData).subscribe(
                (posRes) => {
                  this.loginService.showLoader.next(false);
                  if (posRes.response == 3) {
                    this.attachments.push(posRes.thumblerPath);
                    this.listOfFiles.push(posRes.thumblerPath);
                    this.videoFilesCount += 1;
                  } else {
                    this.openSnackBar(posRes.message, "");
                  }
                },
                (err: HttpErrorResponse) => {
                  console.log(err);
                  this.loginService.showLoader.next(false);
                  if (err.error instanceof Error) {
                    console.warn("ERROR", err.message);
                  } else {
                    console.warn("ERROR", err.message);
                  }
                }
              );
            } else {
              this.openSnackBar("You Can only Upload 2 Videos", "");
            }
          } else {
            formData.append("image", file);
            this.loginService.showLoader.next(true);
            this.userService.uploadGalleryFiles(formData).subscribe(
              (posRes) => {
                this.loginService.showLoader.next(false);
                if (posRes.response == 3) {
                  setTimeout(() => {
                    this.attachments.push(posRes.imagePath);
                    this.listOfFiles.push(posRes.imagePath);
                  }, 100);
                } else {
                  this.openSnackBar(posRes.message, "");
                  this.openSnackBar("posRes.message", "");
                }
              },
              (err: HttpErrorResponse) => {
                this.openSnackBar(err.error, "");
                this.loginService.showLoader.next(false);
                if (err.error instanceof Error) {
                  console.warn("ERROR", err.message);
                } else {
                  console.warn("ERROR", err.message);
                }
              }
            );
          }
        };
      } else {
        this.openSnackBar("Uploaded File Should bellow 20MB", "");
      }
    } else {
      this.openSnackBar("Max upload count is 8 only", "");
    }
  }
  // remove uploaded image
  removeImg(i) {
    const extension = this.listOfFiles[i].split(".").pop();
    if (extension === "png") {
      this.videoFilesCount -= 1;
    }
    this.fileList.splice(i, 1);
    this.listOfFiles.splice(i, 1);
    if (this.fileList.length == 0) {
      this.attachmentsValidation = false;
    } else {
      this.attachmentsValidation = true;
    }
  }
  addDatesToArray() {
    if (this.postTaskForm.value.taskDate != "") {
      this.datesArray.push(
        new Date(this.postTaskForm.value.taskDate).getTime().toString()
      );
      this.datesArray = this.datesArray.filter((elem, index, self) => {
        return index === self.indexOf(elem);
      });
      this.postTaskForm.patchValue({
        taskDate: "",
      });
    }
  }
  submitDetails() {
    if (this.mustHavesActivities.length >= 1) {
      let must: any = [];
      this.mustHavesActivities.forEach((val) => {
        return must.push(val.string1);
      });
      this.postTaskForm.get("mustHaves").setValue(must);
    } else {
      let must: any = [];
      this.postTaskForm.get("mustHaves").setValue(must);
    }

    this.postTaskForm.updateValueAndValidity();
    //this.index += 1;
    this.postTaskForm.patchValue({
      convenientTimings: this.convinientTimings,
      budget: "" + this.postTaskForm.value.budget,
      Hours: "" + this.postTaskForm.value.Hours,
      pricePerHour: "" + this.postTaskForm.value.pricePerHour,
    });
    if (!this.showTaskLocation) {
      this.postTaskForm.patchValue({
        latitude: this.user.loc[0],
        longitude: this.user.loc[1],
        location: this.user.address,
      });
    }
    let payLoad = { ...this.postTaskForm.value };
    let dates = [...this.selectedDatesTimestamps];
    // this.daysSelected.forEach((val) => {
    //   const date = new Date(val);
    //   if (isNaN(date.getTime())) {
    //     if (val) {
    //       const dateArray = val.split("/");
    //       console.log("Dates Array", dateArray);

    //       if (dateArray && dateArray.length === 3) {
    //         const newDateFormat = `${dateArray[1]}/${dateArray[0]}/${dateArray[2]}`;
    //         console.log("New Date Formate", newDateFormat);

    //         if (newDateFormat) {
    //           dates.push(new Date(newDateFormat).getTime().toString());
    //         }
    //       }
    //     }
    //   } else {
    //     dates.push("" + new Date(val).getTime());
    //   }
    // });
    debugger;
    payLoad.taskDate = dates;
    if (this.postTaskForm.get(["budgetType", "HourlyRate"]).value == "true") {
      payLoad.budget =
        "" + parseFloat(payLoad.pricePerHour) * parseFloat(payLoad.Hours);
    } else {
      payLoad.pricePerHour = "0";
      payLoad.Hours = "0";
    }
    if (this.data.postID) {
      if (this.data.type == "Edit") {
        delete payLoad.userID;
        payLoad.postID = this.data.postID;
        this.editPost(payLoad);
      } else {
        let user = JSON.parse(localStorage.getItem("user"));
        payLoad.userID = user.userID;
        this.postData(payLoad);
      }
    } else {
      this.postData(payLoad);
    }
  }
  editPost(payLoad) {
    this.loading = true;
    this.loginService.showLoader.next(true);
    let formData = new FormData();
    if (this.fileList.length == 1) {
      formData.append("image1", this.fileList[0]);
    } else if (this.fileList.length == 2) {
      formData.append("image1", this.fileList[0]);
      formData.append("image2", this.fileList[1]);
    } else if (this.fileList.length == 3) {
      formData.append("image1", this.fileList[0]);
      formData.append("image2", this.fileList[1]);
      formData.append("image3", this.fileList[2]);
    }
    formData.append("postData", JSON.stringify(payLoad));
    payLoad.attachments = this.attachments;
    let token = localStorage.getItem("token");
    this.jobsService.editPost(payLoad, token).subscribe(
      (posRes) => {
        if (posRes.response == 3) {
          this.loginService.showLoader.next(false);
          this.index += 1;
          this.serverResponce = posRes;
          this.loading = false;
        } else {
          this.loading = false;
          this.loginService.showLoader.next(false);
          this.openSnackBar(posRes.message, "");
        }
      },
      (err) => {
        this.loading = false;
        this.loginService.showLoader.next(false);
        this.openSnackBar("Server Failure please try after few minutes", "");
        console.log("Err", err);
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
  postData(payLoad) {
    this.loading = true;
    this.loginService.showLoader.next(true);
    let formData = new FormData();
    if (this.fileList.length >= 1) {
      for (let i: number = 0; i < this.fileList.length; i++) {
        let index = 0;
        index = i + 1;
        formData.append("image" + index, this.fileList[i]);
      }
    }
    payLoad.numberOfWorkers = "" + payLoad.numberOfWorkers;
    payLoad.latitude = "" + payLoad.latitude;
    payLoad.longitude = "" + payLoad.longitude;

    formData.append("postData", JSON.stringify(payLoad));
    payLoad.attachments = this.attachments;
    let token = localStorage.getItem("token");
    this.jobsService.postJobs(payLoad, token).subscribe(
      (posRes) => {
        if (posRes.response == 3) {
          this.openSnackBar(posRes.message, "");
          this.loginService.showLoader.next(false);
          this.loading = false;
          this.serverResponce = posRes;
          if (!this.isDraftPost) {
            this.index += 1;
          } else {
            this.closeDailog();
          }
        } else {
          this.loginService.showLoader.next(false);
          this.loading = false;
          this.openSnackBar(posRes.message, "");
        }
      },
      (err) => {
        console.log("Err", err);
        this.loginService.showLoader.next(false);
        this.loading = false;
        this.openSnackBar("Server Failure please try after few minutes", "");
      }
    );
  }
  closeTab() {
    this.dialogRef.close();
  }
  onBlurMethod() {
    let str = this.postTaskForm.get("location").value;
    this.formatedAddress = str;
    this.jobsService.getLat(str.replace(/\s/g, " ")).subscribe(
      (res) => {
        // console.log("Address",str);
        if (!this.isSuggestionsSelected) {
          if (
            res &&
            res.results.length &&
            res.results[0].geometry &&
            res.results[0].geometry.location
          ) {
            this.postTaskForm.patchValue({
              latitude: res.results[0].geometry.location.lat,
              longitude: res.results[0].geometry.location.lng,
            });
            // console.log("Form Value",this.postTaskForm.value);

            if (
              this.postTaskForm.get("location").valid &&
              this.postTaskForm.get("latitude").valid
            ) {
              this.locationValidation = true;
            } else {
              this.locationValidation = false;
            }
          } else {
            this.locationValidation = false;
            this.postTaskForm.patchValue({
              latitude: undefined,
              longitude: undefined,
            });
          }
        } else {
          this.isSuggestionsSelected = false;
          debugger;
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          console.warn("Client Error", err.message);
        } else {
          console.warn("Server Error", err.message);
        }
      }
    );
  }

  public handleAddressChange(address: any) {
    this.isSuggestionsSelected = true;
    this.formatedAddress = address.formatted_address;
    this.postTaskForm.get("location").setValue(this.formatedAddress);
    let lat = address.geometry.location.lat();
    let lang = address.geometry.location.lng();
    this.postTaskForm.patchValue({
      latitude: lat,
      longitude: lang,
    });
    if (this.postTaskForm.get("location").valid) {
      this.locationValidation = true;
    } else {
      this.locationValidation = false;
    }
  }
  addEarlyMorning() {
    this.isEarlyMorningSelected = !this.isEarlyMorningSelected;
    if (this.isEarlyMorningSelected == true) {
      this.convinientTimings.push("Morning");
    } else {
      let i = this.convinientTimings.indexOf("Morning");
      this.convinientTimings.splice(i, 1);
    }
  }
  addMorning() {
    this.isMorningSelected = !this.isMorningSelected;
    if (this.isMorningSelected == true) {
      this.convinientTimings.push("Midday");
    } else {
      let i = this.convinientTimings.indexOf("Midday");
      this.convinientTimings.splice(i, 1);
    }
  }
  addAfternoon() {
    this.isAfternoonSelected = !this.isAfternoonSelected;
    if (this.isAfternoonSelected == true) {
      this.convinientTimings.push("Afternoon");
    } else {
      let i = this.convinientTimings.indexOf("Afternoon");
      this.convinientTimings.splice(i, 1);
    }
  }
  addEvening() {
    this.isEveningSelected = !this.isEveningSelected;
    if (this.isEveningSelected == true) {
      this.convinientTimings.push("Evening");
    } else {
      let i = this.convinientTimings.indexOf("Evening");
      this.convinientTimings.splice(i, 1);
    }
  }
  changeView(event) {
    if (event.value == "hourly") {
      debugger;
      this.postTaskForm
        .get("Hours")
        .setValidators([
          Validators.required,
          Validators.pattern(/^-?(0|[1-9]\d*)?$/),
          Validators.min(1),
        ]);
      this.postTaskForm
        .get("pricePerHour")
        .setValidators([
          Validators.required,
          Validators.pattern(/^-?(0|[1-9]\d*)?$/),
          Validators.min(this.minPrice / this.postTaskForm.get("Hours").value),
        ]);
      this.postTaskForm.get("budget").clearValidators();
      this.postTaskForm.get("budget").updateValueAndValidity();
      this.postTaskForm.patchValue({
        budgetType: {
          Total: "false",
          HourlyRate: "true",
        },
      });
      this.showHourly = true;
    } else {
      this.postTaskForm.get("Hours").clearValidators();
      this.postTaskForm.get("Hours").updateValueAndValidity();
      this.postTaskForm.get("pricePerHour").clearValidators();
      this.postTaskForm.get("pricePerHour").updateValueAndValidity();
      this.postTaskForm
        .get("budget")
        .setValidators([
          Validators.required,
          Validators.pattern(/^-?(0|[1-9]\d*)?$/),
          Validators.min(this.minPrice),
          Validators.max(9999),
        ]);
      this.postTaskForm.patchValue({
        budgetType: {
          Total: "true",
          HourlyRate: "false",
        },
      });
      this.showHourly = false;
    }
  }
}
