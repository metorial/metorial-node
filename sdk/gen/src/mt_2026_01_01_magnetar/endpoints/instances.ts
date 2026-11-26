import {
  BaseMetorialEndpoint,
  MetorialEndpointManager
} from '@metorial/util-endpoint';

import {
  mapInstancesGetOutput,
  mapInstancesListOutput,
  type InstancesGetOutput,
  type InstancesListOutput
} from '../resources';

/**
 * @name Instances controller
 * @description An instance is an isolated environment within a Metorial project. Only the instances you can access are listed.
 *
 * @see https://metorial.com/api
 * @see https://metorial.com/docs
 */
export class MetorialInstancesEndpoint {
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
   * @name Get instance
   * @description Retrieves an instance.
   *
   * @param `instanceId` - string
   * @param `opts` - { headers?: Record<string, string> }
   * @returns InstancesGetOutput
   * @see https://metorial.com/api
   * @see https://metorial.com/docs
   */
  get(
    instanceId: string,
    opts?: { headers?: Record<string, string> }
  ): Promise<InstancesGetOutput> {
    let path = `instances/${encodeURIComponent(instanceId)}`;

    let request = {
      path,

      ...(opts?.headers ? { headers: opts.headers } : {})
    } as any;

    return this._get(request).transform(mapInstancesGetOutput);
  }

  /**
   * @name List instances
   * @description Returns the instances in the organization that the caller can access.
   *
   * @param `opts` - { headers?: Record<string, string> }
   * @returns InstancesListOutput
   * @see https://metorial.com/api
   * @see https://metorial.com/docs
   */
  list(opts?: {
    headers?: Record<string, string>;
  }): Promise<InstancesListOutput> {
    let path = 'instances';

    let request = {
      path,

      ...(opts?.headers ? { headers: opts.headers } : {})
    } as any;

    return this._get(request).transform(mapInstancesListOutput);
  }
}
