// src/lib/web3auth.ts
import { Web3AuthNoModal } from '@web3auth/no-modal';
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK, UX_MODE } from '@web3auth/base';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';

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

  const instance = new Web3AuthNoModal({
    clientId: CLIENT_ID,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
    privateKeyProvider: privateKeyProvider as any,
  });

  const openloginAdapter = new OpenloginAdapter({
    adapterSettings: {
    uxMode: UX_MODE.POPUP,
    whiteLabel: {
      appName: 'Outbound',
      theme: { primary: '#e8ff47' },
        },
    },
});

instance.configureAdapter(openloginAdapter);
  await instance.init();
  return instance;
}

export async function loginWithGoogle(web3auth: Web3AuthNoModal) {
  return web3auth.connectTo('openlogin', { loginProvider: 'google' });
}

export async function loginWithEmail(web3auth: Web3AuthNoModal, email: string) {
  return web3auth.connectTo('openlogin', { loginProvider: 'email_passwordless', login_hint: email });
}

export async function getWalletAddress(web3auth: Web3AuthNoModal): Promise<string | null> {
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
