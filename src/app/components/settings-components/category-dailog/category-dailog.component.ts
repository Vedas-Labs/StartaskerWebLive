import { Component, OnInit, Inject } from '@angular/core';
import { TaskAlerDialogeComponent } from '../task-aler-dialoge/task-aler-dialoge.component';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-category-dailog',
  templateUrl: './category-dailog.component.html',
  styleUrls: ['./category-dailog.component.css']
})
export class CategoryDailogComponent implements OnInit {
isCategorySelected:boolean = true;
addedCategories:Array<any> = [];
keywords:Array<any> = [];
categories:Array<any> = [];
keywordForm:FormGroup
  constructor(private dialogRef: MatDialogRef<TaskAlerDialogeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private fb:FormBuilder, private snackBar:MatSnackBar) { }

  ngOnInit() {
    console.log("Data",this.data);
    
    this.keywordForm = this.fb.group({
      taskName:[""]
    })
    this.categories = this.data.category
    this.addedCategories = this.data.selected;
    this.keywords = this.data.keywords;
    this.categories.forEach(val=>{
      val.isSelected = false;
    })
    if(this.data.isUpdate){
      this.updateValues()
    }else{
      if(this.addedCategories.length >= 1){
        this.updateValues()
      }
    }
  }
  updateValues(){
this.addedCategories.forEach(val=>{
  let index = -1;
  index = this.categories.findIndex(x=>{
    return x.categoryName == val;
  })
  if(index != -1){
    this.categories[index].isSelected = true;
  }
})
  }
  addToSelected(categoryName){
    let ind = this.categories.findIndex((val)=>{
      return val.categoryName == categoryName});
    let index = this.addedCategories.findIndex((val)=>{
      return val == categoryName});
    if(index < 0){
      this.addedCategories.push(categoryName);
      this.categories[ind].isSelected = true;
      
    }else{
      this.addedCategories.splice(index, 1);
      this.categories[ind].isSelected = false;
    }
  }
  closeTab(){
    this.dialogRef.close(false);
  }
  removeKeyword(index){
    this.keywords.splice(index,1);
  }
         //message alerts showing
 openSnackBar(message: string, action: string) {
  this.snackBar.open(message, action, {
     duration: 3000,
     panelClass:"red-snackbar",
     verticalPosition: 'top'
  });
}
  addKeyword(text){
    if(text != ""){
      let index = this.categories.findIndex(val=>{
        let cat = val.categoryName.toLowerCase();
        return cat == text.toLowerCase();
      })
      if(index < 0){
        this.keywords.push(text);
        this.keywordForm.patchValue({
          taskName:""
        })
      }else{
        alert("MAMA")
        this.openSnackBar("Duplicates are not allowed","")
      }
    }
      }
      addBoth(){
        let data ={
          keywords : this.keywords,
          selected : this.addedCategories
        }
        this.dialogRef.close(data);
      }
}
