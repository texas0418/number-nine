// src/device.ts
// Fail-open wrappers for the phone's PHYSICAL senses (AGENTS.md mechanics
// palette: the device is a haunted instrument). Everything here degrades to
// a no-op: no sensor, no permission, no native module — the game stays fully
// playable by touch alone. Every hardware gate MUST have a touch path.
//
// CRITICAL house rule (learned from the expo-store-review crash): check the
// native registry BEFORE require()ing an expo module. Metro reports a
// module-factory throw as FATAL — a try/catch around require() does NOT
// protect a release build whose pod is missing.

const hasNative = (name: string): boolean =>
  !!(globalThis as unknown as { expo?: { modules?: Record<string, unknown> } }).expo?.modules?.[
    name
  ];

let sensorsMod: any | null | undefined;
function sensors(): any | null {
  if (sensorsMod !== undefined) return sensorsMod;
  if (!hasNative('ExponentGyroscope')) return (sensorsMod = null);
  try {
    sensorsMod = require('expo-sensors');
  } catch {
    sensorsMod = null;
  }
  return sensorsMod;
}

let brightnessMod: any | null | undefined;
function brightness(): any | null {
  if (brightnessMod !== undefined) return brightnessMod;
  if (!hasNative('ExpoBrightness')) return (brightnessMod = null);
  try {
    brightnessMod = require('expo-brightness');
  } catch {
    brightnessMod = null;
  }
  return brightnessMod;
}

/** Subscribe to the gyroscope's z-axis rate (rad/s; the axis a reader turns
 *  a portrait phone around). Returns an unsubscribe; a no-op pair when the
 *  sensor is unavailable — callers must treat tilt as a BONUS input. */
export function watchTwist(cb: (rateZ: number) => void): () => void {
  const s = sensors();
  if (!s?.Gyroscope) return () => {};
  try {
    s.Gyroscope.setUpdateInterval(50);
    const sub = s.Gyroscope.addListener((data: { z?: number }) => {
      if (typeof data?.z === 'number') cb(data.z);
    });
    return () => {
      try {
        sub.remove();
      } catch {
        /* fail open */
      }
    };
  } catch {
    return () => {};
  }
}

/** Subscribe to whether the phone is FACE DOWN (screen to the table).
 *  Accelerometer z in g-units: face-up ≈ -1, face-down ≈ +1 on iOS. No
 *  sensor → callback never fires; the dog-ear drag carries the puzzle. */
export function watchFacing(cb: (faceDown: boolean) => void): () => void {
  const s = sensors();
  if (!s?.Accelerometer) return () => {};
  try {
    s.Accelerometer.setUpdateInterval(150);
    let wasDown = false;
    const sub = s.Accelerometer.addListener((data: { z?: number }) => {
      if (typeof data?.z !== 'number') return;
      const down = data.z > 0.7;
      if (down !== wasDown) {
        wasDown = down;
        cb(down);
      }
    });
    return () => {
      try {
        sub.remove();
      } catch {
        /* fail open */
      }
    };
  } catch {
    return () => {};
  }
}

/** Subscribe to a rough magnetic heading in degrees (0 = north). Derived
 *  from the raw magnetometer — coarse but honest, like a wartime compass.
 *  No sensor → never fires; the draggable ring carries the puzzle. */
export function watchHeading(cb: (deg: number) => void): () => void {
  const s = sensors();
  if (!s?.Magnetometer) return () => {};
  try {
    s.Magnetometer.setUpdateInterval(100);
    const sub = s.Magnetometer.addListener((data: { x?: number; y?: number }) => {
      if (typeof data?.x !== 'number' || typeof data?.y !== 'number') return;
      // Portrait orientation: heading from the magnetic field's x/y plane.
      let deg = (Math.atan2(-data.x, data.y) * 180) / Math.PI;
      if (deg < 0) deg += 360;
      cb(deg);
    });
    return () => {
      try {
        sub.remove();
      } catch {
        /* fail open */
      }
    };
  } catch {
    return () => {};
  }
}

let batteryMod: any | null | undefined;
function battery(): any | null {
  if (batteryMod !== undefined) return batteryMod;
  if (!hasNative('ExpoBattery')) return (batteryMod = null);
  try {
    batteryMod = require('expo-battery');
  } catch {
    batteryMod = null;
  }
  return batteryMod;
}

/** Subscribe to STILLNESS: true after the phone has rested (gyro magnitude
 *  under a whisper) for `holdMs`, false the moment it stirs. B3's "be
 *  still — she can hear your hands". No sensor → never fires; the widget's
 *  touch fallback carries it. */
export function watchStillness(holdMs: number, cb: (still: boolean) => void): () => void {
  const s = sensors();
  if (!s?.Gyroscope) return () => {};
  try {
    s.Gyroscope.setUpdateInterval(120);
    let stillSince: number | null = null;
    let reported = false;
    const sub = s.Gyroscope.addListener((d: { x?: number; y?: number; z?: number }) => {
      const mag = Math.hypot(d?.x ?? 0, d?.y ?? 0, d?.z ?? 0);
      const now = Date.now();
      if (mag < 0.045) {
        if (stillSince === null) stillSince = now;
        if (!reported && now - stillSince >= holdMs) {
          reported = true;
          cb(true);
        }
      } else {
        stillSince = null;
        if (reported) {
          reported = false;
          cb(false);
        }
      }
    });
    return () => {
      try {
        sub.remove();
      } catch {
        /* fail open */
      }
    };
  } catch {
    return () => {};
  }
}

/** Subscribe to SHAKES: fires once per distinct shake burst (accelerometer
 *  magnitude spiking well past gravity). Fail-open as ever. */
export function watchShake(cb: () => void): () => void {
  const s = sensors();
  if (!s?.Accelerometer) return () => {};
  try {
    s.Accelerometer.setUpdateInterval(80);
    let lastFire = 0;
    const sub = s.Accelerometer.addListener((d: { x?: number; y?: number; z?: number }) => {
      const mag = Math.hypot(d?.x ?? 0, d?.y ?? 0, d?.z ?? 0);
      const now = Date.now();
      if (mag > 1.9 && now - lastFire > 450) {
        lastFire = now;
        cb();
      }
    });
    return () => {
      try {
        sub.remove();
      } catch {
        /* fail open */
      }
    };
  } catch {
    return () => {};
  }
}

/** Subscribe to portrait INVERSION (the phone physically upside down).
 *  Accelerometer y: right-way-up ≈ -1, inverted ≈ +1. */
export function watchInversion(cb: (inverted: boolean) => void): () => void {
  const s = sensors();
  if (!s?.Accelerometer) return () => {};
  try {
    s.Accelerometer.setUpdateInterval(150);
    let wasInverted = false;
    const sub = s.Accelerometer.addListener((d: { y?: number }) => {
      if (typeof d?.y !== 'number') return;
      const inverted = d.y > 0.6;
      if (inverted !== wasInverted) {
        wasInverted = inverted;
        cb(inverted);
      }
    });
    return () => {
      try {
        sub.remove();
      } catch {
        /* fail open */
      }
    };
  } catch {
    return () => {};
  }
}

/** Subscribe to STEP BOUNCES while walking (accelerometer magnitude peaks
 *  at stride cadence). Coarse by design — a pocket-held phone bounces once
 *  per pace. No sensor → never fires; taps carry the gate. */
export function watchStepBounce(cb: () => void): () => void {
  const s = sensors();
  if (!s?.Accelerometer) return () => {};
  try {
    s.Accelerometer.setUpdateInterval(90);
    let lastStep = 0;
    const sub = s.Accelerometer.addListener(
      (d: { x?: number; y?: number; z?: number }) => {
        const mag = Math.hypot(d?.x ?? 0, d?.y ?? 0, d?.z ?? 0);
        const now = Date.now();
        if (mag > 1.25 && now - lastStep > 420) {
          lastStep = now;
          cb();
        }
      },
    );
    return () => {
      try {
        sub.remove();
      } catch {
        /* fail open */
      }
    };
  } catch {
    return () => {};
  }
}

/** Subscribe to MAINS power (the charger = the set's hunger). Calls back
 *  with true while plugged in. No native module → never fires; the widget's
 *  hold-the-plug fallback carries the gate. */
export function watchMains(cb: (plugged: boolean) => void): () => void {
  const b = battery();
  if (!b?.getBatteryStateAsync) return () => {};
  let live = true;
  let sub: { remove?: () => void } | null = null;
  try {
    const CHARGING = 2; // Battery.BatteryState.CHARGING
    const FULL = 3;
    b.getBatteryStateAsync()
      .then((st: number) => live && cb(st === CHARGING || st === FULL))
      .catch(() => {});
    sub = b.addBatteryStateListener?.(({ batteryState }: { batteryState: number }) => {
      if (live) cb(batteryState === CHARGING || batteryState === FULL);
    });
  } catch {
    /* fail open */
  }
  return () => {
    live = false;
    try {
      sub?.remove?.();
    } catch {
      /* fail open */
    }
  };
}

/** Poll the SYSTEM screen brightness (0..1) — read-only, no permission on
 *  iOS. Calls back on change; returns a stop function. When unavailable the
 *  callback simply never fires and the in-page fallback carries the puzzle. */
export function watchLamp(cb: (level: number) => void): () => void {
  const b = brightness();
  if (!b?.getBrightnessAsync) return () => {};
  let live = true;
  let last = -1;
  const tick = () => {
    if (!live) return;
    b.getBrightnessAsync()
      .then((v: number) => {
        if (live && typeof v === 'number' && Math.abs(v - last) > 0.02) {
          last = v;
          cb(v);
        }
      })
      .catch(() => {});
  };
  tick();
  const timer = setInterval(tick, 400);
  return () => {
    live = false;
    clearInterval(timer);
  };
}

/** Subscribe to the EAR (B4's whisper): UIDevice proximity via the local
 *  Proximity module (modules/proximity). While subscribed, iOS proximity
 *  monitoring is live — the screen going dark against the ear is diegetic.
 *  No module (Android, Expo Go, stripped build) → never fires; the widget's
 *  press-and-hold-to-listen fallback carries the gate. */
export function watchNearEar(cb: (near: boolean) => void): () => void {
  const mod = (
    globalThis as unknown as {
      expo?: { modules?: Record<string, any> };
    }
  ).expo?.modules?.Proximity;
  if (!mod?.addListener) return () => {};
  try {
    const sub = mod.addListener('onNear', (e: { near?: boolean }) => {
      cb(!!e?.near);
    });
    return () => {
      try {
        sub.remove();
      } catch {
        /* fail open */
      }
    };
  } catch {
    return () => {};
  }
}

let screenCapMod: any | null | undefined;
function screenCapture(): any | null {
  if (screenCapMod !== undefined) return screenCapMod;
  if (!hasNative('ExpoScreenCapture')) return (screenCapMod = null);
  try {
    screenCapMod = require('expo-screen-capture');
  } catch {
    screenCapMod = null;
  }
  return screenCapMod;
}

/** Subscribe to the SHUTTER (B4's séance plate): fires once per screenshot
 *  the reader takes. No module → never fires; the widget's long-press
 *  "expose the plate" fallback carries the gate. */
export function watchShutter(cb: () => void): () => void {
  const sc = screenCapture();
  if (!sc?.addScreenshotListener) return () => {};
  try {
    const sub = sc.addScreenshotListener(() => cb());
    return () => {
      try {
        sub?.remove?.();
      } catch {
        /* fail open */
      }
    };
  } catch {
    return () => {};
  }
}

let networkMod: any | null | undefined;
function network(): any | null {
  if (networkMod !== undefined) return networkMod;
  if (!hasNative('ExpoNetwork')) return (networkMod = null);
  try {
    networkMod = require('expo-network');
  } catch {
    networkMod = null;
  }
  return networkMod;
}

/** Subscribe to SEVERANCE (B5): true while the phone has no network of any
 *  kind — the reader has cut the outside world (airplane mode reads as
 *  NONE; iOS never says "airplane" directly, and severed is severed).
 *  No module → never fires; the widget's held-switch fallback carries it. */
export function watchSeverance(cb: (severed: boolean) => void): () => void {
  const n = network();
  if (!n?.addNetworkStateListener) return () => {};
  let live = true;
  let sub: { remove?: () => void } | null = null;
  try {
    n.getNetworkStateAsync?.()
      .then((s: { isConnected?: boolean }) => live && cb(!(s?.isConnected ?? true)))
      .catch(() => {});
    sub = n.addNetworkStateListener((s: { isConnected?: boolean }) => {
      if (live) cb(!(s?.isConnected ?? true));
    });
  } catch {
    /* fail open */
  }
  return () => {
    live = false;
    try {
      sub?.remove?.();
    } catch {
      /* fail open */
    }
  };
}

// react-native-volume-manager is a BARE RN module — it has no entry in the
// expo native registry, so the guard is the NativeModules table (safe to
// read always). Residual risk if a build ever ships without the pod is
// caught on device QA; the gain gate fails open to a drag fallback anyway.
let volumeMod: any | null | undefined;
function volumeManager(): any | null {
  if (volumeMod !== undefined) return volumeMod;
  try {
    const { NativeModules } = require('react-native');
    if (!NativeModules?.VolumeManager) return (volumeMod = null);
    volumeMod = require('react-native-volume-manager');
  } catch {
    volumeMod = null;
  }
  return volumeMod;
}

/** Subscribe to the RF GAIN (B5): the hardware volume rockers as the set's
 *  gain knob. Calls back 0..1 on every press; `suppressUi` hides the system
 *  volume overlay while the gate holds the stage. Returns a stop that
 *  restores the overlay. */
export function watchGain(
  cb: (volume: number) => void,
  suppressUi = true,
): () => void {
  const vm = volumeManager();
  if (!vm?.addVolumeListener) return () => {};
  let sub: { remove?: () => void } | null = null;
  try {
    if (suppressUi) vm.showNativeVolumeUI?.({ enabled: false });
    vm.getVolume?.()
      .then((v: number | { volume?: number }) =>
        cb(typeof v === 'number' ? v : (v?.volume ?? 0)),
      )
      .catch(() => {});
    sub = vm.addVolumeListener((r: { volume?: number }) => cb(r?.volume ?? 0));
  } catch {
    /* fail open */
  }
  return () => {
    try {
      sub?.remove?.();
      if (suppressUi) vm.showNativeVolumeUI?.({ enabled: true });
    } catch {
      /* fail open */
    }
  };
}

let clipboardMod: any | null | undefined;
function clipboard(): any | null {
  if (clipboardMod !== undefined) return clipboardMod;
  if (!hasNative('ExpoClipboard')) return (clipboardMod = null);
  try {
    clipboardMod = require('expo-clipboard');
  } catch {
    clipboardMod = null;
  }
  return clipboardMod;
}

/** The POCKET SLIP (B5): the station leaves something in the reader's
 *  clipboard — a redundant clue channel they discover later, mid-paste,
 *  somewhere else entirely. Fail-open no-op. */
export function slipIntoPocket(text: string): void {
  const c = clipboard();
  try {
    c?.setStringAsync?.(text);
  } catch {
    /* fail open */
  }
}

let audioMod: any | null | undefined;
function audioModule(): any | null {
  if (audioMod !== undefined) return audioMod;
  if (!hasNative('AudioModule') && !hasNative('ExpoAudio')) return (audioMod = null);
  try {
    audioMod = require('expo-audio');
  } catch {
    audioMod = null;
  }
  return audioMod;
}

/** Whether the ear is ALREADY open (no prompt) — iOS asks once per
 *  install and remembers; the gate can acknowledge a standing yes. */
export async function hasMicPermission(): Promise<boolean> {
  const a = audioModule();
  if (!a?.getRecordingPermissionsAsync) return false;
  try {
    const res = await a.getRecordingPermissionsAsync();
    return !!res?.granted;
  } catch {
    return false;
  }
}

/** Ask to open the EAR (B5's mic gate). The iOS dialog is part of the
 *  scene; a refusal is honored forever (the tines carry the gate). */
export async function askMicPermission(): Promise<boolean> {
  const a = audioModule();
  if (!a?.requestRecordingPermissionsAsync) return false;
  try {
    const res = await a.requestRecordingPermissionsAsync();
    return !!res?.granted;
  } catch {
    return false;
  }
}

/** Subscribe to the reader's BREATH AND VOICE (B5): live mic PCM reduced to
 *  { rms, hz } per buffer — rms 0..1 loudness, hz a coarse zero-crossing
 *  pitch (null when unvoiced/quiet). Requires permission already granted.
 *  Fail-open: no module, no permission, no stream → never fires. */
export function watchBreath(
  cb: (rms: number, hz: number | null, seconds: number) => void,
): () => void {
  const a = audioModule();
  const Stream = a?.AudioModule?.AudioStream ?? a?.AudioStream;
  if (!Stream) return () => {};
  let stream: any | null = null;
  let sub: { remove?: () => void } | null = null;
  try {
    stream = new Stream({ sampleRate: 16000, channels: 1, encoding: 'float32' });
    sub = stream.addListener?.(
      'audioStreamBuffer',
      (buf: { data: ArrayBuffer; sampleRate: number }) => {
        try {
          const pcm = new Float32Array(buf.data);
          if (pcm.length === 0) return;
          let sum = 0;
          let crossings = 0;
          let prev = pcm[0];
          for (let i = 0; i < pcm.length; i++) {
            const v = pcm[i];
            sum += v * v;
            if ((v >= 0) !== (prev >= 0)) crossings++;
            prev = v;
          }
          const rms = Math.sqrt(sum / pcm.length);
          const seconds = pcm.length / (buf.sampleRate || 16000);
          const hz = crossings / 2 / seconds;
          // a hum is quiet-but-voiced; silence and hiss report no pitch.
          // seconds rides along so callers accumulate REAL time (device QA:
          // hardcoded 64ms steps made 2s of hum demand 6+ perfect seconds)
          cb(rms, rms > 0.008 && hz >= 60 && hz <= 600 ? hz : null, seconds);
        } catch {
          /* fail open */
        }
      },
    );
    stream.start?.().catch?.(() => {});
  } catch {
    /* fail open */
  }
  return () => {
    try {
      sub?.remove?.();
      stream?.stop?.();
      stream?.release?.();
      // Drop the RECORD session too — without this iOS keeps the orange
      // mic indicator lit after the gate is done (device QA). Mirrors
      // initAudio's playback mode.
      a?.setAudioModeAsync?.({ allowsRecording: false, playsInSilentMode: true })?.catch?.(
        () => {},
      );
    } catch {
      /* fail open */
    }
  };
}
