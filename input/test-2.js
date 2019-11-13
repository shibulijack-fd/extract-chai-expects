import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import {
  find,
  findAll,
  render,
  triggerEvent
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import contact from 'freshdesk/tests/fixtures/contact';

import { setupTranslations, stubRouter } from '@freshdesk/test-helpers';

describe('Integration | Component | module-contacts/contact-details/contact-info', function() {
  let hooks = setupRenderingTest();
  setupTranslations(hooks);

  let newTicket = '[data-test-id="add-tags"]';

  hooks.beforeEach(function() {
    stubRouter();

    this.store = this.owner.lookup('service:store');
    this.get('store').pushPayload('contact', contact);
    this.set('contact', this.get('store').peekRecord('contact', 1));
  });

  it('renders', async function() {
    await render(hbs`{{module-contacts/contact-details/contact-info contact=contact}}`);

    expect(this.element).to.not.be.null;
  });

  // TODO:: [FIXTEST]: Not sure why this if checks are for.
  it('verify tags are rendered', async function() {
    await render(hbs`{{module-contacts/contact-details/contact-info contact=contact contactFields=contactFields}}`);

    if (findAll('[data-test-tags]').length > 0) {
      if (findAll('[data-test-remaining-count]').length > 0) {
        await triggerEvent('[data-test-remaining-count]', 'mouseenter');

        let dataLength = findAll('[data-test-filtered-data]').length + findAll('[data-test-remaining-data]').length;

        expect(dataLength).to.be.equal(this.get('contact.tags.length'));
      } else {
        expect(findAll('[data-test-filtered-data]').length).to.be.equal(this.get('contact.tags.length'));
      }
    }
  });

  it('renders new ticket', async function() {
    await render(hbs`{{module-contacts/contact-details/contact-info contact=contact}}`);

    expect(this.element).to.not.be.null;
  });

  it('verify ticket icon is rendered', async function() {
    await render(hbs`{{module-contacts/contact-details/contact-info contact=contact validContact=true}}`);

    expect(find('[data-test-icon="add-tags"]')).to.not.be.null;
    expect(find('[data-test-phone-option]')).to.be.null;
    expect(find(newTicket).textContent.trim()).to.equal('New ticket');
  });

  it('will truncate name longer than 120 characters', async function() {
    let name = 'VeryBigTestname'.repeat(9);
    let contact = this.get('contact');
    contact.set('name', name);
    await this.render(hbs`{{module-contacts/contact-details/contact-info contact=contact validContact=true}}`);
    expect(this.$('[data-test-id="contact__info__name"]')).to.have.length(1);
    expect(find('[data-test-id="contact__info__name"]').textContent.trim()).to.have.length(123);
  });

  it('will not truncate name shorter than 120 characters', async function() {
    let name = 'VeryBigTestname'.repeat(8);
    let contact = this.get('contact');
    contact.set('name', name);
    await this.render(hbs`{{module-contacts/contact-details/contact-info contact=contact validContact=true}}`);
    expect(this.$('[data-test-id="contact__info__name"]')).to.have.length(1);
    expect(find('[data-test-id="contact__info__name"]').textContent.trim()).to.have.length(120);
  });
});
