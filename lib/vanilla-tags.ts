import { TagEvent } from './tag-event';
import { IVanillaTagsConfig } from './vanilla-tags-config';

interface ITagMap {
    [key: string]: Element
}

export class VanillaTags {
    private _tagsMap: ITagMap = {};
    private _inputField: HTMLInputElement;
    private _outputField: HTMLInputElement;

    /**
     * Constructs a Vanilla Tags container from a HTML DOM Element.
     * Child elements like the trailing input field and hidden output are constructed eagerly.
     * Any initial tags specified by <tt>data-value</tt> are also immediately constructed.
     * @param {Element} _container A DOM Element to use an the Vanilla Tags container.
     * @param {IVanillaTagsConfig} _config An object containing configuration parameters.
     */
    constructor(
        private _container: Element,
        private _config: IVanillaTagsConfig = {}
    ) {
        this._inputField = this._createInputField();
        this._outputField = this._createOutputField();
        this._createInitialTags();
    }

    /**
     * Adds a new tag to the list of tags.
     * The tag is appended to the DOM after any existing tags, but before the trailing input field.
     * The tag must be valid, else this method returns <tt>null</tt>.
     * @param {string} value The name of the tag to add.
     */
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

    /**
     * Removes a tag from the list of tags, if it exists.
     * @param {string} value The name of the tag to remove.
     */
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

    /**
     * Checks if the input string is empty.
     * @param {string} value An input string to test.
     */
    isEmpty(value: string): boolean {
        return !value;
    }

    /**
     * Checks if the input string duplicates an existing tag.
     * @param {string} value An input string to test.
     */
    isDuplicate(value: string): boolean {
        return !!this._tagsMap[value];
    }

    /**
     * Checks if the input string is valid.
     * A valid string must not be empty, and must not be a duplicate of an existing tag.
     * @param {string} value An input string to test.
     */
    isValid(value: string): boolean {
        return !this.isEmpty(value) && !this.isDuplicate(value);
    }

    /**
     * Gets the current value of the trailing input field.
     */
    get inputValue(): string {
        return this._inputField.value;
    }

    /**
     * Checks if the trailing input field is currently empty.
     */
    get isInputEmpty(): boolean {
        return this.isEmpty(this.inputValue);
    }

    /**
     * Checks if the trailing input field currently duplicates an existing tag.
     */
    get isInputDuplicate(): boolean {
        return this.isDuplicate(this.inputValue);
    }

    /**
     * Checks if the trailing input field contains a valid value.
     * Validity is checked according to {@link VanillaTags#isValid}.
     */
    get isInputValid(): boolean {
        return this.isValid(this.inputValue);
    }

    /**
     * Gets the list of tags.
     */
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
