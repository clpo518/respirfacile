import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } =
      await anonClient.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;
    const adminIds = (Deno.env.get("ADMIN_USER_IDS") || "")
      .split(",")
      .map((id: string) => id.trim())
      .filter((id: string) => id.length > 0);

    if (!adminIds.includes(userId)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let rangeDays = 30;
    try {
      const body = await req.json().catch(() => null);
      if (body?.rangeDays && typeof body.rangeDays === "number" && body.rangeDays > 0 && body.rangeDays <= 365) {
        rangeDays = body.rangeDays;
      }
    } catch { /* default */ }

    const TEST_ACCOUNT_IDS = [...adminIds, "e4408ab6-cbbb-46df-9d61-80dedebcff91"];
    const now = new Date();

    const [
      profilesRes,
      sessionsRes,
      activeRes,
      signupsRes,
      dailySessionsRes,
    ] = await Promise.all([
      supabase.from("profiles").select("id, full_name, is_therapist, linked_therapist_id, subscription_status, subscription_plan, trial_start_date, trial_end_date, created_at, stripe_customer_id, last_activity_date, onboarding_completed_at"),
      supabase.from("sessions").select("id, user_id, duration_seconds, avg_wpm, exercise_type, recording_url, created_at"),
      supabase.from("profiles").select("id").gte("last_activity_date", new Date(Date.now() - 7 * 86400000).toISOString()),
      supabase.from("profiles").select("id, created_at").order("created_at", { ascending: true }),
      supabase.from("sessions").select("id, created_at").gte("created_at", new Date(Date.now() - Math.min(rangeDays, 30) * 86400000).toISOString()),
    ]);

    const profiles = (profilesRes.data || []).filter((p) => !TEST_ACCOUNT_IDS.includes(p.id));
    const sessions = (sessionsRes.data || []).filter((s) => !TEST_ACCOUNT_IDS.includes(s.user_id));
    const activeUsers = (activeRes.data || []).filter((u) => !TEST_ACCOUNT_IDS.includes(u.id));
    const allSignups = (signupsRes.data || []).filter((u) => !TEST_ACCOUNT_IDS.includes(u.id));
    const recentSessions = dailySessionsRes.data || [];

    // ── Base KPIs ──
    const totalUsers = profiles.length;
    const therapists = profiles.filter((p) => p.is_therapist).length;
    const patients = profiles.filter((p) => !p.is_therapist).length;
    const linkedPatients = profiles.filter((p) => p.linked_therapist_id).length;
    const activeCount = activeUsers.length;
    const totalSessions = sessions.length;
    const avgDuration = totalSessions > 0 ? Math.round(sessions.reduce((s, x) => s + x.duration_seconds, 0) / totalSessions) : 0;
    const avgWpm = totalSessions > 0 ? Math.round(sessions.reduce((s, x) => s + x.avg_wpm, 0) / totalSessions) : 0;
    const withRecording = sessions.filter((s) => s.recording_url).length;
    const recordingRate = totalSessions > 0 ? Math.round((withRecording / totalSessions) * 100) : 0;

    // ── Signups per week (12 weeks) ──
    const weeklySignups: { week: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const start = new Date(Date.now() - (i + 1) * 7 * 86400000);
      const end = new Date(Date.now() - i * 7 * 86400000);
      const count = allSignups.filter((p) => { const d = new Date(p.created_at); return d >= start && d < end; }).length;
      weeklySignups.push({ week: `${start.getDate()}/${start.getMonth() + 1}`, count });
    }

    // ── Sessions per day ──
    const dailySessions: { day: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - i);
      const end = new Date(start); end.setDate(end.getDate() + 1);
      const count = recentSessions.filter((s) => { const d = new Date(s.created_at); return d >= start && d < end; }).length;
      dailySessions.push({ day: `${start.getDate()}/${start.getMonth() + 1}`, count });
    }

    // ── Exercise breakdown ──
    const exerciseMap: Record<string, number> = {};
    for (const s of sessions) { const t = s.exercise_type || "reading"; exerciseMap[t] = (exerciseMap[t] || 0) + 1; }
    const exerciseBreakdown = Object.entries(exerciseMap).map(([name, value]) => ({ name, value }));

    // ── Subscription breakdown ──
    const subMap: Record<string, number> = {};
    for (const p of profiles) { const s = p.subscription_status || "none"; subMap[s] = (subMap[s] || 0) + 1; }
    const subscriptionBreakdown = Object.entries(subMap).map(([status, count]) => ({ status, count }));

    // ── New signups this week ──
    const weekStart = new Date(); weekStart.setHours(0, 0, 0, 0);
    const dow = weekStart.getDay(); weekStart.setDate(weekStart.getDate() - (dow === 0 ? 6 : dow - 1));
    const newThisWeek = profiles.filter((p) => new Date(p.created_at) >= weekStart);
    const newTherapistsThisWeek = newThisWeek.filter((p) => p.is_therapist).length;
    const newPatientsThisWeek = newThisWeek.filter((p) => !p.is_therapist).length;

    // ── Subscription lists ──
    const in7days = new Date(Date.now() + 7 * 86400000);
    // Fetch emails from auth.users for paying/canceled users
    const authUsersRes = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const emailMap: Record<string, string> = {};
    for (const u of authUsersRes.data?.users || []) { emailMap[u.id] = u.email || "—"; }

    const PLAN_PRICES_LOOKUP: Record<string, number> = { starter_3: 14.90, essentiel: 14.90, pro_5: 19.90, expert: 19.90, premium_10: 29.90, premium: 29.90, monthly: 9.90, yearly: 79.00 / 12, trial: 0 };

    const payingUsers = profiles.filter((p) => p.subscription_status === "active").map((p) => {
      const patientCount = profiles.filter((pt) => pt.linked_therapist_id === p.id).length;
      const patientSessions = sessions.filter((s) => profiles.some((pt) => pt.linked_therapist_id === p.id && pt.id === s.user_id)).length;
      return {
        id: p.id, name: p.full_name || "Sans nom", email: emailMap[p.id] || "—",
        plan: p.subscription_plan || "—", isTherapist: p.is_therapist,
        stripeCustomerId: p.stripe_customer_id || null,
        patientCount, patientSessions,
        mrr: PLAN_PRICES_LOOKUP[p.subscription_plan || ""] || 0,
        createdAt: p.created_at,
      };
    }).sort((a, b) => b.mrr - a.mrr);

    const canceledUsers = profiles.filter((p) => p.subscription_status === "canceled").map((p) => ({
      id: p.id, name: p.full_name || "Sans nom", email: emailMap[p.id] || "—",
      plan: p.subscription_plan || "—", isTherapist: p.is_therapist,
      stripeCustomerId: p.stripe_customer_id || null,
      createdAt: p.created_at,
    }));

    const expiringTrials = profiles.filter((p) => {
      if (p.subscription_plan !== "trial" && p.subscription_status !== "trial") return false;
      const endDate = p.trial_end_date ? new Date(p.trial_end_date) : p.trial_start_date ? new Date(new Date(p.trial_start_date).getTime() + 30 * 86400000) : null;
      return endDate ? endDate > now && endDate <= in7days : false;
    }).map((p) => {
      const endDate = p.trial_end_date ? new Date(p.trial_end_date) : new Date(new Date(p.trial_start_date!).getTime() + 30 * 86400000);
      return { id: p.id, name: p.full_name || "Sans nom", isTherapist: p.is_therapist, daysLeft: Math.ceil((endDate.getTime() - now.getTime()) / 86400000), endDate: endDate.toISOString() };
    }).sort((a, b) => a.daysLeft - b.daysLeft);

    const totalTrials = profiles.filter((p) => p.subscription_plan === "trial" || p.subscription_status === "trial").length;

    // ── Deepgram costs ──
    const DEEPGRAM_COST_PER_MIN = 0.0043;
    const totalMinutesAll = sessions.reduce((s, x) => s + x.duration_seconds, 0) / 60;
    const deepgramCostTotal = totalMinutesAll * DEEPGRAM_COST_PER_MIN;

    const costByExercise: Record<string, { minutes: number; cost: number; sessions: number }> = {};
    for (const s of sessions) {
      const t = s.exercise_type || "reading";
      if (!costByExercise[t]) costByExercise[t] = { minutes: 0, cost: 0, sessions: 0 };
      const mins = s.duration_seconds / 60;
      costByExercise[t].minutes += mins; costByExercise[t].cost += mins * DEEPGRAM_COST_PER_MIN; costByExercise[t].sessions += 1;
    }
    const deepgramByExercise = Object.entries(costByExercise).map(([type, d]) => ({ type, minutes: Math.round(d.minutes), cost: Number(d.cost.toFixed(2)), sessions: d.sessions })).sort((a, b) => b.cost - a.cost);

    const sessionsThisWeekArr = sessions.filter((s) => new Date(s.created_at) >= weekStart);
    const deepgramCostThisWeek = (sessionsThisWeekArr.reduce((s, x) => s + x.duration_seconds, 0) / 60) * DEEPGRAM_COST_PER_MIN;
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    const deepgramCostThisMonth = (sessions.filter((s) => new Date(s.created_at) >= monthStart).reduce((s, x) => s + x.duration_seconds, 0) / 60) * DEEPGRAM_COST_PER_MIN;

    const deepgramStats = {
      totalMinutes: Math.round(totalMinutesAll), costTotal: Number(deepgramCostTotal.toFixed(2)),
      costThisWeek: Number(deepgramCostThisWeek.toFixed(2)), costThisMonth: Number(deepgramCostThisMonth.toFixed(2)),
      avgPerSession: totalSessions > 0 ? Number((deepgramCostTotal / totalSessions).toFixed(4)) : 0,
      byExercise: deepgramByExercise, ratePerMin: DEEPGRAM_COST_PER_MIN,
    };

    // ── Emails lookup ──
    let therapistEmails: Record<string, string> = {};
    const allTherapistIds = profiles.filter((p) => p.is_therapist).map((p) => p.id);
    if (allTherapistIds.length > 0) {
      const { data: authUsers } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      if (authUsers?.users) {
        for (const u of authUsers.users) {
          if (allTherapistIds.includes(u.id)) therapistEmails[u.id] = u.email || "";
        }
      }
    }

    // ── Unpaid therapists ──
    const unpaidTherapistList = profiles.filter((p) => p.is_therapist && p.subscription_status !== "active").map((t) => {
      const trialEnd = t.trial_end_date ? new Date(t.trial_end_date) : null;
      const trialStart = t.trial_start_date ? new Date(t.trial_start_date) : null;
      const isExpired = trialEnd ? trialEnd <= now : trialStart ? (now.getTime() - trialStart.getTime()) / 86400000 >= 30 : true;
      return { id: t.id, name: t.full_name || "Sans nom", email: therapistEmails[t.id] || "—", plan: t.subscription_plan || "trial", subscriptionStatus: t.subscription_status || "none", trialExpired: isExpired, trialEndDate: t.trial_end_date || null, createdAt: t.created_at, patientCount: profiles.filter((p) => p.linked_therapist_id === t.id).length };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // ── Therapist-Patient map ──
    const therapistPatientMap = profiles.filter((p) => p.is_therapist).map((t) => {
      const pts = profiles.filter((p) => p.linked_therapist_id === t.id);
      return { id: t.id, name: t.full_name || "Sans nom", patientCount: pts.length, patients: pts.map((p) => ({ id: p.id, name: p.full_name || "Sans nom" })), subscriptionStatus: t.subscription_status || "none", plan: t.subscription_plan || "trial" };
    }).sort((a, b) => b.patientCount - a.patientCount);

    // ── Revenue / MRR ──
    const PLAN_PRICES: Record<string, number> = { starter_3: 14.90, essentiel: 14.90, pro_5: 19.90, expert: 19.90, premium_10: 29.90, premium: 29.90, monthly: 9.90, yearly: 79.00 / 12, trial: 0 };
    const activeSubscribers = profiles.filter((p) => p.subscription_status === "active");
    const mrr = activeSubscribers.reduce((sum, p) => sum + (PLAN_PRICES[p.subscription_plan || ""] || 0), 0);

    const revenueByPlan: Record<string, { count: number; mrr: number }> = {};
    for (const p of activeSubscribers) {
      const plan = p.subscription_plan || "unknown";
      if (!revenueByPlan[plan]) revenueByPlan[plan] = { count: 0, mrr: 0 };
      revenueByPlan[plan].count += 1; revenueByPlan[plan].mrr += PLAN_PRICES[plan] || 0;
    }
    const revenueBreakdown = Object.entries(revenueByPlan).map(([plan, d]) => ({ plan, count: d.count, mrr: Number(d.mrr.toFixed(2)) })).sort((a, b) => b.mrr - a.mrr);

    const revenueStats = { mrr: Number(mrr.toFixed(2)), arr: Number((mrr * 12).toFixed(2)), activeSubscribers: activeSubscribers.length, revenueBreakdown, churnedCount: canceledUsers.length, planPrices: PLAN_PRICES };

    // ══════════════════════════════════════════════════════════
    // ══ NEW: MRR MOVEMENTS (approximated from current data) ══
    // ══════════════════════════════════════════════════════════
    // We estimate by looking at subscription changes vs creation dates
    const rangeStartDate = new Date(Date.now() - rangeDays * 86400000);

    // New MRR: users who became active during the range
    const newMrrUsers = activeSubscribers.filter((p) => {
      // Approximation: if created_at is within range or trial_end_date (conversion point) is within range
      const created = new Date(p.created_at);
      return created >= rangeStartDate;
    });
    const newMrr = newMrrUsers.reduce((s, p) => s + (PLAN_PRICES[p.subscription_plan || ""] || 0), 0);

    // Churned MRR: users who canceled during the range
    const churnedMrrUsers = profiles.filter((p) => {
      if (p.subscription_status !== "canceled") return false;
      // Approximation: use last_activity_date or trial_end_date
      const lastAct = p.last_activity_date ? new Date(p.last_activity_date) : null;
      return lastAct ? lastAct >= rangeStartDate : false;
    });
    const churnedMrr = churnedMrrUsers.reduce((s, p) => s + (PLAN_PRICES[p.subscription_plan || ""] || 0), 0);

    // Existing MRR (subscribers from before the range)
    const existingMrrUsers = activeSubscribers.filter((p) => new Date(p.created_at) < rangeStartDate);
    const existingMrr = existingMrrUsers.reduce((s, p) => s + (PLAN_PRICES[p.subscription_plan || ""] || 0), 0);

    const mrrMovements = {
      existing: Number(existingMrr.toFixed(2)),
      new: Number(newMrr.toFixed(2)),
      churned: Number(churnedMrr.toFixed(2)),
      net: Number((newMrr - churnedMrr).toFixed(2)),
    };

    // ══════════════════════════════════════════════════════════
    // ══ NEW: HEALTH SCORE per therapist ══════════════════════
    // ══════════════════════════════════════════════════════════
    const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

    // Pre-compute sessions by user for efficiency
    const sessionsByUser: Record<string, typeof sessions> = {};
    for (const s of sessions) {
      if (!sessionsByUser[s.user_id]) sessionsByUser[s.user_id] = [];
      sessionsByUser[s.user_id].push(s);
    }

    const recentSessionsByUser: Record<string, number> = {};
    for (const s of sessions) {
      if (new Date(s.created_at) >= fourteenDaysAgo) {
        recentSessionsByUser[s.user_id] = (recentSessionsByUser[s.user_id] || 0) + 1;
      }
    }

    const healthScores = profiles.filter((p) => p.is_therapist).map((t) => {
      const patientIds = profiles.filter((pt) => pt.linked_therapist_id === t.id).map((pt) => pt.id);
      const patientCount = patientIds.length;

      // Recent patient sessions (14 days)
      const recentPatientSessions = patientIds.reduce((sum, pid) => sum + (recentSessionsByUser[pid] || 0), 0);

      // Total patient sessions (all time)
      const totalPatientSessions = patientIds.reduce((sum, pid) => sum + (sessionsByUser[pid]?.length || 0), 0);

      // Last activity
      const lastAct = t.last_activity_date ? new Date(t.last_activity_date) : null;
      const daysSinceActivity = lastAct ? Math.floor((now.getTime() - lastAct.getTime()) / 86400000) : 999;

      // Trend: compare last 14d sessions vs previous 14d
      const prev14 = new Date(Date.now() - 28 * 86400000);
      const recentCount = patientIds.reduce((sum, pid) => {
        return sum + (sessionsByUser[pid]?.filter((s) => new Date(s.created_at) >= fourteenDaysAgo).length || 0);
      }, 0);
      const prevCount = patientIds.reduce((sum, pid) => {
        return sum + (sessionsByUser[pid]?.filter((s) => {
          const d = new Date(s.created_at);
          return d >= prev14 && d < fourteenDaysAgo;
        }).length || 0);
      }, 0);
      const trend = prevCount > 0 ? Math.round(((recentCount - prevCount) / prevCount) * 100) : recentCount > 0 ? 100 : 0;

      // Score computation (0-100)
      let score = 0;
      // Patients (0-25): 0=0, 1=10, 2=15, 3+=20, 5+=25
      score += patientCount >= 5 ? 25 : patientCount >= 3 ? 20 : patientCount >= 2 ? 15 : patientCount >= 1 ? 10 : 0;
      // Recent activity (0-30): sessions in last 14 days
      score += recentPatientSessions >= 10 ? 30 : recentPatientSessions >= 5 ? 22 : recentPatientSessions >= 2 ? 15 : recentPatientSessions >= 1 ? 8 : 0;
      // Recency (0-25): days since last activity
      score += daysSinceActivity <= 2 ? 25 : daysSinceActivity <= 7 ? 20 : daysSinceActivity <= 14 ? 12 : daysSinceActivity <= 30 ? 5 : 0;
      // Trend (0-20): growing, stable, declining
      score += trend > 20 ? 20 : trend >= 0 ? 12 : trend >= -30 ? 5 : 0;

      const level = score >= 70 ? "excellent" : score >= 50 ? "bon" : score >= 30 ? "attention" : "critique";

      return {
        id: t.id,
        name: t.full_name || "Sans nom",
        email: therapistEmails[t.id] || "—",
        plan: t.subscription_plan || "trial",
        subscriptionStatus: t.subscription_status || "none",
        score,
        level,
        patientCount,
        recentPatientSessions,
        totalPatientSessions,
        daysSinceActivity: daysSinceActivity === 999 ? null : daysSinceActivity,
        trend,
      };
    }).sort((a, b) => b.score - a.score);

    // ══════════════════════════════════════════════════════════
    // ══ NEW: FEATURE ADOPTION (exercises vs retention) ══════
    // ══════════════════════════════════════════════════════════
    // Compare exercise usage between retained users (active in last 14d) and churned/inactive
    const retainedUserIds = new Set(profiles.filter((p) => {
      const lastAct = p.last_activity_date ? new Date(p.last_activity_date) : null;
      return lastAct && lastAct >= fourteenDaysAgo;
    }).map((p) => p.id));

    const inactiveUserIds = new Set(profiles.filter((p) => {
      const lastAct = p.last_activity_date ? new Date(p.last_activity_date) : null;
      return !lastAct || lastAct < thirtyDaysAgo;
    }).map((p) => p.id));

    const exerciseAdoption: Record<string, { retainedUsers: number; inactiveUsers: number; retainedSessions: number; inactiveSessions: number }> = {};
    for (const s of sessions) {
      const type = s.exercise_type || "reading";
      if (!exerciseAdoption[type]) exerciseAdoption[type] = { retainedUsers: 0, inactiveUsers: 0, retainedSessions: 0, inactiveSessions: 0 };
      if (retainedUserIds.has(s.user_id)) exerciseAdoption[type].retainedSessions++;
      if (inactiveUserIds.has(s.user_id)) exerciseAdoption[type].inactiveSessions++;
    }
    // Count unique users per exercise
    const retainedByEx: Record<string, Set<string>> = {};
    const inactiveByEx: Record<string, Set<string>> = {};
    for (const s of sessions) {
      const type = s.exercise_type || "reading";
      if (retainedUserIds.has(s.user_id)) {
        if (!retainedByEx[type]) retainedByEx[type] = new Set();
        retainedByEx[type].add(s.user_id);
      }
      if (inactiveUserIds.has(s.user_id)) {
        if (!inactiveByEx[type]) inactiveByEx[type] = new Set();
        inactiveByEx[type].add(s.user_id);
      }
    }
    const featureAdoption = Object.entries(exerciseAdoption).map(([exercise, data]) => ({
      exercise,
      retainedUsers: retainedByEx[exercise]?.size || 0,
      inactiveUsers: inactiveByEx[exercise]?.size || 0,
      retainedSessions: data.retainedSessions,
      inactiveSessions: data.inactiveSessions,
      // Retention correlation: how much more likely are retained users to use this exercise
      retentionCorrelation: (retainedByEx[exercise]?.size || 0) > 0 && retainedUserIds.size > 0
        ? Math.round(((retainedByEx[exercise]?.size || 0) / retainedUserIds.size) * 100)
        : 0,
      inactiveCorrelation: (inactiveByEx[exercise]?.size || 0) > 0 && inactiveUserIds.size > 0
        ? Math.round(((inactiveByEx[exercise]?.size || 0) / inactiveUserIds.size) * 100)
        : 0,
    })).sort((a, b) => b.retentionCorrelation - a.retentionCorrelation);

    // ══════════════════════════════════════════════════════════
    // ══ NEW: TIME TO VALUE (Magic Moment) ═══════════════════
    // ══════════════════════════════════════════════════════════
    // For therapists: Magic Moment = first patient completes first session
    // For patients: Magic Moment = first session completed
    const usersWithSession = new Set(sessions.map((s) => s.user_id));

    const timeToValueData: { therapistTTV: number[]; patientTTV: number[] } = { therapistTTV: [], patientTTV: [] };

    for (const p of profiles) {
      if (p.is_therapist) {
        // Time until first patient does a session
        const patientIds = profiles.filter((pt) => pt.linked_therapist_id === p.id).map((pt) => pt.id);
        let firstPatientSession: Date | null = null;
        for (const pid of patientIds) {
          const ps = sessionsByUser[pid]?.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0];
          if (ps) {
            const d = new Date(ps.created_at);
            if (!firstPatientSession || d < firstPatientSession) firstPatientSession = d;
          }
        }
        if (firstPatientSession) {
          const hrs = (firstPatientSession.getTime() - new Date(p.created_at).getTime()) / (1000 * 60 * 60);
          if (hrs >= 0 && hrs < 720) timeToValueData.therapistTTV.push(hrs);
        }
      } else {
        // Time to first session
        const userSessions = sessionsByUser[p.id]?.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        if (userSessions?.length) {
          const hrs = (new Date(userSessions[0].created_at).getTime() - new Date(p.created_at).getTime()) / (1000 * 60 * 60);
          if (hrs >= 0 && hrs < 720) timeToValueData.patientTTV.push(hrs);
        }
      }
    }

    const median = (arr: number[]) => {
      if (!arr.length) return null;
      const sorted = [...arr].sort((a, b) => a - b);
      return Math.round(sorted[Math.floor(sorted.length / 2)]);
    };
    const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : null;

    const timeToValue = {
      therapist: {
        avgHours: avg(timeToValueData.therapistTTV),
        medianHours: median(timeToValueData.therapistTTV),
        reachedCount: timeToValueData.therapistTTV.length,
        totalCount: profiles.filter((p) => p.is_therapist).length,
      },
      patient: {
        avgHours: avg(timeToValueData.patientTTV),
        medianHours: median(timeToValueData.patientTTV),
        reachedCount: timeToValueData.patientTTV.length,
        totalCount: profiles.filter((p) => !p.is_therapist).length,
      },
    };

    // ══════════════════════════════════════════════════════════
    // ══ NEW: LIFECYCLE / ENGAGEMENT SCORE ═══════════════════
    // ══════════════════════════════════════════════════════════
    // Score per user to determine lifecycle stage and email strategy
    const lifecycleScores = profiles.map((p) => {
      const userSessions = sessionsByUser[p.id] || [];
      const recentCount = userSessions.filter((s) => new Date(s.created_at) >= fourteenDaysAgo).length;
      const lastAct = p.last_activity_date ? new Date(p.last_activity_date) : null;
      const daysSince = lastAct ? Math.floor((now.getTime() - lastAct.getTime()) / 86400000) : 999;
      const totalCount = userSessions.length;
      const accountAgeDays = Math.floor((now.getTime() - new Date(p.created_at).getTime()) / 86400000);

      // Engagement score (0-100)
      let engagement = 0;
      engagement += recentCount >= 5 ? 30 : recentCount >= 2 ? 20 : recentCount >= 1 ? 10 : 0;
      engagement += totalCount >= 20 ? 25 : totalCount >= 10 ? 20 : totalCount >= 5 ? 15 : totalCount >= 1 ? 8 : 0;
      engagement += daysSince <= 2 ? 25 : daysSince <= 7 ? 20 : daysSince <= 14 ? 10 : daysSince <= 30 ? 5 : 0;
      engagement += p.onboarding_completed_at ? 10 : 0;
      engagement += p.linked_therapist_id || (p.is_therapist && profiles.some((pt) => pt.linked_therapist_id === p.id)) ? 10 : 0;
      engagement = Math.min(100, engagement);

      // Lifecycle stage
      let stage: string;
      if (totalCount === 0 && accountAgeDays <= 3) stage = "new";
      else if (totalCount === 0 && accountAgeDays > 3) stage = "dormant";
      else if (recentCount > 0 && engagement >= 60) stage = "power_user";
      else if (recentCount > 0) stage = "active";
      else if (daysSince <= 30) stage = "cooling";
      else stage = "churned";

      return {
        id: p.id,
        name: p.full_name || "Sans nom",
        isTherapist: p.is_therapist,
        engagement,
        stage,
        totalSessions: totalCount,
        recentSessions: recentCount,
        daysSinceActivity: daysSince === 999 ? null : daysSince,
        accountAgeDays,
      };
    });

    // Aggregate lifecycle stages
    const stageBreakdown: Record<string, number> = {};
    for (const l of lifecycleScores) { stageBreakdown[l.stage] = (stageBreakdown[l.stage] || 0) + 1; }

    const avgEngagement = lifecycleScores.length > 0 ? Math.round(lifecycleScores.reduce((s, l) => s + l.engagement, 0) / lifecycleScores.length) : 0;

    const lifecycleStats = {
      avgEngagement,
      stageBreakdown,
      topPowerUsers: lifecycleScores.filter((l) => l.stage === "power_user").slice(0, 10),
      dormantUsers: lifecycleScores.filter((l) => l.stage === "dormant").length,
      coolingUsers: lifecycleScores.filter((l) => l.stage === "cooling").length,
      churnedUsers: lifecycleScores.filter((l) => l.stage === "churned").length,
    };

    // ── Conversion signals ──
    const hotLeads = profiles.filter((p) => {
      if (!p.is_therapist || p.subscription_status === "active") return false;
      const trialEnd = p.trial_end_date ? new Date(p.trial_end_date) : p.trial_start_date ? new Date(new Date(p.trial_start_date).getTime() + 30 * 86400000) : null;
      if (trialEnd && trialEnd <= now) return false;
      return profiles.some((pt) => pt.linked_therapist_id === p.id);
    }).map((p) => {
      const patientIds = profiles.filter((pt) => pt.linked_therapist_id === p.id).map((pt) => pt.id);
      const patientSessions = patientIds.reduce((sum, pid) => sum + (recentSessionsByUser[pid] || 0), 0);
      const trialEnd = p.trial_end_date ? new Date(p.trial_end_date) : p.trial_start_date ? new Date(new Date(p.trial_start_date).getTime() + 30 * 86400000) : null;
      const daysLeft = trialEnd ? Math.ceil((trialEnd.getTime() - now.getTime()) / 86400000) : null;
      const urgencyBonus = daysLeft !== null && daysLeft <= 7 ? 10 : daysLeft !== null && daysLeft <= 14 ? 5 : 0;
      const score = patientIds.length * 3 + patientSessions * 2 + urgencyBonus;
      return { id: p.id, name: p.full_name || "Sans nom", email: therapistEmails[p.id] || "—", patientCount: patientIds.length, patientSessions, daysLeft, score, signal: patientSessions >= 5 ? "🔥 Très chaud" : patientSessions >= 2 ? "🟡 Chaud" : "🟢 Intéressé" };
    }).sort((a, b) => b.score - a.score).slice(0, 20);

    const churnRisks = profiles.filter((p) => p.is_therapist && p.subscription_status === "active").map((p) => {
      const patientIds = profiles.filter((pt) => pt.linked_therapist_id === p.id).map((pt) => pt.id);
      const patientSessions = patientIds.reduce((sum, pid) => sum + (recentSessionsByUser[pid] || 0), 0);
      const lastAct = p.last_activity_date ? new Date(p.last_activity_date) : null;
      const daysSince = lastAct ? Math.floor((now.getTime() - lastAct.getTime()) / 86400000) : 999;
      const riskScore = (patientIds.length === 0 ? 20 : 0) + (patientSessions === 0 ? 15 : patientSessions <= 2 ? 5 : 0) + (daysSince > 30 ? 20 : daysSince > 14 ? 10 : daysSince > 7 ? 5 : 0);
      return { id: p.id, name: p.full_name || "Sans nom", email: therapistEmails[p.id] || "—", plan: p.subscription_plan || "—", patientCount: patientIds.length, patientSessions, daysSinceActivity: daysSince === 999 ? null : daysSince, riskScore, riskLevel: riskScore >= 30 ? "🔴 Critique" : riskScore >= 15 ? "🟠 Élevé" : riskScore >= 5 ? "🟡 Modéré" : "🟢 Faible" };
    }).filter((r) => r.riskScore >= 5).sort((a, b) => b.riskScore - a.riskScore);

    const conversionSignals = { hotLeads, churnRisks };

    // ── Analytics events ──
    const thirtyDaysAgoStr = new Date(Date.now() - 30 * 86400000).toISOString();
    const { data: analyticsRaw } = await supabase.from("analytics_events").select("event_name, event_category, page_path, created_at").gte("created_at", thirtyDaysAgoStr).order("created_at", { ascending: false }).limit(10000);
    const analyticsEvents = analyticsRaw || [];

    const eventCounts: Record<string, number> = {};
    for (const e of analyticsEvents) eventCounts[e.event_name] = (eventCounts[e.event_name] || 0) + 1;
    const topEvents = Object.entries(eventCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 20);

    const pageCounts: Record<string, number> = {};
    for (const e of analyticsEvents) { if (e.event_name === "page_view" && e.page_path) pageCounts[e.page_path] = (pageCounts[e.page_path] || 0) + 1; }
    const topPages = Object.entries(pageCounts).map(([path, count]) => ({ path, count })).sort((a, b) => b.count - a.count).slice(0, 15);

    const dailyEvents: { day: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - i);
      const end = new Date(start); end.setDate(end.getDate() + 1);
      dailyEvents.push({ day: `${start.getDate()}/${start.getMonth() + 1}`, count: analyticsEvents.filter((e) => { const d = new Date(e.created_at); return d >= start && d < end; }).length });
    }

    const funnelCounts: Record<string, number> = {};
    for (const e of analyticsEvents) { if (e.event_category === "funnel") funnelCounts[e.event_name] = (funnelCounts[e.event_name] || 0) + 1; }
    const funnelSteps = Object.entries(funnelCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

    // Conversion funnel
    const landingViews = analyticsEvents.filter((e) => e.event_name === "page_view" && (e.page_path === "/" || e.page_path === "/pro")).length;
    const onboardedUsers = profiles.filter((p) => p.onboarding_completed_at).length;
    const firstSessionUsers = usersWithSession.size;
    const paidUsers = profiles.filter((p) => p.subscription_status === "active").length;

    const conversionFunnel = [
      { step: "Visites landing (30j)", count: landingViews },
      { step: "Inscrits (total)", count: profiles.length },
      { step: "Onboarding terminé", count: onboardedUsers },
      { step: "1ère session faite", count: firstSessionUsers },
      { step: "Abonné payant", count: paidUsers },
    ];

    // Retention cohorts
    const retentionCohorts: { week: string; signups: number; d7: number; d14: number; d30: number }[] = [];
    for (let w = 7; w >= 0; w--) {
      const cohortStart = new Date(Date.now() - (w + 1) * 7 * 86400000);
      const cohortEnd = new Date(Date.now() - w * 7 * 86400000);
      const cohortUsers = profiles.filter((p) => { const c = new Date(p.created_at); return c >= cohortStart && c < cohortEnd; });
      if (cohortUsers.length === 0) { retentionCohorts.push({ week: `${cohortStart.getDate()}/${cohortStart.getMonth() + 1}`, signups: 0, d7: 0, d14: 0, d30: 0 }); continue; }
      let d7 = 0, d14 = 0, d30 = 0;
      for (const u of cohortUsers) {
        const created = new Date(u.created_at);
        const us = sessionsByUser[u.id] || [];
        if (us.some((s) => { const d = new Date(s.created_at); return d >= new Date(created.getTime() + 7 * 86400000) && d < new Date(created.getTime() + 14 * 86400000); })) d7++;
        if (us.some((s) => { const d = new Date(s.created_at); return d >= new Date(created.getTime() + 14 * 86400000) && d < new Date(created.getTime() + 21 * 86400000); })) d14++;
        if (us.some((s) => { const d = new Date(s.created_at); return d >= new Date(created.getTime() + 30 * 86400000) && d < new Date(created.getTime() + 37 * 86400000); })) d30++;
      }
      retentionCohorts.push({ week: `${cohortStart.getDate()}/${cohortStart.getMonth() + 1}`, signups: cohortUsers.length, d7: Math.round((d7 / cohortUsers.length) * 100), d14: Math.round((d14 / cohortUsers.length) * 100), d30: Math.round((d30 / cohortUsers.length) * 100) });
    }

    // Advanced insights
    const timesToFirstSession: number[] = [];
    for (const p of profiles) {
      const us = sessionsByUser[p.id]?.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      if (us?.length) {
        const hrs = (new Date(us[0].created_at).getTime() - new Date(p.created_at).getTime()) / (1000 * 60 * 60);
        if (hrs >= 0 && hrs < 720) timesToFirstSession.push(hrs);
      }
    }
    const neverSessioned = profiles.filter((p) => !usersWithSession.has(p.id)).length;
    const hourCounts: Record<number, number> = {};
    for (const s of sessions) { const h = new Date(s.created_at).getHours(); hourCounts[h] = (hourCounts[h] || 0) + 1; }
    const peakHour = Object.entries(hourCounts).sort((a, b) => Number(b[1]) - Number(a[1]))[0];

    const pageViewsByPath: Record<string, number> = {};
    const actionsByPath: Record<string, number> = {};
    for (const e of analyticsEvents) {
      if (e.event_name === "page_view" && e.page_path) pageViewsByPath[e.page_path] = (pageViewsByPath[e.page_path] || 0) + 1;
      else if (e.page_path) actionsByPath[e.page_path] = (actionsByPath[e.page_path] || 0) + 1;
    }
    const abandonmentPages = Object.entries(pageViewsByPath).map(([path, views]) => ({ path, views, actions: actionsByPath[path] || 0, engagementPct: views > 0 ? Math.round(((actionsByPath[path] || 0) / views) * 100) : 0 })).filter((p) => p.views >= 3).sort((a, b) => a.engagementPct - b.engagementPct).slice(0, 10);

    const analyticsStats = {
      totalEvents: analyticsEvents.length, topEvents, topPages, dailyEvents, funnelSteps, conversionFunnel, retentionCohorts,
      advancedInsights: { avgTimeToFirstSessionHours: avg(timesToFirstSession), medianTimeToFirstSessionHours: median(timesToFirstSession), neverSessioned, neverSessionedPct: profiles.length > 0 ? Math.round((neverSessioned / profiles.length) * 100) : 0, peakHour: peakHour ? { hour: Number(peakHour[0]), sessions: Number(peakHour[1]) } : null, abandonmentPages },
    };

    // ── SaaS KPIs ──
    const allTrialOrPaid = profiles.filter((p) => p.is_therapist && (p.subscription_status === "active" || p.subscription_plan === "trial" || p.subscription_status === "canceled"));
    const paidFromTrial = profiles.filter((p) => p.is_therapist && p.subscription_status === "active").length;
    const trialToPaidRate = allTrialOrPaid.length > 0 ? Math.round((paidFromTrial / allTrialOrPaid.length) * 100) : 0;

    let activatedCount = 0;
    for (const p of profiles) {
      const signup = new Date(p.created_at);
      if (sessions.some((s) => s.user_id === p.id && new Date(s.created_at) >= signup && new Date(s.created_at) <= new Date(signup.getTime() + 7 * 86400000))) activatedCount++;
    }
    const activationRate = totalUsers > 0 ? Math.round((activatedCount / totalUsers) * 100) : 0;
    const arpu = paidFromTrial > 0 ? Number((mrr / paidFromTrial).toFixed(2)) : 0;
    const payingTherapistIds = profiles.filter((p) => p.is_therapist && p.subscription_status === "active").map((p) => p.id);
    const avgPatientsPerPayingTherapist = payingTherapistIds.length > 0 ? Number((profiles.filter((p) => p.linked_therapist_id && payingTherapistIds.includes(p.linked_therapist_id)).length / payingTherapistIds.length).toFixed(1)) : 0;
    const weeklyActiveRate = totalUsers > 0 ? Math.round((activeCount / totalUsers) * 100) : 0;

    const saasKpis = { trialToPaidRate, activationRate, arpu, avgPatientsPerPayingTherapist, weeklyActiveRate, activatedCount };

    // ── Smart Recommendations ──
    const recommendations: { type: "opportunity" | "alert" | "insight"; icon: string; title: string; description: string; priority: number }[] = [];

    if (hotLeads.length > 0) {
      const urgentLeads = hotLeads.filter((l) => l.daysLeft !== null && l.daysLeft <= 5);
      if (urgentLeads.length > 0) recommendations.push({ type: "alert", icon: "🚨", priority: 1, title: `${urgentLeads.length} ortho${urgentLeads.length > 1 ? "s" : ""} expire${urgentLeads.length > 1 ? "nt" : ""} dans ≤5j`, description: `${urgentLeads.map((l) => l.name).join(", ")} — ${urgentLeads.reduce((s, l) => s + l.patientSessions, 0)} sessions patients. Conversion probable via email/appel.` });
      if (hotLeads.length > (urgentLeads?.length || 0)) recommendations.push({ type: "opportunity", icon: "🔥", priority: 2, title: `${hotLeads.length} hot leads à travailler`, description: `Orthos en essai avec patients actifs. Copie les emails et envoie un message personnalisé.` });
    }

    const criticalChurn = churnRisks.filter((r) => r.riskLevel.includes("Critique"));
    if (criticalChurn.length > 0) recommendations.push({ type: "alert", icon: "⚠️", priority: 1, title: `${criticalChurn.length} client${criticalChurn.length > 1 ? "s" : ""} à risque critique de churn`, description: `${criticalChurn.map((r) => r.name).join(", ")} — appel de check-in recommandé cette semaine.` });

    if (activationRate < 40) recommendations.push({ type: "insight", icon: "💡", priority: 3, title: `Taux d'activation faible (${activationRate}%)`, description: `${activatedCount}/${totalUsers} font une session en 7j. Améliore l'onboarding : email J+1, exercice guidé par défaut.` });
    if (neverSessioned > 0 && totalUsers > 0 && Math.round((neverSessioned / totalUsers) * 100) > 30) recommendations.push({ type: "alert", icon: "😴", priority: 2, title: `${Math.round((neverSessioned / totalUsers) * 100)}% n'ont jamais pratiqué`, description: `${neverSessioned} comptes dormants. Séquence de relance auto pour inscrits sans session après 48h.` });
    if (trialToPaidRate < 15) recommendations.push({ type: "insight", icon: "📊", priority: 3, title: `Conversion essai→payant à ${trialToPaidRate}%`, description: `Objectif B2B santé : 15-25%. Email de valeur J+7 avec stats patients, webinar, offre fin d'essai.` });
    if (avgPatientsPerPayingTherapist < 2 && payingTherapistIds.length > 0) recommendations.push({ type: "opportunity", icon: "👥", priority: 3, title: `Moy. ${avgPatientsPerPayingTherapist} patients/ortho payant`, description: `Plus de patients = moins de churn. Pousse le kit de recommandation.` });

    // Health score based recommendations
    const criticalHealth = healthScores.filter((h) => h.level === "critique" && h.subscriptionStatus === "active");
    if (criticalHealth.length > 0) recommendations.push({ type: "alert", icon: "🩺", priority: 1, title: `${criticalHealth.length} client${criticalHealth.length > 1 ? "s" : ""} payant${criticalHealth.length > 1 ? "s" : ""} en santé critique`, description: `Health score < 30 : ${criticalHealth.slice(0, 3).map((h) => h.name).join(", ")}. Intervention immédiate recommandée.` });

    // MRR movement recommendation
    if (mrrMovements.churned > mrrMovements.new && mrrMovements.churned > 0) recommendations.push({ type: "alert", icon: "📉", priority: 1, title: `MRR négatif : -${mrrMovements.churned.toFixed(0)}€ churn vs +${mrrMovements.new.toFixed(0)}€ nouveau`, description: `Tu perds plus de revenus que tu n'en gagnes sur cette période. Focus sur la rétention avant l'acquisition.` });

    // Lifecycle recommendation
    if (lifecycleStats.dormantUsers > totalUsers * 0.2) recommendations.push({ type: "opportunity", icon: "💤", priority: 2, title: `${lifecycleStats.dormantUsers} comptes dormants (jamais activés)`, description: `Opportunité de réactivation : séquence email ciblée "Découvrez votre 1er exercice en 2 min".` });

    if (peakHour) recommendations.push({ type: "insight", icon: "⏰", priority: 4, title: `Heure de pointe : ${Number(peakHour[0])}h00`, description: `${Number(peakHour[1])} sessions. Programme tes emails et notifications autour de ce créneau.` });

    const lastTwoWeeks = weeklySignups.slice(-2);
    if (lastTwoWeeks.length === 2 && lastTwoWeeks[0].count > 0) {
      const growthPct = Math.round(((lastTwoWeeks[1].count - lastTwoWeeks[0].count) / lastTwoWeeks[0].count) * 100);
      if (growthPct > 20) recommendations.push({ type: "opportunity", icon: "🚀", priority: 2, title: `Inscriptions +${growthPct}% cette semaine`, description: `${lastTwoWeeks[1].count} vs ${lastTwoWeeks[0].count}. Identifie la source et double la mise.` });
      else if (growthPct < -30 && lastTwoWeeks[0].count >= 3) recommendations.push({ type: "alert", icon: "📉", priority: 2, title: `Chute de ${Math.abs(growthPct)}% des inscriptions`, description: `${lastTwoWeeks[1].count} vs ${lastTwoWeeks[0].count}. Vérifie campagnes et technique.` });
    }

    recommendations.sort((a, b) => a.priority - b.priority);

    const data = {
      totalUsers, therapists, patients, linkedPatients, activeCount, totalSessions, avgDuration, avgWpm, recordingRate,
      weeklySignups, dailySessions, exerciseBreakdown, subscriptionBreakdown,
      payingUsers, canceledUsers, expiringTrials, totalTrials, newTherapistsThisWeek, newPatientsThisWeek,
      deepgramStats, therapistPatientMap, unpaidTherapistList,
      revenueStats, conversionSignals, analyticsStats, saasKpis, recommendations, rangeDays,
      // New data
      mrrMovements, healthScores, featureAdoption, timeToValue, lifecycleStats,
    };

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
