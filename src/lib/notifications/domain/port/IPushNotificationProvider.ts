export interface IPushNotificationProvider {
  send(
      tokens: string[],
      title: string, 
      body: string, 
      data?: Record<string, string>
  ): Promise<void>;
}