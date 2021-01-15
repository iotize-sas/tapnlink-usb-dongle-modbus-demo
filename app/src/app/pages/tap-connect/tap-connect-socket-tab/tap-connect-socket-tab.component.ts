import { Component, OnInit, Inject, ChangeDetectorRef } from "@angular/core";
import { MyTapConnectionService } from "src/app/my-tap-connection.service";
import { ProtocolSelectedEvent } from "@iotize/ionic";

import { TAP_WIFI_SCANNER, TAP_NETWORK_SCANNER } from "@iotize/ionic";
import {
  CordovaNetworkScanResult,
  CordovaWifiScanResult
} from "@iotize/device-com-wifi.cordova";
import { DeviceScanner } from "@iotize/tap/scanner/api";

import { TapConnectionStoreItem } from "@iotize/ionic";

import { Observable, combineLatest, Subscription } from "rxjs";
import { map, tap, startWith, filter } from "rxjs/operators";
import getDebugger from "src/app/logger";
import { Platform } from "@ionic/angular";
const debug = getDebugger("TapConnectSocketTabComponent");

type ScanResultType = CordovaNetworkScanResult | CordovaWifiScanResult;

@Component({
  selector: "app-tap-connect-socket-tab",
  templateUrl: "./tap-connect-socket-tab.component.html",
  styleUrls: ["./tap-connect-socket-tab.component.scss"]
})
export class TapConnectSocketTabComponent implements OnInit {
  error?: Error;

  infraDevices?: Observable<CordovaWifiScanResult[]>;
  networkDevices?: Observable<CordovaNetworkScanResult[]>;
  allDevices?: Observable<(CordovaNetworkScanResult | CordovaWifiScanResult)[]>;
  devicesSnapshot: ScanResultType[];
  deviceSub?: Subscription;

  showScan: boolean = false;
  scanning: Observable<boolean>;

  tapConnectionStored?: TapConnectionStoreItem[];

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private platform: Platform,
    private tapConnectionService: MyTapConnectionService,
    @Inject(TAP_WIFI_SCANNER)
    public wifiScanner: DeviceScanner<CordovaWifiScanResult>,
    @Inject(TAP_NETWORK_SCANNER)
    public networkScanner: DeviceScanner<CordovaNetworkScanResult>
  ) {
    this.networkDevices = this.networkScanner.results;
    this.infraDevices = this.wifiScanner.results.pipe(
      map(devices => {
        return devices.filter(device => {
          debug("Filtering Wi-Fi device", device);
          return device.SSID ? device.SSID.match(/_[0-9A-Fa-f]{5}$/) : false;
        });
      })
    );

    this.allDevices = combineLatest([
      this.networkDevices.pipe(startWith([])),
      this.infraDevices.pipe(startWith([]))
    ]).pipe(
      map(([networkDevices, wifiDevices]) => {
        return [...networkDevices, ...wifiDevices];
      })
    );
    this.showScan = this.platform.is("cordova");
    this.scanning = combineLatest(
      this.wifiScanner.scanning,
      this.networkScanner.scanning
    ).pipe(map(([a, b]) => a || b));
  }

  ngOnInit() {
    this.deviceSub = this.allDevices?.subscribe(devices => {
      // console.log('New scanner results', devices);
      this.devicesSnapshot = devices.filter(d => !!d);
      this.changeDetectorRef.detectChanges();
    });
  }

  ngOnDestroy() {
    console.log("Destroy sub...");
    this.deviceSub?.unsubscribe();
  }

  async onItemClicked(item: CordovaNetworkScanResult | CordovaWifiScanResult) {
    debug("onItemClicked", item);
    if (item.SSID) {
      return this.onInfraItemClicked(item as CordovaWifiScanResult);
    } else {
      return this.onNetworkItemClicked(item as CordovaNetworkScanResult);
    }
  }

  async onNetworkItemClicked(meta: CordovaNetworkScanResult) {
    debug("onNetworkItemClicked", meta);
    // let meta = event.detail.value;
    if (!meta || !meta.ipv4Addresses || meta.ipv4Addresses.length == 0) {
      this.onError(new Error(`This device does not have an IP address`));
      return;
    }
    this.tapConnectionService.connectWithLoader({
      type: "socket",
      info: {
        url: `tcp://${meta.ipv4Addresses[0]}:${meta.port}`
      }
    });
  }

  async onInfraItemClicked(meta: CordovaWifiScanResult) {
    debug("onInfraItemClicked", event);
    // let meta = event.detail.value;
    this.tapConnectionService.connectWithLoader({
      type: "wifi",
      info: {
        ssid: meta.SSID,
        name: meta.SSID,
        url: "tcp://192.168.4.1:2000",
        algorithm: "WPA",
        password: undefined
      }
    });
  }

  async onProtocolSelected(event: ProtocolSelectedEvent) {
    console.log("onProtocolSelected", event);
    this.tapConnectionService.connectWithLoader(event.meta);
  }

  onError(err: Error) {
    this.error = err;
  }

  startScan() {
    this.error = undefined;
    return Promise.all([this.refreshNetwork(), this.refreshWifi()]);
  }

  stopScan() {
    this.networkScanner.stop().catch((err: Error) => this.onError(err));
    this.wifiScanner.stop().catch((err: Error) => this.onError(err));
  }

  async refreshScan(event: any) {
    event.target.complete();
    await this.stopScan();
    await this.startScan();
  }

  refreshNetwork() {
    this.networkScanner.start().catch((err: Error) => this.onError(err));
  }

  refreshWifi() {
    this.wifiScanner.start().catch((err: Error) => this.onError(err));
  }

  clearList() {
    this.devicesSnapshot = [];
  }

  onStoredTapSelected(info: TapConnectionStoreItem) {
    this.tapConnectionService.connectWithLoader(info.connection);
  }
}
