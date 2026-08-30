// exchanges/binance.js
import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

class BinanceClient {
  constructor(memory) {
    this.memory = memory;
    this.apiKey = process.env.EXCHANGE_API_KEY;
    this.apiSecret = process.env.EXCHANGE_API_SECRET;
    this.baseURL = 'https://api.binance.com';
    this.initialized = false;
  }

  // Initialize exchange client
  async init() {
    console.log('[Binance] Initializing...');

    if (!this.apiKey || !this.apiSecret) {
      console.log('[Binance] ⚠️ No API keys found. Using simulation mode.');
      return { success: false, reason: 'No API keys' };
    }

    try {
      // Test connection
      const response = await this.request('GET', '/api/v3/ping');
      this.initialized = true;
      console.log('[Binance] ✅ Connected');
      return { success: true };
    } catch (err) {
      console.error('[Binance] Failed to connect:', err.message);
      return { success: false, error: err.message };
    }
  }

  // Sign request for Binance API
  signRequest(queryString) {
    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(queryString)
      .digest('hex');
  }

  // Make authenticated request
  async request(method, endpoint, params = {}) {
    const timestamp = Date.now();
    const queryString = new URLSearchParams({
      ...params,
      timestamp: timestamp
    }).toString();

    const signature = this.signRequest(queryString);
    const url = `${this.baseURL}${endpoint}?${queryString}&signature=${signature}`;

    const response = await axios({
      method,
      url,
      headers: {
        'X-MBX-APIKEY': this.apiKey
      }
    });

    return response.data;
  }

  // Get current price
  async getPrice(symbol) {
    console.log(`[Binance] Getting price for ${symbol}...`);

    try {
      const response = await axios.get(
        `${this.baseURL}/api/v3/ticker/price?symbol=${symbol}`
      );
      return parseFloat(response.data.price);
    } catch (err) {
      console.error('[Binance] Failed to get price:', err.message);
      return null;
    }
  }

  // Get account balance
  async getBalance() {
    if (!this.initialized) {
      await this.init();
    }

    console.log('[Binance] Getting account balance...');

    try {
      const response = await this.request('GET', '/api/v3/account');
      const balances = response.balances.filter(b => 
        parseFloat(b.free) > 0 || parseFloat(b.locked) > 0
      );

      this.memory.remember('exchange', 'Balance fetched', { balances });
      return balances;
    } catch (err) {
      console.error('[Binance] Failed to get balance:', err.message);
      return [];
    }
  }

  // Place market order
  async marketOrder(symbol, side, quantity) {
    if (!this.initialized) {
      await this.init();
    }

    console.log(`[Binance] ${side} ${quantity} ${symbol} (market)...`);

    try {
      const response = await this.request('POST', '/api/v3/order', {
        symbol,
        side,
        type: 'MARKET',
        quantity
      });

      console.log(`[Binance] ✅ Order placed: ${response.orderId}`);

      this.memory.remember('exchange', `Order placed: ${side} ${quantity} ${symbol}`, {
        orderId: response.orderId,
        symbol,
        side,
        quantity,
        price: response.price
      });

      return { success: true, order: response };
    } catch (err) {
      console.error('[Binance] Order failed:', err.message);
      return { success: false, error: err.message };
    }
  }

  // Place limit order
  async limitOrder(symbol, side, quantity, price) {
    if (!this.initialized) {
      await this.init();
    }

    console.log(`[Binance] ${side} ${quantity} ${symbol} at ${price} (limit)...`);

    try {
      const response = await this.request('POST', '/api/v3/order', {
        symbol,
        side,
        type: 'LIMIT',
        quantity,
        price,
        timeInForce: 'GTC'
      });

      console.log(`[Binance] ✅ Limit order placed: ${response.orderId}`);

      this.memory.remember('exchange', `Limit order: ${side} ${quantity} ${symbol} at ${price}`, {
        orderId: response.orderId,
        symbol,
        side,
        quantity,
        price
      });

      return { success: true, order: response };
    } catch (err) {
      console.error('[Binance] Limit order failed:', err.message);
      return { success: false, error: err.message };
    }
  }

  // Get order status
  async getOrderStatus(symbol, orderId) {
    if (!this.initialized) {
      await this.init();
    }

    try {
      const response = await this.request('GET', '/api/v3/order', {
        symbol,
        orderId
      });

      return response;
    } catch (err) {
      console.error('[Binance] Failed to get order status:', err.message);
      return null;
    }
  }

  // Cancel order
  async cancelOrder(symbol, orderId) {
    if (!this.initialized) {
      await this.init();
    }

    console.log(`[Binance] Cancelling order: ${orderId}...`);

    try {
      const response = await this.request('DELETE', '/api/v3/order', {
        symbol,
        orderId
      });

      console.log(`[Binance] ✅ Order cancelled: ${orderId}`);
      return { success: true, order: response };
    } catch (err) {
      console.error('[Binance] Failed to cancel:', err.message);
      return { success: false, error: err.message };
    }
  }

  // Get recent trades
  async getRecentTrades(symbol, limit = 10) {
    try {
      const response = await axios.get(
        `${this.baseURL}/api/v3/trades?symbol=${symbol}&limit=${limit}`
      );
      return response.data;
    } catch (err) {
      console.error('[Binance] Failed to get trades:', err.message);
      return [];
    }
  }

  // Get stats
  getStats() {
    return {
      initialized: this.initialized,
      baseURL: this.baseURL,
      apiKey: this.apiKey ? '***' : 'Not set'
    };
  }
}

export default BinanceClient;
