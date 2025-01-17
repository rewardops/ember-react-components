import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { hbs } from 'ember-cli-htmlbars';
import { click, fillIn, find, render, typeIn } from '@ember/test-helpers';
import sinon from 'sinon';

module('Integration | Utility | with-ember-support', function (hooks) {
  setupRenderingTest(hooks);

  test('it can render a React component', async function (assert) {
    await render(hbs`
      <BasicComponent />
    `);

    assert
      .dom('div > h1')
      .hasText('Hello from React', 'Renders content from a React component');
  });

  test('it can pass properties to a React component', async function (assert) {
    const [firstFoo, secondFoo] = ['bar', 'baz'];

    this.set('foo', firstFoo);

    await render(hbs`
      <WithProperties @foo={{this.foo}} />
    `);

    const button = find('button');
    const p = find('p');

    assert.dom(button).hasText('Updated is false', 'Has the initial state');
    assert
      .dom(p)
      .hasText(`foo equals ${firstFoo}`, 'Renders passed in properties');

    await click(button);

    assert.dom(button).hasText('Updated is true', 'Has the updated state');

    this.set('foo', secondFoo);

    assert
      .dom(p)
      .hasText(`foo equals ${secondFoo}`, 'Updates when properties change');
    assert
      .dom(button)
      .hasText('Updated is true', 'Maintains the updated state');
  });

  test('it can change input element values in a React component', async function (assert) {
    const [firstFoo, secondFoo, thirdFoo] = ['bar', '', 'baz'];

    this.set('foo', firstFoo);

    await render(hbs`
      <WithProperties @foo={{this.foo}} />
    `);

    const input = find('input');
    const p = find('p');

    await fillIn(input, secondFoo);

    assert.dom(input).hasValue(secondFoo);
    assert
      .dom(p)
      .hasText(`foo equals ${secondFoo}`, 'Updates when properties change');

    await typeIn(input, thirdFoo);

    assert.dom(input).hasValue(thirdFoo);
    assert
      .dom(p)
      .hasText(`foo equals ${thirdFoo}`, 'Updates when properties change');
  });

  test('an action passed into the component can be called', async function (assert) {
    const handleActionStub = sinon.stub();
    this.set('handleAction', handleActionStub);

    await render(hbs`
      <InvokeAction @handleAction={{this.handleAction}} />
    `);

    await click('button');

    assert.ok(handleActionStub.calledOnce, 'Invoked the passed in action');
  });

  test('state is persisted through updated props', async function (assert) {
    this.set('prop', 'foo');

    await render(hbs`
      <SetState @someValue={{this.prop}} />
    `);

    assert
      .dom('[data-test="state"]')
      .hasText('foo', 'Sets the state to the initial value');
    assert
      .dom('[data-test="prop"]')
      .hasText('foo', 'The initial prop value is displayed');

    this.set('prop', 'bar');

    assert
      .dom('[data-test="state"]')
      .hasText('foo', 'Has the initial state after props change');
    assert
      .dom('[data-test="prop"]')
      .hasText('bar', 'The prop has actually updated');
  });

  test('React hooks can be used', async function (assert) {
    await render(hbs`
      <WithHooks />
    `);

    assert
      .dom('[data-test="state"]')
      .hasText('You clicked 0 times', 'Initial state set');

    await click('button');

    assert
      .dom('[data-test="state"]')
      .hasText('You clicked 1 times', 'State updated via in-component hook');
  });

  module('usage with `ember-decorators`', function () {
    test('it works with services', async function (assert) {
      this.owner.factoryFor('service:session');

      await render(hbs`<UsingService />`);

      assert.dom('p').hasText('Hello, Alex');
    });
  });

  module('supporting yields and children', function () {
    test('it can yield the block to the React children', async function (assert) {
      await render(hbs`
        <YieldToChildren>
          <h1>Child content</h1>
        </YieldToChildren>
      `);

      assert.dom('#wrapper').exists();
      assert.dom('h1').exists();
    });

    test('the yield can have multiple children', async function (assert) {
      await render(hbs`
        <YieldToChildren>
          <p data-test="foo">Foo</p>
          <p data-test="bar">Bar</p>
        </YieldToChildren>
      `);

      assert.dom('#wrapper').exists();
      assert.dom('[data-test="foo"]').exists();
      assert.dom('[data-test="bar"]').exists();
    });
  });

  module('supporting functional components', function () {
    module('with traditional functions', function () {
      test('it can render them inline', async function (assert) {
        await render(hbs`
          <TraditionalFunctionalComponent @name="Alex" />
        `);

        assert.dom('[data-test-name]').hasText('Alex');
      });

      test('it can render children', async function (assert) {
        await render(hbs`
          <TraditionalFunctionalComponent>
            <div data-test="foo">Foo</div>
          </TraditionalFunctionalComponent>
        `);

        assert.dom('[data-test="foo"]').hasText('Foo');
      });

      test('it can handle Ember `hash` template helper props', async function (assert) {
        await render(hbs`
          <TraditionalFunctionalComponent @foo={{hash bar='baz'}} @name='yo' />
        `);

        assert.dom('[foo]').exists();
        assert.dom('[data-test-name]').hasText('yo');
      });
    });

    module('with arrow functions', function () {
      test('it can render them inline', async function (assert) {
        await render(hbs`
          <ArrowFunctionComponent @name="Alex" />
        `);

        assert.dom('[data-test-name]').hasText('Alex');
      });

      test('it can render children', async function (assert) {
        await render(hbs`
          <ArrowFunctionComponent>
            <div data-test="foo">Foo</div>
          </ArrowFunctionComponent>
        `);

        assert.dom('[data-test="foo"]').hasText('Foo');
      });
    });
  });

  module('with Ember mixin props passed to HOC', function () {
    test('it can render React function component inside a span', async function (assert) {
      await render(hbs`
        <SpanFunctionComponent />
      `);

      assert
        .dom('span > button')
        .hasText(
          'Button wrapped in a span',
          'Renders a button inside a span from a React component'
        );
    });

    test('it can render a React class component inside a span via decorator', async function (assert) {
      await render(hbs`
        <SpanClassComponent />
      `);

      assert
        .dom('span > button')
        .hasText(
          'Button wrapped in a span',
          'Renders a button inside a span from a React component'
        );
    });
  });
});
