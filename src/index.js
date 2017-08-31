import { dirname, join } from 'path';

import 'better-log/install';

import * as fs from 'fs';
import css from 'css';

import { encapsulate } from './encapsulate';

function isComponent(path) {
  const property = path.node.callee.property;
  return property && 'component' == property.name;
}

function configCall(t, name) {
  return t.Identifier(
    `decorator('${name}Directive', ['$delegate', function($d) {` +
      'if ($d[0].styling) {' +
        'var d = $d[0], c = d.compile;' +
        'd.compile = c' +
          '? function(e, a) { c.call(d, e, a); d.styling(e); }' +
          ': d.styling;' +
        'var style = document.createElement("style");' +
        'style.innerHTML = d.style;' +
        'document.head.appendChild(style);' +
      '}' +
      'return $d;' +
    '}])');
}

const STACK = [];

export default function({types: t}) {
  return {
    visitor: {
      CallExpression(path) {
        if (isComponent(path)) {
          const args = path.node.arguments
          const name = args[0];
          const options = args[1];
          if (t.isStringLiteral(name) ) {
            if (STACK.includes(name.value)) return;
            STACK.push(name.value);
            const config = configCall(t, name.value);
            const member = t.MemberExpression(path.node, config);
            path.find(p => p.isExpression()).replaceWith(member);
          }
        }
      },
      ObjectProperty(path, state) {
        if ('styleUrl' == path.node.key.name) {
          const filename = path.node.value.value;
          const style = readStyleFile(filename, state);
          addStylingProperty(path, t, style);
        }
      },
    },
  };
}

function addStylingProperty(path, t, style) {
  const { ast, id } = encapsulate(css.parse(style));
  const text = css.stringify(ast);

  path.node.key.name = 'style';
  path.node.value.value = text;
  const styling = `function(e) { e.attr('_ng-${id}', ''); }`;
  const styleScope = t.ObjectProperty(t.Identifier('styling'),
                                      t.Identifier(styling))
  path.insertAfter(styleScope);
}

function readStyleFile(filename, state) {
  const basePath = state.opts.basePath || dirname(state.file.opts.filename);
  const relativeFilename = join(basePath, filename);
  try {
    return fs.readFileSync(relativeFilename).toString();
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
