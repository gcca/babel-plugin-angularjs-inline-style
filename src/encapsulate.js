export function encapsulate(ast) {
  const id = sid();
  return {
    id,
    ast: attribute(ast, id),
  };
}

function attribute(ast, id) {
  return Object.keys(ast).reduce((node, key) => {
    const rule = ast[key];
    if ('selectors' == key) {
      node[key] = rule.map(s => `[_ng-${id}]${':host' == s ? '' : ` ${s}`}`);
    } else if (Array.isArray(rule) || rule instanceof Object) {
      node[key] = attribute(rule, id);
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
