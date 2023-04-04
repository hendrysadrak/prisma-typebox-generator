import type { DMMF } from '@prisma/generator-helper';
import { lines } from './utils';

export const transformEnum = (enm: DMMF.DatamodelEnum) => {
  const values = enm.values
    .map((v) => `${v.name}: Type.Literal('${v.name}'),\n`)
    .join('');

  const source = lines([
    'import {Type, Static} from "@sinclair/typebox"',
    '\n\n',
    `export const ${enm.name}Const = {`,
    values,
    '}\n',
    `export const ${enm.name} = Type.KeyOf(Type.Object(${enm.name}Const))\n`,
    `export type ${enm.name}Type = Static<typeof ${enm.name}>`,
  ]);

  return {
    name: enm.name,
    rawString: source,
    inputRawString: undefined,
  };
};

export const transformEnums = (enums: DMMF.DatamodelEnum[]) =>
  enums.map(transformEnum);
