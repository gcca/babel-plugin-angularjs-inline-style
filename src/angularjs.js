// Run before register components
export function inlineStyle() {
  const module = angular.module;
  angular.module = (name, requires, configFn) => {
    const module = module.call(angular, name, register, configFn);
    const component = module.component;
    module.component = (name, config) => {
      const self = component.call(module, name, config);
      if (config.selector && config.style) {
        module.decorator(name, ['$delegate', ($delegate) => {
          $delegate[0].compile = (tElem, tAttr) => {
            const elem = config.selector
                           .replace(/([A-Z])/, '-$1').toLowerCase();
            const result = (new RegExp(`${elem}\\[(_ng-[\w_-]+)\\]`))
                             .exec(config.style);
            if (result) {
              tElem.attr(result[1], '');
            }
          };
        }]);
        const style = document.createElement('style');
        style.innerHTML = config.style;
        document.head.appendChild(style);
        return $delegate;
      }
      return self;
    };
    return module;
  };
}
