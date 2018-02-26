import { TagEvent } from './tag-event';
import { IVanillaTagsConfig } from './vanilla-tags-config';

export class VanillaTags {
    private _tagsMap: { [key: string]: Element } = {};
    private _inputField: Element;
    private _valueField: Element;

    constructor(
        private _container: Element,
        private _config: IVanillaTagsConfig = {}
    ) {
        this._inputField = this._createInputField();
        this._valueField = this._createValueField();
        this._createInitialTags();
    }

    addTag(value: string): Element {
        const tag = document.createElement('div');

        tag.setAttribute('class', 'vanilla-tags--tag');
        tag.innerText = value;
        this._createTagRemoveButton(tag, value);

        this._tagsMap[value] = tag;
        this._container.insertBefore(tag, this._inputField || this._container.lastChild);
        this._container.dispatchEvent(new CustomEvent(TagEvent.Add, {
            detail: { tag: tag, value: value }
        }));

        return tag;
    }

    removeTag(value: string): boolean {
        const tag = this._tagsMap[value];
        if(!tag) return false;

        delete this._tagsMap[value];
        tag.remove();
        this._container.dispatchEvent(new CustomEvent(TagEvent.Remove, {
            detail: { tag: tag, value: value }
        }));

        return true;
    }

    get tags(): string[] {
        return Object.keys(this._tagsMap);
    }

    private _createInitialTags(): void {
        this._initialTagsList.forEach((value) => this.addTag(value));
    }

    private _createInputField(): Element {
        const input = document.createElement('input');

        const handleTagCreation = (event: KeyboardEvent) => {
            if(event.keyCode === 13) {
                if(this._isValidInput(input.value)) {
                    this.addTag(input.value);
                    input.value = '';
                }

                return false;
            }

            return true;
        };
        const highlightInvalidInput = () => {
            // Highlight invalid inputs, except when the field is empty.
            const valid = input.value === '' || this._isValidInput(input.value);
            input.setAttribute('data-valid', valid.toString());
        };

        input.setAttribute('class', 'vanilla-tags--tag-input');
        input.setAttribute('type', 'text');
        input.setAttribute('data-valid', 'true');
        input.addEventListener('keydown', handleTagCreation);
        input.addEventListener('keyup', highlightInvalidInput);

        this._container.addEventListener(TagEvent.Remove, highlightInvalidInput);
        this._container.appendChild(input);

        return input;
    }

    private _createValueField(): Element {
        const value = document.createElement('input');
        const updateFieldValue = (event: Event) => {
            value.setAttribute('value', this.tags.join(';'));
        };

        value.setAttribute('type', 'hidden');
        value.setAttribute('name', this._outputName);
        value.setAttribute('value', '');

        this._container.appendChild(value);
        this._container.addEventListener(TagEvent.Add, updateFieldValue);
        this._container.addEventListener(TagEvent.Remove, updateFieldValue);

        return value;
    }

    private _createTagRemoveButton(tag: Element, value: string) {
        const button = document.createElement('a');

        button.setAttribute('class', 'vanilla-tags--tag-remove');
        button.innerText = 'x';

        button.addEventListener('click', () => this.removeTag(value));
        tag.appendChild(button);
    }

    private _isValidInput(value: string): boolean {
        return !!value && !this._tagsMap[value];
    }

    private get _outputName(): string {
        return this._container.getAttribute('data-name') || '';
    }

    private get _initialTagsList(): string[] {
        return (this._container.getAttribute('data-value') || '').split(';');
    }
}
