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
  UserSession: "UserSession",
  PlanPurchase: "PlanPurchase",
  Providers: "Providers"
};

// Response messages
export const RESPONSE_MESSAGES = {
  PROVIDER_LIST_FETCH_SUCESSFULLY:"provider list is successfully fetched",
  PLAN_ID_IS_NOT_PRESENT:"You need to purchase the plan first",
  PLAN_ID_FETCH:"Plan Id fetch successfully",
  PLAN_ID_SUCCESS:"Plan ID saved successfully",
  PLAN_ID_NOT_FOUND:"Plan ID not found in transaction message",
  NO_MESSAGE:"No messages found in transaction",
  FAILED_TRANSACTION: "Invalid transaction or failed transaction",
  PLAN_FETCH_SUCCESS:"Plans fetched successfully",
  NODE_DETAIL_FOUND:"Node details fetched successfully",
  NO_NODE_FOUND: "No nodes found for this planId",
  PLAN_NOT_FOUND: "No plan found for this address",
  SUCCESS_NEW_TOKEN: "New Token generated successfully",
  BADREQUEST: "Missing required header",
  INVALID_TOKEN: "Invalid token",
  INTERNAL_SERVER_ERROR: "Internal Server Error.",
  NOT_FOUND: "Not Found!",
  USER_NOT_FOUND: "User Not found",
  LOGOUT: "Logout Successful",
  LOGIN: "Login success",
  FETCH_DATA_SUCCESS: "Fetch data successfully",
  UNAUTHORIZED: "Unauthorized",
  ROUTE_404: "Route not found",
  API_SERVICE: "API Service is up",
  INVALID_CREDENTIALS: "Invalid Credentials!",
  NODE_NOT_FOUND: "No Node Server Available",
  APP_VERSION_SUCCESSFULLY_FETCH: "Application version successfully fetched",
  CHAIN_URL_SUCCESSFULLY_FETCH: "Chain URL successfully fetched",
  APP_VERSION_IS_MISSING: "App version not found",
  CHAIN_URL_IS_MISSING: "Chain URL not found",
  BASE_SUCCESS_MESSAGE: "Success",
  BASE_ERROR_MESSAGE: "Failed",
};

export const SESSION_ATTRIBUTES = ['subscription_id','start_at', 'status_at', 'status'];

export const NODE_ATTRIBUTES = ['flag_url', 'city', 'country', 'remote_url', 'address'];

export const NODE_LIST_ATTRIBUTES = [
  'address',
  'country',
  'city',
  'node_status',
  'gigabyte_prices',
  'hourly_prices',
  'remote_url',
  'lat',
  'long',
  'flag_url',
  'createdAt',
  'updatedAt',
  'status_updated_at',
  'inactive_at',
  'protocol'
];

export const UNDEFINED = "undefined";
export const ACTIVE = "active";
export const INACTIVE = "inactive";
export const USER = "user";
