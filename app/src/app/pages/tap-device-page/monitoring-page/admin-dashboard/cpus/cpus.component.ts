import { Component, OnInit, OnDestroy } from "@angular/core";
import { CurrentDeviceService, TapInfo } from "@iotize/ionic";
import {
  ConnectionStateChangeEvent,
  ConnectionState
} from "@iotize/tap/protocol/api";
import { Subscription, Observable } from "rxjs";
import { ToastService } from "app-theme";
import { map } from "rxjs/operators";
import { ModalController } from "@ionic/angular";
import { TapMonitoringSettingsComponent } from "@iotize/ionic/monitoring";
import { MonitoringSettingsService } from "@iotize/ionic/monitoring";
import { TypedDataManager, VariableView, TapVariable } from "@iotize/tap/data";
import { ModbusSlaveDemoDataApi, dataManagerConfig } from "tap-api";
import { Router, NavigationStart } from "@angular/router";
import { TapMonitoringService } from "app-lib";
import { Tap } from "@iotize/tap";
import {
  PipeConverter,
  ByteSwapConverter,
  ArrayConverter,
  NumberConverter,
  StringConverter,
  FloatConverter,
  BooleanConverter
} from "@iotize/tap/client/impl";

const DEFAULT_TARGET_CONNECT_TRY_COUNT = 2;

@Component({
  selector: "cpus",
  templateUrl: "./cpus.component.html",
  styleUrls: ["./cpus.component.scss"]
})
export class CpusComponent implements OnInit, OnDestroy {
  private connectionStateChangeSub: Subscription;

  /**
   * Variables cache
   * Will be initialized only once
   */
  variables: Partial<{
    cpuCount: TapVariable<number, "cpuCount">;

    cpuUsagePercentage: TapVariable<number, "cpuUsagePercentage">;
  }> = {};

  waitForSubmit: boolean = false;
  isMonitorRunning: boolean = false;

  notificationErrors: {
    error: Error;
    createdAt: Date;
  }[] = [];

  dataManager: TypedDataManager<ModbusSlaveDemoDataApi.Data>;

  get isTapConnected() {
    return this.tapService.protocolMeta && this.tap.isConnected();
  }

  constructor(
    public tapService: CurrentDeviceService,
    private modalController: ModalController,
    private monitoringSettingsService: MonitoringSettingsService,
    public monitoringService: TapMonitoringService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.initVariableCache();
  }

  async ngOnInit() {
    this.onNewTapSelected();
    this.tapService.tapChanged.subscribe((newTap: Tap) => {
      this.onNewTapSelected();
    });

    this.waitForSubmit = !this.tapService.tap.isConnected();

    this.connectionStateChangeSub = this.tapService.connectionState.subscribe(
      async (event: ConnectionStateChangeEvent) => {
        switch (event.newState) {
          case ConnectionState.CONNECTED:
            this.waitForSubmit = false;
            if (this.isMonitoringRunning) {
              try {
                await this.dataManager.refreshValues();
              } catch (err) {
                this.showError(err);
              }
            }
            break;
          default:
            this.waitForSubmit = true;
        }
      }
    );
  }

  private onNewTapSelected() {
    this.initVariableCache();
    this.initComponents();
    this.waitForSubmit = !this.tapService.tap.isConnected();
  }

  private initVariableCache() {
    this.dataManager = (this.tapService.tap
      .data as unknown) as TypedDataManager<ModbusSlaveDemoDataApi.Data>;
    try {
      this.variables.cpuCount = this.dataManager.variable("cpuCount") as any;

      this.variables.cpuUsagePercentage = this.dataManager.variable(
        "cpuUsagePercentage"
      ) as any;
    } catch (err) {
      console.warn(err);
      this.showError(err);
    }
  }

  public initComponents() {}

  ngOnDestroy() {
    this.connectionStateChangeSub.unsubscribe();
  }

  get tap() {
    return this.tapService.tap;
  }

  get isMonitoringRunning() {
    return this.monitoringService.isRunning;
  }

  async changeDevice() {
    await this.tapService.remove();
    this.router.navigate(["/"]);
  }

  async showError(err: Error) {
    this.toastService.error(err);
  }
}
