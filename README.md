# NethVoice CTI Phone Island

A fully standalone component for managing calls, video calls, screen sharing and more...

## Builds

Available as component on `npm`

[![alt text](https://img.shields.io/npm/dw/@nethesis/phone-island?label=npm&color=red&style=for-the-badge)](https://www.npmjs.com/package/@nethesis/phone-island)

Available as widget on `jsDelivr`

[![alt_text](https://img.shields.io/jsdelivr/gh/hw/nethesis/phone-island?label=jsdelivr-js&style=for-the-badge)](https://cdn.jsdelivr.net/gh/nethesis/phone-island/dist-widget/index.widget.js)
[![alt_text](https://img.shields.io/jsdelivr/gh/hw/nethesis/phone-island?label=jsdelivr-css&color=blue&style=for-the-badge)](https://cdn.jsdelivr.net/gh/nethesis/phone-island/dist-widget/index.widget.css)

## Online Demo

The repository root now contains a demo entrypoint for GitHub Pages.
The page loads the standalone widget bundle from `dist-widget` so users can try Phone Island directly in the browser without integrating it into their own project first.

To publish or update the demo page:

```sh
npm install
npm run build:widget
```

Then publish GitHub Pages from the repository root so that at least these assets are available online:

- `index.html`
- `dist-widget/index.widget.js`
- `dist-widget/index.widget.css`

GitHub Pages should be configured to serve the root of the branch, because the demo page references the widget bundle with `/dist-widget/...` paths.

What users need to do on the demo page:

1. Open the GitHub Pages URL.
2. Paste a valid Base64 token built from `<cti_host>:<cti_username>:<cti_token>:<sip_ext>:<sip_secret>`.
3. Allow browser permissions for microphone and, if needed, camera.
4. Wait for the WebRTC registration to complete.
5. Start a test call from the page.

Notes:

- GitHub Pages is served over HTTPS, which is required for browser media permissions and WebRTC APIs.
- The demo is meant for testing the standalone widget build, not for production embedding.
- Every time the widget changes, `dist-widget` should be rebuilt before updating the Pages site.

## Screenshots

### Dark Theme
#### Call started
![dark-call](https://github.com/nethesis/phone-island/assets/6152486/a65ce4b8-53b9-4450-a530-a8b9eba5216e)

#### Call incoming
![dark-incoming](https://github.com/nethesis/phone-island/assets/6152486/54f30441-21d2-42b2-bed5-af99aa9f85e4)

#### Call connected
![dark-conn](https://github.com/nethesis/phone-island/assets/6152486/bac24d1f-aa5e-405f-b00e-a5093f3b0bea)

### Light Theme
#### Call started
![white-call](https://github.com/nethesis/phone-island/assets/6152486/280a6d6f-0cda-4779-b15a-d3613ae3d8cb)

#### Call incoming
![white-incoming](https://github.com/nethesis/phone-island/assets/6152486/5ca7e539-de88-4d69-9dac-98573564ad8c)

#### Call connected
![white-conn](https://github.com/nethesis/phone-island/assets/6152486/8eb88b6b-0e74-4e51-9b80-904548762473)

## Structure

```mermaid
flowchart LR
    Views[Island] --> Call(Call)
    Views[Island] --> Play(Player)
    Views[Island] --> Chat(Chat)

    Call --> CC{{Simple Call}} --- 1CAComp>Audio Component]
    Call --> CCC{{Conference Call}} --- 2CAComp>Audio Component]

    Call --> CVC{{Video Call}}
    CVC{{Video Call}} --- 3CAComp>Audio Component]
    CVC{{Video Call}} --- 3CVComp>Video Component]
    CVC{{Video Call}} --- 5CVComp>ScreenSharing component]

    Call --> CVS{{Video Sources Call}}
    CVS{{Video Sources Call}} --- 4CAComp>Audio Component]
    CVS{{Video Sources Call}} --- 4CVComp>Video component]

    Play --> PA{{Player Voicemail}} --- 6PComp>Player Component]
    Play --> PR{{Player Registration}} --- 6PComp>Player Component]

    Chat --> CS{{Single Chat}} --- 7CComp>Chat Component]
    Chat --> CG{{Group Chat}} --- 7CComp>Chat Component]
```

## Scaffolding

- **widget-build** - contains the build of the widget version
- **widget-example** - contains the usage example of the built widget
- **index.html** - GitHub Pages demo entrypoint that loads the standalone widget from `dist-widget`
- **dist** - contains the component lib build
- **src/index.ts** - is the entry point for the component lib and exports the React component
- **src/index.widget.tsx** - is the entry point for the widget that is built as a single js and css file

## Development

Install deps

```
npm install
```

Run the local development host

```
npm run dev
```

Open the local page served by Parcel and paste the base64 config token in the left panel.

Example token generation:

```
echo -n "<cti_host>:<cti_username>:<cti_token>:<sip_ext>:<sip_secret>:<sip_host>:<sip_port>" | base64 -w0
```

The main component is developed inside a dedicated Parcel host that mounts the exported `PhoneIsland` component directly, so edits in `src/App.tsx` and child components are reflected with live reload.

Tailwind CSS is enable by default.

## Import locally

Run build and start watch

```
npm run watch
```

Go to the project directory

```
cd <local-project>
```

Link the `./dist` directory

```
npm link <path-to-phone-island/dist>
```

## Build

Build component library

```
npm run build
```

Build widget

```
npm run build:widget
```

Serve the widget

```
npm run serve:widget
```

As you can see the app/component can be built in two ways.

- The component library built with Rollup
- The widget files built with Parcel

```
npm run build-pack
```

It's useful to create a new local version of phone-island that could be imported in any project with some debug command

```
npm run revert-bump
```

It's useful to delete all .tgz created with npm run build-pack command, and reset git version to the original one
