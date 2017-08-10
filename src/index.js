import * as fs from 'fs';
import css from 'css';

import { encapsulate } from './encapsulate';

let filename, selector, text;

export default function() {
  return {
    visitor: {
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
            path.node.key.name = 'style__';
            path.node.value.value = text;
          }
        }
      },
    },
  };
}
