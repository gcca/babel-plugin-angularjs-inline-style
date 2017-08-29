import css from 'css';
import { encapsulate } from '../src/encapsulate';

describe('#encapsulate', () => {
  let encapsulated;

  describe('when there is a single class', () => {
    beforeEach(() => {
      encapsulated = encapsulateTestInfo(`
      .extra {
        display: none;
      }
      `);
    });

    it('should kebabify `testInfo` to encapsulate', () => {
      expect(encapsulated).to.match(/\[_ng-.*\] .extra/);
    });
  });

  describe('when we have nested classes', () => {
    function generateCssWith(nestedSymbol) {
        return encapsulateTestInfo(`
        .main ${nestedSymbol} .extra {
          display: none;
        }
        `);
    }

    ['>', '+', '~'].map(nestedSymbol => {
      describe(`with '${nestedSymbol}'`, () => {
        beforeEach(() => {
          encapsulated = generateCssWith(nestedSymbol);
        });

        it('should kebabify `testInfo`', () => {
          if ('+' == nestedSymbol) {
            nestedSymbol = '\\+';
          }
          const pattern =
            `\\[_ng-.*\\] .main ${nestedSymbol} .extra`;
          const expression = new RegExp(pattern);
          expect(encapsulated).to.match(expression);
        });
      });
    });
  });

  describe('when we have multiple classes with bad use of `:host`', () => {
    beforeEach(() => {
      encapsulated = encapsulateTestInfo(`
      :host > .extra, :host textarea {
        display: none;
      }
      `);
    });

    it('should kebabify `testInfo`', () => {
      const pattern =
        '\\[_ng-.*\\] :host > .extra,\n\\[_ng-.*\\] :host textarea';
      const expression = new RegExp(pattern);
      expect(encapsulated).to.match(expression);
    });
  });
});

function encapsulateTestInfo(style) {
  const ast = css.parse(style);
  return css.stringify(encapsulate(ast).ast);
}
