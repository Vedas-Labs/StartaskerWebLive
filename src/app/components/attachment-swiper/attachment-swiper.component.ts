import { Component, OnInit, Inject } from '@angular/core';
import { BrowseJobsComponent } from '../browse-jobs/browse-jobs.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import Swiper from 'swiper'
import { UserServiceService } from 'src/app/services/user-service.service';

@Component({
  selector: 'app-attachment-swiper',
  templateUrl: './attachment-swiper.component.html',
  styleUrls: ['./attachment-swiper.component.css']
})
export class AttachmentSwiperComponent implements OnInit {
imageArray:Array<any> = [];
baseUrl:any;
mySwiper:any = null;
  constructor(private dialogRef: MatDialogRef<BrowseJobsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private userService:UserServiceService) { }

  ngOnInit() {
    this.baseUrl = this.userService.baseUrl;
    console.log(this.data);
    this.data.forEach(val=>{
      if(val.substring(val.lastIndexOf('.')+1) == 'jpg'){
        let obj = {
          path : this.baseUrl+val,
          isImage : true
        }
        this.imageArray.push(obj)
      }else{
        let obj = {
          thumbNail: this.baseUrl+val,
          path : this.baseUrl+val.replace('png','mp4'),
          isImage : false
        }
        this.imageArray.push(obj)
      }
    })
    console.log(this.imageArray);
    this.initiateSwiper()
  }
  initiateSwiper(){
  this.mySwiper = new Swiper('.s2', {
    slidesPerView: 1,
      spaceBetween: 30,
      loop: true,
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
  });
}
}
