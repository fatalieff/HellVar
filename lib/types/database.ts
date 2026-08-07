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
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ProviderDetails = {
  user_id: string; // matches profiles.id / auth.users.id
  category: string;
  working_radius_km: number;
  documents_uploaded: boolean;
  profile_status: ProfileStatus;
  rating?: number | null;
  hourly_rate?: number | null;
  bio?: string | null;
  years_experience?: number | null;
  completed_jobs?: number | null;
  is_online: boolean;
};

export type ProviderReview = {
  id: string;
  provider_id: string;
  customer_id: string;
  rating: number;
  comment?: string | null;
  created_at: string;
  updated_at: string;
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

export type ChatConversation = {
  id: string;
  participant_low: string;
  participant_high: string;
  last_message_at: string;
  created_at: string;
};

export type ChatMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type NotificationType = 'new_message' | 'new_review' | 'review_reply' | 'system';

export type Notification = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  related_id?: string | null;
  is_read: boolean;
  created_at: string;
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
      provider_reviews: {
        Row: ProviderReview;
        Insert: Omit<ProviderReview, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Pick<ProviderReview, 'rating' | 'comment' | 'updated_at'>>;
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
      chat_conversations: {
        Row: ChatConversation;
        Insert: Omit<ChatConversation, 'id' | 'created_at' | 'last_message_at'> & { id?: string; created_at?: string; last_message_at?: string };
        Update: Partial<ChatConversation>;
        Relationships: [];
      };
      chat_messages: {
        Row: ChatMessage;
        Insert: Omit<ChatMessage, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: never;
        Relationships: [];
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at' | 'is_read'> & { id?: string; created_at?: string; is_read?: boolean };
        Update: Partial<Pick<Notification, 'is_read'>>;
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
