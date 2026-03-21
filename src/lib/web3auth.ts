import { Web3Auth, WEB3AUTH_NETWORK, WALLET_CONNECTORS } from '@web3auth/modal';

const CLIENT_ID = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!;

let instance: Web3Auth | null = null;

export async function createWeb3Auth() {
  // Reuse existing instance if already initialized
  if (instance) return instance;

  instance = new Web3Auth({
    clientId: CLIENT_ID,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
    uiConfig: {
      appName: 'Outbound',
      mode: 'dark',
      theme: { primary: '#e8ff47', onPrimary: '#080808' },
      loginMethodsOrder: ['google', 'email_passwordless'],
    },
    modalConfig: {
      connectors: {
        [WALLET_CONNECTORS.AUTH]: {
          label: 'auth',
          showOnModal: true,
          loginMethods: {
            google: { name: 'Google', showOnModal: true },
            email_passwordless: { name: 'Email', showOnModal: true },
            facebook: { name: 'Facebook', showOnModal: false },
            twitter: { name: 'Twitter', showOnModal: false },
            reddit: { name: 'Reddit', showOnModal: false },
            discord: { name: 'Discord', showOnModal: false },
            twitch: { name: 'Twitch', showOnModal: false },
            apple: { name: 'Apple', showOnModal: false },
            line: { name: 'Line', showOnModal: false },
            github: { name: 'GitHub', showOnModal: false },
            linkedin: { name: 'LinkedIn', showOnModal: false },
            farcaster: { name: 'Farcaster', showOnModal: false },
            sms_passwordless: { name: 'SMS', showOnModal: false },
          },
        },
      },
      hideWalletDiscovery: true, // hide external wallet options
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
