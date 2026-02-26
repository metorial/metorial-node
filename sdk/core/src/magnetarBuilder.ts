import { GetMetorialSDKConfig, MetorialSDKBuilder } from '@metorial/util-endpoint';

export type MetorialKeyPrefix =
  | 'metorial_uk_'
  | 'metorial_mk_'
  | 'metorial_sk_'
  | 'metorial_ak_'
  | 'metorial_pk_';

export let magnetarSdkBuilder = MetorialSDKBuilder.create<
  '2026-01-01-magnetar',
  {
    apiVersion: '2026-01-01-magnetar';
    apiKey: `${MetorialKeyPrefix}${string}` | string;
    headers?: Record<string, string>;
    apiHost?: string;
    mcpHost?: string;
  }
>('metorial-public-api', '2026-01-01-magnetar')
  .setGetApiHost(config => config.apiHost ?? 'https://api.metorial.com')
  .setGetHeaders(config => ({
    Authorization: `Bearer ${config.apiKey}`,
    'Metorial-Version': config.apiVersion,
    ...(config.headers ?? {})
  }));

export type MetorialMagnetarSDKConfig = GetMetorialSDKConfig<typeof magnetarSdkBuilder>;
