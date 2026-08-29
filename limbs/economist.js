// limbs/economist.js
import { callLLM } from './llm.js';

class Economist {
  constructor(memory) {
    this.memory = memory;
    this.balance = 0;
    this.trades = [];
    this.profit = 0;
    this.initialized = false;
  }

  // Initialize wallet
  async initWallet() {
    try {
      // Check if we have a private key
      if (!process.env.WALLET_PRIVATE_KEY) {
        console.log('[Economist] No wallet found. Generating new wallet...');
        // In production, you'd use ethers.js to generate a wallet
        // For now, we'll simulate
        const simulatedAddress = '0x' + 'a'.repeat(40);
        this.address = simulatedAddress;
        this.balance = 0;
        console.log(`[Economist] Generated wallet: ${simulatedAddress}`);
        console.log('[Economist] ⚠️ No private key set. Using simulation mode.');
      } else {
        this.address = process.env.WALLET_ADDRESS || '0x...';
        this.balance = 10; // Simulated initial balance
        console.log(`[Economist] Wallet loaded: ${this.address}`);
        console.log(`[Economist] Balance: $${this.balance}`);
      }

      this.initialized = true;
      this.memory.remember('system', 'Wallet initialized', {
        address: this.address,
        balance: this.balance
      });

      return { success: true, address: this.address, balance: this.balance };
    } catch (err) {
      console.error('[Economist] Failed to initialize wallet:', err.message);
      return { success: false, error: err.message };
    }
  }

  // Get current balance
  async getBalance() {
    try {
      // In production: call blockchain RPC
      // For now: simulated
      this.balance = 10 + (Math.random() * 5 - 2.5);
      this.balance = Math.max(0, this.balance);
      return this.balance;
    } catch (err) {
      console.error('[Economist] Failed to get balance:', err.message);
      return 0;
    }
  }

  // Analyze market for opportunities
  async analyzeMarket() {
    console.log('[Economist] Analyzing market...');

    const prompt = `
    You are a crypto trading analyst. Analyze the current market.
    Consider:
    - Bitcoin (BTC) trend
    - Ethereum (ETH) trend
    - Stablecoins for safety
    - Market sentiment

    Return a JSON array of recommendations:
    [
      { "action": "buy", "asset": "BTC", "amount": 100, "reason": "..." },
      { "action": "sell", "asset": "ETH", "amount": 50, "reason": "..." }
    ]
    `;

    try {
      const response = await callLLM(
        'You are a conservative crypto analyst. Only suggest trades with clear reasoning.',
        prompt,
        null,
        0.3
      );

      let recommendations = [];
      try {
        const match = response.match(/\[[\s\S]*?\]/);
        if (match) recommendations = JSON.parse(match[0]);
      } catch {
        recommendations = [];
      }

      this.memory.remember('system', 'Market analysis', { recommendations });
      return recommendations;
    } catch (err) {
      console.error('[Economist] Analysis failed:', err.message);
      return [];
    }
  }

  // Execute a trade
  async executeTrade(trade) {
    console.log(`[Economist] Executing trade: ${trade.action} ${trade.asset}`);

    // Validate trade
    if (!trade.action || !trade.asset || !trade.amount) {
      return { success: false, error: 'Invalid trade parameters' };
    }

    // Check if we have enough balance
    const balance = await this.getBalance();
    if (trade.amount > balance) {
      console.log(`[Economist] Insufficient balance: $${balance} < $${trade.amount}`);
      return { success: false, error: 'Insufficient balance' };
    }

    // Simulate trade execution
    const price = 50000 + (Math.random() * 10000 - 5000);
    const executedAt = new Date().toISOString();

    // Simulate profit/loss
    const profitPercent = (Math.random() * 4 - 2); // -2% to +2%
    const profit = trade.amount * (profitPercent / 100);

    const result = {
      success: true,
      action: trade.action,
      asset: trade.asset,
      amount: trade.amount,
      price: price,
      profit: profit,
      profitPercent: profitPercent,
      executedAt: executedAt,
      reason: trade.reason || 'No reason provided'
    };

    // Update balance
    this.balance += profit;
    this.profit += profit;
    this.trades.push(result);

    // Log to memory
    this.memory.remember('system', 'Trade executed', result);

    console.log(`[Economist] ✅ ${trade.action} ${trade.asset}: $${profit.toFixed(2)} profit`);
    return result;
  }

  // Run trading cycle
  async trade() {
    console.log('\n[Economist] Starting trading cycle...');

    // 1. Check balance
    const balance = await this.getBalance();
    console.log(`[Economist] Current balance: $${balance.toFixed(2)}`);

    if (balance < 1) {
      console.log('[Economist] ⚠️ Balance too low. Cannot trade.');
      return { success: false, reason: 'Insufficient balance' };
    }

    // 2. Analyze market
    const recommendations = await this.analyzeMarket();

    if (recommendations.length === 0) {
      console.log('[Economist] No trading opportunities found.');
      return { success: true, trades: 0, reason: 'No opportunities' };
    }

    // 3. Execute trades
    let executed = 0;
    for (const trade of recommendations) {
      const result = await this.executeTrade(trade);
      if (result.success) {
        executed++;
      }
    }

    // 4. Log summary
    const summary = {
      tradesExecuted: executed,
      totalTrades: recommendations.length,
      profit: this.profit,
      balance: this.balance
    };

    this.memory.remember('system', 'Trading cycle complete', summary);
    console.log(`[Economist] Trading cycle complete: ${executed} trades executed`);

    return summary;
  }

  // Get trading stats
  getStats() {
    return {
      balance: this.balance,
      totalTrades: this.trades.length,
      totalProfit: this.profit,
      winRate: this.trades.length > 0 
        ? (this.trades.filter(t => t.profit > 0).length / this.trades.length * 100).toFixed(1) + '%'
        : 'N/A',
      address: this.address,
      initialized: this.initialized
    };
  }
}

export default Economist;
