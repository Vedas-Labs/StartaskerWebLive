import { Component, OnInit, Inject, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';
import { TaskAlertComponent } from '../task-alert/task-alert.component';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { UserServiceService } from 'src/app/services/user-service.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CategoryDailogComponent } from '../category-dailog/category-dailog.component';
import { JobsService } from 'src/app/services/jobs.service';

@Component({
  selector: 'app-task-aler-dialoge',
  templateUrl: './task-aler-dialoge.component.html',
  styleUrls: ['./task-aler-dialoge.component.css']
})
export class TaskAlerDialogeComponent implements OnInit, AfterViewInit {
  inPerson:boolean = true;
  distance:number = 53;
  customTaskAlertForm:FormGroup;
  isUpdate:boolean = false;
  formatedAddress:any = "";
  category:Array<any>=[];
  addedCategories:Array<any> = [];
  keywords:Array<any> = [];
  bothCategories:Array<any> = [];
  loading:boolean = false;
  isSuggestionsSelected:boolean = false
  categoryValidation:boolean = false;
  errorMsg:string = "Enter all required feilds.."
  loadPage:boolean = false;
  options = {
    componentRestrictions : {
      country : ['MY']
    }
  }
  constructor(private dialogRef: MatDialogRef<TaskAlertComponent>, private dialog:MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,private fb:FormBuilder,private userService:UserServiceService,
    private snackBar:MatSnackBar, private jobsService:JobsService, private cd:ChangeDetectorRef) { }

  ngOnInit() {
    console.log(this.data);
    this.category = this.data.Category;
    this.customTaskAlertForm = this.fb.group({
      "userID":[""],
	"alertType": this.fb.group({
		"inPerson":["true"],
		"remote":["false"]
	}),
  "taskName":[""],
  "taskKeyword":[""],
  taskLoc:["",Validators.required],
	"taskLocation":["",Validators.required],
  "taskDistance":["10"],
  alertID:['']
    })
   this.patchValues() 
  }
  ngAfterViewInit(){
    if(this.inPerson){
      this.customTaskAlertForm.patchValue({
       taskDistance: parseInt(this.data.alertData.taskDistance),
      })
      this.cd.detectChanges()
    }
  }
 patchValues(){
   if(this.data.isUpdate){
     this.isUpdate = true;
     this.inPerson = this.data.alertData.alertType.inPerson;
     if(this.inPerson){
      this.customTaskAlertForm.patchValue({
       taskLocation: this.data.alertData.taskLocation,
       taskDistance: parseInt(this.data.alertData.taskDistance),
       taskLoc : this.data.alertData.taskLoc
      })
      this.cd.detectChanges()
      this.distance = parseInt(this.data.alertData.taskDistance)
      console.log("CHECKING VALUE",this.customTaskAlertForm.value.taskDistance);
      debugger;
      this.formatedAddress = this.data.alertData.taskLocation;
    }
     this.keywords = this.data.alertData.taskKeyword;
       this.addedCategories = this.data.alertData.taskName;
       this.bothCategories = [];
      this.addedCategories.forEach(val=>{
        this.bothCategories.push(val);
      })
      this.keywords.forEach(val=>{
        this.bothCategories.push(val)
      })
     
     let event = {
      value : ""+this.data.alertData.alertType.inPerson
    }
    this.customTaskAlertForm.patchValue({
      userID : this.data.userID,
      alertID: this.data.alertData.alertID,
    })
    this.selectType(event);
   }else{
    this.customTaskAlertForm.patchValue({
      userID : this.data.userID
    })
   }
   
 }
 changeCategory(event){
   let index = -1;
   this.categoryValidation = false;
   index = event.target.selectedIndex - 1
   if(index != -1){
     this.customTaskAlertForm.patchValue({
      taskName : this.category[index].categoryName
     })
     if(this.customTaskAlertForm.get('taskName').valid){
       this.categoryValidation = true;
     }else{
       this.categoryValidation = false;
     }
   }
 }
 
 onBlurMethod(){
  let str = this.customTaskAlertForm.get('taskLocation').value;
  this.formatedAddress = str;
  this.jobsService.getLat(str.replace("\\s+"," ")).subscribe((res)=>{
    console.log("Address",res);
   if(!this.isSuggestionsSelected){
    if(res && res.results.length && res.results[0].geometry && res.results[0].geometry.location){
      let loc =  res.results[0].geometry.location;
      this.customTaskAlertForm.get("taskLoc").setValue([loc.lat,loc.lng])
      console.log("Form Value",this.customTaskAlertForm.value);
    }else{
      this.customTaskAlertForm.get("taskLoc").setValue([null,null])
      this.errorMsg = "Enter valid location details.."
    }
   }else{
     this.isSuggestionsSelected = false;
   }
  },(err:HttpErrorResponse)=>{
    if(err.error instanceof Error){
      console.warn("Client Error",err.message)
    }else{
      console.warn("Server Error",err.message)
    }
  })
}
  handleAddressChange(address){
    this.isSuggestionsSelected = true;
    this.formatedAddress = address.name;
    let lat = address.geometry.location.lat();
    let lang = address.geometry.location.lng();
    this.customTaskAlertForm.get("taskLoc").setValue([lat,lang])
    this.customTaskAlertForm.get("taskLocation").setValue(this.formatedAddress)
  }
  selectType(event){
    if(event.value == "true"){
      this.inPerson = true;
      this.customTaskAlertForm.controls['taskLoc'].setValidators([Validators.required])
      this.customTaskAlertForm.controls['taskLocation'].setValidators([Validators.required])
      this.customTaskAlertForm.patchValue({
        taskDistance: "5",
        alertType:{
          "inPerson":"true",
		        "remote":"false"
        }
      })
    }else{
      this.inPerson = false;
      this.customTaskAlertForm.controls['taskLoc'].clearValidators();
      this.customTaskAlertForm.get("taskLoc").updateValueAndValidity()
      this.customTaskAlertForm.controls['taskLocation'].clearValidators();
      this.customTaskAlertForm.get("taskLocation").updateValueAndValidity()
      this.customTaskAlertForm.patchValue({
        taskLocation: "",
        taskDistance: "",
        taskLoc:[],
        alertType:{
          "inPerson":"false",
		        "remote":"true"
        }
      })
    }
  }
  closeTab(){
    this.dialogRef.close()
  }
     //message alerts showing
 openSnackBar(message: string, action: string) {
  this.snackBar.open(message, action, {
     duration: 3000,
     panelClass:"red-snackbar",
     verticalPosition:'top'
  });
}
  openCategory(){
    let arrayData = {
      category : this.category,
      keywords : this.keywords,
      selected : this.addedCategories,
      isUpdate : this.isUpdate
    }
    let dialog = this.dialog.open(CategoryDailogComponent,{
      panelClass: 'col-md-4',
      hasBackdrop: true,
      disableClose: true,
      data : arrayData
    })
    dialog.afterClosed().subscribe(res=>{
     if(res != false){
      this.keywords = res.keywords;
      this.addedCategories = res.selected;
      this.bothCategories = [];
      this.addedCategories.forEach(val=>{
        this.bothCategories.push(val);
      })
      this.keywords.forEach(val=>{
        this.bothCategories.push(val)
      })
     }
    })
  }
  addKeyword(text){
if(text != ""){
  let index = this.category.findIndex(val=>{
    return val.categoryName == text;
  })
  if(index < 0){
    this.keywords.push(text);
    this.bothCategories.push(text);
    this.customTaskAlertForm.patchValue({
      taskName:""
    })
  }else{
    this.openSnackBar("You can't add predefined alerts","")
  }
}
  }
  addCustomAlerts(){
    if(!this.customTaskAlertForm.valid){
      this.openSnackBar(this.errorMsg,"");
      return;
    }
    debugger;
    if(this.addedCategories.length > 0 || this.keywords.length > 0){
      this.loading = true;
    let token = localStorage.getItem('token')
    let payLoad = {...this.customTaskAlertForm.value}
    payLoad.taskName = this.addedCategories;
    payLoad.taskKeyword = this.keywords;
    delete payLoad.alertID;
    payLoad.taskDistance = ""+this.customTaskAlertForm.value.taskDistance;
    console.log("Value",payLoad);
    this.userService.customTaskAlert(payLoad,token).subscribe((posRes)=>{
      this.loading = false;
      this.dialogRef.close(posRes)
    },(err:HttpErrorResponse)=>{
      this.dialogRef.close()
      this.loading = false;
      if(err.error instanceof Error){
        console.log("CSE",err.message);        
      }else{
        console.log("SSE",err.message);
      }
    })
    }else{
      this.openSnackBar("Add Categories or Keywords","")
    }
  }
  updateCustomAlerts(){
    if(!this.customTaskAlertForm.valid){
      return;
    }
    this.loading = true;
    let token = localStorage.getItem('token')
    let payLoad = {...this.customTaskAlertForm.value}
    payLoad.taskName = this.addedCategories;
    payLoad.taskKeyword = this.keywords;
    payLoad.taskDistance = ""+this.customTaskAlertForm.value.taskDistance;
    console.log("PAYLoad",payLoad);
    
    this.userService.updateCustomTaskAlert(payLoad,token).subscribe((posRes)=>{
      this.loading = false;
      this.dialogRef.close(posRes)
    },(err:HttpErrorResponse)=>{
      this.loading = false;
      this.dialogRef.close()
      if(err.error instanceof Error){
        console.log("CSE",err.message);        
      }else{
        console.log("SSE",err.message);
      }
    })
  }
}
