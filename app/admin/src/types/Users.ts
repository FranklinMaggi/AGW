export interface User {
    id: string;
    index: number;
  
    nickname: string;
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    phone: string | null;
  
    profile_image: string | null;
    avatar_ai: string | null;
  
    mailing: {
      primary: string;
      secondary: string | null;
      verified: boolean;
      verification_sent_at: number | null;
      verified_at: number | null;
      preferences: {
        newsletter: boolean;
        missions: boolean;
        rewards: boolean;
        billing: boolean;
        security: boolean;
      };
      status: {
        bounced: boolean;
        soft_bounce_count: number;
        hard_bounce: boolean;
        unsubscribe: boolean;
        unsubscribe_at: number | null;
      };
      log: any[];
    };
  
    personal: {
      birthdate: string | null;
      weight: number | null;
      height: number | null;
      gender: string | null;
      job: string | null;
    };
  
    status: {
      suspended: boolean;
      createdAt: number;
    };
  
    stats: {
      level_total: number;
      level_year: number;
      rank_month: number;
      motivation_week: number;
      assessment_day: number;
  
      krm_total: number;
      krm_year: number;
      krm_month: number;
      krm_week: number;
      krm_day: number;
  
      missions_completed_total: number;
      missions_completed_month: number;
      missions_completed_week: number;
      missions_completed_today: number;
    };
  
    discipline: {
      daily_completed: number;
      daily_goal: number;
      weekly_completed: number;
      weekly_goal: number;
    };
  
    subscription: {
      type: string | null;
      renew_every: number;
      last_payment_at: number | null;
      payment_status: "green" | "orange" | "red" | null;
      expires_at: number | null;
    };
  
    bonus: {
      award: string | null;
      expiresAt: number | null;
      days?: number;
    } | null;
  
    missions: {
      status: "approved" | "pending" | "rejected";
      [k: string]: any;
    }[];
  
    delta7?: number;
  }
  