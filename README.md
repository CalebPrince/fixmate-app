# Fixmate

An AI-powered OBD-II companion app. Pairs with any ELM327-compatible Bluetooth scanner (built and tested against a KONNWEI BLE adapter) and translates trouble codes and live telemetry into plain-English diagnoses — what's wrong, how urgent it is, and whether it's a DIY fix or a trip to the mechanic.

Built for a client project; replaces the scanner's stock companion app (MaxOBD) with a smarter, AI-backed interface.

## Stack

- **React Native 0.86** (bare, TypeScript) — bare workflow, not Expo, since BLE requires native modules
- **react-native-ble-plx** — Bluetooth Low Energy transport
- **react-native-keychain** — API keys stored in the OS keychain, never plain storage
- **react-native-bootsplash** — native splash screen with a loading spinner during JS bundle load
- **@react-navigation/bottom-tabs** — the four main screens
- Four pluggable AI providers: OpenAI, Anthropic (Claude), Google (Gemini), xAI (Grok) — user picks one and supplies their own key in Settings

## Project structure

```
src/
  obd/         Generic OBD-II PID parser + ELM327 command/response parsing + DTC decode
               (works on any OBD-II compliant vehicle — SAE J1979 standard PIDs)
  ble/         BLE transport layer (scan, connect, command queueing)
  ai/          AI provider interface + 4 implementations, shared prompt/JSON-parsing logic
  storage/     Keychain-backed API key storage
  state/       AppContext — wires BLE + OBD + AI together for the screens
  screens/     Pair, Live Dashboard, Diagnosis, Settings
  navigation/  Bottom tab navigator
  theme/       Color tokens (light/dark), shared across screens

mockup/        Standalone HTML/CSS click-through prototype of the 4 screens (design reference,
               not part of the app build). Run with `node mockup/serve.js`.

branding/      Logo source images and the scripts used to generate them + the Android icon set
               (build_icons.py, make_transparent.py — rerun these if the logo changes)
```

## Running it

### First-time setup

```sh
npm install
```

### Start Metro (JS dev server)

```sh
npx react-native start
```

### Build and install on a connected Android device

**Windows note:** `npx react-native run-android` currently fails on this machine — the community CLI can't resolve `gradlew.bat` when spawned from Git Bash/PowerShell (a Node-on-Windows batch-file execution quirk, not a project issue). Build directly with Gradle instead, using the **full path** to `gradlew.bat`:

```powershell
& "android\gradlew.bat" -p android app:installDebug -PreactNativeDevServerPort=8081
```

Then forward Metro's port and launch:

```sh
adb reverse tcp:8081 tcp:8081
adb shell am start -n com.diagnosticapp/.MainActivity
```

Debug builds fetch the JS bundle from Metro over USB on every cold launch — expect a few seconds of load time (covered by the native splash + spinner) before the app appears.

### Building a standalone release APK (for handing off to testers/the client)

Release builds embed the JS bundle directly, so they run standalone with no Metro connection needed:

```powershell
& "android\gradlew.bat" -p android assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`. Signed with the default debug keystore (fine for testing; **generate a real release keystore before any actual Play Store submission** — see [Signed APK docs](https://reactnative.dev/docs/signed-apk-android)).

## Known gaps / open items

- **BLE GATT UUIDs are unconfirmed** (`src/ble/uuids.ts`). They default to the Nordic UART Service pattern most ELM327 BLE clones use, but this hasn't been verified against the client's actual adapter yet — first real connection attempt will confirm or require correcting these.
- **Custom fonts not bundled.** The design (Big Shoulders Display / IBM Plex Sans / IBM Plex Mono, used in the HTML mockup) isn't wired into the native app yet — screens currently use system font fallbacks.
- **iOS untested.** This has only been built and run on Android — the dev machine is Windows, so iOS needs a Mac to build/verify. iOS Bluetooth permission strings are already set in `Info.plist`.
- **No vehicle multi-profile / scan history yet** — single vehicle profile only, no persistence across app restarts, no historical scan log. Planned for a later phase.
- **Background BLE monitoring not implemented** — live telemetry only updates while the app is in the foreground on the Live tab.

## Design reference

The color palette, typography direction, and screen layouts were prototyped first as a clickable HTML mockup (`mockup/index.html`) before being ported to native screens. Palette: warm graphite/steel neutrals, muted copper accent (`#C1652B`), with green/amber/red reserved for urgency states — not the brand accent.
