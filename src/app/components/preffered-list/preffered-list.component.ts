import { HttpErrorResponse } from "@angular/common/http";
import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from "@angular/material";
import { JobsService } from "src/app/services/jobs.service";
import { LoginService } from "src/app/services/login.service";
import { SetupProfileComponent } from "../setup-profile/setup-profile.component";

@Component({
  selector: "app-preffered-list",
  templateUrl: "./preffered-list.component.html",
  styleUrls: ["./preffered-list.component.css"],
})
export class PrefferedListComponent implements OnInit {
  selectedList: Array<any> = [];
  list: Array<any> = [];
  showCancel: boolean = true;
  constructor(
    private dialogRef: MatDialogRef<SetupProfileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar,
    private loginService: LoginService,
    private jobService: JobsService
  ) {}

  ngOnInit() {
    this.onLoad();
    this.selectedList = [...this.data];
  }
  onLoad() {
    if (
      this.loginService.categoriesList &&
      this.loginService.categoriesList.categoriesList
    ) {
      this.list = this.loginService.categoriesList.categoriesList;
    } else {
      this.getCategories();
    }
    this.list = this.list.map((cat) => {
      cat.selected = false;
      return cat;
    });
    this.data.forEach((val) => {
      let i = -1;
      i = this.list.findIndex((cat) => {
        return val === cat.categoryName;
      });
      if (i != -1) {
        this.list[i].selected = true;
      }
    });
    let user = JSON.parse(localStorage.getItem("user")) || null;

    if (user !== null) {
      if (user && !user.category.length) {
        this.showCancel = false;
      }
    }
  }
  closeTab() {
    this.dialogRef.close();
  }
  //message alerts showing
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: "red-snackbar",
      verticalPosition: "top",
    });
  }
  setAll(event, index) {
    if (event) {
      this.selectedList.push(this.list[index].categoryName);
    } else {
      let i = -1;
      i = this.selectedList.findIndex((cat) => {
        return cat === this.list[index].categoryName;
      });
      if (i != -1) {
        this.selectedList.splice(i, 1);
      }
    }
  }
  getCategories() {
    this.loginService.showLoader.next(true);
    this.jobService.browseCategory().subscribe(
      (res) => {
        this.loginService.showLoader.next(false);
        if (res.response == 3) {
          this.loginService.categoriesList = res;
          this.list = res.categoriesList;
          this.list = this.list.map((cat) => {
            cat.selected = false;
            return cat;
          });
          this.data.forEach((val) => {
            let i = -1;
            i = this.list.findIndex((cat) => {
              return val === cat.categoryName;
            });
            if (i != -1) {
              this.list[i].selected = true;
            }
          });
        } else {
          this.openSnackBar(res.message, "");
        }
      },
      (err: HttpErrorResponse) => {
        this.loginService.showLoader.next(false);
        this.openSnackBar(err.message, "");

        console.log("Error", err);
      }
    );
  }
  submit() {
    if (this.selectedList.length) {
      this.dialogRef.close(this.selectedList);
    } else {
      this.openSnackBar(
        "Please select the preferred tasks, you choosed as a worker",
        ""
      );
    }
  }
}
