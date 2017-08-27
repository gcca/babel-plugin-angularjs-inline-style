import { dirname, join } from 'path';

import 'better-log/install';

import * as fs from 'fs';
import css from 'css';

import { encapsulate } from './encapsulate';

function isComponent(path) {
  const property = path.node.callee.property;
  return property && 'component' == property.name;
}

function configCall(t, name, options) {
  return t.Identifier(`config(['$provide', function($p) {
    $p.decorator('${name}Directive', ['$delegate', function($d) {
      $d[0].compile = function(tE) {
        tE.attr(${options}.styleScope, '');
      };
      return $d;
    }]);
    var style = document.createElement('style');
    style.innerHTML = ${options}.style;
    document.head.appendChild(style);
  }])`);
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
            let component;
            if (t.isIdentifier(options)) {
              component = options.name;
            }
            if (t.isMemberExpression(options)) {
              component = `${options.object.name}.${options.property.name}`;
            }
            const config = configCall(t, name.value, component);
            const member = t.MemberExpression(path.node, config);
            path.find(p => p.isExpression()).replaceWith(member);
          }
        }
      },
      ObjectProperty(path, state) {
        if ('styleUrl' == path.node.key.name) {
          const basePath = state.opts.basePath
                             || dirname(state.file.opts.filename);
          const filename = join(basePath, path.node.value.value);

          let style;
          try {
            style = fs.readFileSync(filename).toString();
          } catch(error) {
            if ('ENOENT' == error.code) {
              console.error(`\tERROR: open file '${error.path}'`);
            } else {
              console.error('Unkown inlineStyle error');
              throw error;
            }
            return;
          }

          const { ast, id } = encapsulate(css.parse(style));
          const text = css.stringify(ast);

          path.node.key.name = 'style';
          path.node.value.value = text;
          const styleScope = t.ObjectProperty(t.Identifier('styleScope'),
                                              t.StringLiteral(id))
          path.insertAfter(styleScope);
        }
      },
    },
  };
}
