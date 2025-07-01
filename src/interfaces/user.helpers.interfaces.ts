interface ApiResponse {
    error?: boolean;
    data?: any;
    message?: string;
    status?: number;
    token?: string;
  }
  interface DecodedToken {
    wallet_address: string;
  }
  interface UploadResponse {
    error: boolean;
    data?: any;
    message: string;
    status?: number;
  }
  interface AccessTokenPayload {
    access_uuid?: string;
    refresh_uuid?: string;
    wallet_address: string;
  }
  

  
  export { ApiResponse, DecodedToken,UploadResponse,AccessTokenPayload };
  