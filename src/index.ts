import { generatorHandler } from '@prisma/generator-helper';
import { parseEnvValue } from '@prisma/sdk';
import { error } from 'console';
import { appendFile, mkdir, writeFile } from 'fs/promises';
import * as path from 'path';
import { format as prettier } from 'prettier';
import { transformDMMF } from './generator/transformDMMF';

const format = (str: string) => {
  try {
    return prettier(str);
  } catch (e) {
    error(e);
    return str;
  }
};

generatorHandler({
  onManifest() {
    return {
      defaultOutput: './typebox',
      prettyName: 'Prisma Typebox Generator',
    };
  },
  async onGenerate(options) {
    const payload = transformDMMF(options.dmmf);

    if (!options.generator.output) {
      throw new Error('No output was specified for Prisma Typebox Generator');
    }

    const outputDir =
      // This ensures previous version of prisma are still supported
      typeof options.generator.output === 'string'
        ? (options.generator.output as unknown as string)
        : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          parseEnvValue(options.generator.output);

    const barrelFile = path.join(outputDir, 'index.ts');

    await mkdir(outputDir, { recursive: true });
    await writeFile(barrelFile, '', { encoding: 'utf-8' });

    await Promise.all(
      payload.map((n) => {
        const fsPromises = [];

        fsPromises.push(
          writeFile(path.join(outputDir, n.name + '.ts'), format(n.rawString), {
            encoding: 'utf-8',
          }),
        );

        fsPromises.push(
          appendFile(barrelFile, `export * from './${n.name}';\n`, {
            encoding: 'utf-8',
          }),
        );

        if (n.inputRawString) {
          fsPromises.push(
            writeFile(
              path.join(outputDir, n.name + 'Input.ts'),
              format(n.inputRawString),
              {
                encoding: 'utf-8',
              },
            ),
          );

          fsPromises.push(
            appendFile(barrelFile, `export * from './${n.name}Input';\n`, {
              encoding: 'utf-8',
            }),
          );
        }

        return Promise.all(fsPromises);
      }),
    );
  },
});
