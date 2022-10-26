import { Component, OnInit, Inject } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { JobDetailsComponent } from "../job-details/job-details.component";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { JobsService } from "src/app/services/jobs.service";
import { HttpErrorResponse } from "@angular/common/http";
import { LoginService } from "src/app/services/login.service";

@Component({
  selector: "app-reply-dialog",
  templateUrl: "./reply-dialog.component.html",
  styleUrls: ["./reply-dialog.component.css"],
})
export class ReplyDialogComponent implements OnInit {
  headings: string = "Reply";
  offers: any = [];
  image: string;
  replyForm: FormGroup;
  baseUrl: any = "";
  user: any;
  isWordThere: boolean = false;
  restrictedKeys: Array<string> = [
    "emailid",
    "email",
    "contact me",
    "mail",
    "mailid",
    "whatsapp",
    "gmailid",
    "gmail",
    " my no",
    "contact no",
    "contact number",
    "site",
    "website",
    "link",
    "address",
    "my location",
    "number",
    "id",
    "phone",
    "phone number",
    "fb",
    "facebook",
    "fb id",
    "+60",
    "60",
    "contact details",
    "phone details",
    "weblink",
    "web site",
    "Instagram",
  ];
  websiteKeys: Array<string> = [
    "https",
    ".in",
    ".org",
    ".edu",
    ".mil",
    ".net",
    ".io",
    ".gov",
    "http",
    "@gmail.com",
    ".com",
  ];
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<JobDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private jobService: JobsService,
    private loginService: LoginService
  ) {}

  ngOnInit() {
    console.log("replylog", this.data);
    this.user = JSON.parse(localStorage.getItem("user"));
    console.log("user", this.user);

    this.baseUrl = this.loginService.baseUrl;
    this.offers = this.data.authorMessages;
    this.image = "https://liveapi.startasker.com/user.png";
    this.replyForm = this.fb.group({
      postID: [""],
      offeredUserID: [""],
      userID: [""],
      message: [""],
      profilePic: [""],
      name: [""],
    });
  }
  closeTab() {
    this.dialogRef.close();
  }
  sendReply() {
    this.isWordThere = false;
    let patt = new RegExp(/^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/);
    if (patt.test(this.replyForm.value.message)) {
      this.isWordThere = true;
      return;
    }
    let strArray = this.replyForm.value.message.split(" ");
    strArray.forEach((element, index: number) => {
      let matchPattern = element.match(/\d+/g);
      if (matchPattern != null) {
        var withNoDigits = "";
        withNoDigits = element.replace(/[0-9]/g, "");

        var numb = element.match(/\d/g);
        numb = numb.join("");
        let word = withNoDigits.toLocaleLowerCase();
        if (
          word == "rm" ||
          word == "am" ||
          word == "pm" ||
          word == "year" ||
          word == "years" ||
          word == "hour" ||
          word == "hours"
        ) {
          this.isWordThere = false;
        } else {
          if (word === "") {
            let nextWord = strArray[index + 1];
            let str = ["hours", "hour", "am", "pm", "year", "years"];
            if (!str.includes(nextWord)) {
              this.isWordThere = true;
              return;
            }
          }
        }
        if (numb.length > 5) {
          this.isWordThere = true;
          return;
        }
        // if (element.substring(0, 2).toLowerCase() == "rm") {
        //   let num = element.substring(2);
        //   if (!isNaN(+num)) {
        //     if (num.length > 5) {
        //       this.isWordThere = true;
        //       return;
        //     }
        //   } else {
        //     this.isWordThere = true;
        //     return;
        //   }
        // } else {
        //   this.isWordThere = true;
        //   return;
        // }
      }
    });
    strArray.forEach((key) => {
      this.restrictedKeys.forEach((wordKey) => {
        if (key == wordKey) {
          this.isWordThere = true;
          return;
        }
      });
    });
    if (this.isWordThere) {
      return;
    }
    this.websiteKeys.forEach((wordKey) => {
      if (this.replyForm.value.message.indexOf(wordKey) > -1) {
        this.isWordThere = true;
        return;
      }
    });

    if (this.isWordThere) {
      return;
    }
    this.loginService.showLoader.next(true);

    this.replyForm.patchValue({
      offeredUserID: this.data.offeredUserID,
      userID: this.data.userID,
      postID: this.data.postID,
      profilePic: this.user.profilePic,
      name: this.user.firstName,
    });
    let token = localStorage.getItem("token");
    this.jobService.replyToUser(this.replyForm.value, token).subscribe(
      (posRes) => {
        this.loginService.showLoader.next(false);
        this.dialogRef.close(posRes);
      },
      (err: HttpErrorResponse) => {
        this.loginService.showLoader.next(false);
        if (err.error instanceof Error) {
          console.log("CSE", err.message);
        } else {
          console.log("SSE", err.message);
        }
      }
    );
  }
}
