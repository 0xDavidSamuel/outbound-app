// src/lib/web3auth.ts
// Web3Auth client for Outbound — social login + Base wallet creation

import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from '@web3auth/base';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';

const CLIENT_ID = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!;

// Base mainnet — switch to base-sepolia for dev
const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: '0x2105',                             // Base mainnet
  rpcTarget: 'https://mainnet.base.org',
  displayName: 'Base',
  blockExplorerUrl: 'https://basescan.org',
  ticker: 'ETH',
  tickerName: 'Ethereum',
};

let web3authInstance: Web3Auth | null = null;

export async function getWeb3Auth(): Promise<Web3Auth> {
  if (web3authInstance) return web3authInstance;

  const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

web3authInstance = new Web3Auth({
  clientId: CLIENT_ID,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
  privateKeyProvider: privateKeyProvider as any,
    uiConfig: {
      appName: 'Outbound',
      appUrl: 'https://outbound.app',
      theme: {
        primary: '#e8ff47',
        onPrimary: '#080808',
      },
      mode: 'dark',
      defaultLanguage: 'en',
      loginMethodsOrder: ['google', 'email_passwordless', 'apple', 'twitter'],
      loginGridCol: 2,
    },
  });

  await web3authInstance.init();
  return web3authInstance;
}

export async function getWalletAddress(web3auth: Web3Auth): Promise<string | null> {
  try {
    if (!web3auth.provider) return null;
    const { ethers } = await import('ethers');
    const provider = new ethers.BrowserProvider(web3auth.provider as any);
    const signer = await provider.getSigner();
    return await signer.getAddress();
  } catch {
    return null;
  }
}
