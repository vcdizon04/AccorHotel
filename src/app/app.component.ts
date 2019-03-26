import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Keyboard } from '@ionic-native/keyboard';


import { HomePage } from '../pages/home/home';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = HomePage;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen , keyBoard: Keyboard ){
    platform.ready().then(() => {
      setTimeout(() => {
      const currentDateTimestamp = new Date().getTime();
      const expirationTimestamp = 1560182400000;
      if(currentDateTimestamp < expirationTimestamp) {
      
      } else {
        alert('License Expired');
        platform.exitApp();
      }
      }, 500);
      
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
      keyBoard.disableScroll(true);
    });
  }
}

