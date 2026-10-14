import type { MetorialMapper } from './types';

export type CompactTarget = string | 0 | 1;

export type CompactField =
  | string
  | readonly [source: string, target: CompactTarget]
  | readonly [source: string, target: CompactTarget, descriptor: CompactDescriptor];

export type CompactFields = readonly CompactField[];

export type CompactKind = 0 | 1 | 2 | 3 | 4 | 5;

export type CompactBranch = readonly [kind: CompactKind, descriptor: CompactDescriptor];

export type CompactDescriptor =
  | 0
  | 4
  | 5
  | 6
  | 8
  | readonly [7, CompactDescriptor]
  | readonly [1, CompactFields]
  | readonly [2, CompactDescriptor]
  | readonly [3, readonly CompactBranch[]];

type CompiledField = readonly [source: string, target: string, descriptor: CompiledDescriptor];

type CompiledDescriptor =
  | 0
  | 4
  | readonly [1, readonly CompiledField[], ReadonlySet<string>, ReadonlySet<string>]
  | readonly [2, CompiledDescriptor]
  | readonly [3, readonly (CompiledDescriptor | undefined)[]];

let camelCase = (source: string) =>
  source.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());

let patternCache = new Map<5 | 6 | 8, CompiledDescriptor>();

let compile = (descriptor: CompactDescriptor, flags: number): CompiledDescriptor => {
  if (typeof descriptor === 'number') {
    if (descriptor === 0 || descriptor === 4) return descriptor;
    if (descriptor !== 5 && descriptor !== 6 && descriptor !== 8) {
      throw new Error(`Unsupported compact descriptor ${descriptor}.`);
    }

    let cached = patternCache.get(descriptor);
    if (cached !== undefined) return cached;

    let fields: CompactFields =
      descriptor === 5
        ? [
            ['gt', 0, 4],
            ['lt', 0, 4]
          ]
        : descriptor === 6
          ? ['has_more_before', 'has_more_after']
          : [
              ['created_at', 1, 4],
              ['updated_at', 1, 4]
            ];
    let compiled = compile([1, fields], 0);
    patternCache.set(descriptor, compiled);

    return compiled;
  }

  if (descriptor[0] === 7) {
    return compile(
      [
        1,
        [
          ['items', 0, [2, descriptor[1]]],
          ['pagination', 0, 6]
        ]
      ],
      flags
    );
  }

  if (descriptor[0] === 1) {
    let fields: CompiledField[] = [];

    for (let field of descriptor[1]) {
      let source = typeof field === 'string' ? field : field[0];
      let target = typeof field === 'string' ? 1 : field[1];
      let name = target === 0 ? source : target === 1 ? camelCase(source) : target;
      let implicit: 0 | 4 = (flags & 1) !== 0 && source.endsWith('_at') ? 4 : 0;
      let child = compile(
        typeof field === 'string' ? implicit : (field[2] ?? implicit),
        flags
      );

      if (source !== name || child !== 0) fields.push([source, name, child]);
    }

    if (!fields.length) return 0;

    return [
      1,
      fields,
      new Set(fields.map(field => field[0])),
      new Set(fields.map(field => field[1]))
    ];
  }

  if (descriptor[0] === 2) {
    let child = compile(descriptor[1], flags);
    return child === 0 ? 0 : [2, child];
  }

  let branches: (CompiledDescriptor | undefined)[] = [];

  for (let [kind, child] of descriptor[1]) {
    branches[kind] = compile(child, flags);
  }

  if (branches.every(branch => branch === undefined || branch === 0)) return 0;

  return [3, branches];
};

let toDate = (input: any) => {
  if (input instanceof Date) return input;

  if (typeof input === 'string' || typeof input === 'number') {
    let date = new Date(input);
    if (!isNaN(date.getTime())) return date;
  }

  return input;
};

let kindOf = (input: any): CompactKind | undefined => {
  if (Array.isArray(input)) return 1;
  if (input instanceof Date) return 2;
  if (typeof input === 'object' && input !== null) return 0;
  if (typeof input === 'string') return 3;
  if (typeof input === 'number') return 4;
  if (typeof input === 'boolean') return 5;

  return undefined;
};

let setField = (output: any, key: string, value: any) => {
  if (key === '__proto__') {
    Object.defineProperty(output, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    output[key] = value;
  }
};

let transform = (descriptor: CompiledDescriptor, input: any, to: boolean): any => {
  if (descriptor === 0) return input;
  if (descriptor === 4) return toDate(input);

  if (descriptor[0] === 1) {
    if (typeof input !== 'object' || input === null) return input;

    let output: any = {};
    let consumed = descriptor[to ? 3 : 2];

    for (let [source, target, child] of descriptor[1]) {
      let from = to ? target : source;
      if (!Object.prototype.propertyIsEnumerable.call(input, from)) continue;

      setField(output, to ? source : target, transform(child, input[from], to));
    }

    for (let key of Object.keys(input)) {
      if (!consumed.has(key)) setField(output, key, input[key]);
    }

    return output;
  }

  if (descriptor[0] === 2) {
    if (!Array.isArray(input) || !input.length) return input;

    return input.map(item => transform(descriptor[1], item, to));
  }

  let kind = kindOf(input);
  if (kind === undefined) return input;

  let branch = descriptor[1][kind];
  if (branch !== undefined) return transform(branch, input, to);

  if ((kind === 3 || kind === 4) && descriptor[1][2] === 4) return toDate(input);

  return input;
};

export let createMapper = <T = any>(
  descriptor: CompactDescriptor,
  flags = 0
): MetorialMapper<T> => {
  let compiled = compile(descriptor, flags);

  return {
    transformFrom: (input: any): T => transform(compiled, input, false),
    transformTo: (input: any) => transform(compiled, input, true)
  };
};

export let mapObject = <T = any>(fields: CompactFields, flags = 0): MetorialMapper<T> =>
  createMapper<T>([1, fields], flags);
