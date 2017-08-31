import { configCall, isComponent, isntDecorated } from './decoration';
import { addStylingProperty, readStyleFile } from './styling'

export default function({types: t}) {
  return {
    visitor: {
      CallExpression(path) {
        if (isComponent(path)) {
          const args = path.node.arguments
          const name = args[0];
          const options = args[1];
          if (t.isStringLiteral(name) && isntDecorated(name)) {
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
