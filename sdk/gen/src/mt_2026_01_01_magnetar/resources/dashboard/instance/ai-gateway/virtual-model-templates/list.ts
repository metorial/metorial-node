import { createMapper } from '@metorial/util-resource-mapper/compact';

export type DashboardInstanceAiGatewayVirtualModelTemplatesListOutput = {
  object: 'list';
  items: {
    object: 'ai_gateway.virtual_model.template';
    slug: string;
    name: string;
    description: string;
    parameters: { key: string; name: string; description: string }[];
    usesDecisionModel: boolean;
  }[];
  pagination: {
    hasMoreBefore: boolean;
    hasMoreAfter: boolean;
    before?: string | undefined;
    after?: string | undefined;
  };
};

export let mapDashboardInstanceAiGatewayVirtualModelTemplatesListOutput =
  /* @__PURE__ */ createMapper<DashboardInstanceAiGatewayVirtualModelTemplatesListOutput>(
    [7, [1, ['uses_decision_model']]]
  );
