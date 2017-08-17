import * as fs from 'fs';
import css from 'css';

import { encapsulate } from './encapsulate';

let filename, selector, text;

function isComponent(path) {
  const property = path.node.callee.property;
  return property && 'component' == property.name;
}

function configCall(t, name, options) {
  const snake = name.replace(/([A-Z])/, '-$1').toLowerCase();
  return t.identifier(`config(['$provide', function($p) {
    $p.decorator('${name}Directive', ['$delegate', function($d) {
      $d[0].compile = function(tE) {
        var r = /${snake}\\[(_ng-[\\w_-]+)\\]/.exec(${options}.style);
        if (r) tE.attr(r[1], '');
      };
      return $d;
    }]);
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
      ObjectProperty(path) {
        if ('styleUrl' == path.node.key.name) {
          filename = path.node.value.value;
        }
        if ('selector' == path.node.key.name) {
          selector = path.node.value.value;
        }
        if (filename && selector) {
          if (!text) {
            const style = fs.readFileSync(filename).toString();
            const ast = css.parse(style);
            text = css.stringify(encapsulate(ast, selector));
          }
          if ('styleUrl' == path.node.key.name) {
            path.node.key.name = 'style';
            path.node.value.value = text;
          }
        }
      },
    },
  };
}
