import { generatorHandler } from '@prisma/generator-helper';
import { parseEnvValue } from '@prisma/sdk';
import { error } from 'console';
import { appendFile, mkdir, writeFile } from 'fs/promises';
import pMap from 'p-map';
import { join } from 'path';
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

    const barrelFile = join(outputDir, 'index.ts');

    await mkdir(outputDir, { recursive: true });
    await writeFile(barrelFile, '', { encoding: 'utf-8' });
    await pMap(
      payload,
      async (n) => {
        await writeFile(join(outputDir, n.name + '.ts'), format(n.rawString), {
          encoding: 'utf-8',
        });

        await appendFile(barrelFile, `export * from './${n.name}';\n`, {
          encoding: 'utf-8',
        });

        if (n.inputRawString) {
          await writeFile(
            join(outputDir, n.name + 'Input.ts'),
            format(n.inputRawString),
            { encoding: 'utf-8' },
          );

          await appendFile(barrelFile, `export * from './${n.name}Input';\n`, {
            encoding: 'utf-8',
          });
        }
      },
      { concurrency: 1 },
    );
  },
});
