import { Component, OnInit, Inject } from '@angular/core';
import { UserServiceService } from 'src/app/services/user-service.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserProfileComponent } from '../../user-profile/user-profile.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-emergency-contacts',
  templateUrl: './emergency-contacts.component.html',
  styleUrls: ['./emergency-contacts.component.css']
})
export class EmergencyContactsComponent implements OnInit {
emergencyContacts:Array<any> = [];
isContactsShowing:boolean = true;
emergencyContactsForm:FormGroup;
isAddContact:boolean = true;
countryCode = {initialCountry: ''}
id:string = "";
loading:boolean = false;
  constructor(private userService:UserServiceService,private fb:FormBuilder, private dailogRef:MatDialogRef<UserProfileComponent>,
    @Inject(MAT_DIALOG_DATA) public data:any, private loginService:LoginService) { }

  ngOnInit() {
    this.countryCode.initialCountry = 'my'
    this.callForm()
    this.fetchContacts()
  }
  callForm(){
    this.emergencyContactsForm= this.fb.group({
      userID:[""],
      NameoftheContactPerson:["",Validators.required],
      contact: this.fb.group({
        phoneNumber:["",[Validators.required,Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
        countryCode:["MY",]
      })
    })
  }
  closeTab(){
    this.dailogRef.close()
  }
  deleteContact(id,i){
    let obj = {
      _id : id
    }
    let token = localStorage.getItem('token')
    this.userService.deleteEmergencyContacts(obj,token).subscribe((posRes)=>{
      if(posRes.response == 3){
       this.emergencyContacts.splice(i,1)
      }
    },(err:HttpErrorResponse)=>{
      if(err.error instanceof Error){
        console.warn("CSE",err.message);
      }else{
        console.warn("ServerSideError",err.message);
      }
    })
  }
  editNumber(contact){
    this.isContactsShowing = false;
    this.isAddContact = false;
    this.id = contact._id;
    this.emergencyContactsForm.patchValue({
      NameoftheContactPerson: contact.NameoftheContactPerson,
      contact:{
        phoneNumber : parseFloat(contact.contact.phoneNumber),
        countryCode : contact.contact.countryCode
      }
    })
    this.countryCode.initialCountry = contact.contact.countryCode.toLowerCase()
  }
  fetchContacts(){
    this.loading = true;
    this.loginService.showLoader.next(true)
    let obj = {userID : this.data.userID};
    let token = localStorage.getItem('token')
    this.userService.fetchEmergencyContacts(obj,token).subscribe((posRes)=>{
      this.loading = false;
      if(posRes.response == 3){
        this.emergencyContacts = posRes.contacts;
        this.loginService.showLoader.next(false);
      }else{
        this.loginService.showLoader.next(false);
        alert(posRes.message);
      }
    },(err:HttpErrorResponse)=>{
      this.loginService.showLoader.next(false);
      this.loading = false;
      alert("Server Failure please try after some time")
      if(err.error instanceof Error){
        console.warn("CSE",err.message);
      }else{
        console.warn("ServerSideError",err.message);
      }
    })
  }
  sendContactNumbers(){
    if(this.isAddContact){
      this.emergencyContactsForm.get('userID').setValue(this.data.userID);
      this.submitContacts()
    }else{
      let payLoad = {...this.emergencyContactsForm.value}
      delete payLoad.userID
       payLoad._id = this.id;
       payLoad.contact.phoneNumber =""+payLoad.contact.phoneNumber
       this.submitEditedContacts(payLoad)
    }
  }
  submitEditedContacts(payLoad){
    this.loginService.showLoader.next(true);
    let token = localStorage.getItem('token')
    this.userService.editEmergencyContacts(payLoad,token).subscribe((posRes)=>{
      this.loginService.showLoader.next(false);
      if(posRes.response == 3){
        this.fetchContacts()
        this.isContactsShowing = true;
      }else{
        alert(posRes.message)
      }
    },(err:HttpErrorResponse)=>{
      this.loginService.showLoader.next(false);
      if(err.error instanceof Error){
        console.warn("CSE",err.message);
      }else{
        console.warn("ServerSideError",err.message);
      }
    })
  }
  onCountryChange(event){
    let code = event.iso2
    console.log(code.toUpperCase());
    
    this.emergencyContactsForm.patchValue({
      contact:{
       countryCode : code.toUpperCase()
      }
    })
  }
  submitContacts(){
    if(this.emergencyContactsForm.valid){
      let token = localStorage.getItem('token');
      this.userService.addEmergencyContacts(this.emergencyContactsForm.value,token).subscribe((posRes)=>{
        if(posRes.response == 3){
          this.fetchContacts()
          this.isContactsShowing = true;
         this.callForm()
        }
      },(err:HttpErrorResponse)=>{
        if(err.error instanceof Error){
          console.warn("CSE",err.message);
        }else{
          console.warn("ServerSideError",err.message);
        }
      })
    }
  }
}
