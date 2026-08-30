// limbs/uniswap.js
import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

const UNISWAP_ROUTER = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'; // Uniswap V2 Router (Ethereum mainnet)
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

export class UniswapTrader {
  constructor(privateKey, rpcUrl = 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY') {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.router = new ethers.Contract(UNISWAP_ROUTER, [
      'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
      'function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)'
    ], this.wallet);
  }

  async getETHBalance() {
    const balance = await this.provider.getBalance(this.wallet.address);
    return parseFloat(ethers.formatEther(balance));
  }

  async getUSDCPrice(ethAmount) {
    const amountIn = ethers.parseEther(ethAmount.toString());
    const path = [WETH, USDC];
    const amounts = await this.router.getAmountsOut(amountIn, path);
    const usdcOut = parseFloat(ethers.formatUnits(amounts[1], 6));
    return usdcOut;
  }

  async swapETHToUSDC(ethAmount, slippage = 0.5) {
    const amountIn = ethers.parseEther(ethAmount.toString());
    const path = [WETH, USDC];
    const amounts = await this.router.getAmountsOut(amountIn, path);
    const amountOutMin = amounts[1] - (amounts[1] * BigInt(Math.floor(slippage * 100))) / 10000n;

    const tx = await this.router.swapExactETHForTokens(
      amountOutMin,
      path,
      this.wallet.address,
      Math.floor(Date.now() / 1000) + 60 * 20,
      { value: amountIn }
    );

    const receipt = await tx.wait();
    return receipt;
  }
}
