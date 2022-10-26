import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { DigitalHiringComponent } from "../digital-hiring/digital-hiring.component";

@Component({
  selector: "app-add-ehire-category",
  templateUrl: "./add-ehire-category.component.html",
  styleUrls: ["./add-ehire-category.component.css"],
})
export class AddEhireCategoryComponent implements OnInit {
  addCatForm: FormGroup;
  constructor(
    private dialogRef: MatDialogRef<DigitalHiringComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.addCatForm = this.fb.group({
      categoryName: ["", Validators.required],
      Experience: ["", [Validators.required, Validators.min(1)]],
      isSelected: [true],
    });
  }
  submitDetails() {
    if (!this.addCatForm.valid) {
      return;
    }
    this.dialogRef.close(this.addCatForm.value);
  }
  close() {
    this.dialogRef.close();
  }
}
