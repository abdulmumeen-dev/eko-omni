import { UniswapTrader } from './limbs/uniswap.js';
import dotenv from 'dotenv';
dotenv.config();

const trader = new UniswapTrader(process.env.WALLET_PRIVATE_KEY);

const balance = await trader.getETHBalance();
console.log(`💰 ETH Balance: ${balance} ETH`);

if (balance > 0.01) {
  const price = await trader.getUSDCPrice(0.01);
  console.log(`📊 0.01 ETH ≈ ${price} USDC`);

  // ⚠️ Commented out for safety — uncomment to execute
  // const receipt = await trader.swapETHToUSDC(0.005);
  // console.log(`✅ Swap confirmed: ${receipt.hash}`);
} else {
  console.log('❌ Insufficient ETH balance');
}
