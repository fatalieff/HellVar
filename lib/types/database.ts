export type ProfileRole = 'CUSTOMER' | 'PROVIDER';
export type ProfileStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ServiceRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';

export type Profile = {
  id: string; // matches auth.users.id
  first_name: string;
  last_name: string;
  phone: string;
  role: ProfileRole;
  address?: string | null;
};

export type ProviderDetails = {
  user_id: string; // matches profiles.id / auth.users.id
  category: string;
  working_radius_km: number;
  documents_uploaded: boolean;
  profile_status: ProfileStatus;
  rating?: number | null;
  hourly_rate?: number | null;
  is_online: boolean;
};

export type ServiceRequest = {
  id: string;
  customer_id: string;
  provider_id?: string | null;
  category: string;
  description: string;
  photo_url?: string | null;
  budget: number;
  distance_km?: number | null;
  status: ServiceRequestStatus;
  created_at: string;
  updated_at: string;
};

export type ProviderWithProfile = ProviderDetails & {
  profiles: Profile | null;
};

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Profile;
        Update: Partial<Profile>;
        Relationships: [];
      };
      provider_details: {
        Row: ProviderDetails;
        Insert: ProviderDetails;
        Update: Partial<ProviderDetails>;
        Relationships: [];
      };
      service_requests: {
        Row: ServiceRequest;
        Insert: Omit<ServiceRequest, 'id' | 'created_at' | 'updated_at' | 'status'> & {
          id?: string;
          status?: ServiceRequestStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<ServiceRequest>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
