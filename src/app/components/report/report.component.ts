import { Component, OnInit, Inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { JobDetailsComponent } from "../job-details/job-details.component";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { JobsService } from "src/app/services/jobs.service";
import { HttpErrorResponse } from "@angular/common/http";
import { LoginService } from "src/app/services/login.service";

@Component({
  selector: "app-report",
  templateUrl: "./report.component.html",
  styleUrls: ["./report.component.css"],
})
export class ReportComponent implements OnInit {
  reportForm: FormGroup;
  loading: boolean = false;
  shortLink: string = "https://www.startasker.com/#/browsejobs";
  types: Array<any> = [
    "Spam",
    "Rude or Offensive",
    "Breach of marketplace rules",
    "Other",
  ];
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<JobDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private jobService: JobsService,
    private loginService: LoginService
  ) {}

  ngOnInit() {
    console.log("Report Data", this.data);
    this.reportForm = this.fb.group({
      type: ["Spam", Validators.required],
      message: ["", Validators.required],
      userID: [""],
    });
    this.getShortLink();
  }
  setType(type) {
    this.reportForm.patchValue({
      type: type,
    });
  }
  getShortLink(): any {
    this.loginService.showLoader.next(true);
    let { postID } = this.data;
    let obj = {
      dynamicLinkInfo: {
        domainUriPrefix: "https://startasker.page.link",
        link: `https://www.startasker.com/#/browsejobs/job/${postID}`,
        androidInfo: {
          androidPackageName: "com.star.startasker",
        },
        iosInfo: {
          iosBundleId: "com.startasker.StarTasker",
        },
        socialMetaTagInfo: {
          socialTitle: "Report",
          socialDescription: `Report placed on this task`,
          socialImageLink:
            "https://www.startasker.com/assets/startasker-new-logo.png",
        },
      },
    };

    this.loginService.getShortLink(obj).subscribe(
      (posRes) => {
        this.loginService.showLoader.next(false);
        this.shortLink = posRes.shortLink;
      },
      (err: HttpErrorResponse) => {
        this.loginService.showLoader.next(false);
        console.log(err);
      }
    );
  }
  submitReport() {
    let user = JSON.parse(localStorage.getItem("user"));
    this.reportForm.patchValue({
      userID: user.userID,
    });
    let payLoad = { ...this.reportForm.value };
    payLoad.message = `Post Task Link : ${this.shortLink} \n PostID : ${this.data.postID} \n User Name: ${user.firstName} \n Category Type: ${payLoad.type} \n User Comments: ${payLoad.message}`;
    this.jobService.reportTask(payLoad).subscribe(
      (posRes) => {
        this.dialogRef.close(posRes);
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          console.log("CSE", err.message);
          this.dialogRef.close();
        } else {
          console.log("SSE", err.message);
          this.dialogRef.close();
        }
      }
    );
  }
  closeTab() {
    this.dialogRef.close();
  }
}
