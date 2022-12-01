# NethVoice CTI Phone Island
A fully standalone component for managing calls, video calls, screen sharing and more...

## Preview
### Closed
![pi-close](https://user-images.githubusercontent.com/6152486/205046804-98037726-7b2a-408b-b247-7053f0fc08e0.png)

### Open
![pi-open](https://user-images.githubusercontent.com/6152486/205046912-e32d81ad-781e-4985-bb35-397be675b4b7.png)


## Structure
```mermaid
flowchart LR
    Views[Island] --> Call(Call)
    Views[Island] --> Play(Play)
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

    Play --> PA{{Play Voicemail}} --- 6PComp>Play Component]
    Play --> PR{{Play Registration}} --- 6PComp>Play Component]

    Chat --> CS{{Single Chat}} --- 7CComp>Chat Component]
    Chat --> CG{{Group Chat}} --- 7CComp>Chat Component]
```

## Builds
Available as component on `npm`

[![alt text](https://img.shields.io/npm/dw/@nethesis/phone-island?label=npm&color=red&style=for-the-badge)](https://www.npmjs.com/package/@nethesis/phone-island)

Available as widget on `jsDelivr`

[![alt_text](https://img.shields.io/jsdelivr/gh/hw/nethesis/phone-island?label=jsdelivr-js&style=for-the-badge)](https://cdn.jsdelivr.net/gh/nethesis/phone-island/dist-widget/index.widget.js)
[![alt_text](https://img.shields.io/jsdelivr/gh/hw/nethesis/phone-island?label=jsdelivr-css&color=blue&style=for-the-badge)](https://cdn.jsdelivr.net/gh/nethesis/phone-island/dist-widget/index.widget.css)

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
npm run dev
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

Link the ```./dist``` directory

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
