# Mad Math

Play now at https://mad-math.azab2c.com

Mad Math is a modern web port of a Windows Phone 7 math game originally built
for family math practice.

The active implementation lives in `/web`. The original WP7 app remains in
`/wp7` as reference material.

## Web App

```powershell
Set-Location web
npm install
npm run dev
```

Validation:

```powershell
npm run test
npm run build
npm run lint
npm run smoke
```

Production preview:

```powershell
npm run preview
```

The first web release is fully local-first: profiles, settings, and results are
stored in browser storage with no backend.

## Android Host

The Capacitor Android wrapper remains under internal development in
`/android-cap` and is not part of the current public mirror while the web
experience is stabilized.

```powershell
Set-Location android-cap
npm install
npm run cap:sync
```

To build a debug APK, install/configure the Android SDK and then run:

```powershell
npm run android:build
```

If Gradle reports that the SDK location is missing, set `ANDROID_HOME` or create
`android-cap/android/local.properties` with a local `sdk.dir` path.

## Docs

- `docs/WP7-NOTES.md` captures behavior from the original app.
- `docs/MASTER-PLAN.md` tracks the phased implementation plan.
- `tasks/` contains batch artifacts used during the port.
