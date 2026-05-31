require("dotenv").config();

const appJson = require("./app.json");

const androidAdMobAppId =
  process.env.ADMOB_APP_ID || "ca-app-pub-4185040274135926~2042240790";

module.exports = {
  ...appJson.expo,
  plugins: [
    ...(appJson.expo.plugins || []),
    [
      "react-native-google-mobile-ads",
      {
        androidAppId: androidAdMobAppId,
        iosAppId:
          process.env.ADMOB_IOS_APP_ID ||
          "ca-app-pub-3940256099942544~1458002511",
      },
    ],
  ],
};
