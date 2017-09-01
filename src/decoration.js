export function configCall(t, name, component) {
  return t.Identifier(
    `decorator('${name}Directive', ['$delegate', function($d) {` +
      `if (${component}.styling) {` +
        `var d = $d[0], c = d.compile, o = ${component};` +
        'd.compile = c' +
          '? function(e, a) { c.call(d, e, a); o.styling(e); }' +
          ': o.styling;' +
        'var style = document.createElement("style");' +
        'style.innerHTML = o.style;' +
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
  return !STACK.includes(name.value);
}
