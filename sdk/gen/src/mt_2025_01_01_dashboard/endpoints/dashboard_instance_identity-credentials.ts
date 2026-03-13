import {
  BaseMetorialEndpoint,
  MetorialEndpointManager
} from '@metorial/util-endpoint';

import {
  mapDashboardInstanceIdentityCredentialsCreateBody,
  mapDashboardInstanceIdentityCredentialsCreateOutput,
  mapDashboardInstanceIdentityCredentialsDeleteOutput,
  mapDashboardInstanceIdentityCredentialsGetOutput,
  mapDashboardInstanceIdentityCredentialsListOutput,
  mapDashboardInstanceIdentityCredentialsListQuery,
  mapDashboardInstanceIdentityCredentialsUpdateBody,
  mapDashboardInstanceIdentityCredentialsUpdateOutput,
  type DashboardInstanceIdentityCredentialsCreateBody,
  type DashboardInstanceIdentityCredentialsCreateOutput,
  type DashboardInstanceIdentityCredentialsDeleteOutput,
  type DashboardInstanceIdentityCredentialsGetOutput,
  type DashboardInstanceIdentityCredentialsListOutput,
  type DashboardInstanceIdentityCredentialsListQuery,
  type DashboardInstanceIdentityCredentialsUpdateBody,
  type DashboardInstanceIdentityCredentialsUpdateOutput
} from '../resources';

/**
 * @name Identity Credentials controller
 * @description Identity credentials bind an identity to concrete provider deployment, config, and auth resources.
 *
 * @see https://metorial.com/api
 * @see https://metorial.com/docs
 */
export class MetorialDashboardInstanceIdentityCredentialsEndpoint {
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
   * @name List identity credentials
   * @description Returns a paginated list of identity credentials for the instance.
   *
   * @param `instanceId` - string
   * @param `query` - DashboardInstanceIdentityCredentialsListQuery
   * @param `opts` - { headers?: Record<string, string> }
   * @returns DashboardInstanceIdentityCredentialsListOutput
   * @see https://metorial.com/api
   * @see https://metorial.com/docs
   */
  list(
    instanceId: string,
    query?: DashboardInstanceIdentityCredentialsListQuery,
    opts?: { headers?: Record<string, string> }
  ): Promise<DashboardInstanceIdentityCredentialsListOutput> {
    let path = `dashboard/instances/${instanceId}/identity-credentials`;

    let request = {
      path,

      query: query
        ? mapDashboardInstanceIdentityCredentialsListQuery.transformTo(query)
        : undefined,
      ...(opts?.headers ? { headers: opts.headers } : {})
    } as any;

    return this._get(request).transform(
      mapDashboardInstanceIdentityCredentialsListOutput
    );
  }

  /**
   * @name Get identity credential
   * @description Retrieves a specific identity credential by ID.
   *
   * @param `instanceId` - string
   * @param `identityCredentialId` - string
   * @param `opts` - { headers?: Record<string, string> }
   * @returns DashboardInstanceIdentityCredentialsGetOutput
   * @see https://metorial.com/api
   * @see https://metorial.com/docs
   */
  get(
    instanceId: string,
    identityCredentialId: string,
    opts?: { headers?: Record<string, string> }
  ): Promise<DashboardInstanceIdentityCredentialsGetOutput> {
    let path = `dashboard/instances/${instanceId}/identity-credentials/${identityCredentialId}`;

    let request = {
      path,

      ...(opts?.headers ? { headers: opts.headers } : {})
    } as any;

    return this._get(request).transform(
      mapDashboardInstanceIdentityCredentialsGetOutput
    );
  }

  /**
   * @name Create identity credential
   * @description Creates a new credential and attaches it to an identity.
   *
   * @param `instanceId` - string
   * @param `body` - DashboardInstanceIdentityCredentialsCreateBody
   * @param `opts` - { headers?: Record<string, string> }
   * @returns DashboardInstanceIdentityCredentialsCreateOutput
   * @see https://metorial.com/api
   * @see https://metorial.com/docs
   */
  create(
    instanceId: string,
    body: DashboardInstanceIdentityCredentialsCreateBody,
    opts?: { headers?: Record<string, string> }
  ): Promise<DashboardInstanceIdentityCredentialsCreateOutput> {
    let path = `dashboard/instances/${instanceId}/identity-credentials`;

    let request = {
      path,
      body: mapDashboardInstanceIdentityCredentialsCreateBody.transformTo(body),

      ...(opts?.headers ? { headers: opts.headers } : {})
    } as any;

    return this._post(request).transform(
      mapDashboardInstanceIdentityCredentialsCreateOutput
    );
  }

  /**
   * @name Update identity credential
   * @description Updates the delegation config attached to an identity credential.
   *
   * @param `instanceId` - string
   * @param `identityCredentialId` - string
   * @param `body` - DashboardInstanceIdentityCredentialsUpdateBody
   * @param `opts` - { headers?: Record<string, string> }
   * @returns DashboardInstanceIdentityCredentialsUpdateOutput
   * @see https://metorial.com/api
   * @see https://metorial.com/docs
   */
  update(
    instanceId: string,
    identityCredentialId: string,
    body: DashboardInstanceIdentityCredentialsUpdateBody,
    opts?: { headers?: Record<string, string> }
  ): Promise<DashboardInstanceIdentityCredentialsUpdateOutput> {
    let path = `dashboard/instances/${instanceId}/identity-credentials/${identityCredentialId}`;

    let request = {
      path,
      body: mapDashboardInstanceIdentityCredentialsUpdateBody.transformTo(body),

      ...(opts?.headers ? { headers: opts.headers } : {})
    } as any;

    return this._patch(request).transform(
      mapDashboardInstanceIdentityCredentialsUpdateOutput
    );
  }

  /**
   * @name Delete identity credential
   * @description Archives an identity credential.
   *
   * @param `instanceId` - string
   * @param `identityCredentialId` - string
   * @param `opts` - { headers?: Record<string, string> }
   * @returns DashboardInstanceIdentityCredentialsDeleteOutput
   * @see https://metorial.com/api
   * @see https://metorial.com/docs
   */
  delete(
    instanceId: string,
    identityCredentialId: string,
    opts?: { headers?: Record<string, string> }
  ): Promise<DashboardInstanceIdentityCredentialsDeleteOutput> {
    let path = `dashboard/instances/${instanceId}/identity-credentials/${identityCredentialId}`;

    let request = {
      path,

      ...(opts?.headers ? { headers: opts.headers } : {})
    } as any;

    return this._delete(request).transform(
      mapDashboardInstanceIdentityCredentialsDeleteOutput
    );
  }
}
