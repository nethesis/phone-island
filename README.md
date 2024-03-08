# NethVoice CTI Phone Island

A fully standalone component for managing calls, video calls, screen sharing and more...

## Builds

Available as component on `npm`

[![alt text](https://img.shields.io/npm/dw/@nethesis/phone-island?label=npm&color=red&style=for-the-badge)](https://www.npmjs.com/package/@nethesis/phone-island)

Available as widget on `jsDelivr`

[![alt_text](https://img.shields.io/jsdelivr/gh/hw/nethesis/phone-island?label=jsdelivr-js&style=for-the-badge)](https://cdn.jsdelivr.net/gh/nethesis/phone-island/dist-widget/index.widget.js)
[![alt_text](https://img.shields.io/jsdelivr/gh/hw/nethesis/phone-island?label=jsdelivr-css&color=blue&style=for-the-badge)](https://cdn.jsdelivr.net/gh/nethesis/phone-island/dist-widget/index.widget.css)

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
- **dist** - contains the component lib build
- **src/index.ts** - is the entry point for the component lib and exports the React component
- **src/index.widget.tsx** - is the entry point for the widget that is built as a single js and css file

## Development

Install deps

```
npm install
```

Run Storybook

```
touch .env.development.local
echo "CONFIG_TOKEN=$(echo -n "<cti_host>:<cti_username>:<cti_token>:<sip_ext>:<sip_secret>" | base64 -w0)" > .env.development.local
npm run dev
```
**Other environment variables can be specified inside the file above:**

```
# The destination number to be called
DEST_NUMBER=<call_destination_number>

# The announcement id to be reproduced as announcement and base64 audio file
ANNOUNCEMENT_ID=<announcement_id>

# The call recording id to be reproduced
CALL_RECORDING_ID=<call_recording_id>
```

The main component can be developed using Storybook. Inside the story is rendered the component exported by the final component library.

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
