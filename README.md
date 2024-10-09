This is a new [**React Native**](https://reactnative.dev) project. Linking to both the Stream Overlay FE and Express App BE. These can be found [here](https://github.com/yourlocaldeveloper/thelocalgame)


# thelocalgame_live_app

This is the heart of the RFID table. This handles the entire logic and game flow. This is a React Native app that utilizes Socket.io and RESTful APIs to control the stream output.

This handles the game logic and stores the state it is in.

Learn more about this project on my [website][https://www.yourlocaldev.com/projects/rfid]

## Notible files:

[HandProgress.tsx](https://github.com/yourlocaldeveloper/thelocalgame_live_app/blob/develop/components/molecules/HandProgress/HandProgress.tsx)

This is one of the most important files in the app. It is a component that handles user input to handle the game. This is a very messy file. I am currently trying to trim it down and refactor it. I've moved a bunch of functions into the [helper file](https://github.com/yourlocaldeveloper/thelocalgame_live_app/blob/develop/components/molecules/HandProgress/HandProgress.helpers.ts) to improve the code splitting.

# Getting Started

>**Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.
