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
  bin?: string;
  release_year?: number;
  is_top: boolean;
  author_id: int;
  is_active: bool;
  create_date: string;
  description?: string;
  images: ImageResponse[];
  // Include other fields returned by backend that might be dynamically included or joined
  category_id?: number;
  city?: string; // Often joined in response
  price_per_day?: number;
  transmission?: string;
}
