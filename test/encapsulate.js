import css from 'css';
import { encapsulate } from '../src/encapsulate';

describe('#encapsulate', () => {
  let encapsulated;

  describe('when there is a single class', () => {
    beforeEach(() => {
      encapsulated = encapsulateTestInfo(`
      test-info .extra {
        display: none;
      }
      `);
    });

    it('should snakify `testInfo` to encapsulate', () => {
      expect(encapsulated).to.match(/test-info\[_ng-.*\] .extra/);
    });
  });

  describe('when we have nested classes', () => {
    function generateCssWith(nestedSymbol) {
        return encapsulateTestInfo(`
        test-info ${nestedSymbol} .extra {
          display: none;
        }
        `);
    }

    ['>', '+', '~'].map(nestedSymbol => {
      describe(`with '${nestedSymbol}'`, () => {
        beforeEach(() => {
          encapsulated = generateCssWith(nestedSymbol);
        });

        it('should snakify `testInfo`', () => {
          if ('+' == nestedSymbol) {
            nestedSymbol = '\\+';
          }
          const pattern = `test-info\\[_ng-.*\\] ${nestedSymbol} .extra`;
          const expression = new RegExp(pattern);
          expect(encapsulated).to.match(expression);
        });
      });
    });
  });

  describe('when we have multiple classes', () => {
    beforeEach(() => {
      encapsulated = encapsulateTestInfo(`
      test-info > .extra, test-info textarea {
        display: none;
      }
      `);
    });

    it('should snakify `testInfo`', () => {
      const pattern = ('test-info\\[_ng-.*\\] > .extra,\n' +
                       'test-info\\[_ng-.*\\] textarea');
      const expression = new RegExp(pattern);
      expect(encapsulated).to.match(expression);
    });
  });
});

function encapsulateTestInfo(style) {
  const ast = css.parse(style);
  return css.stringify(encapsulate(ast, 'testInfo').ast);
}
