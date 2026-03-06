import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from '@web3auth/base';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import { UX_MODE } from '@web3auth/openlogin-adapter';

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
      mode: 'dark',
      theme: { primary: '#e8ff47', onPrimary: '#080808' },
      loginMethodsOrder: ['google', 'email_passwordless'],
    },
  });

  const openloginAdapter = new OpenloginAdapter({
    adapterSettings: {
      // REDIRECT MODE — same as RemiliaVillage, no popup, no iframe issues
      uxMode: UX_MODE.REDIRECT,
      redirectUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
      whiteLabel: {
        appName: 'Outbound',
        theme: { primary: '#e8ff47' },
      },
    },
  });

  instance.configureAdapter(openloginAdapter);
  await instance.initModal();
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
