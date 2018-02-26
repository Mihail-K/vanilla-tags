import { TagEvent } from '../lib/tag-event';
import { VanillaTags } from '../lib/vanilla-tags';

describe('VanillaTags', () => {
    let container: HTMLDivElement;
    let vanillaTags: VanillaTags;

    beforeEach(() => {
        container = document.createElement('div');
        container.setAttribute('id', 'test-tags');
        container.setAttribute('data-name', 'test-output');

        document.body.appendChild(container);
    });

    beforeEach(() => {
        vanillaTags = new VanillaTags(container);
    });

    afterEach(() => {
        container.remove();
    });

    describe('constructor', () => {
        it('creates a trailing input element', () => {
            let input = container.querySelector('input.vanilla-tags--tag-input');

            expect(input).not.toBeNull();
            expect(input && input.getAttribute('type')).toEqual('text');
        });

        it('creates a hidden output field', () => {
            let output = container.querySelector('input[type="hidden"]');

            expect(output).not.toBeNull();
            expect(output && output.getAttribute('name')).toEqual('test-output');
        });
    });

    describe('addTag', () => {
        it('creates a new tag element in the HTML DOM', () => {
            expect(vanillaTags.addTag('orange')).toBeTruthy();
            let tag = container.querySelector('div.vanilla-tags--tag');

            expect(tag).toBeTruthy();
            expect(tag && tag.textContent).toContain('orange');
        });

        it('dispatches an event to the container', () => {
            let called = false;
            container.addEventListener(TagEvent.Add, (event: Event) => {
                expect((<CustomEvent> event).detail.value).toEqual('orange');
                called = true;
            });

            vanillaTags.addTag('orange');
            expect(called).toBe(true);
        });

        it('adds the tag to the list of tags in the container', () => {
            vanillaTags.addTag('orange');
            expect(vanillaTags.tags).toEqual(['orange']);
        });

        it('creates a button to remove the tag', () => {
            let tag = vanillaTags.addTag('orange');
            let button = tag && tag.querySelector('.vanilla-tags--tag-remove');
            spyOn(vanillaTags, 'removeTag').and.stub();

            expect(button).toBeTruthy();
            expect(button && button.textContent).toEqual('x');

            (<HTMLAnchorElement> button).click();
            expect(vanillaTags.removeTag).toHaveBeenCalledWith('orange');
        });

        it('returns null when called with an invalid input', () => {
            spyOn(vanillaTags, 'isValid').and.returnValue(false);
            let tag = vanillaTags.addTag('orange');
            expect(tag).toBeNull();

            let element = container.querySelector('div.vanilla-tags--tag');
            expect(element).toBeFalsy();
        });
    });

    describe('removeTag', () => {
        beforeEach(() => {
            vanillaTags.addTag('orange');
        });

        it('removes an existing tag from the HTML DOM', () => {
            expect(vanillaTags.removeTag('orange')).toBe(true);
            expect(container.querySelector('div.vanilla-tags--tag')).toBeFalsy();
        });

        it('dispatches an event to the container', () => {
            let called = false;
            container.addEventListener(TagEvent.Remove, (event: Event) => {
                expect((<CustomEvent> event).detail.value).toEqual('orange');
                called = true;
            });

            vanillaTags.removeTag('orange');
            expect(called).toBe(true);
        });

        it('removes the tag from the list of tags in the container', () => {
            vanillaTags.removeTag('orange');
            expect(vanillaTags.tags).toEqual([]);
        });

        it("returns false when called with a tag that doesn't exist", () => {
            expect(vanillaTags.removeTag('red')).toBeFalsy();
            expect(container.querySelector('div.vanilla-tags--tag')).toBeTruthy();
        });
    });
});
