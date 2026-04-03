const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const WEBSITE_URL = process.env.EXPO_PUBLIC_WEBSITE_URL;

if (!API_BASE_URL || !WEBSITE_URL) {
  throw new Error(
    "Missing required environment variables: EXPO_PUBLIC_API_BASE_URL and EXPO_PUBLIC_WEBSITE_URL must be set."
  );
}

const ApiConstants = {
  BASE_URL: API_BASE_URL,
  WEBSITE_URL: WEBSITE_URL,
  LOGIN_URL: `${API_BASE_URL}/auth/login`,
  REGISTER_URL: `${API_BASE_URL}/auth/signup`,
  USERS_URL: `${API_BASE_URL}/userinfo`,
  NEW_ALERT: `${API_BASE_URL}/alert/new`,
  SEND_AUDIO: `${API_BASE_URL}/alert/sendaudio`,
  SEND_IMAGE: `${API_BASE_URL}/alert/sendimage`,
  SEND_LOCATION: `${API_BASE_URL}/alert/sendlocation`,
  SEND_PUSH_LOCATION: `${API_BASE_URL}/location/pushlocation`,
  NEARBY_USERS: `${API_BASE_URL}/location/nearbyuser`,
  USER_INFO: `${API_BASE_URL}/user/info`,
  UPDATE_USER_INFO: `${API_BASE_URL}/user/update`,
  CHANGE_PASSWORD: `${API_BASE_URL}/user/changepass`,
};

export default ApiConstants;
