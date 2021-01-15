import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";
import { IonicModule, IonicRouteStrategy, Platform } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MyProtocolFactoryService } from "./my-protocol-factory.service";
import { AppThemeModule } from "app-theme";
import { TapDeviceAngularModule } from "@iotize/ionic/default";
import { ProtocolFactoryService } from "@iotize/ionic";
import { Dialogs } from "@ionic-native/dialogs/ngx";
import { environment } from "../environments/environment";
import { ScannerNotAvailable } from "./scanner-not-available";

import { TapScannerBleModule, TAP_BLE_SCANNER } from "@iotize/ionic";
import { BLEScanner } from "@iotize/device-com-ble.cordova";
import { WebBluetoothScanner } from "@iotize/device-com-web-bluetooth.js";

import { TapScannerNfcModule } from "@iotize/ionic";

import { TAP_WIFI_SCANNER, TAP_NETWORK_SCANNER } from "@iotize/ionic";
import {
  WifiScanner,
  ZeroConfScannerCordova
} from "@iotize/device-com-wifi.cordova";

if (environment.debug) {
  require("debug").enable(environment.debug);
}

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    AppThemeModule,
    TapDeviceAngularModule.forRoot(),
    IonicModule.forRoot(),
    TapScannerNfcModule,
    TapScannerBleModule,
    AppRoutingModule,
    BrowserAnimationsModule
    // ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Dialogs,
    {
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy
    },
    {
      provide: TAP_WIFI_SCANNER,
      useFactory: (platform: Platform) => {
        if (platform.is("cordova")) {
          return new WifiScanner();
        } else {
          return new ScannerNotAvailable(
            "Wifi scanner is not available in the browser"
          );
        }
      },
      deps: [Platform]
    },
    {
      provide: TAP_BLE_SCANNER,
      useFactory: (platform: Platform) => {
        if (platform.is("cordova")) {
          return new BLEScanner();
        } else {
          return new WebBluetoothScanner();
        }
      },
      deps: [Platform]
    },
    {
      provide: TAP_NETWORK_SCANNER,
      useFactory: (platform: Platform) => {
        if (platform.is("cordova")) {
          return new ZeroConfScannerCordova();
        } else {
          return new ScannerNotAvailable(
            "Network scanner is not available in the browser"
          );
        }
      },
      deps: [Platform]
    },
    {
      provide: ProtocolFactoryService,
      useClass: MyProtocolFactoryService,
      deps: [Platform, TAP_BLE_SCANNER]
    },
    {
      provide: "TapConnectionOptions",
      useValue: {
        switchProtocol: true,
        refreshSessionState: true,
        nfcPairing: true,
        nfcEnableEncryption: true
      }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
