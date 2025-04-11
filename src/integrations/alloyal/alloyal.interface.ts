export class CreateGuestUserDto {
  cpf: string;
  name: string;
  email?: string;
  phone?: string;
}

export class GetOrUpdateGuestUserDto {
  userId: number;
  payload?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export class GetOrUpdateUserDto {
  cpf: string;
  payload?: {
    name?: string;
    email?: string;
    cellphone?: string;
  };
}

export class CreateSmartLinkDto {
  cpf: string;
  redirectTo?: string;
}

export class TokenResponseDto {
  id: string;
  role: string;
  email: string;
  auth_token: string;
  businesses: { id: string; active: boolean; cnpj: string; name: string }[];
}

export class GuestUserResponseDto {
  id: number;
  phone: any;
  name: string;
  email: string;
  tags: string[];
  active: boolean;
  user_tags: any[];
  created_at: string;
  updated_at: string;
  activated_at: string;
  custom_field_1: string;
  taxpayer_number: string;
}

export class UserResponseDto {
  id: number;
  cpf: string;
  tags: any[];
  name: string;
  email: string;
  user_tags: any;
  wallet: Wallet;
  active: boolean;
  cellphone: string;
  business_id: number;
  custom_field_1: any;
  custom_field_2: any;
  custom_field_3: any;
  custom_field_4: any;
  custom_field_5: any;
  custom_field_6: any;
  custom_field_7: any;
  custom_field_8: any;
  activated_at: string;
  telemedicine: boolean;
  default_auth_flow: boolean;
}

interface Wallet {
  balance: number;
}

export class CreateSmartLinkResponseDto {
  smart_token: string;
  web_smart_link: string;
  app_smart_link: string;
}
