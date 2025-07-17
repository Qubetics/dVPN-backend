// Error messages for api
export const ERR = {
  INTERNAL: "Internal server error",
};

// Status codes
export const STATUS_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NOCONTENT: 204,
  BADREQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOTFOUND: 404,
  TIMEOUT: 408,
  ALREADYEXIST: 409,
  TOOMANYREQ: 429,
  INTERNALSERVER: 500,
  BADGATEWAYS: 502,
  SERVICEUNAVILABLE: 503,
  GATEWAYTIMEOUT: 504,
  UNPROCESSABLE: 422,
};

// DB data models
export const DATA_MODELS = {
  User: "User",
  Node: "Node",
  Plans: "Plans",
  Subscriptions: "Subscriptions",
  Sessions: "Sessions",
  UserSession: "UserSession"
};

// Response messages
export const RESPONSE_MESSAGES = {
  PROVIDER_ADDRESS_NOT_FOUND: "Provider address is not found",
  NODE_ADDRESS_NOT_FOUND: "Node address is not found",
  BADREQUEST: "Missing required header",
  INVALID_TOKEN: "Invalid token",
  INTERNAL_SERVER_ERROR: "Internal Server Error.",
  NOT_FOUND: "Not Found!",
  PLAN_NOT_FOUND: "Plan not found!",
  SAVEDATA: "Save Successfully",
  DISPUTE: "Dispute already raised",
  USERALREADY: "User already exists",
  USER_NOT_FOUND: "Not found!",
  LOGOUT: "Logout Successfull",
  ADMINNOTFOUND: "Invalid Admin Address",
  LOGIN: "Login success",
  SIGNUP: "Signup success",
  FETCH_DATA_SUCCESS: "Fetch data successfully",
  FETCH_USER_SUCCESS: "Fetch user data successfully",
  FETCH_EVENTSDATA_SUCCESS: "Fetch events successfully",
  UPDATED_SUCCESS: "Updated Successfully.",
  EVENTCREATE: "Event create successfully.",
  NOT_VALID_QUERY: "Query is not Valid!",
  INVALID_ID: "Id is not valid!",
  INVALID_NAME: "Name is not valid",
  UNAUTHORIZED: "Unauthorized!",
  ROUTE_404: "Route not found.",
  Max_LIMIT: "Invalid page limit (defaults to 10, maximum is 40)",
  USERNAME_EXIST: "Username already exists",
  API_SERVICE: "API Service is up",
  INVALID_CREDENTIALS: "Invalid Credentials!",
  NODE_NOT_FOUND:"No Node Server Available."
};

export const UNDEFINED = "undefined";
export const USER = "user";
