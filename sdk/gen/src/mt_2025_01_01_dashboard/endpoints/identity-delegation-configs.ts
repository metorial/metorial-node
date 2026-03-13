import {
  BaseMetorialEndpoint,
  MetorialEndpointManager
} from '@metorial/util-endpoint';

import {
  mapDashboardInstanceIdentityDelegationConfigsCreateBody,
  mapDashboardInstanceIdentityDelegationConfigsCreateOutput,
  mapDashboardInstanceIdentityDelegationConfigsDeleteOutput,
  mapDashboardInstanceIdentityDelegationConfigsGetOutput,
  mapDashboardInstanceIdentityDelegationConfigsListOutput,
  mapDashboardInstanceIdentityDelegationConfigsListQuery,
  mapDashboardInstanceIdentityDelegationConfigsUpdateBody,
  mapDashboardInstanceIdentityDelegationConfigsUpdateOutput,
  type DashboardInstanceIdentityDelegationConfigsCreateBody,
  type DashboardInstanceIdentityDelegationConfigsCreateOutput,
  type DashboardInstanceIdentityDelegationConfigsDeleteOutput,
  type DashboardInstanceIdentityDelegationConfigsGetOutput,
  type DashboardInstanceIdentityDelegationConfigsListOutput,
  type DashboardInstanceIdentityDelegationConfigsListQuery,
  type DashboardInstanceIdentityDelegationConfigsUpdateBody,
  type DashboardInstanceIdentityDelegationConfigsUpdateOutput
} from '../resources';

/**
 * @name Identity Delegation Configs controller
 * @description Delegation configs define the default policy for sub-delegation behavior and delegation depth.
 *
 * @see https://metorial.com/api
 * @see https://metorial.com/docs
 */
export class MetorialIdentityDelegationConfigsEndpoint {
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
   * @name List identity delegation configs
   * @description Returns a paginated list of identity delegation configs.
   *
   * @param `query` - DashboardInstanceIdentityDelegationConfigsListQuery
   * @param `opts` - { headers?: Record<string, string> }
   * @returns DashboardInstanceIdentityDelegationConfigsListOutput
   * @see https://metorial.com/api
   * @see https://metorial.com/docs
   */
  list(
    query?: DashboardInstanceIdentityDelegationConfigsListQuery,
    opts?: { headers?: Record<string, string> }
  ): Promise<DashboardInstanceIdentityDelegationConfigsListOutput> {
    let path = 'identity-delegation-configs';

    let request = {
      path,

      query: query
        ? mapDashboardInstanceIdentityDelegationConfigsListQuery.transformTo(
            query
          )
        : undefined,
      ...(opts?.headers ? { headers: opts.headers } : {})
    } as any;

    return this._get(request).transform(
      mapDashboardInstanceIdentityDelegationConfigsListOutput
    );
  }

  /**
   * @name Get identity delegation config
   * @description Retrieves a specific identity delegation config by ID.
   *
   * @param `identityDelegationConfigId` - string
   * @param `opts` - { headers?: Record<string, string> }
   * @returns DashboardInstanceIdentityDelegationConfigsGetOutput
   * @see https://metorial.com/api
   * @see https://metorial.com/docs
   */
  get(
    identityDelegationConfigId: string,
    opts?: { headers?: Record<string, string> }
  ): Promise<DashboardInstanceIdentityDelegationConfigsGetOutput> {
    let path = `identity-delegation-configs/${identityDelegationConfigId}`;

    let request = {
      path,

      ...(opts?.headers ? { headers: opts.headers } : {})
    } as any;

    return this._get(request).transform(
      mapDashboardInstanceIdentityDelegationConfigsGetOutput
    );
  }

  /**
   * @name Create identity delegation config
   * @description Creates a new identity delegation config.
   *
   * @param `body` - DashboardInstanceIdentityDelegationConfigsCreateBody
   * @param `opts` - { headers?: Record<string, string> }
   * @returns DashboardInstanceIdentityDelegationConfigsCreateOutput
   * @see https://metorial.com/api
   * @see https://metorial.com/docs
   */
  create(
    body: DashboardInstanceIdentityDelegationConfigsCreateBody,
    opts?: { headers?: Record<string, string> }
  ): Promise<DashboardInstanceIdentityDelegationConfigsCreateOutput> {
    let path = 'identity-delegation-configs';

    let request = {
      path,
      body: mapDashboardInstanceIdentityDelegationConfigsCreateBody.transformTo(
        body
      ),

      ...(opts?.headers ? { headers: opts.headers } : {})
    } as any;

    return this._post(request).transform(
      mapDashboardInstanceIdentityDelegationConfigsCreateOutput
    );
  }

  /**
   * @name Update identity delegation config
   * @description Updates mutable fields on an existing identity delegation config.
   *
   * @param `identityDelegationConfigId` - string
   * @param `body` - DashboardInstanceIdentityDelegationConfigsUpdateBody
   * @param `opts` - { headers?: Record<string, string> }
   * @returns DashboardInstanceIdentityDelegationConfigsUpdateOutput
   * @see https://metorial.com/api
   * @see https://metorial.com/docs
   */
  update(
    identityDelegationConfigId: string,
    body: DashboardInstanceIdentityDelegationConfigsUpdateBody,
    opts?: { headers?: Record<string, string> }
  ): Promise<DashboardInstanceIdentityDelegationConfigsUpdateOutput> {
    let path = `identity-delegation-configs/${identityDelegationConfigId}`;

    let request = {
      path,
      body: mapDashboardInstanceIdentityDelegationConfigsUpdateBody.transformTo(
        body
      ),

      ...(opts?.headers ? { headers: opts.headers } : {})
    } as any;

    return this._patch(request).transform(
      mapDashboardInstanceIdentityDelegationConfigsUpdateOutput
    );
  }

  /**
   * @name Delete identity delegation config
   * @description Archives an identity delegation config.
   *
   * @param `identityDelegationConfigId` - string
   * @param `opts` - { headers?: Record<string, string> }
   * @returns DashboardInstanceIdentityDelegationConfigsDeleteOutput
   * @see https://metorial.com/api
   * @see https://metorial.com/docs
   */
  delete(
    identityDelegationConfigId: string,
    opts?: { headers?: Record<string, string> }
  ): Promise<DashboardInstanceIdentityDelegationConfigsDeleteOutput> {
    let path = `identity-delegation-configs/${identityDelegationConfigId}`;

    let request = {
      path,

      ...(opts?.headers ? { headers: opts.headers } : {})
    } as any;

    return this._delete(request).transform(
      mapDashboardInstanceIdentityDelegationConfigsDeleteOutput
    );
  }
}
