export interface ReviewCreateRequest {
  car_id: number;
  car_owner_id: number;
  user_id?: number;
  rating: number; // 1-5
  comment?: string;
}

export interface ReviewResponse {
  id: number;
  car_id: number;
  car_owner_id: number;
  user_id?: number;
  rating: number;
  comment?: string;
  create_date: string;
}
