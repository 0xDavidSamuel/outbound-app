// src/lib/web3auth.ts
// No singleton — fresh instance each time to avoid stale init state

import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from '@web3auth/base';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';

const CLIENT_ID = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!;

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: '0x2105',
  rpcTarget: 'https://mainnet.base.org',
  displayName: 'Base',
  blockExplorerUrl: 'https://basescan.org',
  ticker: 'ETH',
  tickerName: 'Ethereum',
};

export async function createWeb3Auth() {
  const privateKeyProvider = new EthereumPrivateKeyProvider({
    config: { chainConfig },
  });

  const instance = new Web3Auth({
    clientId: CLIENT_ID,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
    privateKeyProvider: privateKeyProvider as any,
    uiConfig: {
      appName: 'Outbound',
      theme: { primary: '#e8ff47', onPrimary: '#080808' },
      mode: 'dark',
      defaultLanguage: 'en',
      loginMethodsOrder: ['google', 'email_passwordless', 'apple', 'twitter'],
    },
  });

  await instance.init();
  return instance;
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
