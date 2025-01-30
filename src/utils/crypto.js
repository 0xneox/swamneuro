import { PublicKey } from '@solana/web3.js';
import { sign } from '@noble/ed25519';

export const signMessage = async (message, privateKey) => {
  try {
    const signature = await sign(
      new TextEncoder().encode(message),
      privateKey
    );
    return Buffer.from(signature).toString('hex');
  } catch (error) {
    console.error('Failed to sign message:', error);
    throw error;
  }
};

export const verifySignature = async (message, signature, publicKey) => {
  try {
    const key = new PublicKey(publicKey);
    const signatureBytes = Buffer.from(signature, 'hex');
    const messageBytes = new TextEncoder().encode(message);
    
    return await key.verify(messageBytes, signatureBytes);
  } catch (error) {
    console.error('Failed to verify signature:', error);
    throw error;
  }
};
