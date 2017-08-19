Pseudo CSS encapsulation for AngularJS
======================================

TL;DR Namespace CSS to AngularJS component by `styleUrl` property using component name.

Use
---

We need to scope all CSS styles with a class whose name is equals to component name. (Note that component name is camelCase and class name is kebab-case.)

Example
-------

```scss
a-foo {
  .class { ... }
  ...
}
```

```javascript
const AFooComponent = {
  selector: 'aFoo',
  styleUrl: './a-foo.css'
  template: '...',
};

angular.module('...', [])
  .component('aFoo', AFooComponent);
```
