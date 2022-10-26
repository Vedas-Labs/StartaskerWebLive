import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class JobsService {
  public isJobPosted: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public baseUrl: string = "https://liveapi.startasker.com";
  constructor(private http: HttpClient) {}
  checkStatus(data): Observable<any> {
    const myheader = new HttpHeaders().set(
      "Content-Type",
      "application/x-www-form-urlencoded"
    );
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append("Amount", data.Amount);
    urlSearchParams.append("CurrencyCode", data.CurrencyCode);
    urlSearchParams.append("HashValue", data.HashValue);
    urlSearchParams.append("PaymentID", data.PaymentID);
    urlSearchParams.append("PymtMethod", data.PymtMethod);
    urlSearchParams.append("ServiceID", data.ServiceID);
    urlSearchParams.append("TransactionType", data.TransactionType);
    let body = urlSearchParams.toString();

    return this.http.post(
      "https://securepay.e-ghl.com/IPG/payment.aspx",
      body,
      { headers: myheader, responseType: "text" }
    );
  }
  browsJobs(data): Observable<any> {
    return this.http.post(
      "https://liveapi.startasker.com/api/postjob/fetch_all",
      data
    );
  }
  getLat(data): Observable<any> {
    return this.http.get(
      "https://maps.googleapis.com/maps/api/geocode/json?address=" +
        data +
        "&sensor=false&components=country:MY&key=AIzaSyC1VLf_KiKNh5LNfbwg_Fcxoto47HZ1Jc8"
    );
  }
  messageReadUpdate(data, token): Observable<any> {
    return this.http.put(
      `https://liveapi.startasker.com/api/offers/isReadMessageUpdate`,
      data,
      { headers: { startasker: token } }
    );
  }
  searchTermJobs(data, token): Observable<any> {
    return this.http.post(
      "https://liveapi.startasker.com/api/postjob/browsejob",
      data,
      { headers: { startasker: token } }
    );
  }
  browseCategory(): Observable<any> {
    return this.http.get("https://liveapi.startasker.com/api/categories");
  }
  postJobs(data, token): Observable<any> {
    return this.http.post(
      "https://liveapi.startasker.com/api/postjob/insertPostJob",
      data,
      { headers: { startasker: token } }
    );
  }
  withDrawOffer(data, token): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        startasker: token,
      }),
      body: {
        postID: data.postID,
        offeredUserID: data.offeredUserID,
      },
    };
    return this.http.delete(
      "https://liveapi.startasker.com/api/offers/delete_offer",
      options
    );
  }
  replyToUser(data, token): Observable<any> {
    return this.http.post(
      "https://liveapi.startasker.com/api/postjob/replay_to_offereduser",
      data,
      { headers: { startasker: token } }
    );
  }
  partialHire(data, token): Observable<any> {
    return this.http.post(
      "https://liveapi.startasker.com/api/hire/partialBooking",
      data,
      { headers: { startasker: token } }
    );
  }
  fullHire2(data, token): Observable<any> {
    return this.http.post(
      "https://liveapi.startasker.com/api/hire/taskers",
      data,
      { headers: { startasker: token } }
    );
  }
  fullHire(data, token): Observable<any> {
    return this.http.post(
      "https://liveapi.startasker.com/api/hire/hireTasker",
      data,
      { headers: { startasker: token } }
    );
  }
  deleteBooking(data, token): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        startasker: token,
      }),
      body: {
        bookingID: data.bookingID,
      },
    };
    return this.http.delete(
      "https://liveapi.startasker.com/api/hire/partialBooking",
      options
    );
  }
  editPost(data, token): Observable<any> {
    return this.http.put(
      "https://liveapi.startasker.com/api/postjob/updatePostJob",
      data,
      { headers: { startasker: token } }
    );
  }
  cancelTask(data, token): Observable<any> {
    return this.http.put(
      "https://liveapi.startasker.com/api/postjob/taskCancel",
      data,
      { headers: { startasker: token } }
    );
  }
  getMyTasks(data): Observable<any> {
    return this.http.post(
      "https://liveapi.startasker.com/api/postjob/get",
      data
    );
  }
  getMyOfferedTasks(data, token): Observable<any> {
    return this.http.post(
      "https://liveapi.startasker.com/api/offers/getOfferedPosts",
      data,
      { headers: { startasker: token } }
    );
  }
  getFilteredJobs(data, token): Observable<any> {
    return this.http.post(
      "https://liveapi.startasker.com/api/customer/task",
      data,
      { headers: { startasker: token } }
    );
  }
  updatePhoto(data, token): Observable<any> {
    return this.http.put(
      "https://liveapi.startasker.com/api/customer/update",
      data,
      { headers: { startasker: token } }
    );
  }
  updateMobileNumber(data, token): Observable<any> {
    return this.http.put(
      "https://liveapi.startasker.com/api/customer/updatemobileno",
      data,
      { headers: { startasker: token } }
    );
  }
  updateMobileStatus(data, token): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/customer/updatemobileverify`,
      data,
      { headers: { startasker: token } }
    );
  }
  reportTask(data) {
    return this.http.post(
      "https://liveapi.startasker.com/api/task/insert",
      data
    );
  }
  updateDob(data, token): Observable<any> {
    return this.http.put(
      "https://liveapi.startasker.com/api/customer/updatedob",
      data,
      { headers: { startasker: token } }
    );
  }
  updateAddress(data, token): Observable<any> {
    return this.http.put(
      "https://liveapi.startasker.com/api/customer/updateaddress",
      data,
      { headers: { startasker: token } }
    );
  }
  updateBankAccount(data, token): Observable<any> {
    return this.http.put(
      "https://liveapi.startasker.com/api/customer/updateaccount",
      data,
      { headers: { startasker: token } }
    );
  }
  makeAnOffer(data, token): Observable<any> {
    return this.http.post(
      "https://liveapi.startasker.com/api/postjob/insertoffers",
      data,
      { headers: { startasker: token } }
    );
  }
  updateAnOffer(data, token): Observable<any> {
    return this.http.put(
      "https://liveapi.startasker.com/api/offers/update_offer",
      data,
      { headers: { startasker: token } }
    );
  }
  addComments(data, token): Observable<any> {
    return this.http.post(
      "https://liveapi.startasker.com/api/postjob/add_comment",
      data,
      { headers: { startasker: token } }
    );
  }
}
