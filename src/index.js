import { configCall, isComponent, isntDecorated }
  from './decoration';
import { addStylingProperty, isStyleUrl, isStylized, readStyle }
  from './styling';

const STACK = [];

export default function({types: t}) {
  return {
    visitor: {
      CallExpression(path, state) {
        if (isComponent(path)) {
          const args = path.node.arguments
          const name = args[0];
          const options = args[1];
          if (t.isStringLiteral(name)) {
            const centinel = `${state.file.opts.filename}-${name.value}`;
            if (STACK.includes(centinel)) return;
            STACK.push(centinel);
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
        if (isStylized(path)) {
          let style;
          if (isStyleUrl(path)) {
            style = readStyle(path, state);
          } else if ('style' == path.node.key.name) {
            const value = path.node.value;
            if (t.isTemplateLiteral(value)) {
              style = value.quasis[0].value.raw;
              path.replaceWith(t.ObjectProperty(t.Identifier('style'),
                                                t.StringLiteral('')));
            } else if (t.isStringLiteral(value)) {
              style = value.value;
            }
          }
          if (style) addStylingProperty(path, t, style);
        }
      },
    },
  };
}
