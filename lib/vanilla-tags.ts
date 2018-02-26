import { TagEvent } from './tag-event';
import { IVanillaTagsConfig } from './vanilla-tags-config';

interface ITagMap {
    [key: string]: Element
}

export class VanillaTags {
    private _tagsMap: ITagMap = {};
    private _inputField: HTMLInputElement;
    private _outputField: HTMLInputElement;

    constructor(
        private _container: Element,
        private _config: IVanillaTagsConfig = {}
    ) {
        this._inputField = this._createInputField();
        this._outputField = this._createOutputField();
        this._createInitialTags();
    }

    addTag(value: string): Element | null {
        if(!this.isValid(value)) return null;
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

    isEmpty(value: string): boolean {
        return !value;
    }

    isDuplicate(value: string): boolean {
        return !!this._tagsMap[value];
    }

    isValid(value: string): boolean {
        return !this.isEmpty(value) && !this.isDuplicate(value);
    }

    get inputValue(): string {
        return this._inputField.value;
    }

    get isInputEmpty(): boolean {
        return this.isEmpty(this.inputValue);
    }

    get isInputDuplicate(): boolean {
        return this.isDuplicate(this.inputValue);
    }

    get isInputValid(): boolean {
        return this.isValid(this.inputValue);
    }

    get tags(): string[] {
        return Object.keys(this._tagsMap);
    }

    private _createInitialTags(): void {
        this._initialTagsList.forEach((value) => this.addTag(value));
    }

    private _createInputField(): HTMLInputElement {
        const input = document.createElement('input');

        input.setAttribute('class', 'vanilla-tags--tag-input');
        input.setAttribute('type', 'text');
        input.setAttribute('data-valid', 'true');
        input.addEventListener('keydown', (event) => this._enterKeydownListener(event));
        input.addEventListener('keyup', () => this._invalidInputListener());

        this._container.addEventListener(TagEvent.Remove, () => this._invalidInputListener());
        this._container.appendChild(input);

        return input;
    }

    private _createOutputField(): HTMLInputElement {
        const output = document.createElement('input');

        output.setAttribute('type', 'hidden');
        output.setAttribute('name', this._outputName);
        output.setAttribute('value', '');

        this._container.addEventListener(TagEvent.Add, () => this._writeOutputValue());
        this._container.addEventListener(TagEvent.Remove, () => this._writeOutputValue());
        this._container.appendChild(output);

        return output;
    }

    private _createTagRemoveButton(tag: Element, value: string) {
        const button = document.createElement('a');

        button.setAttribute('class', 'vanilla-tags--tag-remove');
        button.innerText = 'x';

        button.addEventListener('click', () => this.removeTag(value));
        tag.appendChild(button);
    }

    private _enterKeydownListener(event: KeyboardEvent): boolean {
        if(event.keyCode === 13) {
            if(this.isInputValid) {
                this.addTag(this._inputField.value);
                this._inputField.value = '';
            }

            return false;
        }

        return true;
    }

    private _invalidInputListener(): void {
        // Highlight invalid inputs, except when the field is empty.
        const valid = this.isInputEmpty || this.isInputValid;
        this._inputField.setAttribute('data-valid', valid.toString());
    }

    private _writeOutputValue(): void {
        this._outputField.setAttribute('value', this.tags.join(';'));
    }

    private get _outputName(): string {
        return this._container.getAttribute('data-name') || '';
    }

    private get _initialTagsList(): string[] {
        return (this._container.getAttribute('data-value') || '').split(';');
    }
}
