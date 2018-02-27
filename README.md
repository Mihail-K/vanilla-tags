# Vanilla Tags

## Getting Started
Vanilla Tags relies on a `div` (or other block element) as a container for the tags and input field.
No special magic is required in the HTML DOM to setup the tag container.
```html
<div id="my-tags"></div>
```

The container may also be given two optional properties, passed as element attributes:
 - `data-name`, a field name to use for form submissions.
 - `data-value`, which is starting list of tags, delimited by semicolons.
```html
<div id="my-tags" data-name="tags" data-value="red;blue;green"></div>
```

To initialize Vanilla Tags, simply call the constructor. It expects a DOM element as a parameter.
```js
let element = document.querySelector('#my-tags');
let vanilla = new VanillaTags(element);
```

## Styling Tags
Vanilla Tags uses a small list of CSS classes to style tags. All classes are namespaced to avoid collisions.

| Class | Purpose |
| --- | --- |
| `.vanilla-tags--tag` | Each tag element |
| `.vanilla-tags--tag-remove` | The remove button on each tag |
| `.vanilla-tags--tag-input` | The trailing input field |

The library itself provides no default styles, but some examples might be added in the future.

### Invalid Inputs
In addition, the trailing input field also exposes a data property `data-valid` which contains a boolean value.
This can be used for styling the field, to highlight invalid inputs.

For example, to hightlight the field in red:
```css
.vanilla-tags--tag-input[data-valid="false"] {
  background-color: lightpink;
  border: solid 1px red;
  color: red;
}
```

Note that `data-valid` will be false when the input field is empty, despite not allowing for empty values.
This is by design, so that a user is not presented with an error state before having touched the field.

## Programmatic Access
Vanilla Tags provides programmatic control over most functionality provided by the library.
```javascript
let element = document.querySelector('#my-tags');
let vanilla = new VanillaTags(element);

vanilla.addTag('red');
vanilla.addTag('blue');
vanilla.addTag('green');

vanilla.removeTag('blue');
vanilla.tags // => ['red', 'green']
```

### Lifecycle Events
Vanilla Tags also provides dispatches events to the DOM element, which can be hooked into to receive feedback.
These events are namespaced to avoid collisions.

Currently, the only two available events are for tags being added or removed.
For example:
```javascript
let element = document.querySelector('#my-tags');
let vanilla = new VanillaTags(element);

element.addEventListener('tags::Add', (event) => {
  console.log('Added:', event.detail.value);
});
element.addEventListener('tags::Remove', (event) => {
  console.log('Removed:', event.detail.value);
});
```

## License
I saw a bunch of people had a section like this, so I put one here too.
Vanilla Tags is distributed under the MIT license.
