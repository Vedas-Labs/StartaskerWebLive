import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class UserServiceService {
  user: any = undefined;
  public userDetailsUpdated: BehaviorSubject<boolean> = new BehaviorSubject(
    false
  );
  public isFetchUser: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public isTasker: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public openVerifyPhone: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public isBookingDeleted: BehaviorSubject<boolean> = new BehaviorSubject(
    false
  );

  public baseUrl: string = "https://liveapi.startasker.com/";
  constructor(private http: HttpClient) {}

  skillUpdate(data, token): Observable<any> {
    return this.http.put(
      "https://liveapi.startasker.com/api/customer/settings/skill_update",
      data,
      { headers: { startasker: token } }
    );
  }
  accountVerifyfetch(data, token): Observable<any> {
    return this.http.post(this.baseUrl + "api/AccountVerify/get", data, {
      headers: { startasker: token },
    });
  }
  updateUserInfo(data, token): Observable<any> {
    return this.http.put(this.baseUrl + "api/customer/updateInfo", data, {
      headers: { startasker: token },
    });
  }
  uploadGalleryFiles(data): Observable<any> {
    return this.http.put(this.baseUrl + "api/customer/uploadFile", data);
  }
  deleteGalleryFiles(data, token): Observable<any> {
    return this.http.post(this.baseUrl + "api/customer/deleteFile", data, {
      headers: { startasker: token },
    });
  }
  verifyAccount(data, token): Observable<any> {
    return this.http.post(this.baseUrl + "api/AccountVerify/", data, {
      headers: { startasker: token },
    });
  }
  deleteOneNotification(data, token): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        startasker: token,
      }),
      body: {
        userID: data.userID,
        notifyID: data.notifyID,
      },
    };
    return this.http.delete(this.baseUrl + "api/inbox/deleteByID", options);
  }
  deleteAllNotification(data, token): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        startasker: token,
      }),
      body: {
        userID: data.userID,
      },
    };
    return this.http.delete(this.baseUrl + "api/inbox/deleteAll", options);
  }
  taskAlert(data, token): Observable<any> {
    return this.http.put(
      "https://liveapi.startasker.com/api/customer/settings/taskalert_update",
      data,
      { headers: { startasker: token } }
    );
  }
  customTaskAlert(data, token): Observable<any> {
    return this.http.post(
      "https://liveapi.startasker.com/api/customer/settings/add_custom_alerts",
      data,
      { headers: { startasker: token } }
    );
  }
  fetchInboxMessages(data, token): Observable<any> {
    return this.http.post(this.baseUrl + "api/inbox/fetchInbox", data, {
      headers: { startasker: token },
    });
  }
  readInboxMessages(data, token): Observable<any> {
    return this.http.put(this.baseUrl + "api/inbox/isReadNotification", data, {
      headers: { startasker: token },
    });
  }
  addEmergencyContacts(data, token): Observable<any> {
    return this.http.post(
      `${this.baseUrl}api/addemergencycontact/addNewContact`,
      data,
      { headers: { startasker: token } }
    );
  }
  fetchEmergencyContacts(data, token): Observable<any> {
    return this.http.post(
      `${this.baseUrl}api/addemergencycontact/fetchContact`,
      data,
      { headers: { startasker: token } }
    );
  }
  editEmergencyContacts(data, token): Observable<any> {
    return this.http.put(
      `${this.baseUrl}api/addemergencycontact/updateContact`,
      data,
      { headers: { startasker: token } }
    );
  }
  deleteEmergencyContacts(data, token): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        startasker: token,
      }),
      body: {
        _id: data._id,
      },
    };
    return this.http.delete(
      `${this.baseUrl}api/addemergencycontact/deleteContact`,
      options
    );
  }
  updateCustomTaskAlert(data, token): Observable<any> {
    return this.http.put(
      "https://liveapi.startasker.com/api/customer/settings/update_custom_alerts",
      data,
      { headers: { startasker: token } }
    );
  }
  deleteCustomTaskAlert(data, token): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        startasker: token,
      }),
      body: {
        userID: data.userID,
        alertID: data.alertID,
      },
    };
    return this.http.delete(
      "https://liveapi.startasker.com/api/customer/settings/delete_custom_alerts",
      options
    );
  }
  notificationSettings(data, token): Observable<any> {
    return this.http.put(
      "https://liveapi.startasker.com/api/customer/settings/notifications_update",
      data,
      { headers: { startasker: token } }
    );
  }
  changePassword(data, token): Observable<any> {
    return this.http.put(
      "https://liveapi.startasker.com/api/customer/changepassword",
      data,
      { headers: { startasker: token } }
    );
  }
  userBookings(data, token): Observable<any> {
    return this.http.post(this.baseUrl + "api/hire/getBookings", data, {
      headers: { startasker: token },
    });
  }
  bookingDetails(data, token): Observable<any> {
    return this.http.post(this.baseUrl + "api/hire/", data, {
      headers: { startasker: token },
    });
  }
  withdrawFromJob(data, token): Observable<any> {
    return this.http.post(this.baseUrl + "api/hire/withDrawJob", data, {
      headers: { startasker: token },
    });
  }
  completeTaskByPoster(data, token): Observable<any> {
    return this.http.put(
      this.baseUrl + "api/hire/task_completed_providers_to_customer",
      data,
      { headers: { startasker: token } }
    );
  }
  completeTaskByTasker(data, token): Observable<any> {
    return this.http.put(
      this.baseUrl + "api/hire/task_completed_providers_to_customer",
      data,
      { headers: { startasker: token } }
    );
  }
  giveRatings(data, token, url): Observable<any> {
    return this.http.post(this.baseUrl + "api/ratings/" + url, data, {
      headers: { startasker: token },
    });
  }
}
