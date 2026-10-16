import { mapObject } from '@metorial/util-resource-mapper/compact';

export type DashboardInstanceChatEventsGetOutput = {
  object: 'chat.event';
  id: string;
  type: string;
  source: 'webhook' | 'polling' | 'internal';
  chatConnectionId: string;
  chatId: string | null;
  channelId: string | null;
  threadId: string | null;
  messageId: string | null;
  authorId: string | null;
  providerEventId: string | null;
  providerChannelId: string | null;
  providerThreadId: string | null;
  providerMessageId: string | null;
  providerAuthorId: string | null;
  payload: Record<string, any> | null;
  occurredAt: Date;
  createdAt: Date;
};

export let mapDashboardInstanceChatEventsGetOutput =
  /* @__PURE__ */ mapObject<DashboardInstanceChatEventsGetOutput>(
    [
      'chat_connection_id',
      'chat_id',
      'channel_id',
      'thread_id',
      'message_id',
      'author_id',
      'provider_event_id',
      'provider_channel_id',
      'provider_thread_id',
      'provider_message_id',
      'provider_author_id',
      'occurred_at',
      'created_at'
    ],
    1
  );
