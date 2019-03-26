import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the AppProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AppProvider {

  constructor(public http: HttpClient) {
    console.log('Hello AppProvider Provider');
  }

  getConfirmationNumDetails(num) {
    return this.http.get<any>(`https://cors-anywhere.herokuapp.com/http://121.196.218.53:9098/customize/control/FetchBooking?Json={"confirmationNumber": {"value": "${num}","type": "INTERNAL"}}&hotelCode=FSDH&chainCode=MF `)
  }
  getFolio(num) {
    return this.http.get<any>(`http://121.196.218.53:9098/customize/control/Invoice?Json={"reservationRequest": {"hotelReference": {"value": "","hotelCode": "FSDH"},"reservationID": {"uniqueID": [{"value": "${num}","type": "EXTERNAL","source": "RESV_NAME_ID"}]}}}&hotelCode=FSDH&chainCode=MF `)
  }
}
