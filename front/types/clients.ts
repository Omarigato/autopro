export interface ClientCreateRequest {
  name: string;
  age?: number;
  phone_number: string;
  car_id: number;
}

export interface ClientResponse {
  id: number;
  name: string;
  age?: number;
  phone_number: string;
  create_date: string;
}

export interface WhatsAppContactResponse {
  client: ClientResponse;
  whatsapp_url: string;
}
