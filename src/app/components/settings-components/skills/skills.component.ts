import { Component, OnInit } from '@angular/core';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material/chips';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { UserServiceService } from 'src/app/services/user-service.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css']
})
export class SkillsComponent implements OnInit {
  skillsForm:FormGroup;
  loading:boolean = false;
  visible = true;
  selectable = true;
  user:any;
  languages:any = [];
  qualifications:any = []
  experiance:any = []
  removable = true;
  addOnBlur = true;
  skillsSettings:any;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  activities:any=[]
  constructor(private fb:FormBuilder,private userService:UserServiceService, private snackBar:MatSnackBar) { }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('user'))
    this.skillsSettings = this.user.Settings[0].skills;
    this.skillsForm = this.fb.group({
      userID:[""],
      trasportations:this.fb.group({
       Bicycle:[false],
       Car:[false],
       Online:[false],
       Scooter:[false],
       Truck:[false],
       Walk:[false],
      }),
      languages:[''],
      education:[""],
      work:[''],
      specialities:[""]
     })
     this.skillsSettings.education.forEach(val=>{
       this.qualifications.push(val)
     })
     this.skillsSettings.languages.forEach(val=>{
       this.languages.push(val)
     })
     this.skillsSettings.specialities.forEach(val=>{
      this.activities.push(val)
    })
    this.skillsSettings.work.forEach(val=>{
      this.experiance.push(val)
    })
    this.skillsForm.patchValue({
      trasportations: {
        Bicycle:this.skillsSettings.trasportations.Bicycle,
       Car:this.skillsSettings.trasportations.Car,
       Online:this.skillsSettings.trasportations.Online,
       Scooter:this.skillsSettings.trasportations.Scooter,
       Truck:this.skillsSettings.trasportations.Truck,
       Walk:this.skillsSettings.trasportations.Walk,
      }
    })
  }
  get userLanguages(){
    return <FormArray>this.skillsForm.get('languages')
  }
  addLanguage(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    // Add our fruit
    if ((value || '').trim()) {
      this.languages.push( value.trim());
    }
    // Reset the input value
    if (input) {
      input.value = '';
    }
  }
  removeLanguage(fruit): void {
    const index = this.languages.indexOf(fruit);
    if (index >= 0) {
      this.languages.splice(index, 1);
    }
  }
   //message alerts showing
 openSnackBar(message: string, action: string) {
  this.snackBar.open(message, action, {
     duration: 3000,
     panelClass:"red-snackbar"
  });
}
  // Activity chips
  submitSkills(){
    this.loading = true;
    let payLoad = {...this.skillsForm.value}
    payLoad.userID = this.user.userID
    payLoad.languages = this.languages
    payLoad.specialities= this.activities
    payLoad.education = this.qualifications
    payLoad.work = this.experiance
    payLoad.trasportations.Bicycle =""+ this.skillsForm.get(['trasportations','Bicycle']).value;
    payLoad.trasportations.Car =""+ this.skillsForm.get(['trasportations','Car']).value;
    payLoad.trasportations.Online =""+ this.skillsForm.get(['trasportations','Online']).value
    payLoad.trasportations.Scooter =""+ this.skillsForm.get(['trasportations','Scooter']).value;
    payLoad.trasportations.Truck =""+ this.skillsForm.get(['trasportations','Truck']).value;
    payLoad.trasportations.Walk =""+ this.skillsForm.get(['trasportations','Walk']).value;

    let token = localStorage.getItem('token')
    this.userService.skillUpdate(payLoad,token).subscribe((posRes)=>{
      this.loading = false;
      if(posRes.response == 3){
        this.openSnackBar(posRes.message,"")
        this.userService.userDetailsUpdated.next(true)
      }else{
        this.openSnackBar(posRes.message,"")
      }
    },(err:HttpErrorResponse)=>{
      this.loading = false;
      if(err.error instanceof Error){
        console.warn("CSE",err.message);
      }else{
        console.warn("SSE",err.message);
        
      }
    })
  }
  addActivity(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    // Add our fruit
    if ((value || '').trim()) {
      this.activities.push( value.trim());
    }
    // Reset the input value
    if (input) {
      input.value = '';
    }
  }
  removeActivity(fruit): void {
    const index = this.activities.indexOf(fruit);

    if (index >= 0) {
      this.activities.splice(index, 1);
    }
  }
//  Educational
addQualification(event: MatChipInputEvent): void {
  const input = event.input;
  const value = event.value;
  // Add our fruit
  if ((value || '').trim()) {
    this.qualifications.push( value.trim());
  }
  // Reset the input value
  if (input) {
    input.value = '';
  }
}
removeQualification(fruit): void {
  const index = this.qualifications.indexOf(fruit);
  if (index >= 0) {
    this.qualifications.splice(index, 1);
  }
}

//  Experiance
addExp(event: MatChipInputEvent): void {
  const input = event.input;
  const value = event.value;
  // Add our fruit
  if ((value || '').trim()) {
    this.experiance.push( value.trim());
  }
  // Reset the input value
  if (input) {
    input.value = '';
  }
}
removeExp(exp): void {
  const index = this.experiance.indexOf(exp);
  if (index >= 0) {
    this.experiance.splice(index, 1);
  }
}
}
