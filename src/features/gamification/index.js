import { atom } from 'recoil';
import { generateNFT } from '../nft/generator';
import { socialShare } from '../social/share';

// Achievement Types
export const ACHIEVEMENTS = {
  COMPUTE_MILESTONES: [100, 1000, 10000, 100000], // TFLOPS contributed
  STREAK_MILESTONES: [3, 7, 30, 100], // Days
  REFERRAL_MILESTONES: [5, 25, 100, 1000], // Users
  TASK_MILESTONES: [10, 100, 1000, 10000] // Tasks completed
};

// Ranks and Titles
export const RANKS = {
  NOVICE: { name: 'Novice Neuron', minScore: 0 },
  CONTRIBUTOR: { name: 'Active Contributor', minScore: 1000 },
  VALIDATOR: { name: 'Swarm Validator', minScore: 5000 },
  LEADER: { name: 'Swarm Leader', minScore: 10000 },
  PIONEER: { name: 'Network Pioneer', minScore: 50000 },
  MASTER: { name: 'Neural Master', minScore: 100000 }
};

// Special Events
export const EVENTS = {
  POWER_HOUR: { bonus: 2.5, duration: 3600 }, // 2.5x rewards for 1 hour
  WEEKEND_BOOST: { bonus: 2.0, days: [6, 0] }, // 2x rewards on weekends
  NEURAL_STORM: { bonus: 3.0, probability: 0.1 } // Random 3x reward events
};

class GamificationSystem {
  constructor() {
    this.achievements = new Map();
    this.currentStreak = 0;
    this.lastActive = null;
  }

  async checkAchievements(stats) {
    const newAchievements = [];

    // Check compute power achievements
    ACHIEVEMENTS.COMPUTE_MILESTONES.forEach(milestone => {
      if (stats.totalCompute >= milestone && !this.achievements.has(`compute_${milestone}`)) {
        newAchievements.push(this.unlockAchievement('compute', milestone));
      }
    });

    // Check streak achievements
    if (this.checkAndUpdateStreak()) {
      ACHIEVEMENTS.STREAK_MILESTONES.forEach(milestone => {
        if (this.currentStreak >= milestone && !this.achievements.has(`streak_${milestone}`)) {
          newAchievements.push(this.unlockAchievement('streak', milestone));
        }
      });
    }

    return newAchievements;
  }

  async unlockAchievement(type, milestone) {
    const achievement = {
      id: `${type}_${milestone}`,
      type,
      milestone,
      unlockedAt: Date.now()
    };

    // Generate achievement NFT
    const nft = await generateNFT({
      type: 'achievement',
      milestone,
      rank: this.calculateRank(milestone)
    });

    // Create social share content
    const shareContent = this.createShareContent(achievement, nft);

    // Store achievement
    this.achievements.set(achievement.id, {
      ...achievement,
      nft,
      shareContent
    });

    return achievement;
  }

  createShareContent(achievement, nft) {
    const messages = {
      compute: `🚀 Just hit ${achievement.milestone} TFLOPS on @NeurolovNetwork! Contributing to decentralized AI computing. Join me and earn $NEURO!`,
      streak: `🔥 ${achievement.milestone} day streak on @NeurolovNetwork! Earning while my device contributes to AI. Join: `,
      referral: `🌟 Brought ${achievement.milestone} users to @NeurolovNetwork! Building the future of decentralized AI. Join us: `,
      task: `⚡ Completed ${achievement.milestone} tasks on @NeurolovNetwork! Earning $NEURO while contributing to AI. Start here: `
    };

    return {
      text: messages[achievement.type],
      image: nft.image,
      url: `https://neurolov.xyz/join?ref=${this.referralCode}`
    };
  }

  calculateRank(score) {
    return Object.entries(RANKS)
      .reverse()
      .find(([_, rank]) => score >= rank.minScore)?.[0] || 'NOVICE';
  }

  checkAndUpdateStreak() {
    const now = new Date();
    const today = now.toDateString();

    if (!this.lastActive) {
      this.currentStreak = 1;
      this.lastActive = today;
      return true;
    }

    const lastActiveDate = new Date(this.lastActive);
    const daysDiff = (now - lastActiveDate) / (1000 * 60 * 60 * 24);

    if (daysDiff <= 1) {
      this.currentStreak++;
      this.lastActive = today;
      return true;
    } else if (daysDiff > 1) {
      this.currentStreak = 1;
      this.lastActive = today;
    }

    return false;
  }

  async shareAchievement(achievementId) {
    const achievement = this.achievements.get(achievementId);
    if (!achievement) return false;

    return await socialShare(achievement.shareContent);
  }
}

export const gamificationSystem = new GamificationSystem();
