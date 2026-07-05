export interface Transaction {
  hash: string;
  recipient: string;
  amount: string;
  token: string;
  status: 'Waiting for Signature' | 'Pending' | 'Success' | 'Failed';
  timestamp: string;
  signatureImage?: string;
}

export interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  valueUsd: string;
  iconColor: string;
}
