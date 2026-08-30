// blockchain/wallet.js
import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

class WalletManager {
  constructor(memory) {
    this.memory = memory;
    this.wallet = null;
    this.provider = null;
    this.address = null;
    this.balance = 0;
    this.initialized = false;
  }

  // Initialize wallet from private key
  async init() {
    console.log('[Wallet] Initializing real wallet...');

    const privateKey = process.env.WALLET_PRIVATE_KEY;
    const rpcUrl = process.env.RPC_URL || 'https://eth.llamarpc.com';

    if (!privateKey) {
      console.log('[Wallet] ⚠️ No private key found. Using simulation mode.');
      return { success: false, reason: 'No private key' };
    }

    try {
      // Connect to blockchain
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      this.address = this.wallet.address;
      
      // Get balance
      const balance = await this.provider.getBalance(this.address);
      this.balance = parseFloat(ethers.formatEther(balance));
      
      this.initialized = true;

      console.log(`[Wallet] ✅ Connected: ${this.address}`);
      console.log(`[Wallet] 💰 Balance: ${this.balance} ETH`);

      this.memory.remember('wallet', 'Wallet initialized', {
        address: this.address,
        balance: this.balance
      });

      return { success: true, address: this.address, balance: this.balance };
    } catch (err) {
      console.error('[Wallet] Failed to initialize:', err.message);
      return { success: false, error: err.message };
    }
  }

  // Get current balance
  async getBalance() {
    if (!this.initialized) {
      await this.init();
    }

    try {
      const balance = await this.provider.getBalance(this.address);
      this.balance = parseFloat(ethers.formatEther(balance));
      return this.balance;
    } catch (err) {
      console.error('[Wallet] Failed to get balance:', err.message);
      return 0;
    }
  }

  // Send ETH
  async sendETH(to, amount) {
    if (!this.initialized) {
      await this.init();
    }

    console.log(`[Wallet] Sending ${amount} ETH to ${to}...`);

    try {
      const tx = await this.wallet.sendTransaction({
        to: to,
        value: ethers.parseEther(amount.toString())
      });

      console.log(`[Wallet] Transaction sent: ${tx.hash}`);
      await tx.wait();
      console.log(`[Wallet] ✅ Transaction confirmed`);

      // Update balance
      await this.getBalance();

      this.memory.remember('wallet', `Sent ${amount} ETH`, {
        to,
        amount,
        txHash: tx.hash
      });

      return { success: true, txHash: tx.hash };
    } catch (err) {
      console.error('[Wallet] Failed to send:', err.message);
      return { success: false, error: err.message };
    }
  }

  // Get transaction history
  async getHistory() {
    if (!this.initialized) {
      await this.init();
    }

    try {
      // Get recent transactions
      const history = [];
      // In production: use Etherscan API or The Graph
      
      // For now: return from memory
      const memories = this.memory.search('wallet');
      for (const mem of memories) {
        if (mem.metadata && mem.metadata.txHash) {
          history.push(mem.metadata);
        }
      }

      return history;
    } catch (err) {
      console.error('[Wallet] Failed to get history:', err.message);
      return [];
    }
  }

  // Get stats
  getStats() {
    return {
      address: this.address,
      balance: this.balance,
      initialized: this.initialized,
      network: 'Ethereum'
    };
  }
}

export default WalletManager;
