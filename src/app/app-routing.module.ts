import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { HowToPostJobComponent } from './components/how-to-post-job/how-to-post-job.component';
import { HowToApplyJobComponent } from './components/how-to-apply-job/how-to-apply-job.component';
import { ReferAFriendComponent } from './components/refer-afriend/refer-afriend.component';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { TermComponent } from './components/term/term.component';
import { ContactUsComponent } from './components/contact-us/contact-us.component';
import { AdminComponent } from './components/admin/admin.component';
import { AssemblyComponent } from './components/assembly/assembly.component';
import { CleaningComponent } from './components/cleaning/cleaning.component';
import { EventComponent } from './components/event/event.component';
import { MovingHelpComponent } from './components/moving-help/moving-help.component';
import { HandymanComponent } from './components/handyman/handyman.component';
import { DesignerComponent } from './components/designer/designer.component';
import { WaiterComponent } from './components/waiter/waiter.component';
import { PhotographyComponent } from './components/photography/photography.component';
import { PostAJobComponent } from './components/post-ajob/post-ajob.component';
import { BrowseJobsComponent } from './components/browse-jobs/browse-jobs.component';
import { MiniTaskComponent } from './components/mini-task/mini-task.component';
import { PostGuideComponent } from './components/post-guide/post-guide.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { ProfileSettingsComponent } from './components/profile-settings/profile-settings.component';
import { JobScheduleComponent } from './components/job-schedule/job-schedule.component';
import { UserBookingsComponent } from './components/user-bookings/user-bookings.component';
import { JobDetailsComponent } from './components/job-details/job-details.component';
import { MyTasksComponent } from './components/my-tasks/my-tasks.component';
import { MyTaskDetailsComponent } from './components/my-task-details/my-task-details.component';
import { SkillsComponent } from './components/settings-components/skills/skills.component';
import { TaskAlertComponent } from './components/settings-components/task-alert/task-alert.component';
import { NotificationsComponent } from './components/settings-components/notifications/notifications.component';
import { RefferEarnComponent } from './components/account-components/reffer-earn/reffer-earn.component';
import { RewardsComponent } from './components/account-components/rewards/rewards.component';
import { ProfilePageComponent } from './components/profile-page/profile-page.component';
import { BookingDetailsComponent } from './components/booking-details/booking-details.component';
import { InboxComponent } from './components/account-components/inbox/inbox.component';
import { AccountVerificationComponent } from './components/account-components/account-verification/account-verification.component';


const routes: Routes = [
  {path:"home",component:HomeComponent},
  {path:"howtopostjob",component:HowToPostJobComponent},
  {path:"howtoapplyjob",component:HowToApplyJobComponent},
  {path:"profile/:id",component:ProfilePageComponent},
  {path:"bookings",component:UserBookingsComponent,children:[
    {path:"booking-job-details/:id",component:BookingDetailsComponent}
  ]},
  {path:"referafriend",component:ReferAFriendComponent},
  {path:"privacy",component:PrivacyComponent},
  {path:"term",component:TermComponent},
  {path:"contactus",component:ContactUsComponent},
  {path:"admin",component:AdminComponent},
  {path:"assembly",component:AssemblyComponent},
  {path:"cleaning",component:CleaningComponent},
  {path:"event",component:EventComponent},
  {path:"movinghelp",component:MovingHelpComponent},
  {path:"handyman",component:HandymanComponent},
  {path:"designer",component:DesignerComponent},
  {path:"waiter",component:WaiterComponent},
  {path:"photography",component:PhotographyComponent},
  {path:"browsejobs",component:BrowseJobsComponent, children:[{
    path:"job/:id",component:JobDetailsComponent
  }]},
  {path:"my-tasks",component:MyTasksComponent,  children:[{
    path:"task/:id",component:MyTaskDetailsComponent
  }]},
  {path:"minitask",component:MiniTaskComponent},
  {path:"postguide",component:PostGuideComponent},
  {path:"my-account",component:UserProfileComponent, children:[
    {path:"profileSetting",component:ProfileSettingsComponent},
    {path:"account_verification",component:AccountVerificationComponent},
    {path:"skills",component:SkillsComponent},
    {path:"notifications",component:NotificationsComponent},
    {path:"inbox",component:InboxComponent},
    {path:"alerts",component:TaskAlertComponent},
    {path:"scheduler",component:JobScheduleComponent},
    {path:"reffer-earn",component:RefferEarnComponent},
    {path:"rewards",component:RewardsComponent},
    {path:"**",redirectTo:"profileSetting",pathMatch:"full"},
    
  ]},

  {path:"",redirectTo:"home",pathMatch:"full" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash:true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
