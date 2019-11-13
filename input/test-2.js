import { expect } from 'chai';
import { describe, it } from 'mocha';
import {
  click,
  find,
  findAll,
  render,
  triggerKeyEvent
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { typeInSearch, clickTrigger } from 'freshdesk/tests/helpers/ember-power-select';
import { setupRenderingWithMirage } from '@freshdesk/test-helpers';

describe('Integration | Component | module-tickets/new-ticket/add-requester', function() {
  setupRenderingWithMirage();

  it('should have name, email, company and phone field', async function() {
    let contact = {
      name: null,
      email: null,
      company_name: null,
      phone: null
    };
    let createdContact = this.get('store').createRecord('contact', contact);
    this.set('contact', createdContact);

    await render(hbs `{{module-tickets/new-ticket/add-requester model=contact startValidate=false}}`);

    expect(find('[data-test-id="requesterName"]')).to.not.be.null;
    expect(find('[data-test-id="requesterEmail"]')).to.not.be.null;
    expect(find('[data-test-id="requesterPhone"]')).to.not.be.null;
    expect(find('[data-test-id="requesterCompany"]')).to.not.be.null;
  });

  it('should be able to validate existing email Id', async function() {
    let contact = {
      name: 'annie',
      email: 'andrew07@hotmail.com',
      company_name: null,
      phone: null
    };
    this.set('startValidate', true);
    let createdContact = this.get('store').createRecord('contact', contact);
    this.set('contact', createdContact);

    await render(hbs `{{module-tickets/new-ticket/add-requester model=contact startValidate=startValidate}}`);

    await click('.add-requester');

    expect(find('.help-block')).to.not.be.null;
    expect(find('[data-test-id="requesterEmail"] .help-block').textContent.trim()).to.be.equal(`A contact with this email "${contact.email}" already exists`);
  });

  it('should be able to validate invalid email Id', async function() {
    let contact = {
      name: 'annie',
      email: 'annanielsen',
      company_name: null,
      phone: null
    };
    this.set('startValidate', true);
    let createdContact = this.get('store').createRecord('contact', contact);
    this.set('contact', createdContact);

    await render(hbs `{{module-tickets/new-ticket/add-requester model=contact startValidate=startValidate}}`);

    await click('.add-requester');

    expect(find('.help-block')).to.not.be.null;
    expect(find('[data-test-id="requesterEmail"] .help-block').textContent.trim()).to.be.equal('Please enter a valid email');
  });

  it('should show "fill at least one field" message when email or phone is empty', async function() {
    let contact = {
      name: 'annie',
      email: null,
      company_name: null,
      phone: null
    };
    this.set('startValidate', true);
    let createdContact = this.get('store').createRecord('contact', contact);
    this.set('contact', createdContact);

    await render(hbs `{{module-tickets/new-ticket/add-requester model=contact startValidate=startValidate}}`);

    await click('.add-requester');

    expect(findAll('.help-block')).to.have.length(2);
    expect(find('[data-test-id="requesterEmail"] .help-block').textContent.trim()).to.be.equal('Please fill at least one of these fields');
    expect(find('[data-test-id="requesterPhone"] .help-block').textContent.trim()).to.be.equal('Please fill at least one of these fields');
  });

  it('should not show any error when all field is valid', async function() {
    let contact = {
      name: 'annie',
      email: null,
      company_name: null,
      phone: '2131231'
    };
    this.set('startValidate', true);
    let createdContact = this.get('store').createRecord('contact', contact);
    this.set('contact', createdContact);

    await render(hbs `{{module-tickets/new-ticket/add-requester model=contact startValidate=startValidate}}`);

    await click('.add-requester');

    expect(find('.help-block')).to.be.null;
  });

  it('should show error message if name field left as blank', async function() {
    let contact = {
      name: '  ',
      email: 'timoky@mohwak.com',
      company_name: 'abc',
      phone: '2131231'
    };
    this.set('startValidate', true);
    let createdContact = this.get('store').createRecord('contact', contact);
    this.set('contact', createdContact);

    await render(hbs `{{module-tickets/new-ticket/add-requester model=contact startValidate=startValidate}}`);

    await click('.add-requester');

    expect(find('.help-block')).to.not.be.null;
    expect(find('[data-test-id="requesterName"] .help-block').textContent.trim()).to.be.equal('This field can\'t be blank');
  });

  it('should not allow blank in email or phone', async function() {
    let contact = {
      name: 'annie',
      email: ' ',
      company_name: 'abc',
      phone: '  '
    };
    this.set('startValidate', true);
    let createdContact = this.get('store').createRecord('contact', contact);
    this.set('contact', createdContact);

    await render(hbs `{{module-tickets/new-ticket/add-requester model=contact startValidate=startValidate}}`);

    await click('.add-requester');

    expect(findAll('.help-block')).to.have.length(2);
    expect(find('[data-test-id="requesterEmail"] .help-block').textContent.trim()).to.be.equal('Please fill at least one of these fields');
    expect(find('[data-test-id="requesterPhone"] .help-block').textContent.trim()).to.be.equal('Please fill at least one of these fields');
  });

  it('should be to able to search and select company value and show the options to create when it has no exact match', async function() {
    let contact = {
      name: 'annie',
      email: null,
      company_name: null,
      phone: 12121122
    };
    this.set('startValidate', true);
    let createdContact = this.get('store').createRecord('contact', contact);
    this.set('contact', createdContact);

    await render(hbs `{{module-tickets/new-ticket/add-requester model=contact startValidate=startValidate}}`);

    await clickTrigger();
    await typeInSearch('Allen');

    expect(find('input[type="search"]').value.trim()).to.be.equal('Allen');
    expect(findAll('.ember-power-select-options').length, 4);
    expect(find('.ember-power-select-option[aria-current="true"]').textContent.trim()).to.be.equal('Add "Allen"...');

    await triggerKeyEvent('.ember-power-select-trigger', 'keydown', 40);
    expect(find('.ember-power-select-option[aria-current="true"]').textContent.trim()).to.be.equal('Allen LLC');

    await click(findAll('.ember-power-select-option')[1]);
    expect(find('.ember-power-select-dropdown')).to.be.null;
    expect(find('.ember-power-select-selected-item').textContent.trim()).to.have.string('Allen LLC');
  });

  it('should be able to replace the existing company value when selecting second time', async function() {
    let contact = {
      name: 'annie',
      email: null,
      company_name: null,
      phone: 12121122
    };
    this.set('startValidate', true);
    let createdContact = this.get('store').createRecord('contact', contact);
    this.set('contact', createdContact);

    await render(hbs `{{module-tickets/new-ticket/add-requester model=contact startValidate=startValidate}}`);

    await clickTrigger();
    await typeInSearch('Allen');
    expect(findAll('.ember-power-select-options').length, 4);

    await click(findAll('.ember-power-select-option')[1]);
    expect(find('.ember-power-select-dropdown')).to.be.null;
    expect(find('.ember-power-select-selected-item').textContent.trim()).to.have.string('Allen LLC');

    await clickTrigger();
    await typeInSearch('Allen');
    await click(findAll('.ember-power-select-option')[2]);
    expect(find('.ember-power-select-dropdown')).to.be.null;
    expect(find('.ember-power-select-selected-item').textContent.trim()).to.have.string('Allen, Gonzalez and Houston');
  });

  it('should be able to select the new company value', async function() {
    let contact = {
      name: 'annie',
      email: null,
      company_name: null,
      phone: 12121122
    };
    this.set('startValidate', true);
    let createdContact = this.get('store').createRecord('contact', contact);
    this.set('contact', createdContact);

    await render(hbs `{{module-tickets/new-ticket/add-requester model=contact startValidate=startValidate}}`);

    await clickTrigger();
    await typeInSearch('CompanyIsFakeAndNewOne');
    expect(findAll('.ember-power-select-options').length, 1);

    await click(findAll('.ember-power-select-option')[0]);
    expect(find('.ember-power-select-dropdown')).to.be.null;
    expect(find('.ember-power-select-selected-item').textContent.trim()).to.have.string('CompanyIsFakeAndNewOne');
  });

  it('should not show an option to add company if there is a company exist with same name', async function() {
    let contact = {
      name: 'annie',
      email: null,
      company_name: null,
      phone: 12121122
    };
    this.set('startValidate', true);
    let createdContact = this.get('store').createRecord('contact', contact);
    this.set('contact', createdContact);

    await render(hbs `{{module-tickets/new-ticket/add-requester model=contact startValidate=startValidate}}`);

    await clickTrigger();
    await typeInSearch('Allen LLC');
    expect(findAll('.ember-power-select-options').length, 1);

    await click(findAll('.ember-power-select-option')[0]);
    expect(find('.ember-power-select-dropdown')).to.be.null;
    expect(find('.ember-power-select-selected-item').textContent.trim()).to.have.string('Allen LLC');
  });
});
