import { Component, OnInit, Inject } from "@angular/core";
import { UserServiceService } from "src/app/services/user-service.service";
import { BookingDetailsComponent } from "../booking-details/booking-details.component";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { HttpErrorResponse } from "@angular/common/http";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { LoginService } from "src/app/services/login.service";

@Component({
  selector: "app-give-ratings",
  templateUrl: "./give-ratings.component.html",
  styleUrls: ["./give-ratings.component.css"],
})
export class GiveRatingsComponent implements OnInit {
  rating: number = 1;
  image: string = "";
  ratingsForm: FormGroup;
  constructor(
    private dialogRef: MatDialogRef<BookingDetailsComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserServiceService,
    private loginService: LoginService
  ) {}

  ngOnInit() {
    this.ratingsForm = this.fb.group({
      message: [""],
    });
    console.log(this.data);
    this.image = "https://liveapi.startasker.com/user.png";
  }
  submitRating() {
    this.loginService.showLoader.next(true);
    let endUrl = "";
    this.data.body = this.ratingsForm.value.message;
    let token = localStorage.getItem("token");
    let payLoad = { ...this.data };
    delete payLoad.iamPoster;
    if (this.data.iamPoster) {
      endUrl = "toProvider";
      payLoad.ratingsAsAProvider = this.rating.toFixed(1);
    } else {
      endUrl = "toPoster";
      payLoad.ratingsAsAPoster = this.rating.toFixed(1);
    }
    console.log("Payload", payLoad);
    this.userService.giveRatings(payLoad, token, endUrl).subscribe(
      (posRes) => {
        this.dialogRef.close(posRes);
        this.loginService.showLoader.next(false);
      },
      (err: HttpErrorResponse) => {
        this.loginService.showLoader.next(false);
        this.dialogRef.close();
        if (err.error instanceof Error) {
          console.warn("CSE", err.message);
        } else {
          console.warn("SSE", err.message);
        }
      }
    );
  }
  closeTab() {
    this.dialogRef.close();
  }
}
