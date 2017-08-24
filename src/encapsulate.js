const nesters = ['>', '+', '~'];
const sRe = /\s+/;

export function encapsulate(ast) {
  const id = `_ng-${sid()}`;
  return {
    id,
    ast: attribute(ast, id),
  };
}

function attribute(ast, sid) {
  return Object.keys(ast).reduce((node, key) => {
    const rule = ast[key];
    if ('selectors' == key) {
      node[key] = rule.map(selector =>
        selector.split(sRe).map(token =>
          (nesters.includes(token) ? token : `[${sid}] ${token}`)
            .replace(' :host', '')
        ).join(' '));
    } else if (Array.isArray(rule) || rule instanceof Object) {
      node[key] = attribute(rule, sid);
    } else {
      node[key] = rule;
    }
    return node;
  }, Array.isArray(ast) ? [] : {});
}

function sid() {
  return `${s4()}${s4()}`;
}

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}
