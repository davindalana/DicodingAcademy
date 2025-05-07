const API_CONFIG = {
  BASE_URL: "https://story-api.dicoding.dev/v1",
  ENDPOINTS: {
    REGISTER: "/register",
    LOGIN: "/login",
    STORIES: "/stories",
    GUEST_STORY: "/stories/guest",
    NOTIFICATIONS_SUBSCRIBE: "/notifications/subscribe",
  },
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
  },
  MAP: {
    DEFAULT_CENTER: [-7.983908, 112.621391],
    DEFAULT_ZOOM: 10,
    TILE_LAYER: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    ATTRIBUTION:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  WEB_PUSH: {
    VAPID_PUBLIC_KEY:
      "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk",
  },
};

export default API_CONFIG;
