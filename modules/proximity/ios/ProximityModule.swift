// modules/proximity/ios/ProximityModule.swift
// The EAR sense: UIDevice proximity, for the whisper gate (B4). While any JS
// listener is subscribed, iOS proximity monitoring is on — which also turns
// the screen OFF against the ear. That side effect is diegetic: the lamp
// goes out when she leans in.

import ExpoModulesCore
import UIKit

public class ProximityModule: Module {
  public func definition() -> ModuleDefinition {
    Name("Proximity")
    Events("onNear")

    OnStartObserving {
      DispatchQueue.main.async {
        UIDevice.current.isProximityMonitoringEnabled = true
      }
      NotificationCenter.default.addObserver(
        self,
        selector: #selector(self.proximityChanged),
        name: UIDevice.proximityStateDidChangeNotification,
        object: nil
      )
    }

    OnStopObserving {
      NotificationCenter.default.removeObserver(
        self,
        name: UIDevice.proximityStateDidChangeNotification,
        object: nil
      )
      DispatchQueue.main.async {
        UIDevice.current.isProximityMonitoringEnabled = false
      }
    }
  }

  @objc
  private func proximityChanged() {
    sendEvent("onNear", ["near": UIDevice.current.proximityState])
  }
}
