import {
  BaseMetorialEndpoint,
  MetorialEndpointManager
} from '@metorial/util-endpoint';

import {
  mapDashboardInstanceIdentityDelegationsCreateBody,
  mapDashboardInstanceIdentityDelegationsCreateOutput,
  mapDashboardInstanceIdentityDelegationsGetOutput,
  mapDashboardInstanceIdentityDelegationsListOutput,
  mapDashboardInstanceIdentityDelegationsListQuery,
  mapDashboardInstanceIdentityDelegationsRevokeOutput,
  type DashboardInstanceIdentityDelegationsCreateBody,
  type DashboardInstanceIdentityDelegationsCreateOutput,
  type DashboardInstanceIdentityDelegationsGetOutput,
  type DashboardInstanceIdentityDelegationsListOutput,
  type DashboardInstanceIdentityDelegationsListQuery,
  type DashboardInstanceIdentityDelegationsRevokeOutput
} from '../resources';

/**
 * @name Identity Delegations controller
 * @description Identity delegations grant provider permissions from one identity owner to another actor, with optional per-credential overrides.
 *
 * @see https://metorial.com/api
 * @see https://metorial.com/docs
 */
export class MetorialManagementInstanceIdentityDelegationsEndpoint {
  constructor(private readonly _manager: MetorialEndpointManager<any>) {}

  // thin proxies so method bodies stay unchanged
  private _get(request: any) {
    return this._manager._get(request);
  }
  private _post(request: any) {
    return this._manager._post(request);
  }
  private _put(request: any) {
    return this._manager._put(request);
  }
  private _patch(request: any) {
    return this._manager._patch(request);
  }
  private _delete(request: any) {
    return this._manager._delete(request);
  }

  /**
   * @name List identity delegations
   * @description Returns a paginated list of identity delegations for the instance.
   *
   * @param `instanceId` - string
   * @param `query` - DashboardInstanceIdentityDelegationsListQuery
   * @param `opts` - { headers?: Record<string, string> }
   * @returns DashboardInstanceIdentityDelegationsListOutput
   * @see https://metorial.com/api
   * @see https://metorial.com/docs
   */
  list(
    instanceId: string,
    query?: DashboardInstanceIdentityDelegationsListQuery,
    opts?: { headers?: Record<string, string> }
  ): Promise<DashboardInstanceIdentityDelegationsListOutput> {
    let path = `instances/${instanceId}/identity-delegations`;

    let request = {
      path,

      query: query
        ? mapDashboardInstanceIdentityDelegationsListQuery.transformTo(query)
        : undefined,
      ...(opts?.headers ? { headers: opts.headers } : {})
    } as any;

    return this._get(request).transform(
      mapDashboardInstanceIdentityDelegationsListOutput
    );
  }

  /**
   * @name Get identity delegation
   * @description Retrieves a specific identity delegation by ID.
   *
   * @param `instanceId` - string
   * @param `identityDelegationId` - string
   * @param `opts` - { headers?: Record<string, string> }
   * @returns DashboardInstanceIdentityDelegationsGetOutput
   * @see https://metorial.com/api
   * @see https://metorial.com/docs
   */
  get(
    instanceId: string,
    identityDelegationId: string,
    opts?: { headers?: Record<string, string> }
  ): Promise<DashboardInstanceIdentityDelegationsGetOutput> {
    let path = `instances/${instanceId}/identity-delegations/${identityDelegationId}`;

    let request = {
      path,

      ...(opts?.headers ? { headers: opts.headers } : {})
    } as any;

    return this._get(request).transform(
      mapDashboardInstanceIdentityDelegationsGetOutput
    );
  }

  /**
   * @name Create identity delegation
   * @description Creates a new identity delegation.
   *
   * @param `instanceId` - string
   * @param `body` - DashboardInstanceIdentityDelegationsCreateBody
   * @param `opts` - { headers?: Record<string, string> }
   * @returns DashboardInstanceIdentityDelegationsCreateOutput
   * @see https://metorial.com/api
   * @see https://metorial.com/docs
   */
  create(
    instanceId: string,
    body: DashboardInstanceIdentityDelegationsCreateBody,
    opts?: { headers?: Record<string, string> }
  ): Promise<DashboardInstanceIdentityDelegationsCreateOutput> {
    let path = `instances/${instanceId}/identity-delegations`;

    let request = {
      path,
      body: mapDashboardInstanceIdentityDelegationsCreateBody.transformTo(body),

      ...(opts?.headers ? { headers: opts.headers } : {})
    } as any;

    return this._post(request).transform(
      mapDashboardInstanceIdentityDelegationsCreateOutput
    );
  }

  /**
   * @name Revoke identity delegation
   * @description Revokes an existing identity delegation.
   *
   * @param `instanceId` - string
   * @param `identityDelegationId` - string
   * @param `opts` - { headers?: Record<string, string> }
   * @returns DashboardInstanceIdentityDelegationsRevokeOutput
   * @see https://metorial.com/api
   * @see https://metorial.com/docs
   */
  revoke(
    instanceId: string,
    identityDelegationId: string,
    opts?: { headers?: Record<string, string> }
  ): Promise<DashboardInstanceIdentityDelegationsRevokeOutput> {
    let path = `instances/${instanceId}/identity-delegations/${identityDelegationId}/revoke`;

    let request = {
      path,

      ...(opts?.headers ? { headers: opts.headers } : {})
    } as any;

    return this._post(request).transform(
      mapDashboardInstanceIdentityDelegationsRevokeOutput
    );
  }
}
