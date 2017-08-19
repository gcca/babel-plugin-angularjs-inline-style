const snakeRegExp = /([A-Z])/;

export function encapsulate(ast, scope) {
  const id = `_ng-${sid()}`;
  return {
    id,
    ast: attribute(ast, snake(scope), id),
  };
}

function attribute(ast, scope, sid) {
  return Object.keys(ast).reduce((node, key) => {
    const rule = ast[key];
    if ('selectors' == key) {
      node[key] = rule.map(selector =>
        selector.split(/\s+/).map(token =>
          token == scope
          ? token.replace(/^(.*?)(:|$)(.*)?/, `$1[${sid}]$2$3`)
          : token
        ).join(' '));
    } else if (Array.isArray(rule) || rule instanceof Object) {
      node[key] = attribute(rule, scope, sid);
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

function snake(selector) {
  return selector.replace(snakeRegExp, '-$1').toLowerCase();
}
