import { Profile, ProviderDetails, ServiceRequest } from "@/lib/types/database";

export type ProviderDashboardData = { profile: Profile; details: ProviderDetails };
export type RequestWithCustomer = ServiceRequest & { customerName: string };
