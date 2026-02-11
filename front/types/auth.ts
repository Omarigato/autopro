export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface OwnerRegisterRequest {
  name: string;
  phone_number: string;
  login: string;
  password: string;
}

export interface OwnerLoginRequest {
  login: string;
  password: string;
}

export interface UserResponse {
  id: number;
  name: string;
  phone_number: string;
  role: "owner" | "admin";
  create_date: string; // ISO date string
}
