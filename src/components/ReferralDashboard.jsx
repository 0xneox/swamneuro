import React from 'react';
import { useRecoilValue } from 'recoil';
import { referralState } from '../state/referralState';
import { CopyToClipboard } from 'react-copy-to-clipboard';

export const ReferralDashboard = ({ compact = false }) => {
  const referralData = useRecoilValue(referralState);
  const [copied, setCopied] = React.useState(false);

  const referralLink = `https://neurolov.xyz/join?ref=${referralData.referralCode}`;

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalEarnings = referralData.directReferrals.reduce(
    (sum, ref) => sum + ref.earnings,
    0
  ) + referralData.indirectReferrals.reduce(
    (sum, ref) => sum + ref.earnings,
    0
  );

  return (
    <div className={`referral-dashboard ${compact ? 'compact' : ''}`}>
      <h2>Referral Program</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <label>Total Earnings</label>
          <value>{totalEarnings.toFixed(2)} NEURO</value>
        </div>
        
        <div className="stat-card">
          <label>Direct Referrals</label>
          <value>{referralData.directReferrals.length}</value>
        </div>
        
        <div className="stat-card">
          <label>Indirect Referrals</label>
          <value>{referralData.indirectReferrals.length}</value>
        </div>
      </div>

      <div className="referral-link-section">
        <h3>Your Referral Link</h3>
        <div className="link-box">
          <input 
            type="text" 
            value={referralLink} 
            readOnly 
          />
          <CopyToClipboard text={referralLink} onCopy={handleCopy}>
            <button className={copied ? 'copied' : ''}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </CopyToClipboard>
        </div>
      </div>

      {!compact && (
        <div className="referral-tree">
          <h3>Referral Network</h3>
          <div className="tree-visualization">
            {referralData.directReferrals.map(referral => (
              <ReferralNode 
                key={referral.id} 
                referral={referral} 
                level={1} 
              />
            ))}
          </div>
        </div>
      )}

      <div className="rewards-info">
        <h3>Rewards Structure</h3>
        <ul>
          <li>Level 1 (Direct): 20% of referral's earnings</li>
          <li>Level 2 (Indirect): 10% of referral's earnings</li>
        </ul>
      </div>
    </div>
  );
};

const ReferralNode = ({ referral, level }) => {
  return (
    <div className={`referral-node level-${level}`}>
      <div className="node-content">
        <div className="user-info">
          <span className="username">{referral.username}</span>
          <span className="status">{referral.status}</span>
        </div>
        <div className="earnings">
          {referral.earnings.toFixed(2)} NEURO
        </div>
      </div>
      {referral.referrals && (
        <div className="child-nodes">
          {referral.referrals.map(childRef => (
            <ReferralNode 
              key={childRef.id} 
              referral={childRef} 
              level={level + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
};
