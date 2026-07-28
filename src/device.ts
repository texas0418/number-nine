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
