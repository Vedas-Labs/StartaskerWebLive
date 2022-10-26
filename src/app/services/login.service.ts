import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class LoginService {
  public baseUrl: string = "https://liveapi.startasker.com";
  public userID: string = "";
  showLoader = new BehaviorSubject(false);
  public checkIsLoggedIn = new BehaviorSubject(false);
  public isLoggedIn = new BehaviorSubject(false);
  public callLogin = new BehaviorSubject(false);
  public setUserId = new BehaviorSubject(false);
  public callSignUp = new BehaviorSubject(false);
  public callEhire = new BehaviorSubject(false);
  public callSignOut = new BehaviorSubject(false);
  public callPostJob = new BehaviorSubject(false);
  public callForgotPass: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public gotOtp: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public checkIsImgUpdated: BehaviorSubject<boolean> = new BehaviorSubject(
    false
  );
  //public isLoggedIn:BehaviorSubject<boolean>= new BehaviorSubject(false)
  public isProfileSetPageCompleted: BehaviorSubject<boolean> =
    new BehaviorSubject(false);
  public profilePic: BehaviorSubject<string> = new BehaviorSubject(
    "https://liveapi.startasker.com/user.png"
  );
  public isSocilaLogin: boolean = false;
  // public isManualLogin:boolean = true;
  public isProfieleUpdated: boolean = false;
  public categoriesList: any = {};

  constructor(private http: HttpClient) {}
  getPosition(): Promise<any> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (resp) => {
          resolve({ lng: resp.coords.longitude, lat: resp.coords.latitude });
        },
        (err) => {
          reject(err);
        }
      );
    });
  }
  getLocation(position): Observable<any> {
    return this.http.get(
      "https://maps.googleapis.com/maps/api/geocode/json?latlng=" +
        position.latitude +
        "," +
        position.longitude +
        "&key=AIzaSyC1VLf_KiKNh5LNfbwg_Fcxoto47HZ1Jc8"
    );
  }
  addCategories(data): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/customer/addcategory`, data);
  }
  getCompletedJobsCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/admin/`);
  }
  checkUserAvailability(data): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/customer/userCheckID`, data);
  }
  customerSignup(data): Observable<any> {
    return this.http.post(
      "https://liveapi.startasker.com/api/customer/register",
      data
    );
  }
  getShortLink(data): Observable<any> {
    return this.http.post(
      "https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=AIzaSyB-zhUiDVblOQ57_pIuau2eMnFX5oAR1cQ",
      data
    );
  }
  getRefferalData(data, token): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/customer/fetchReferralUsers_Earnings`,
      data,
      { headers: { startasker: token } }
    );
  }
  login(data): Observable<any> {
    return this.http.post(
      "https://liveapi.startasker.com/api/customer/login",
      data
    );
  }
  logOut(data, token): Observable<any> {
    return this.http.post(
      "https://liveapi.startasker.com/api/customer/signout",
      data,
      { headers: { startasker: token } }
    );
  }
  socialLogin(data): Observable<any> {
    return this.http.post(
      "https://liveapi.startasker.com/api/customer/social_media",
      data
    );
  }
  fetchUserDetails(id): Observable<any> {
    return this.http.post(
      "https://liveapi.startasker.com/api/customer/fetch",
      id
    );
  }
  updatePhoneVerificationStatus(data, token) {
    return this.http.post(
      `${this.baseUrl}/api/customer/updatemobileverify`,
      data,
      { headers: { startasker: token } }
    );
  }
  fetchUserReviews(data, token): Observable<any> {
    return this.http.post(
      "https://liveapi.startasker.com/api/ratings/fetch_reviews",
      data,
      { headers: { startasker: token } }
    );
  }
  verify(data): Observable<any> {
    return this.http.post(
      "https://liveapi.startasker.com/api/customer/verify",
      data
    );
  }
  withdrawAmountApi(data, token): Observable<any> {
    return this.http.post(
      "https://liveapi.startasker.com/api/hire/withDrawReferralAmount",
      data,
      { headers: { startasker: token } }
    );
  }
  setProfile(data, token): Observable<any> {
    return this.http.put("https://liveapi.startasker.com/api/customer/", data, {
      headers: { startasker: token },
    });
  }
  forgotPassword(data): Observable<any> {
    return this.http.post(
      "https://liveapi.startasker.com/api/customer/forgot",
      data
    );
  }
  isThisAccountElegibleToDelete(data): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/customer/DeleteEligiable`, data);
  }
  deleteMyAccount(data, token): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        startasker: token,
      }),
      body: data,
    };
    return this.http.delete(`${this.baseUrl}/api/customer/account`, options);
  }
  resetPassword(data): Observable<any> {
    return this.http.put(
      "https://liveapi.startasker.com/api/customer/reset_password",
      data
    );
  }
  addSkills(data): Observable<any> {
    return this.http.put(
      "https://liveapi.startasker.com/api/customer/settings/skill_updatea",
      data
    );
  }
  public getIPAddress() {
    return this.http.get("http://api.ipify.org/?format=json");
  }
  eHiring(data: any, token: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/hiring/insert`, data, {
      headers: { startasker: token },
    });
  }
}
