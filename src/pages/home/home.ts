import { Component, ViewChild } from '@angular/core';
import { NavController, LoadingController, ToastController, Platform, AlertController } from 'ionic-angular';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { AppProvider } from '../../providers/app/app';
import { Camera, PictureSourceType } from '@ionic-native/camera';
import * as Tesseract from 'tesseract.js'
import moment from "moment";
import { AbbyyRTR, TextCaptureOptions } from '@ionic-native/abbyy-rtr';

declare var AWS;




@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  currentPage = 'home';
  page = 0
  selectedPages = '';
  bookingDetails;
  confirmNumber: String = undefined;
  roomNumber: String = undefined;
  lastName: String = undefined;
  selectedImage: string;
  imageText: string;
  isTermCheked: Boolean;
  signatureDataUrl;
  textRecognized;
  folioDetails;
  time;
  date;
  
  pages = {
    checkIn : ['checkinOption','confirmNumber', 'verification', 'passport', 'userDetails', 'dtcm', 'dtcm2', 'signature', 'checkInSuccess'],
    checkOut: ['roomInfo', 'folio', 'checkOutSuccess']
  }
  
  private signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
    'minWidth': 1,
    'canvasWidth': 250,
    'canvasHeight': 220
  };

  @ViewChild(SignaturePad) signaturePad: SignaturePad;

 
  constructor(
    private abbyyRTR: AbbyyRTR, 
    public navCtrl: NavController, 
    public appProvider: AppProvider, 
    public loadingCtrl: LoadingController, 
    public toast: ToastController, 
    private camera: Camera, 
    public platfrom: Platform,
    public alert: AlertController
    ) {
   this.platfrom.ready().then(
     () => {


     }
   )
   
   
    setInterval(()=>{ 
      //code goes here that will be run every 5 seconds.    
      this.getDate();
      this.getTime();
    }, 500);

    let mrz = [
      'I<UTOD23145890<1233<<<<<<<<<<<',
      '7408122F1204159UTO<<<<<<<<<<<6',
      'ERIKSSON<<ANNA<MARIA<<<<<<<<<<'

    ];
  const parse = require('mrz').parse; 
  console.log( parse(mrz))

  }

  getTime(){
   this.time = moment().format('hh:mm A') ;
  }
  getDate(){
    this.date = moment().format('dddd DD MMMM') ;
  }

  ionViewDidLoad(){
    // this.signaturePad is now available
    const signatureContainerWidth: any = document.querySelector('.signature .container');
    const canvas:any =  document.querySelector('.signature .container canvas');
    // canvas.width = signatureContainerWidth.offsetWidth;
    // this.signaturePad.set('canvasWidth', signatureContainerWidth.offsetWidth);
    this.signaturePad.set('minWidth', 1); // set szimek/signature_pad options at runtime
    this.signaturePad.clear(); // invoke functions from szimek/signature_pad API
  }

  async recognize() {
    console.log('try')
    const loader = this.loadingCtrl.create({
      content: 'Recognizing image please wait..',
    });
    loader.present();
    const rekognition = new AWS.Rekognition();
    const face1 = await new Promise((resolve, reject) => {
      // var FR = new FileReader();
      var jpg = true;
      var image;
 
      // FR.addEventListener("load",  (e:any) => {
      //     console.log(e);
         
      // });
      try {
        image = atob(this.selectedImage.split("data:image/jpeg;base64,")[1]);

     } catch (e) {
         jpg = false;
     }
     if (jpg == false) {
         try {
             image = atob(this.selectedImage.split("data:image/png;base64,")[1]);
             console.log(image);
         } catch (e) {
             alert("Not an image file Rekognition can process");
             return;
         }
     }

     var length = image.length;
     var imageBytes = new ArrayBuffer(length);
     var ua = new Uint8Array(imageBytes);
     for (var i = 0; i < length; i++) {
         ua[i] = image.charCodeAt(i);
     }
     resolve(imageBytes);
      // const file:any = document.getElementsByClassName('face')[0];
      // FR.readAsDataURL(file.files[0]);

  });

  
  var params = {
    Image: { /* required */
        Bytes: face1
    }
    };

rekognition.detectText(params, (err, data) => {
        if (err)  {
          console.log(err, err.stack);
          loader.dismiss();
          alert('Cannot recognize image please capture again');
          this.recognizeImage = undefined;
         } // an error occurred
        else    {
          console.log(data, 'recognized text'); 
          this.textRecognized = data.TextDetections.filter((data) => data.Type === 'LINE');
          console.log(this.textRecognized, 'textRecognized')
          loader.dismiss();
          // alert('success' + JSON.stringify(data));
        }          // successful response
        });

    // setTimeout(() => {
    //   loader.dismiss();
    // }, 2000);
  }

  capture() {
    
    const options = {
      areaOfInterest: '0.9 0.2',
      orientation: 'landscape',
     //  stopWhenStable: true,
      licenseFileName : "AbbyyRtrSdk.license",
    };
   this.abbyyRTR.startTextCapture(options)
.then((res: any) =>  {
  console.log(res);
  this.textRecognized = res;
  // const currentDate = new Date().getTime();
  // const expirationDate = this.textRecognized.textLines[1].text.substring(21, 27);
  // const expirationYear:any = `20${expirationDate.substring(0,2)}`;
  // const expirationDateTimestamp =  new Date (expirationYear, parseInt(expirationDate.substring(2,4))-1, expirationDate.substring(4)).getTime();
  // if(currentDate <= expirationDateTimestamp) {
  //   this.page++;
  //   this.currentPage = this.pages[this.selectedPages][this.page];
  // } else {
  //   this.alert.create({
  //     buttons: [ {
  //       text: 'Ok'
  //     } ],
  //     title: 'Licensed Expired',
  //     message: 'License is expired!'
  //   }).present();
  // }
  this.page++;
    this.currentPage = this.pages[this.selectedPages][this.page];
 
})
.catch((error: any) => console.error(error));


//   const options = {
//     customDataCaptureScenario : {
// 			name : "Code",
// 			description : "Mix of digits with letters:  X6YZ64  32VPA  zyy777",
// 			recognitionLanguages : ["English"],
// 			fields : [ {
// 				regEx : "[A-Z0-9<]{9}[0-9]{1}[A-Z<]{3}[0-9]{6}[0-9]{1}[FM<]{1}[0-9]{6}[0-9]{1}[A-Z0-9<]{14}[0-9]{1}[0-9]{1}"
// 			} ]
// 		},
//     areaOfInterest: '0.7 0.2',
//     licenseFileName : "AbbyyRtrSdk.license",
//      orientation: 'landscape',
//   }

// this.abbyyRTR.startDataCapture(options)
//   .then((res: any) => console.log(res))
//   .catch((error: any) => console.error(error));
  }
  getPicture(sourceType: PictureSourceType) {
    this.camera.getPicture({
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: sourceType,
      allowEdit: true,
      saveToPhotoAlbum: false,
      correctOrientation: true
    }).then((imageData) => {
      this.selectedImage = `data:image/jpeg;base64,${imageData}`;
      console.log(this.selectedImage);
      this.recognize();
      this.recognizeImage();
    });
  }
 
  recognizeImage() {
    console.log('recognize image')
    Tesseract.recognize(this.selectedImage)
    .progress(message => {
      if (message.status === 'recognizing text') {
        console.log('recognizing image');
      }
      // this.progress.set(message.progress);
    })
    .catch(err => console.error(err))
    .then(result => {
      this.imageText = result.text;
      console.log('result', result);
    })
    .finally(resultOrError => {
      // this.progress.complete();
      console.log(resultOrError , 'err')
    });
  }
  // ngAfterViewInit(): void {
  //   //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
  //   //Add 'implements AfterViewInit' to the class.
 
  // }
  checkIn() {
    this.selectedPages = 'checkIn'
    this.currentPage = this.pages[this.selectedPages][this.page];
  }
  checkOut() {
    this.selectedPages = 'checkOut'
    this.currentPage = this.pages[this.selectedPages][this.page];
  }
  back(){
    if(this.page === 0) {
      this.currentPage = 'home'; 
      this.quit();
    }  else {
      this.page--;
      this.currentPage = this.pages[this.selectedPages][this.page];

    }
  }
  quit(){
    this.page = 0;
    this.currentPage = 'home';
    this.confirmNumber = undefined;
    this.signaturePad.clear();
    this.signatureDataUrl = undefined;
    this.roomNumber = undefined;
    this.lastName = undefined;
    this.selectedImage = undefined;
  }
  next() {
    console.log(this.currentPage);
    if(this.currentPage === 'confirmNumber') {
      const loader = this.loadingCtrl.create({
        content: 'Loading please wait..'
      });
      if(this.confirmNumber) {
        loader.present();
        
        // this.appProvider.getConfirmationNumDetails(this.confirmNumber).subscribe(res => {
        //   console.log(res);
        //   this.bookingDetails = res;
        //   loader.dismiss();
        //   this.page++;
        //   this.currentPage = this.pages[this.selectedPages][this.page];
        // }, err => {
        //   loader.dismiss();
        //   alert('Error, please try again');
        //   this.page++;
        //   this.currentPage = this.pages[this.selectedPages][this.page];
        // })
        setTimeout(() => {
          let isFound: Boolean = false;

          if(this.confirmNumber === '12345') {
            this.bookingDetails = {
              firstName: 'FRANK',
              lastName: 'LIU',
              arrivalDate: 'MARCH 6, 2019',
              departureDate: 'MARCH 10, 2019',
              totalRoomNights: '4  Night',
              type: 'Classic Room',
              addOns: 'N/A',
              gender: 'Male',
              documentNo: '123',
              birthPlace: 'China',
              nationality: 'Chinese',
              expiryDate: 'Sept 12, 2020',
              issueDate: 'Sept 12, 2010',
              countryCode: '+86'

            }; 
            isFound  = true;
           
          } else if(this.confirmNumber === '0987') {
            this.bookingDetails = {
              firstName: 'CATRIONA ',
              lastName: 'GRAY ',
              arrivalDate: 'MARCH 6, 2019',
              departureDate: 'MARCH 10, 2019',
              totalRoomNights: '4  Night',
              type: 'Classic Room',
              addOns: 'N/A',
              gender: 'Female',
              documentNo: '456',
              birthPlace: 'Philippines',
              nationality: 'Filipino',
              expiryDate: 'Aug 09, 2025',
              issueDate: 'Aug 09, 2015',
              countryCode: '+86'

            }
            isFound  = true;
            
          } else {
              this.toast.create({
                message: 'Confirmation number not found.',
                duration: 2000
              }).present();
          }

          loader.dismiss();
          if(isFound) {
            this.page++;
            this.currentPage = this.pages[this.selectedPages][this.page];
          }
      }, 2000);
        
      } else {
        this.toast.create({
          duration: 2000,
          message: 'Please Enter Confirmation Number'
        }).present();
      }
      
    } else if(this.currentPage === 'passport') {
      this.capture();
      // if(!this.selectedImage) {
      //   this.toast.create({
      //     message: 'Capture passport please...',
      //     duration: 2000
      //   }).present();
      // } else {
      //   this.page++;
      //   this.currentPage = this.pages[this.selectedPages][this.page];
      // }
    } else if(this.currentPage === 'userDetails'){ 
      if(this.isTermCheked) {
        this.page++;
        this.currentPage = this.pages[this.selectedPages][this.page];
        setTimeout(() => {
          this.page++;
          this.currentPage = this.pages[this.selectedPages][this.page];
        }, 2000);
      } else {
        this.toast.create({
          message: 'Please Check Terms & Condition to proceed',
          duration: 2000
        }).present();
      }
    } else if(this.currentPage === 'roomInfo'){
      if(this.roomNumber && this.lastName) {
        const loader = this.loadingCtrl.create({
          content: 'Loading please wait..'
        });
        loader.present();

        setTimeout(() => {
          if(this.roomNumber === '111' && this.lastName.toLowerCase() === 'liu') {
            this.folioDetails = {
              guest: 'Frank Liu',
              roomNumber: '111',
              confirmNumber: '12345'
            }
       
              this.bookingDetails = {
                firstName: 'FRANK',
                lastName: 'LIU',
                arrivalDate: 'MARCH 6, 2019',
                departureDate: 'MARCH 10, 2019',
                totalRoomNights: '4  Night',
                type: 'Classic Room',
                addOns: 'N/A',
  
              }; 
             
            loader.dismiss();
            this.page++;
            this.currentPage = this.pages[this.selectedPages][this.page];
          } else if(this.roomNumber === '222' && this.lastName.toLowerCase() === 'gray') {
            this.folioDetails = {
              guest: ' Catriona Gray',
              roomNumber: '222',
              confirmNumber: '0987'
            }
            this.bookingDetails = {
              firstName: 'CATRIONA ',
              lastName: 'GRAY ',
              arrivalDate: 'MARCH 6, 2019',
              departureDate: 'MARCH 10, 2019',
              totalRoomNights: '4  Night',
              type: 'Classic Room',
              addOns: 'N/A',

            }; 
            loader.dismiss();
            this.page++;
            this.currentPage = this.pages[this.selectedPages][this.page];
          } else {
            loader.dismiss();
            this.toast.create({
              message: "No data found.",
              duration: 2000
            }).present();
          }
        }, 2000);
       
      } else {
        let message = 'Please Enter Room Number and Last Name';
        if(!this.roomNumber && !this.lastName){
          message = 'Please Enter Room Number and Last Name';
        } else if(!this.lastName){
          message = 'Please Enter Last Name';
        } else {
          message = 'Please Enter Room Number';
        }
        this.toast.create( {
          duration: 2000,
          message: message
        }).present();
      }
    } else if(this.currentPage === 'signature'){
      if(this.signatureDataUrl) {
        this.page++;
        this.currentPage = this.pages[this.selectedPages][this.page];
      } else {
        this.toast.create({
          duration: 2000,
          message: 'Please sign to continue.'
        }).present();
      }
    } else {
      this.page++;
      this.currentPage = this.pages[this.selectedPages][this.page];
    }

   
  }
  clear(){
    this.signaturePad.clear();
    this.signatureDataUrl = undefined;
  }

  drawComplete() {
    // will be notified of szimek/signature_pad's onEnd event
    console.log(this.signaturePad.toDataURL());
    this.signatureDataUrl = this.signaturePad.toDataURL();

  }
 
  drawStart() {
    // will be notified of szimek/signature_pad's onBegin event
    console.log('begin drawing');
  }

  formatDate(date: String) {
    date = date || '';
    return date.substring(0,10);
  }
  formatRecognizeText(text) {
    return text.replace(/<|_|«|\*/g,'');
  }
  
  formatExpiryDate(date) {
    const year:any = `20${date.substring(0,2)}`;
    date = new Date (year, parseInt(date.substring(2,4))-1, date.substring(4))
    return  moment(date.getTime()).format('MMMM DD, YYYY') ;
  }
}
