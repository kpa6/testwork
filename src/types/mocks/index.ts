export type Session = {
  fingerprint: string;
  expiresAt: number;
};

export type DeviceToken = {
  token: string;
  fingerprint: string;
};
