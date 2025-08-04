import React from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { Modal } from 'semantic-ui-react';

type ContactFormProps = {
    open: boolean;
    onClose: () => void;
};

export function ContactForm({ open, onClose }: ContactFormProps) {
    const [state, handleSubmit] = useForm("mwpqrkle");
    return (
        <Modal open={open} onClose={onClose}>
            <Modal.Header>Contact Us</Modal.Header>
            <Modal.Content>
                {state.succeeded ? (
                    <p>Thanks for your message!</p>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="name">Name</label>
                        <input id="name" type="text" name="name" />

                        <label htmlFor="email">Email address</label>
                        <input id="email" type="email" name="email" />
                        <ValidationError prefix="Email" field="email" errors={state.errors} />

                        <label htmlFor="phone">Phone number</label>
                        <input id="phone" type="tel" name="phone" />
                        <ValidationError prefix="Phone" field="phone" errors={state.errors} />

                        <label htmlFor="message">Message</label>
                        <textarea id="message" name="message" />
                        <ValidationError prefix="Message" field="message" errors={state.errors} />

                        <button type="submit" disabled={state.submitting}>
                            Submit
                        </button>
                    </form>
                )}
            </Modal.Content>
        </Modal>
    );
}
