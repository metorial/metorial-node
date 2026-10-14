import { describe, expect, it } from 'vitest';
import { createMapper, mapObject } from './compact';
import { mtMap } from './index';

describe('compact mappers', () => {
  it('matches legacy mapping in both directions while preserving unknown fields', () => {
    let legacy = mtMap.object({
      id: mtMap.objectField('id', mtMap.passthrough()),
      createdAt: mtMap.objectField('created_at', mtMap.date()),
      nestedItems: mtMap.objectField(
        'nested_items',
        mtMap.array(
          mtMap.object({
            displayName: mtMap.objectField('display_name', mtMap.passthrough()),
            dates: mtMap.objectField('dates', mtMap.array(mtMap.date()))
          })
        )
      )
    });
    let compact = mapObject(['nested_items', ['created_at', 1, 4]]);
    let nested = mapObject([
      ['created_at', 1, 4],
      ['nested_items', 1, [2, [1, ['display_name', ['dates', 0, [2, 4]]]]]]
    ]);
    let wire = {
      id: 'one',
      created_at: '2026-10-13',
      nested_items: [{ display_name: 'a', dates: ['2026-10-12'] }],
      extra_key: { raw_key: true }
    };
    let copy = JSON.stringify(wire);

    expect(nested.transformFrom(wire)).toEqual(legacy.transformFrom(wire));
    expect(nested.transformTo(legacy.transformFrom(wire))).toEqual(
      legacy.transformTo(legacy.transformFrom(wire))
    );
    expect(JSON.stringify(wire)).toBe(copy);
    expect(compact.transformFrom(wire).nestedItems).toBe(wire.nested_items);
    expect(nested.transformFrom(wire).extra_key).toBe(wire.extra_key);
  });

  it('reuses identity containers and copies transformed containers', () => {
    let input = { items: [{ unchanged: true }] };

    expect(createMapper(0).transformFrom(input)).toBe(input);
    expect(mapObject([]).transformTo(input)).toBe(input);
    expect(createMapper([2, [1, []]]).transformFrom(input.items)).toBe(input.items);
    expect(mapObject(['item_list']).transformFrom({ item_list: input.items }).itemList).toBe(
      input.items
    );
    expect(mapObject([['items', 0, [2, [1, ['other_key']]]]]).transformFrom(input)).not.toBe(
      input
    );
  });

  it('preserves missing, null, undefined, invalid, and unexpected values', () => {
    let mapper = mapObject([
      ['created_at', 1, 4],
      ['items', 0, [2, 4]]
    ]);

    for (let method of [mapper.transformFrom, mapper.transformTo]) {
      for (let value of [null, undefined, 42, 'text', false])
        expect(method(value)).toBe(value);
      expect(method({})).toEqual({});
    }

    expect(mapper.transformFrom({ created_at: undefined })).toEqual({ createdAt: undefined });
    expect(mapper.transformFrom({ created_at: null, items: null })).toEqual({
      createdAt: null,
      items: null
    });
    expect(mapper.transformTo({ createdAt: 'invalid', items: 42 })).toEqual({
      created_at: 'invalid',
      items: 42
    });
    expect(createMapper(4).transformFrom(NaN)).toBeNaN();

    let date = new Date();
    let empty: any[] = [];

    expect(createMapper(4).transformTo(date)).toBe(date);
    expect(createMapper([2, 4]).transformFrom(empty)).toBe(empty);
  });

  it('handles explicit names, swaps, and chains from the original input', () => {
    let swap = mapObject([
      ['first', 'second'],
      ['second', 'first']
    ]);
    let chain = mapObject([
      ['first', 'second'],
      ['second', 'third']
    ]);
    let explicit = mapObject([['custom_special_name', 'customSPECIALname']]);

    expect(swap.transformFrom({ first: 1, second: 2 })).toEqual({ first: 2, second: 1 });
    expect(swap.transformTo({ first: 2, second: 1 })).toEqual({ first: 1, second: 2 });
    expect(chain.transformFrom({ first: 1, second: 2 })).toEqual({ second: 1, third: 2 });
    expect(chain.transformTo({ second: 1, third: 2 })).toEqual({ first: 1, second: 2 });
    expect(explicit.transformFrom({ custom_special_name: 3 })).toEqual({
      customSPECIALname: 3
    });
    expect(explicit.transformTo({ customSPECIALname: 3 })).toEqual({ custom_special_name: 3 });
  });

  it('preserves legacy precedence for unconsumed destination keys', () => {
    let compact = mapObject(['some_key']);
    let legacy = mtMap.object({ someKey: mtMap.objectField('some_key', mtMap.passthrough()) });

    for (let input of [
      { some_key: 1, someKey: 2 },
      { someKey: 2, some_key: 1 }
    ]) {
      expect(compact.transformFrom(input)).toEqual(legacy.transformFrom(input));
      expect(compact.transformTo(input)).toEqual(legacy.transformTo(input));
    }
  });

  it('maps only own enumerable fields and safely preserves prototype-named keys', () => {
    let mapper = mapObject(['some_key']);
    let input = Object.create({ some_key: 'inherited' });
    Object.defineProperty(input, 'some_key', { value: 'hidden' });

    expect(mapper.transformFrom(input)).toEqual({});

    let special = JSON.parse('{"some_key":1,"__proto__":{"polluted":true},"constructor":2}');
    let output = mapper.transformFrom(special);

    expect(Object.getPrototypeOf(output)).toBe(Object.prototype);
    expect(Object.prototype.hasOwnProperty.call(output, '__proto__')).toBe(true);
    expect(output.constructor).toBe(2);
  });

  it('maps nested arrays and heterogeneous union arrays element by element', () => {
    let mapper = createMapper([
      3,
      [
        [0, [1, ['some_key']]],
        [
          1,
          [
            2,
            [
              3,
              [
                [0, [1, ['some_key']]],
                [2, 4]
              ]
            ]
          ]
        ]
      ]
    ]);
    let date = new Date('2026-10-13');

    expect(mapper.transformFrom([{ some_key: 1 }, '2026-10-13', 7, null])).toEqual([
      { someKey: 1 },
      date,
      new Date(7),
      null
    ]);
    expect(mapper.transformTo([{ someKey: 1 }, date, null])).toEqual([
      { some_key: 1 },
      date,
      null
    ]);
    expect(mapper.transformFrom({ some_key: 2 })).toEqual({ someKey: 2 });
    expect(createMapper([2, [2, 4]]).transformFrom([['2026-10-13']])).toEqual([[date]]);
  });

  it('gives string and number union branches precedence over date parsing', () => {
    let dates = createMapper([3, [[2, 4]]]);
    let strings = createMapper([
      3,
      [
        [2, 4],
        [3, 0]
      ]
    ]);
    let numbers = createMapper([
      3,
      [
        [2, 4],
        [4, 0]
      ]
    ]);
    let both = createMapper([
      3,
      [
        [2, 4],
        [3, 0],
        [4, 0]
      ]
    ]);
    let date = new Date('2026-10-13');

    for (let direction of ['transformFrom', 'transformTo'] as const) {
      expect(dates[direction]('2026-10-13')).toEqual(date);
      expect(dates[direction](7)).toEqual(new Date(7));
      expect(strings[direction]('2026-10-13')).toBe('2026-10-13');
      expect(strings[direction](7)).toEqual(new Date(7));
      expect(numbers[direction](7)).toBe(7);
      expect(numbers[direction]('2026-10-13')).toEqual(date);
      expect(both[direction]('2026-10-13')).toBe('2026-10-13');
      expect(both[direction](7)).toBe(7);
      expect(both[direction](date)).toBe(date);
      expect(dates[direction]('invalid')).toBe('invalid');
    }
  });
});
