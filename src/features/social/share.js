import { generateShareImage } from '../utils/imageGenerator';

export class SocialShare {
  constructor() {
    this.platforms = {
      twitter: this.shareToTwitter,
      discord: this.shareToDiscord,
      telegram: this.shareToTelegram,
      linkedin: this.shareToLinkedIn
    };
  }

  async shareAchievement(achievement, platform = 'twitter') {
    const shareImage = await generateShareImage(achievement);
    const shareText = this.generateShareText(achievement);
    
    if (this.platforms[platform]) {
      return await this.platforms[platform](shareText, shareImage);
    }
    
    throw new Error(`Unsupported platform: ${platform}`);
  }

  generateShareText(achievement) {
    const templates = {
      milestone: `🚀 Just reached ${achievement.value} ${achievement.unit} on @NeurolovNetwork! Contributing to decentralized AI while earning $NEURO. Join me: {referralLink} #DecentralizedAI #Web3`,
      
      rank_up: `⭐ Leveled up to ${achievement.rank} on @NeurolovNetwork! Proud to be part of the decentralized AI revolution. Start your journey: {referralLink} #NeurolovNetwork #AI`,
      
      earnings: `💰 Earned ${achievement.amount} $NEURO on @NeurolovNetwork today! My device is contributing to AI development while I earn. Learn how: {referralLink} #PassiveIncome #AI`,
      
      swarm_leader: `👑 Just became a Swarm Leader on @NeurolovNetwork! Leading a group of ${achievement.swarmSize} nodes in decentralized AI computing. Join my swarm: {referralLink} #DecentralizedComputing`,
      
      referral_bonus: `🎁 Thanks to my referrals, I earned an extra ${achievement.bonus} $NEURO on @NeurolovNetwork! Join my network: {referralLink} #ReferralRewards #PassiveIncome`
    };

    return templates[achievement.type]
      .replace('{referralLink}', `https://neurolov.xyz/join?ref=${achievement.referralCode}`);
  }

  async shareToTwitter(text, image) {
    const twitterIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    
    if (typeof window !== 'undefined') {
      const width = 550;
      const height = 420;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      
      window.open(
        twitterIntent,
        'Share on Twitter',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      return true;
    }
    
    return false;
  }

  async shareToDiscord(text, image) {
    // Implementation for Discord webhook sharing
    const webhookUrl = 'https://discord.com/api/webhooks/...';
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: text,
        embeds: [{
          image: { url: image }
        }]
      })
    });
    
    return response.ok;
  }

  async shareToTelegram(text, image) {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(text)}`;
    
    if (typeof window !== 'undefined') {
      window.open(telegramUrl, '_blank');
      return true;
    }
    
    return false;
  }

  async shareToLinkedIn(text, image) {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      'https://neurolov.xyz'
    )}&summary=${encodeURIComponent(text)}`;
    
    if (typeof window !== 'undefined') {
      window.open(linkedinUrl, '_blank');
      return true;
    }
    
    return false;
  }
}

// Viral Mechanics
export class ViralMechanics {
  constructor() {
    this.socialShare = new SocialShare();
  }

  async triggerViralEvent(type, data) {
    switch (type) {
      case 'MILESTONE':
        return await this.handleMilestone(data);
      case 'EARNINGS':
        return await this.handleEarnings(data);
      case 'RANK_UP':
        return await this.handleRankUp(data);
      case 'SWARM_LEADER':
        return await this.handleSwarmLeader(data);
      default:
        throw new Error(`Unknown viral event type: ${type}`);
    }
  }

  async handleMilestone(data) {
    const achievement = {
      type: 'milestone',
      value: data.value,
      unit: data.unit,
      referralCode: data.referralCode
    };

    // Generate NFT badge
    const nft = await this.generateMilestoneNFT(data);
    
    // Share achievement
    await this.socialShare.shareAchievement(achievement);
    
    // Return viral package
    return {
      achievement,
      nft,
      shareUrl: `https://neurolov.xyz/achievement/${nft.id}`
    };
  }

  async generateMilestoneNFT(data) {
    // NFT generation logic
    return {
      id: `milestone-${Date.now()}`,
      image: 'https://nft.neurolov.xyz/...',
      metadata: {
        type: 'milestone',
        value: data.value,
        timestamp: Date.now()
      }
    };
  }
}

export const viralMechanics = new ViralMechanics();
