/**
 * 📊 PRODUCTION ANALYTICS SCRIPT
 * Monitor key metrics for Mix & Mingle Communities
 */

const { createClient } = require("@supabase/supabase-js");

// Configuration
const supabase = createClient(
  "https://ywfjmsbyksehjgwalqum.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Zmptc2J5a3NlaGpnd2FscXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMzIwNjgsImV4cCI6MjA2MjkwODA2OH0.fXx5d7iRXgpJDB_jAKgtRa2pVoAPBHU9Rly0T14HsVs",
);

async function generateAnalyticsReport() {
  console.log("📊 MIX & MINGLE ANALYTICS DASHBOARD");
  console.log("=".repeat(60));
  console.log(`📅 Generated: ${new Date().toLocaleString()}`);
  console.log("=".repeat(60));

  try {
    // User Growth Metrics
    console.log("\n👥 USER GROWTH METRICS");
    console.log("-".repeat(30));

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, created_at");

    if (!profilesError && profiles) {
      console.log(`📈 Total Users: ${profiles.length}`);

      // Users created in last 24 hours
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentUsers = profiles.filter(
        (p) => new Date(p.created_at) > yesterday,
      );
      console.log(`🆕 New Users (24h): ${recentUsers.length}`);

      // Users created in last 7 days
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const weeklyUsers = profiles.filter(
        (p) => new Date(p.created_at) > weekAgo,
      );
      console.log(`📅 New Users (7d): ${weeklyUsers.length}`);
    }

    // Community Growth Metrics
    console.log("\n🏘️ COMMUNITY METRICS");
    console.log("-".repeat(30));

    const { data: communities, error: communitiesError } = await supabase
      .from("communities")
      .select("id, name, created_at, creator_id");

    if (!communitiesError && communities) {
      console.log(`🏠 Total Communities: ${communities.length}`);

      // Communities created in last 24 hours
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentCommunities = communities.filter(
        (c) => new Date(c.created_at) > yesterday,
      );
      console.log(`🆕 New Communities (24h): ${recentCommunities.length}`);

      // Most active community creators
      const creatorCounts = {};
      communities.forEach((c) => {
        creatorCounts[c.creator_id] = (creatorCounts[c.creator_id] || 0) + 1;
      });
      const topCreators = Object.entries(creatorCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);
      console.log(
        `🏆 Top Creators: ${topCreators.map(([id, count]) => `${count} communities`).join(", ")}`,
      );
    }

    // Membership Metrics
    console.log("\n👫 MEMBERSHIP METRICS");
    console.log("-".repeat(30));

    const { data: memberships, error: membershipsError } = await supabase
      .from("community_members")
      .select("community_id, user_id, joined_at");

    if (!membershipsError && memberships) {
      console.log(`🤝 Total Memberships: ${memberships.length}`);

      // Calculate average members per community
      const membershipsByComm = {};
      memberships.forEach((m) => {
        membershipsByComm[m.community_id] =
          (membershipsByComm[m.community_id] || 0) + 1;
      });
      const avgMembers =
        Object.values(membershipsByComm).reduce((a, b) => a + b, 0) /
        Object.keys(membershipsByComm).length;
      console.log(`📊 Avg Members/Community: ${avgMembers.toFixed(1)}`);

      // Most popular communities
      const topCommunities = Object.entries(membershipsByComm)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);
      console.log(
        `🔥 Top Communities: ${topCommunities.map(([id, count]) => `${count} members`).join(", ")}`,
      );
    }

    // Content Metrics
    console.log("\n📝 CONTENT METRICS");
    console.log("-".repeat(30));

    const { data: posts, error: postsError } = await supabase
      .from("community_posts")
      .select("id, community_id, created_at");

    if (!postsError && posts) {
      console.log(`📄 Total Posts: ${posts.length}`);

      // Posts created in last 24 hours
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentPosts = posts.filter(
        (p) => new Date(p.created_at) > yesterday,
      );
      console.log(`🆕 New Posts (24h): ${recentPosts.length}`);

      // Average posts per community
      const postsByCommunity = {};
      posts.forEach((p) => {
        postsByCommunity[p.community_id] =
          (postsByCommunity[p.community_id] || 0) + 1;
      });
      const avgPosts =
        Object.values(postsByCommunity).reduce((a, b) => a + b, 0) /
        Object.keys(postsByCommunity).length;
      console.log(`📊 Avg Posts/Community: ${avgPosts.toFixed(1)}`);
    }

    // Storage Usage
    console.log("\n🖼️ STORAGE METRICS");
    console.log("-".repeat(30));

    const { data: storageFiles, error: storageError } = await supabase.storage
      .from("community-images")
      .list("", { limit: 1000 });

    if (!storageError && storageFiles) {
      console.log(`📁 Total Images: ${storageFiles.length}`);

      // Calculate total storage usage
      const totalSize = storageFiles.reduce(
        (sum, file) => sum + (file.metadata?.size || 0),
        0,
      );
      const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
      console.log(`💾 Storage Used: ${sizeMB} MB`);
    }

    // Engagement Score
    console.log("\n🎯 ENGAGEMENT SCORE");
    console.log("-".repeat(30));

    const totalUsers = profiles?.length || 0;
    const totalCommunities = communities?.length || 0;
    const totalPosts = posts?.length || 0;
    const totalMemberships = memberships?.length || 0;

    // Calculate engagement metrics
    const communitiesPerUser =
      totalUsers > 0 ? totalCommunities / totalUsers : 0;
    const postsPerUser = totalUsers > 0 ? totalPosts / totalUsers : 0;
    const membershipsPerUser =
      totalUsers > 0 ? totalMemberships / totalUsers : 0;

    console.log(`📈 Communities/User: ${communitiesPerUser.toFixed(2)}`);
    console.log(`📝 Posts/User: ${postsPerUser.toFixed(2)}`);
    console.log(`🤝 Memberships/User: ${membershipsPerUser.toFixed(2)}`);

    // Overall engagement score (0-100)
    const engagementScore = Math.min(
      100,
      (communitiesPerUser * 20 + postsPerUser * 15 + membershipsPerUser * 10) *
        10,
    );
    console.log(`🎯 Engagement Score: ${engagementScore.toFixed(0)}/100`);

    // Growth Trajectory
    console.log("\n📈 GROWTH TRAJECTORY");
    console.log("-".repeat(30));

    if (totalUsers < 10) {
      console.log("🌱 SEED STAGE: Building initial user base");
      console.log("🎯 Goal: Reach 50 beta users");
    } else if (totalUsers < 50) {
      console.log("🚀 EARLY GROWTH: Beta momentum building");
      console.log("🎯 Goal: Reach 100 engaged users");
    } else if (totalUsers < 100) {
      console.log("⚡ ACCELERATION: Strong beta adoption");
      console.log("🎯 Goal: Prepare for viral growth");
    } else {
      console.log("🔥 VIRAL GROWTH: Ready for scale");
      console.log("🎯 Goal: Optimize for retention");
    }

    // Health Indicators
    console.log("\n💚 PLATFORM HEALTH");
    console.log("-".repeat(30));

    const healthScore = {
      userGrowth: totalUsers > 10 ? "✅" : "⚠️",
      contentCreation: totalPosts > totalUsers * 0.5 ? "✅" : "⚠️",
      communityFormation: totalCommunities > totalUsers * 0.1 ? "✅" : "⚠️",
      engagement: engagementScore > 30 ? "✅" : "⚠️",
      storage: storageFiles?.length > 5 ? "✅" : "⚠️",
    };

    console.log(`User Growth: ${healthScore.userGrowth}`);
    console.log(`Content Creation: ${healthScore.contentCreation}`);
    console.log(`Community Formation: ${healthScore.communityFormation}`);
    console.log(`User Engagement: ${healthScore.engagement}`);
    console.log(`Image Uploads: ${healthScore.storage}`);

    // Recommendations
    console.log("\n💡 RECOMMENDATIONS");
    console.log("-".repeat(30));

    if (totalUsers < 20) {
      console.log("🎯 Focus on beta user recruitment");
      console.log("📧 Send personalized onboarding emails");
      console.log("🎨 Create showcase communities");
    } else if (totalCommunities < totalUsers * 0.2) {
      console.log("🏘️ Encourage community creation");
      console.log("🎁 Offer incentives for first communities");
      console.log("📱 Improve community discovery");
    } else if (totalPosts < totalUsers) {
      console.log("📝 Drive content creation");
      console.log("🎮 Gamify posting experience");
      console.log("🔔 Improve notification system");
    } else {
      console.log("🚀 Scale infrastructure for growth");
      console.log("📊 Implement advanced analytics");
      console.log("💰 Consider monetization features");
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 Analytics report complete! 🎉");
    console.log("🔄 Run this script regularly to track progress");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("❌ Analytics Error:", error.message);
  }
}

// Run analytics
generateAnalyticsReport();
