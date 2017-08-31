import { dirname, join } from 'path';

import { readFileSync } from 'fs';
import css from 'css';

import { encapsulate } from './encapsulate';

export function addStylingProperty(path, t, style) {
  const { ast, id } = encapsulate(css.parse(style));
  const text = css.stringify(ast);

  path.node.key.name = 'style';
  path.node.value.value = text;
  const styling = `function(e) { e.attr('_ng-${id}', ''); }`;
  const styleScope = t.ObjectProperty(t.Identifier('styling'),
                                      t.Identifier(styling))
  path.insertAfter(styleScope);
}

export function readStyleFile(filename, state) {
  const basePath = state.opts.basePath || dirname(state.file.opts.filename);
  const relativeFilename = join(basePath, filename);
  try {
    return readFileSync(relativeFilename).toString();
  } catch(error) {
    if ('ENOENT' == error.code) {
      console.error(`StyleURL Error: open file '${filename}'
 - base path: ${basePath}
 - error path: ${error.path}
 - relative: ${relativeFilename}
      `);
    } else {
      console.error('Error: Unkown inlineStyle error');
      throw error;
    }
    process.exit();
  }
}
