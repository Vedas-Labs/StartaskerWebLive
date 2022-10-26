import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import {
  MatToolbarModule,
  MatIconModule,
  MatButtonModule,
  MatCardModule,
  MatTabsModule,
  MatFormFieldModule,
  MatInputModule,
  MatDialogModule,
  MatRadioModule,
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatCheckboxModule,
  MatSnackBarModule,
  MatChipsModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatSidenavModule,
  MatListModule,
  MatButtonToggleModule,
  MatSelectModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatMenuModule,
  MatRippleModule,
  MatStepperModule,
  MatBottomSheetModule,
  MatBadgeModule,
} from "@angular/material";
import { HeaderComponent } from "./components/header/header.component";
import { HomeComponent } from "./components/home/home.component";
import {
  SocialLoginModule,
  AuthServiceConfig,
  FacebookLoginProvider,
  LoginOpt,
  GoogleLoginProvider,
} from "angularx-social-login";
import { CalendarModule, DateAdapter } from "angular-calendar";
import { adapterFactory } from "angular-calendar/date-adapters/date-fns";
import { NgxMaterialTimepickerModule } from "ngx-material-timepicker";
import { GooglePlaceModule } from "ngx-google-places-autocomplete";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { FooterComponent } from "./components/footer/footer.component";
import { HowToPostJobComponent } from "./components/how-to-post-job/how-to-post-job.component";
import { HowToApplyJobComponent } from "./components/how-to-apply-job/how-to-apply-job.component";
import { ReferAFriendComponent } from "./components/refer-afriend/refer-afriend.component";
import { PrivacyComponent } from "./components/privacy/privacy.component";
import { TermComponent } from "./components/term/term.component";
import { ContactUsComponent } from "./components/contact-us/contact-us.component";
import { AdminComponent } from "./components/admin/admin.component";
import { AssemblyComponent } from "./components/assembly/assembly.component";
import { CleaningComponent } from "./components/cleaning/cleaning.component";
import { EventComponent } from "./components/event/event.component";
import { MovingHelpComponent } from "./components/moving-help/moving-help.component";
import { HandymanComponent } from "./components/handyman/handyman.component";
import { DesignerComponent } from "./components/designer/designer.component";
import { WaiterComponent } from "./components/waiter/waiter.component";
import { PhotographyComponent } from "./components/photography/photography.component";
import { PostAJobComponent } from "./components/post-ajob/post-ajob.component";
import { BrowseJobsComponent } from "./components/browse-jobs/browse-jobs.component";
import { MiniTaskComponent } from "./components/mini-task/mini-task.component";
import { PostGuideComponent } from "./components/post-guide/post-guide.component";
import { SignUpComponent } from "./components/sign-up/sign-up.component";
import { LoginComponent } from "./components/login/login.component";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { UserProfileComponent } from "./components/user-profile/user-profile.component";
import { ProfileSettingsComponent } from "./components/profile-settings/profile-settings.component";
import { JobScheduleComponent } from "./components/job-schedule/job-schedule.component";
import { UserBookingsComponent } from "./components/user-bookings/user-bookings.component";
import { ForgotpasswordComponent } from "./components/forgotpassword/forgotpassword.component";
import { SetPasswordComponent } from "./components/set-password/set-password.component";
import { SetupProfileComponent } from "./components/setup-profile/setup-profile.component";
import { AccountAlertDialogComponent } from "./components/account-alert-dialog/account-alert-dialog.component";
import { JobDetailsComponent } from "./components/job-details/job-details.component";
import { SignOutComponent } from "./components/sign-out/sign-out.component";
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { MyTasksComponent } from "./components/my-tasks/my-tasks.component";
import { DateAgoPipe } from "./pipes/date-ago.pipe";
import { MyTaskDetailsComponent } from "./components/my-task-details/my-task-details.component";
import { PaymentDialogComponent } from "./components/payment-dialog/payment-dialog.component";
import { MakeAnOfferComponent } from "./components/make-an-offer/make-an-offer.component";
import { NgOtpInputModule } from "ng-otp-input";
import { Ng5SliderModule } from "ng5-slider";
import { ReplyDialogComponent } from "./components/reply-dialog/reply-dialog.component";
import { OutSideClickDirective } from "./directive/outsideclick.directive";
import { ReportComponent } from "./components/report/report.component";
import { CancelComponent } from "./components/cancel/cancel.component";
import { AttachmentSwiperComponent } from "./components/attachment-swiper/attachment-swiper.component";
import { SkillsComponent } from "./components/settings-components/skills/skills.component";
import { TaskAlertComponent } from "./components/settings-components/task-alert/task-alert.component";
import { TaskAlerDialogeComponent } from "./components/settings-components/task-aler-dialoge/task-aler-dialoge.component";
import { NotificationsComponent } from "./components/settings-components/notifications/notifications.component";
import { ChangePasswordComponent } from "./components/settings-components/change-password/change-password.component";
import { AddBankDetailsComponent } from "./components/settings-components/add-bank-details/add-bank-details.component";
import { RefferEarnComponent } from "./components/account-components/reffer-earn/reffer-earn.component";
import { EditRefferalComponent } from "./components/account-components/edit-refferal/edit-refferal.component";
import { RewardsComponent } from "./components/account-components/rewards/rewards.component";
import { RewardsDailogComponent } from "./components/account-components/rewards-dailog/rewards-dailog.component";
import { ProfilePageComponent } from "./components/profile-page/profile-page.component";
import { BookingDetailsComponent } from "./components/booking-details/booking-details.component";
import { WithdrawComponent } from "./components/withdraw/withdraw.component";
import { GiveRatingsComponent } from "./components/give-ratings/give-ratings.component";
import { CompleteTaskDialogComponent } from "./components/complete-task-dialog/complete-task-dialog.component";
import { InboxComponent } from "./components/account-components/inbox/inbox.component";
import { InboxMessagesComponent } from "./components/account-components/inbox-messages/inbox-messages.component";
import { EmergencyContactsComponent } from "./components/account-components/emergency-contacts/emergency-contacts.component";

import { AngularFireMessagingModule } from "@angular/fire/messaging";
import { AngularFireDatabaseModule } from "@angular/fire/database";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFireModule } from "@angular/fire";
import { PushMessagingService } from "./services/push-messaging.service";
import { environment } from "../environments/environment";
import { AsyncPipe } from "../../node_modules/@angular/common";
import { DeleteDialogComponent } from "./components/delete-dialog/delete-dialog.component";
import { Ng2TelInputModule } from "ng2-tel-input";
import { UpdatePhoneComponent } from "./components/settings-components/update-phone/update-phone.component";
import { AccountVerificationComponent } from "./components/account-components/account-verification/account-verification.component";
import { CategoryDailogComponent } from "./components/settings-components/category-dailog/category-dailog.component";
import { CouponComponent } from "./components/coupon/coupon.component";
import { AccountVerifyStatusComponent } from "./components/account-components/account-verify-status/account-verify-status.component";
import { WelcomeGiftComponent } from "./components/welcome-gift/welcome-gift.component";
import { PaymentStatusComponent } from "./components/payment-dialog/payment-status/payment-status.component";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { PrefferedListComponent } from "./components/preffered-list/preffered-list.component";
import { DigitalHiringComponent } from "./components/digital-hiring/digital-hiring.component";
import { AddEhireCategoryComponent } from "./components/add-ehire-category/add-ehire-category.component";

const fbLoginOptions: LoginOpt = {
  scope: "email",
  return_scopes: true,
  enable_profile_selector: true,
}; // https://developers.facebook.com/docs/reference/javascript/FB.login/v2.11

const googleLoginOptions: LoginOpt = {
  scope: "profile email",
}; // https://developers.google.com/api-client-library/javascript/reference/referencedocs#gapiauth2clientconfig

const config = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider(
      "10724526113-4ocv4el4juj3pd8kf8rl41ud93dh5sgc.apps.googleusercontent.com",
      googleLoginOptions
    ),
  },
  {
    id: FacebookLoginProvider.PROVIDER_ID,
    provider: new FacebookLoginProvider("727949867932788"),
  },
]);
// StarTasker Original : 276863492699306, surge:134696661302325
//FaceBook my account Old : 1226666277672315
// google Old : 976958853544-e49r1ecbr3v9njnecoja3kpk9hqqkhr9.apps.googleusercontent.com
// tester.startaskerGoogleId: 1054236659162-q5guii968dc6tmf7j3t15npsa72hoh2m.apps.googleusercontent.com

export function provideConfig() {
  return config;
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    FooterComponent,
    OutSideClickDirective,
    HowToPostJobComponent,
    HowToApplyJobComponent,
    ReferAFriendComponent,
    PrivacyComponent,
    TermComponent,
    ContactUsComponent,
    AdminComponent,
    AssemblyComponent,
    CleaningComponent,
    EventComponent,
    MovingHelpComponent,
    HandymanComponent,
    DesignerComponent,
    WaiterComponent,
    PhotographyComponent,
    PostAJobComponent,
    BrowseJobsComponent,
    MiniTaskComponent,
    PostGuideComponent,
    SignUpComponent,
    LoginComponent,
    UserProfileComponent,
    ProfileSettingsComponent,
    JobScheduleComponent,
    UserBookingsComponent,
    ForgotpasswordComponent,
    SetPasswordComponent,
    SetupProfileComponent,
    AccountAlertDialogComponent,
    JobDetailsComponent,
    SignOutComponent,
    SidebarComponent,
    MyTasksComponent,
    DateAgoPipe,
    MyTaskDetailsComponent,
    PaymentDialogComponent,
    MakeAnOfferComponent,
    ReplyDialogComponent,
    ReportComponent,
    CancelComponent,
    AttachmentSwiperComponent,
    SkillsComponent,
    TaskAlertComponent,
    TaskAlerDialogeComponent,
    NotificationsComponent,
    ChangePasswordComponent,
    AddBankDetailsComponent,
    RefferEarnComponent,
    EditRefferalComponent,
    RewardsComponent,
    RewardsDailogComponent,
    ProfilePageComponent,
    BookingDetailsComponent,
    WithdrawComponent,
    GiveRatingsComponent,
    CompleteTaskDialogComponent,
    InboxComponent,
    InboxMessagesComponent,
    EmergencyContactsComponent,
    DeleteDialogComponent,
    UpdatePhoneComponent,
    AccountVerificationComponent,
    CategoryDailogComponent,
    CouponComponent,
    AccountVerifyStatusComponent,
    WelcomeGiftComponent,
    PaymentStatusComponent,
    PrefferedListComponent,
    DigitalHiringComponent,
    AddEhireCategoryComponent,
  ],
  entryComponents: [
    LoginComponent,
    SignUpComponent,
    ForgotpasswordComponent,
    SetPasswordComponent,
    SetupProfileComponent,
    AccountAlertDialogComponent,
    PostAJobComponent,
    SignOutComponent,
    PaymentDialogComponent,
    MakeAnOfferComponent,
    ReplyDialogComponent,
    ReportComponent,
    CancelComponent,
    AttachmentSwiperComponent,
    TaskAlerDialogeComponent,
    PaymentStatusComponent,
    ChangePasswordComponent,
    AddBankDetailsComponent,
    EditRefferalComponent,
    RewardsDailogComponent,
    WithdrawComponent,
    GiveRatingsComponent,
    CompleteTaskDialogComponent,
    InboxMessagesComponent,
    WelcomeGiftComponent,
    EmergencyContactsComponent,
    DeleteDialogComponent,
    UpdatePhoneComponent,
    CategoryDailogComponent,
    CouponComponent,
    AccountVerifyStatusComponent,
    SidebarComponent,
    PrefferedListComponent,
    DigitalHiringComponent,
    AddEhireCategoryComponent,
    ContactUsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatSelectModule,
    ReactiveFormsModule,
    NgOtpInputModule,
    HttpClientModule,
    MatMenuModule,
    FormsModule,
    MatIconModule,
    ScrollingModule,
    MatStepperModule,
    MatButtonModule,
    MatCheckboxModule,
    MatBottomSheetModule,
    MatSlideToggleModule,
    MatBadgeModule,
    NgbModule,
    MatListModule,
    MatCardModule,
    MatSliderModule,
    MatRadioModule,
    MatPaginatorModule,
    MatButtonToggleModule,
    MatTableModule,
    MatSidenavModule,
    MatSortModule,
    Ng5SliderModule,
    MatDialogModule,
    MatChipsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRippleModule,
    MatInputModule,
    SocialLoginModule,
    GooglePlaceModule,
    MatSnackBarModule,
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AngularFireMessagingModule,
    Ng2TelInputModule,
    AngularFireModule.initializeApp(environment.firebase),
    NgxMaterialTimepickerModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
  ],
  providers: [
    {
      provide: AuthServiceConfig,
      useFactory: provideConfig,
    },
    PushMessagingService,
    AsyncPipe,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
