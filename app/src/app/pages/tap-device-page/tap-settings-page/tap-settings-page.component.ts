import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { CurrentDeviceService, TapInfo, TapConfigItem } from "@iotize/ionic";
import { ToastService } from "app-theme";
import { HostProtocol } from "@iotize/tap";

@Component({
  selector: "tap-settings-page",
  templateUrl: "./tap-settings-page.component.html",
  styleUrls: ["./tap-settings-page.component.scss"]
})
export class TapSettingsPageComponent implements OnInit {
  protocolSections: {
    title: string;
    icon?: string;
    items: TapConfigItem[];
  }[] = [];

  public interfaceTapConfigItems = [
    {
      key: "appName",
      editable: true
    }
  ];
  public profile_adminConfigItem = [
    {
      key: "ProfileLifeTime",
      editable: true,
      params: ["65535"]
    },
    {
      key: "profilePassword",
      editable: true,
      params: ["65535"]
    }
  ];
  public profile_supervisorConfigItem = [
    {
      key: "ProfileLifeTime",
      editable: true,
      params: ["65534"]
    },
    {
      key: "profilePassword",
      editable: true,
      params: ["65534"]
    }
  ];
  public bundle_MemoryConfigItem = [
    {
      key: "BundleDatalogPeriod",
      editable: true,
      params: ["1"]
    }
  ];
  public bundle_CPUsConfigItem = [
    {
      key: "BundleDatalogPeriod",
      editable: true,
      params: ["2"]
    }
  ];
  public bundle_ControlConfigItem = [
    {
      key: "BundleDatalogPeriod",
      editable: true,
      params: ["3"]
    }
  ];

  public get tap() {
    return this.tapService.tap;
  }

  constructor(
    private tapService: CurrentDeviceService,
    private toastService: ToastService
  ) {}

  async ngOnInit() {}

  private onError(err: Error) {
    this.toastService.error(err);
  }
}
