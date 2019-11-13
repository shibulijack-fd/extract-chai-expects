# extract-chai-expects

Node CLI tool to extract chai assertions - expect statements from JS test files.

- Uses Recast under the hood to parse the JS files and filter expect statements
- Aggregates the entire list of expect variations
- Finds the list of unique expects.

#### INSTALL

```sh
npm i extract-chai-expects
```

#### USAGE

```sh
extract-chai-expects --sourceDir PATH_TO_SOURCE_FOLDER
```

#### EXAMPLE

**/example/test.js**

```javascript
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { find, findAll } from '@ember/test-helpers';
import { setupRenderingWithMirage, setupWindowMock } from '@freshdesk/test-helpers';

describe('Integration | Component', function() {
  let hooks = setupRenderingWithMirage();
  setupWindowMock(hooks);

  it('basic expect statements', async function() {
    // Simple true validation
    expect(true).to.be.true;
    expect(true, 'expect with message').to.be.true;
    expect(true, 'expect with not').to.not.be.true;

    // Simple false validation
    expect(false).to.be.false;
    expect(true, 'false with not').to.not.be.false;
    expect(false, 'expect with message').to.be.false;
    
    // ok
    expect('Test').to.be.ok;
    expect('Test', 'With message').to.be.ok;
    
    let sampleArr = [1, 2];
    let sampleObj = {"name": "nucleus"};

    // Empty checks
    expect('', 'empty string').to.be.empty;
    expect([], 'empty array').to.be.empty;
    expect({}, 'empty object').to.be.empty;
    expect([1, 2], 'non empty array').to.not.be.empty;
    expect(sampleArr, 'non empty array ref').to.not.be.empty;
    expect({"name": "freshworks"}, 'non empty object').to.not.be.empty;
    expect(sampleObj, 'non empty object ref').to.not.be.empty;

    // Variations in equal assertion
    expect(true).to.equal(true);
    expect(find('[data-test-id=page-title]').innerText.trim(), '[Message] Expression with message').to.equal('[Expected] Page Title');

    // Variations in length
    // Find out if its a dom present case or not present case
    expect(findAll('[data-test-id=page-title]'), '[Message] Multiple elements should be present').to.have.length(2);
    expect(findAll('[data-test-id=page-title]')).to.have.length(1);
    expect(findAll('[data-test-id=page-title]'), '[Message] One Element Present').to.have.length(1); // With message and length 1
    expect(findAll('[data-test-id=page-title]'), '[Message] Element not present').to.have.length(0);
    expect(findAll('[data-test-id=page-title]')).to.have.length(0); // Without message
  });

  it('Expect within a nested block', function() {
	[true, true].forEach(function(item) {
      // Inner Comment
      expect(true).to.be.true;
    });
  });

});
```

On running `extract-chai-expects --sourceDir example/`, the following output file gets generated:

**output.txt**

```txt
[
	".to.be.true",
	".to.not.be",
	".to.be.false",
	".to.be.ok",
	".to.be.empty",
	".to.equal",
	".to.have.length"
]
```
