export interface ImageCreate {
  url: string;
  image_id?: string;
  position?: number;
}

export interface CarCreateRequest {
  name: string;
  marka_id?: number;
  model_id?: number;
  bin?: string;
  release_year?: number;
  is_top?: boolean;
  description?: string;
  images?: ImageCreate[];
  // Additional fields used in the frontend form that might map to backend fields
  category_id?: number;
  transmission_id?: number;
  fuel_type_id?: number;
  color_id?: number;
  city_id?: number;
  engine_volume?: number | string;
  price_per_day?: number;
  transport_number?: string;
  motor_number?: string;
  body_number?: string;
  tech_passport_number?: string;
  tech_passport_date?: string;
}

export interface ImageResponse {
  id: number;
  url: string;
  image_id?: string;
  position: number;
}

export interface CarResponse {
  id: number;
  name: string;
  marka_id?: number;
  model_id?: number;
  release_year?: number;
  is_top: boolean;
  author_id: number;
  status: string;
  create_date: string;
  update_date?: string | null;
  description?: string;
  images: ImageResponse[];
  // Include other fields returned by backend that might be dynamically included or joined
  category_id?: number;
  category?: string;
  city?: string;
  city_id?: number;
  price_per_day?: number;
  transmission?: string;
  body_type?: string;
  engine_volume?: string | number;
  mileage?: number | string;
  condition?: string;
  condition_id?: number;
  color?: string;
  fuel_type?: string;
  steering?: string;
  steering_id?: number;
  car_class?: string;
  car_class_id?: number;
  mark?: string;
  vehicle_mark_id?: number;
  model?: string;
  vehicle_model_id?: number;

  additional_info?: string;
  author?: {
    name?: string;
    address?: string;
    phone_number?: string;
  };
}
