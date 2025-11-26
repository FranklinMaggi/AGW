export function createDefaultUser(id) {
  return {
    id,
    nickname: "",
    firstname: "",
    lastname: "",
    email: "",
    profile_image: null,
    avatar_ai: null,

    password_reset: {
      token: null,
      expires_at: null
    },

    mailing: {
      primary: "",
      secondary: null,
      verified: false,
      verification_sent_at: null,
      verified_at: null,
      preferences: {
        newsletter: true,
        missions: true,
        rewards: true,
        billing: true,
        security: true
      },
      status: {
        bounced: false,
        soft_bounce_count: 0,
        hard_bounce: false,
        unsubscribe: false,
        unsubscribe_at: null
      },
      log: []
    },

    personal: {
      birthdate: null,
      weight: null,
      height: null,
      gender: null,
      job: null
    },

    status: {
      suspended: false,
      createdAt: Date.now()
    },

    stats: {
      level_total: 1,
      level_year: 1,

      rank_month: 0,
      motivation_week: 0,
      assessment_day: 0,

      krm_total: 0,
      krm_year: 0,
      krm_month: 0,
      krm_week: 0,
      krm_day: 0,

      missions_completed_total: 0,
      missions_completed_month: 0,
      missions_completed_week: 0,
      missions_completed_today: 0,

      dayPurchasesLast7Days: 0
    },

    discipline: {
      daily_completed: 0,
      daily_goal: 3,
      weekly_completed: 0,
      weekly_goal: 7
    },

    subscription: {
      type: null,
      renew_every: null,
      last_payment_at: null,
      payment_status: null,
      expires_at: null
    },

    bonus: null
  };
}
