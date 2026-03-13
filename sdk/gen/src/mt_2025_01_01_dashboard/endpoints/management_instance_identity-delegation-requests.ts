import {
  BaseMetorialEndpoint,
  MetorialEndpointManager
} from '@metorial/util-endpoint';

import {
  mapDashboardInstanceIdentityDelegationRequestsApproveOutput,
  mapDashboardInstanceIdentityDelegationRequestsApproveQuery,
  mapDashboardInstanceIdentityDelegationRequestsCreateBody,
  mapDashboardInstanceIdentityDelegationRequestsCreateOutput,
  mapDashboardInstanceIdentityDelegationRequestsDenyOutput,
  mapDashboardInstanceIdentityDelegationRequestsDenyQuery,
  mapDashboardInstanceIdentityDelegationRequestsGetOutput,
  mapDashboardInstanceIdentityDelegationRequestsGetQuery,
  mapDashboardInstanceIdentityDelegationRequestsListOutput,
  mapDashboardInstanceIdentityDelegationRequestsListQuery,
  type DashboardInstanceIdentityDelegationRequestsApproveOutput,
  type DashboardInstanceIdentityDelegationRequestsApproveQuery,
  type DashboardInstanceIdentityDelegationRequestsCreateBody,
  type DashboardInstanceIdentityDelegationRequestsCreateOutput,
  type DashboardInstanceIdentityDelegationRequestsDenyOutput,
  type DashboardInstanceIdentityDelegationRequestsDenyQuery,
  type DashboardInstanceIdentityDelegationRequestsGetOutput,
  type DashboardInstanceIdentityDelegationRequestsGetQuery,
  type DashboardInstanceIdentityDelegationRequestsListOutput,
  type DashboardInstanceIdentityDelegationRequestsListQuery
} from '../resources';

/**
 * @name Identity Delegation Requests controller
 * @description Identity delegation requests represent approval workflows for creating delegations that require consent.
 *
 * @see https://metorial.com/api
 * @see https://metorial.com/docs
 */
export class MetorialManagementInstanceIdentityDelegationRequestsEndpoint {
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
   * @name List identity delegation requests
   * @description Returns a paginated list of identity delegation requests.
   *
   * @param `instanceId` - string
   * @param `query` - DashboardInstanceIdentityDelegationRequestsListQuery
   * @param `opts` - { headers?: Record<string, string> }
   * @returns DashboardInstanceIdentityDelegationRequestsListOutput
   * @see https://metorial.com/api
   * @see https://metorial.com/docs
   */
  list(
    instanceId: string,
    query?: DashboardInstanceIdentityDelegationRequestsListQuery,
    opts?: { headers?: Record<string, string> }
  ): Promise<DashboardInstanceIdentityDelegationRequestsListOutput> {
    let path = `instances/${instanceId}/identity-delegation-requests`;

    let request = {
      path,

      query: query
        ? mapDashboardInstanceIdentityDelegationRequestsListQuery.transformTo(
            query
          )
        : undefined,
      ...(opts?.headers ? { headers: opts.headers } : {})
    } as any;

    return this._get(request).transform(
      mapDashboardInstanceIdentityDelegationRequestsListOutput
    );
  }

  /**
   * @name Get identity delegation request
   * @description Retrieves a specific identity delegation request by ID.
   *
   * @param `instanceId` - string
   * @param `identityDelegationRequestId` - string
   * @param `query` - DashboardInstanceIdentityDelegationRequestsGetQuery
   * @param `opts` - { headers?: Record<string, string> }
   * @returns DashboardInstanceIdentityDelegationRequestsGetOutput
   * @see https://metorial.com/api
   * @see https://metorial.com/docs
   */
  get(
    instanceId: string,
    identityDelegationRequestId: string,
    query?: DashboardInstanceIdentityDelegationRequestsGetQuery,
    opts?: { headers?: Record<string, string> }
  ): Promise<DashboardInstanceIdentityDelegationRequestsGetOutput> {
    let path = `instances/${instanceId}/identity-delegation-requests/${identityDelegationRequestId}`;

    let request = {
      path,

      query: query
        ? mapDashboardInstanceIdentityDelegationRequestsGetQuery.transformTo(
            query
          )
        : undefined,
      ...(opts?.headers ? { headers: opts.headers } : {})
    } as any;

    return this._get(request).transform(
      mapDashboardInstanceIdentityDelegationRequestsGetOutput
    );
  }

  /**
   * @name Create identity delegation request
   * @description Creates a new identity delegation request.
   *
   * @param `instanceId` - string
   * @param `body` - DashboardInstanceIdentityDelegationRequestsCreateBody
   * @param `opts` - { headers?: Record<string, string> }
   * @returns DashboardInstanceIdentityDelegationRequestsCreateOutput
   * @see https://metorial.com/api
   * @see https://metorial.com/docs
   */
  create(
    instanceId: string,
    body: DashboardInstanceIdentityDelegationRequestsCreateBody,
    opts?: { headers?: Record<string, string> }
  ): Promise<DashboardInstanceIdentityDelegationRequestsCreateOutput> {
    let path = `instances/${instanceId}/identity-delegation-requests`;

    let request = {
      path,
      body: mapDashboardInstanceIdentityDelegationRequestsCreateBody.transformTo(
        body
      ),

      ...(opts?.headers ? { headers: opts.headers } : {})
    } as any;

    return this._post(request).transform(
      mapDashboardInstanceIdentityDelegationRequestsCreateOutput
    );
  }

  /**
   * @name Approve identity delegation request
   * @description Approves an existing identity delegation request.
   *
   * @param `instanceId` - string
   * @param `identityDelegationRequestId` - string
   * @param `query` - DashboardInstanceIdentityDelegationRequestsApproveQuery
   * @param `opts` - { headers?: Record<string, string> }
   * @returns DashboardInstanceIdentityDelegationRequestsApproveOutput
   * @see https://metorial.com/api
   * @see https://metorial.com/docs
   */
  approve(
    instanceId: string,
    identityDelegationRequestId: string,
    query?: DashboardInstanceIdentityDelegationRequestsApproveQuery,
    opts?: { headers?: Record<string, string> }
  ): Promise<DashboardInstanceIdentityDelegationRequestsApproveOutput> {
    let path = `instances/${instanceId}/identity-delegation-requests/${identityDelegationRequestId}/approve`;

    let request = {
      path,

      query: query
        ? mapDashboardInstanceIdentityDelegationRequestsApproveQuery.transformTo(
            query
          )
        : undefined,
      ...(opts?.headers ? { headers: opts.headers } : {})
    } as any;

    return this._post(request).transform(
      mapDashboardInstanceIdentityDelegationRequestsApproveOutput
    );
  }

  /**
   * @name Deny identity delegation request
   * @description Denies an existing identity delegation request.
   *
   * @param `instanceId` - string
   * @param `identityDelegationRequestId` - string
   * @param `query` - DashboardInstanceIdentityDelegationRequestsDenyQuery
   * @param `opts` - { headers?: Record<string, string> }
   * @returns DashboardInstanceIdentityDelegationRequestsDenyOutput
   * @see https://metorial.com/api
   * @see https://metorial.com/docs
   */
  deny(
    instanceId: string,
    identityDelegationRequestId: string,
    query?: DashboardInstanceIdentityDelegationRequestsDenyQuery,
    opts?: { headers?: Record<string, string> }
  ): Promise<DashboardInstanceIdentityDelegationRequestsDenyOutput> {
    let path = `instances/${instanceId}/identity-delegation-requests/${identityDelegationRequestId}/deny`;

    let request = {
      path,

      query: query
        ? mapDashboardInstanceIdentityDelegationRequestsDenyQuery.transformTo(
            query
          )
        : undefined,
      ...(opts?.headers ? { headers: opts.headers } : {})
    } as any;

    return this._post(request).transform(
      mapDashboardInstanceIdentityDelegationRequestsDenyOutput
    );
  }
}
