module.exports = {
  presets: ["babel-preset-expo", "@babel/preset-typescript"],
  plugins: [
    "react-native-reanimated/plugin", // 👈 Required for Reanimated v2 (used by Drawer and other navigators)
  ],
};
