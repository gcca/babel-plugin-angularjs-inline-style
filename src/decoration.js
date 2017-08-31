const STACK = [];

export function configCall(t, name) {
  STACK.push(name);
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

export function isComponent(path) {
  const property = path.node.callee.property;
  return property && 'component' == property.name;
}

export function isntDecorated(name) {
  return STACK.includes(name.value);
}
