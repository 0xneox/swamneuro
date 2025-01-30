use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("NEURoxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

#[program]
pub mod neurolov {
    use super::*;

    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        min_stake: u64,
        leader_bonus: u64,
        referral_bonus: u64,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.authority = ctx.accounts.authority.key();
        pool.total_staked = 0;
        pool.reward_rate = 100; // 1 NEURO per computation unit
        pool.min_stake = min_stake;
        pool.leader_bonus = leader_bonus;
        pool.referral_bonus = referral_bonus;
        Ok(())
    }

    pub fn create_task(ctx: Context<CreateTask>, computation_units: u64, reward: u64) -> Result<()> {
        let task = &mut ctx.accounts.task;
        task.creator = ctx.accounts.creator.key();
        task.computation_units = computation_units;
        task.reward = reward;
        task.status = TaskStatus::Open;
        
        // Transfer reward to escrow
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.creator_token_account.to_account_info(),
                to: ctx.accounts.escrow_token_account.to_account_info(),
                authority: ctx.accounts.creator.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, reward)?;
        
        Ok(())
    }

    pub fn register_referral(
        ctx: Context<RegisterReferral>,
        referrer: Pubkey
    ) -> Result<()> {
        let referral_account = &mut ctx.accounts.referral_info;
        referral_account.referrer = referrer;
        referral_account.total_rewards = 0;
        referral_account.active_referrals = 0;
        Ok(())
    }

    pub fn create_swarm(
        ctx: Context<CreateSwarm>,
        members: Vec<Pubkey>,
        total_power: u64
    ) -> Result<()> {
        let swarm = &mut ctx.accounts.swarm;
        swarm.leader = ctx.accounts.leader.key();
        swarm.members = members;
        swarm.total_power = total_power;
        swarm.tasks_completed = 0;
        swarm.performance_score = 100;
        Ok(())
    }

    pub fn complete_task(
        ctx: Context<CompleteTask>, 
        result_hash: [u8; 32],
        swarm_proof: SwarmProof
    ) -> Result<()> {
        let task = &mut ctx.accounts.task;
        require!(task.status == TaskStatus::Open, ErrorCode::InvalidTaskStatus);
        
        // Verify computation result
        if !verify_computation_result(&result_hash) {
            return Err(ErrorCode::InvalidComputationResult.into());
        }
        
        // Verify swarm proof
        if !verify_swarm_proof(&swarm_proof) {
            return Err(ErrorCode::InvalidSwarmProof.into());
        }
        
        // Calculate rewards including bonuses
        let base_reward = task.reward;
        let leader_bonus = (base_reward * ctx.accounts.pool.leader_bonus) / 100;
        let total_reward = base_reward + leader_bonus;
        
        // Distribute rewards
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.escrow_token_account.to_account_info(),
                to: ctx.accounts.worker_token_account.to_account_info(),
                authority: ctx.accounts.pool.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, total_reward)?;
        
        // Update task state
        task.status = TaskStatus::Completed;
        task.completed_by = Some(ctx.accounts.worker.key());
        task.swarm_proof = Some(swarm_proof);
        task.result_hash = Some(result_hash);
        
        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum TaskStatus {
    Open,
    InProgress,
    Completed,
    Failed,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct SwarmProof {
    pub leader: Pubkey,
    pub members: Vec<Pubkey>,
    pub total_power: u64,
    pub task_hash: [u8; 32],
    pub signatures: Vec<[u8; 64]>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ReferralInfo {
    pub referrer: Pubkey,
    pub total_rewards: u64,
    pub active_referrals: u64,
}

#[account]
pub struct SwarmState {
    pub leader: Pubkey,
    pub members: Vec<Pubkey>,
    pub total_power: u64,
    pub tasks_completed: u64,
    pub performance_score: u64,
}

#[account]
pub struct Pool {
    pub authority: Pubkey,
    pub total_staked: u64,
    pub reward_rate: u64,
    pub min_stake: u64,
    pub leader_bonus: u64,
    pub referral_bonus: u64,
}

#[account]
pub struct Task {
    pub creator: Pubkey,
    pub computation_units: u64,
    pub reward: u64,
    pub status: TaskStatus,
    pub completed_by: Option<Pubkey>,
    pub swarm_proof: Option<SwarmProof>,
    pub result_hash: Option<[u8; 32]>,
}

#[error_code]
pub enum ErrorCode {
    InvalidTaskStatus,
    InvalidComputationResult,
    InsufficientReward,
    InvalidSwarmProof,
    InvalidReferral,
}
