import { CheminParam } from './CheminParam';
import { CheminUtils } from './CheminUtils';

const defaultCreateChemin = createCreator();

export const Chemin = {
  createCreator,
  create: defaultCreateChemin,
  parse: parseChemin,
  isChemin,
};

type CreateChemin = typeof defaultCreateChemin;

type Part = CheminParam<any, any> | Chemin<any>;

type Params<T> = T extends string
  ? {}
  : T extends Chemin<infer P>
  ? P
  : T extends CheminParam<any, void>
  ? {}
  : T extends CheminParam<infer N, infer P>
  ? { [K in N]: P }
  : {};

const IS_CHEMIN = Symbol('IS_CHEMIN');

interface SlashOptions {
  leadingSlash?: boolean;
  trailingSlash?: boolean;
}

export interface Chemin<Params = any> {
  [IS_CHEMIN]: Params;
  parts: Array<Part>;
  serialize: {} extends Params
    ? ((params?: null, options?: SlashOptions) => string)
    : (params: Params, options?: SlashOptions) => string;
  match: (pathname: string | Array<string>) => CheminMatchMaybe<Params>;
  matchExact: (pathname: string | Array<string>) => CheminMatchMaybe<Params>;
  extract: () => Array<Chemin>;
  toString: () => string;
}

type In = string | CheminParam<any, any> | Chemin<any>;

function isChemin(maybe: any): maybe is Chemin<any> {
  return maybe && maybe[IS_CHEMIN];
}

function createCreator(defaultSerializeOptions: SlashOptions = {}) {
  /**
 const r = num=>Array(num).fill(null).map((v,i)=>i);
 const res = r(10).map(count=> count === 0 ? (`function createChemin(): Chemin<{}>;`) : (`function createChemin<${r(count).map(i=>`P${i} extends In`).join(', ')}>(${r(count).map(i=>`p${i}: P${i}`).join(', ')}): Chemin<${r(count).map(i=>`Params<P${i}>`).join(' & ')}>;`)).map(v=>`// prettier-ignore\n${v}`).join('\n');

 */

  // prettier-ignore
  function createChemin(): Chemin<{}>;
  // prettier-ignore
  function createChemin<P0 extends In>(p0: P0): Chemin<Params<P0>>;
  // prettier-ignore
  function createChemin<P0 extends In, P1 extends In>(p0: P0, p1: P1): Chemin<Params<P0> & Params<P1>>;
  // prettier-ignore
  function createChemin<P0 extends In, P1 extends In, P2 extends In>(p0: P0, p1: P1, p2: P2): Chemin<Params<P0> & Params<P1> & Params<P2>>;
  // prettier-ignore
  function createChemin<P0 extends In, P1 extends In, P2 extends In, P3 extends In>(p0: P0, p1: P1, p2: P2, p3: P3): Chemin<Params<P0> & Params<P1> & Params<P2> & Params<P3>>;
  // prettier-ignore
  function createChemin<P0 extends In, P1 extends In, P2 extends In, P3 extends In, P4 extends In>(p0: P0, p1: P1, p2: P2, p3: P3, p4: P4): Chemin<Params<P0> & Params<P1> & Params<P2> & Params<P3> & Params<P4>>;
  // prettier-ignore
  function createChemin<P0 extends In, P1 extends In, P2 extends In, P3 extends In, P4 extends In, P5 extends In>(p0: P0, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5): Chemin<Params<P0> & Params<P1> & Params<P2> & Params<P3> & Params<P4> & Params<P5>>;
  // prettier-ignore
  function createChemin<P0 extends In, P1 extends In, P2 extends In, P3 extends In, P4 extends In, P5 extends In, P6 extends In>(p0: P0, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6): Chemin<Params<P0> & Params<P1> & Params<P2> & Params<P3> & Params<P4> & Params<P5> & Params<P6>>;
  // prettier-ignore
  function createChemin<P0 extends In, P1 extends In, P2 extends In, P3 extends In, P4 extends In, P5 extends In, P6 extends In, P7 extends In>(p0: P0, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6, p7: P7): Chemin<Params<P0> & Params<P1> & Params<P2> & Params<P3> & Params<P4> & Params<P5> & Params<P6> & Params<P7>>;
  // prettier-ignore
  function createChemin<P0 extends In, P1 extends In, P2 extends In, P3 extends In, P4 extends In, P5 extends In, P6 extends In, P7 extends In, P8 extends In>(p0: P0, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6, p7: P7, p8: P8): Chemin<Params<P0> & Params<P1> & Params<P2> & Params<P3> & Params<P4> & Params<P5> & Params<P6> & Params<P7> & Params<P8>>;

  function createChemin(...fragments: Array<In>): Chemin<any>;
  function createChemin(...fragments: Array<In>): Chemin<any> {
    const parts = fragments.map(part => {
      if (typeof part === 'string') {
        return CheminParam.constant(part);
      }
      return part;
    });
    let name: string | null = null;
    let chemins: Array<Chemin> | null = null;

    const chemin: Chemin<any> = {
      [IS_CHEMIN]: true,
      parts,
      serialize: (params: any | null, options?: SlashOptions) =>
        serializeChemin(chemin, params, {
          ...defaultSerializeOptions,
          ...options,
        }),
      extract: () => (chemins === null ? (chemins = extractChemins(chemin)) : chemins),
      match: pathname => matchChemin(chemin, pathname),
      matchExact: pathname => matchExactChemin(chemin, pathname),
      toString: () => (name === null ? (name = cheminToString(chemin)) : name),
    };

    return chemin;
  }

  return createChemin;
}

function parseChemin<Params extends { [key: string]: string } = { [key: string]: string }>(
  str: string,
  creator: CreateChemin = defaultCreateChemin
): Chemin<Params> {
  const strParts = CheminUtils.splitPathname(str);
  const parts: Array<Part> = strParts.map(strPart => {
    const isParam = strPart[0] === ':';
    const isOptional = strPart[strPart.length - 1] === '?';
    const name = strPart.slice(isParam ? 1 : 0, isOptional ? -1 : undefined);
    if (isParam === false && isOptional) {
      return CheminParam.optionalConst(name);
    }
    const inner: CheminParam<string, any> = isParam ? CheminParam.string(name) : CheminParam.constant(name);
    return isOptional ? CheminParam.optional(inner) : inner;
  });
  return creator(...parts);
}

export interface CheminMatch<Params> {
  params: Params;
  rest: Array<string>;
}

export type CheminMatchMaybe<Params> = CheminMatch<Params> | false;

function matchChemin<Params>(chemin: Chemin<Params>, pathname: string | Array<string>): CheminMatchMaybe<Params> {
  const pathParts = typeof pathname === 'string' ? CheminUtils.splitPathname(pathname) : pathname;
  return matchPart(chemin, pathParts);
}

function matchExactChemin<Params>(chemin: Chemin<Params>, pathname: string | Array<string>): false | Params {
  const match = matchChemin(chemin, pathname);
  if (match && match.rest.length === 0) {
    return match.params;
  }
  return false;
}

function matchPart(part: Part, pathname: Array<string>): CheminMatch<any> | false {
  if (isChemin(part)) {
    const match = matchNextParts(part.parts, pathname);
    if (match === false) {
      return false;
    }
    return {
      rest: match.rest,
      params: match.params,
    };
  }
  const res = part.match(...pathname);
  if (res.match === false) {
    return false;
  }
  return {
    params: {
      [part.name]: res.value,
    },
    rest: res.next,
  };
}

function matchNextParts(parts: Array<Part>, pathname: Array<string>): CheminMatch<any> | false {
  if (parts.length === 0) {
    return { params: {}, rest: pathname };
  }
  const nextPart = parts[0];
  const nextHasParams = isChemin(nextPart) ? true : (nextPart as any).noValue !== true;
  const res = matchPart(nextPart, pathname);
  if (res === false) {
    return false;
  }
  const nextRes = matchNextParts(parts.slice(1), res.rest);
  if (nextRes === false) {
    return false;
  }
  return {
    rest: nextRes.rest,
    params: {
      ...(nextHasParams ? res.params : {}),
      ...nextRes.params,
    },
  };
}

function serializeChemin<Params>(
  chemin: Chemin<Params>,
  params?: {} extends Params ? null | undefined : Params,
  options: SlashOptions = {}
): string {
  const { leadingSlash = true, trailingSlash = false } = options;
  const paramsResolved: any = params === null || params === undefined ? {} : params;

  const result = chemin.parts
    .map(part => {
      if (isChemin(part)) {
        return serializeChemin(part, paramsResolved, { leadingSlash: false, trailingSlash: false });
      }
      const value = paramsResolved[part.name];
      return part.serialize(value);
    })
    .filter((val: string | null): val is string => {
      return val !== null && val.length > 0;
    })
    .join('/');

  const empty = result.length === 0;
  if (empty && (leadingSlash || trailingSlash)) {
    return '/';
  }
  return (leadingSlash ? '/' : '') + result + (trailingSlash ? '/' : '');
}

function cheminToString(chemin: Chemin<any>, options: SlashOptions = {}): string {
  const { leadingSlash = true, trailingSlash = false } = options;
  const result = chemin.parts
    .map((part): string => {
      if (isChemin(part)) {
        return cheminToString(part, { leadingSlash: false, trailingSlash: false });
      }
      return part.toString();
    })
    .filter(val => {
      return val.length > 0;
    })
    .join('/');
  return (leadingSlash ? '/' : '') + result + (trailingSlash ? '/' : '');
}

function extractChemins(chemin: Chemin): Array<Chemin> {
  const result: Array<Chemin> = [chemin];
  function traverse(current: Part) {
    if (isChemin(current)) {
      if (result.indexOf(current) === -1) {
        result.push(current);
        current.parts.forEach(traverse);
      }
    }
  }
  chemin.parts.forEach(traverse);
  return result;
}
