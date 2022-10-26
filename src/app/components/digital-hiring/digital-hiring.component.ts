import { HttpErrorResponse } from "@angular/common/http";
import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MatSnackBar,
  MAT_DIALOG_DATA,
} from "@angular/material";
import { LoginService } from "src/app/services/login.service";
import { AddEhireCategoryComponent } from "../add-ehire-category/add-ehire-category.component";
import { HeaderComponent } from "../header/header.component";

@Component({
  selector: "app-digital-hiring",
  templateUrl: "./digital-hiring.component.html",
  styleUrls: ["./digital-hiring.component.css"],
})
export class DigitalHiringComponent implements OnInit {
  index: number = 0;
  checkValue: boolean = false;
  loading: boolean = false;
  isMalaysian: boolean = true;
  mediaName: string = "facebook";
  vehicleName: string = "car";
  hasOwnTools: boolean = true;
  categories: Array<any> = [];
  isOtherMedia: boolean = false;
  isOtherVehicle: boolean = false;
  otherMediaName: string = "";
  otherVehicleName: string = "";
  vehicleArray: Array<any> = [
    { name: "Car", isSelected: false, payLoadName: "car" },
    { name: "Motor", isSelected: false, payLoadName: "motor" },
    {
      name: "Public Transport",
      isSelected: false,
      payLoadName: "publicTransport",
    },
    { name: "Other", isSelected: false, payLoadName: "other" },
  ];
  mobileForm: FormGroup;
  constructor(
    private dialogRef: MatDialogRef<HeaderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private loginService: LoginService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.mobileForm = this.fb.group({
      mobileNumber: ["", [Validators.required, Validators.pattern("^[0-9]*$")]],
    });
    if (
      this.loginService.categoriesList &&
      this.loginService.categoriesList.categoriesList
    ) {
      this.categories = this.loginService.categoriesList.categoriesList
        .map((val) => {
          delete val.categoryId;
          delete val.image;
          return val;
        })
        .map((cat) => {
          cat.isSelected = false;
          cat.Experience = 1;
          return cat;
        });
    }
  }
  agreeTerms() {
    if (this.checkValue) {
      this.index += 1;
    }
  }
  setIsMalaysian(val) {
    this.isMalaysian = val;
  }
  setMediaName(name) {
    if (name === "others") {
      this.isOtherMedia = true;
      this.mediaName = name;
    } else {
      this.isOtherMedia = false;
      this.mediaName = name;
    }
  }
  setVehicleName(index) {
    if (index == 3) {
      this.isOtherVehicle = !this.isOtherVehicle;
    }
    this.vehicleArray[index].isSelected = !this.vehicleArray[index].isSelected;
  }
  prev() {
    this.index -= 1;
  }
  //message alerts showing
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: "red-snackbar",
    });
  }
  next() {
    if (this.index === 6) {
      let selectedCount = this.categories.filter((val) => {
        return val.isSelected;
      });

      if (selectedCount.length) {
        let zeroExpCount = selectedCount.filter((val) => {
          return !val.Experience;
        });
        if (zeroExpCount.length) {
          this.openSnackBar("Experiance should be minimum 1 year", "");
        } else {
          this.index += 1;
        }
      } else {
        this.openSnackBar("Select atleast one Category", "");
      }
    } else if (this.index === 4) {
      let selectedCount = this.vehicleArray.filter((val) => {
        return val.isSelected;
      });
      if (this.isOtherVehicle) {
        if (!this.otherVehicleName) {
          this.openSnackBar("Enter the other vehicle name you have..", "");
          return;
        }
      }
      if (selectedCount.length) {
        this.index += 1;
      } else {
        this.openSnackBar("Select atleast one Transport Option", "");
      }
    } else if (this.index == 3) {
      if (this.isOtherMedia) {
        if (this.otherMediaName) {
          this.index += 1;
        } else {
          this.openSnackBar("Enter Other Social Media Name", "");
        }
      } else {
        this.index += 1;
      }
    } else {
      this.index += 1;
    }
  }
  close() {
    this.dialogRef.close();
  }
  selectItem(index) {
    this.categories[index].isSelected = !this.categories[index].isSelected;
  }
  addNewCat() {
    let dailogRef = this.dialog.open(AddEhireCategoryComponent, {
      panelClass: "col-md-3",
      hasBackdrop: true,
      disableClose: true,
    });
    dailogRef.afterClosed().subscribe((val) => {
      if (val) {
        this.categories.push(val);
      }
    });
  }
  completeHiring() {
    let filteredCat = this.categories
      .filter((val) => {
        return val.isSelected;
      })
      .map((cat) => {
        delete cat.isSelected;
        cat.Experience = "" + cat.Experience;
        return cat;
      });
    let vehicles = this.vehicleArray
      .filter((val) => {
        return val.isSelected;
      })
      .map((vehicle) => {
        if (vehicle.payLoadName == "other") {
          return this.otherVehicleName;
        }
        return vehicle.payLoadName;
      });
    let contact = this.mobileForm.get("mobileNumber").value;
    let payLoad = {
      AreYouMalaysian: this.isMalaysian,
      WheredidyouKnowStartasker: this.isOtherMedia
        ? this.otherMediaName
        : this.mediaName,
      WhatTransporationyouhave: vehicles,
      Doyouprovideyourowntools: this.hasOwnTools,
      Whatexperienceyouhave: filteredCat,
      ContactNumber: this.data.phoneNumber,
      Name: this.data.firstName,
      Email: this.data.userID,
      EmergencyContact: contact ? contact.toString() : "",
    };
    let token = localStorage.getItem("token");
    this.loading = true;
    this.loginService.eHiring(payLoad, token).subscribe(
      (res) => {
        this.loading = false;
        this.openSnackBar(res.message, "");
        this.index += 1;
      },
      (err: HttpErrorResponse) => {
        this.loading = false;
        this.openSnackBar(err.message, "");
      }
    );
  }
}
