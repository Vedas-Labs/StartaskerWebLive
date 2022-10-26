import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-assembly',
  templateUrl: './assembly.component.html',
  styleUrls: ['./assembly.component.css']
})
export class AssemblyComponent implements OnInit {

  constructor(private loginService:LoginService) { }

  ngOnInit() {
  }
  openPostJob(){
    this.loginService.callPostJob.next(true) 
   }
}
