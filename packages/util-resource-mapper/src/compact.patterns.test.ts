import { describe, expect, it } from 'vitest';
import { createMapper, mapObject } from './compact';
import type { CompactDescriptor } from './compact';

let patterns: [CompactDescriptor, CompactDescriptor, any[]][] = [
  [
    5,
    [
      1,
      [
        ['gt', 0, 4],
        ['lt', 0, 4]
      ]
    ],
    [
      { gt: '2026-10-14' },
      { lt: null, gt: undefined },
      { gt: 'invalid', extra: true },
      null,
      42
    ]
  ],
  [
    6,
    [1, ['has_more_before', 'has_more_after']],
    [
      { has_more_before: true, hasMoreBefore: false, has_more_after: false },
      { has_more_after: null },
      {},
      null
    ]
  ],
  [
    8,
    [
      1,
      [
        ['created_at', 1, 4],
        ['updated_at', 1, 4]
      ]
    ],
    [
      { created_at: '2026-10-14', updated_at: null },
      { created_at: '2026-10-14', createdAt: 'collision' },
      { metadata: { raw_at: '2026-10-14' } },
      null
    ]
  ],
  [
    [7, 8],
    [
      1,
      [
        ['items', 0, [2, 8]],
        ['pagination', 0, 6]
      ]
    ],
    [
      {
        items: [{ created_at: '2026-10-14' }],
        pagination: { has_more_after: false },
        extra: true
      },
      { items: [], pagination: null },
      { pagination: {} },
      null
    ]
  ],
  [
    [7, 0],
    [1, [['pagination', 0, 6]]],
    [{ items: [{ raw_at: '2026-10-14' }], pagination: { has_more_before: true } }]
  ]
];

describe('compact date defaults and patterns', () => {
  it.each(patterns)(
    'expands %j equivalently without changing the transformation engine',
    (descriptor, canonical, inputs) => {
      let special = createMapper(descriptor);
      let expanded = createMapper(canonical);

      for (let input of inputs) {
        expect(special.transformFrom(input)).toEqual(expanded.transformFrom(input));
        let sdk = expanded.transformFrom(input);
        expect(special.transformTo(sdk)).toEqual(expanded.transformTo(sdk));
      }
    }
  );

  it('opts into suffix dates only for listed fields and honors explicit identity', () => {
    let legacy = mapObject(['created_at']);
    let mapper = mapObject(
      [
        'created_at',
        ['first_seen_at', 1, 0],
        ['metadata_at', 1, 0],
        ['created_at_filter', 'createdAtFilter', 5]
      ],
      1
    );
    let metadata = { created_at: '2026-10-14', nested: { raw_at: '2026-10-14' } };
    let wire = {
      created_at: '2026-10-14',
      first_seen_at: '2026-10-14',
      metadata_at: metadata,
      unknown_at: '2026-10-14'
    };

    expect(legacy.transformFrom(wire).createdAt).toBe('2026-10-14');
    expect(mapper.transformFrom(wire).createdAt).toEqual(new Date('2026-10-14'));
    expect(mapper.transformFrom(wire).firstSeenAt).toBe('2026-10-14');
    expect(mapper.transformFrom(wire).metadataAt).toBe(metadata);
    expect(mapper.transformFrom(wire).unknown_at).toBe('2026-10-14');
    expect(mapper.transformTo({ createdAt: '2026-10-14', metadataAt: metadata })).toEqual({
      created_at: new Date('2026-10-14'),
      metadata_at: metadata
    });
    expect(
      mapObject([['created_at', 'customDateName']], 1).transformFrom(wire).customDateName
    ).toEqual(new Date('2026-10-14'));
  });

  it('propagates defaults through nested arrays, objects, unions, and list patterns', () => {
    let child: CompactDescriptor = [3, [[0, [1, ['created_at', ['non_date_at', 1, 0]]]]]];
    let mapper = createMapper([7, [2, child]], 1);
    let input = {
      items: [[{ created_at: '2026-10-14', non_date_at: 'raw' }]],
      pagination: { has_more_before: false }
    };
    let copy = JSON.stringify(input);

    expect(mapper.transformFrom(input)).toEqual({
      items: [[{ createdAt: new Date('2026-10-14'), nonDateAt: 'raw' }]],
      pagination: { hasMoreBefore: false }
    });
    expect(JSON.stringify(input)).toBe(copy);
    expect(mapObject(['created_at'], 1).transformFrom({ created_at: null })).toEqual({
      createdAt: null
    });
    expect(mapObject(['created_at'], 1).transformFrom({ created_at: 'invalid' })).toEqual({
      createdAt: 'invalid'
    });
    expect(mapObject(['created_at'], 1).transformFrom({})).toEqual({});
  });
  it('rejects unknown numeric descriptors rather than treating them as a known pattern', () => {
    expect(() => createMapper(9 as any)).toThrow('Unsupported compact descriptor 9');
  });
});
