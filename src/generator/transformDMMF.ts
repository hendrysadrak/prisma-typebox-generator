import type { DMMF } from '@prisma/generator-helper';
import { transformEnums } from './enums';

const transformField = (field: DMMF.Field) => {
  const tokens = [field.name + ':'];
  let inputTokens = [];
  const deps = new Set();

  if (['Int', 'Float', 'Decimal'].includes(field.type)) {
    tokens.push('Type.Number()');
  } else if (['BigInt'].includes(field.type)) {
    tokens.push('Type.Integer()');
  } else if (['String', 'DateTime', 'Json', 'Date'].includes(field.type)) {
    tokens.push('Type.String()');
  } else if (field.type === 'Boolean') {
    tokens.push('Type.Boolean()');
  } else {
    tokens.push(`::${field.type}::`);
    deps.add(field.type);
  }

  if (field.isList) {
    tokens.splice(1, 0, 'Type.Array(');
    tokens.splice(tokens.length, 0, ')');
  }

  inputTokens = [...tokens];

  // @id cannot be optional except for input if it's auto increment
  if (field.isId && (field?.default as any)?.name === 'autoincrement') {
    inputTokens.splice(1, 0, 'Type.Optional(');
    inputTokens.splice(inputTokens.length, 0, ')');
  }

  if ((!field.isRequired || field.hasDefaultValue) && !field.isId) {
    tokens.splice(1, 0, 'Type.Optional(');
    tokens.splice(tokens.length, 0, ')');
    inputTokens.splice(1, 0, 'Type.Optional(');
    inputTokens.splice(inputTokens.length, 0, ')');
  }

  return {
    str: tokens.join(' ').concat('\n'),
    strInput: inputTokens.join(' ').concat('\n'),
    deps,
  };
};

const transformFields = (fields: DMMF.Field[]) => {
  let dependencies = new Set();
  const _fields: string[] = [];
  const _inputFields: string[] = [];

  fields
    .filter((field) => !field.relationName)
    .map(transformField)
    .forEach((field) => {
      _fields.push(field.str);
      _inputFields.push(field.strInput);
      [...field.deps].forEach((d) => {
        dependencies.add(d);
      });
    });

  return {
    dependencies,
    rawString: _fields.filter((f) => !!f).join(','),
    rawInputString: _inputFields.filter((f) => !!f).join(','),
  };
};

const transformModel = (model: DMMF.Model, models?: DMMF.Model[]) => {
  const fields = transformFields(model.fields);

  let raw = [
    `${models ? '' : `export const ${model.name} = `}Type.Object({\n\t`,
    fields.rawString,
    '})',
  ].join('\n');

  let inputRaw = [
    `${models ? '' : `export const ${model.name}Input = `}Type.Object({\n\t`,
    fields.rawInputString,
    '})',
  ].join('\n');

  if (Array.isArray(models))
    models.forEach((md) => {
      const re = new RegExp(`.+::${md.name}.+\n`, 'gm');
      const inputRe = new RegExp(`.+::${md.name}.+\n`, 'gm');
      raw = raw.replace(re, '');
      inputRaw = inputRaw.replace(inputRe, '');
    });

  return {
    raw,
    inputRaw,
    deps: fields.dependencies,
  };
};

const transformType = (model: DMMF.Model, models?: DMMF.Model[]) => {
  const fields = transformFields(model.fields);

  let raw = [
    `${models ? '' : `export const ${model.name} = `}Type.Object({\n\t`,
    fields.rawString,
    '})',
  ].join('\n');

  let inputRaw = [
    `${models ? '' : `export const ${model.name}Input = `}Type.Object({\n\t`,
    fields.rawInputString,
    '})',
  ].join('\n');

  if (Array.isArray(models))
    models.forEach((md) => {
      const re = new RegExp(`.+::${md.name}.+\n`, 'gm');
      const inputRe = new RegExp(`.+::${md.name}.+\n`, 'gm');
      raw = raw.replace(re, '');
      inputRaw = inputRaw.replace(inputRe, '');
    });

  return {
    raw,
    inputRaw,
    deps: fields.dependencies,
  };
};

export function transformDMMF(dmmf: DMMF.Document) {
  let { models = [], enums = [], types = [] } = dmmf.datamodel;

  const transformedEnums = transformEnums(enums);

  const transformedTypes = types.map((type) => {
    const importStatements = new Set([
      'import {Type, Static} from "@sinclair/typebox"',
    ]);

    let { raw, inputRaw, deps } = transformType(type);

    deps.forEach((dep) => {
      const depsModel = models.find((m) => m.name === dep);

      if (!depsModel) return;

      const replacer = transformModel(depsModel, models);
      const re = new RegExp(`::${dep}::`, 'gm');
      raw = raw.replace(re, replacer.raw);
      inputRaw = inputRaw.replace(re, replacer.inputRaw);
    });

    enums.forEach((enm) => {
      const re = new RegExp(`::${enm.name}::`, 'gm');

      if (!raw.match(re)) return;

      raw = raw.replace(re, enm.name);
      inputRaw = inputRaw.replace(re, enm.name);
      importStatements.add(`import { ${enm.name} } from './${enm.name}'`);
    });

    return {
      name: type.name,

      rawString: [
        [...importStatements].join('\n'),
        raw,
        `export type ${type.name}Type = Static<typeof ${type.name}>`,
      ].join('\n\n'),

      inputRawString: [
        [...importStatements].join('\n'),
        inputRaw,
        `export type ${type.name}InputType = Static<typeof ${type.name}Input>`,
      ].join('\n\n'),
    };
  });

  const transformedModels = models.map((model) => {
    const importStatements = new Set([
      'import {Type, Static} from "@sinclair/typebox"',
    ]);

    let { raw, inputRaw, deps } = transformModel(model);

    deps.forEach((dep) => {
      const depsModel = models.find((m) => m.name === dep);

      if (depsModel && depsModel.name !== model.name) {
        const replacer = transformModel(depsModel, models);
        const re = new RegExp(`::${dep}::`, 'gm');

        raw = raw.replace(re, replacer.raw);
        inputRaw = inputRaw.replace(re, replacer.inputRaw);

        // raw = raw.replace(re, depsModel.name);
        // inputRaw = inputRaw.replace(re, depsModel.name);
        // importStatements.add(
        //   `import { ${depsModel.name} } from './${depsModel.name}'`,
        // );
      }

      const depsType = types.find((m) => m.name === dep);

      if (depsType && depsType.name !== model.name) {
        // const replacer = transformType(depsType, types);
        const re = new RegExp(`::${dep}::`, 'gm');
        raw = raw.replace(re, depsType.name);
        inputRaw = inputRaw.replace(re, depsType.name);
        importStatements.add(
          `import { ${depsType.name} } from './${depsType.name}'`,
        );
      }
    });

    enums.forEach((enm) => {
      const re = new RegExp(`::${enm.name}::`, 'gm');

      if (!raw.match(re)) return;

      raw = raw.replace(re, enm.name);
      inputRaw = inputRaw.replace(re, enm.name);
      importStatements.add(`import { ${enm.name} } from './${enm.name}'`);
    });

    return {
      name: model.name,

      rawString: [
        [...importStatements].join('\n'),
        raw,
        `export type ${model.name}Type = Static<typeof ${model.name}>`,
      ].join('\n\n'),

      inputRawString: [
        [...importStatements].join('\n'),
        inputRaw,
        `export type ${model.name}InputType = Static<typeof ${model.name}Input>`,
      ].join('\n\n'),
    };
  });

  return [...transformedEnums, ...transformedTypes, ...transformedModels];
}
