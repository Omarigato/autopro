export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface OwnerRegisterRequest {
  name: string;
  phone_number: string;
  email?: string | null;
  password: string;
}

export interface OwnerLoginRequest {
  login: string;
  password?: string;
  otp_code?: string;
}

export interface UserResponse {
  id: number;
  name: string;
  phone_number: string;
  role: "client" | "admin";
  create_date: string; // ISO date string
  email?: string;
  avatar_url?: string;
  city_id?: number;
  notify_by_email?: boolean;
  notify_by_whatsapp?: boolean;
}
