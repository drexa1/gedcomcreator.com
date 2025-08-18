import React, {useEffect, useRef, useState} from "react";
import {useForm, ValidationError} from "@formspree/react";
import {Button, Form, Grid, Icon, Image, Message, Modal,} from "semantic-ui-react";
import {FormattedMessage, useIntl} from "react-intl";
import countries from "i18n-iso-countries";
import enCountries from "i18n-iso-countries/langs/en.json";
import esCountries from "i18n-iso-countries/langs/es.json";
import plCountries from "i18n-iso-countries/langs/pl.json";
import {i18nMessages} from "./index";


// Register country locales
countries.registerLocale(enCountries);
countries.registerLocale(esCountries);
countries.registerLocale(plCountries);

type ContactFormProps = {
    open: boolean;
    onClose: () => void;
    onI18nLanguage: (lang: string) => void
};

export function ContactForm({ open, onClose, onI18nLanguage }: ContactFormProps) {
    const [state, handleSubmit, reset] = useForm("mwpqrkle");
    const intl = useIntl();
    const i18nCountryNames = countries.getNames(intl.locale, { select: "official" });
    const sortedCountries = Object.entries(i18nCountryNames).sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB, intl.locale));
    const formRef = useRef<HTMLFormElement>(null);
    const [formData, setFormData] = useState({name: "", email: "", country: "", message: ""});
    const isFormValid = formData.name?.trim() !== "" && formData.email?.trim() !== "" && formData.country?.trim() !== "" && formData.message?.trim() !== "";
    const i18nLanguages = Object.keys(i18nMessages).sort();

    /**
     * When submission succeeds, update cooldown timer in localStorage.
     */
    useEffect(() => {
        if (state.succeeded) {
            localStorage.setItem("lastSubmitTime", Date.now().toString());
        }
    }, [state.succeeded]);

    /**
     * Submit handler with cooldown enforcement.
     */
    const handleSubmitWithCooldown = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!submitCooldown()) {
            return;
        }
        await handleSubmit(event);
    };

    /**
     * 1 minute cooldown check.
     */
    const submitCooldown = () => {
        const last = localStorage.getItem("lastSubmitTime");
        if (!last)
            return true;
        return Date.now() - Number(last) > 60_000;
    };

    /**
     * Update on input change.
     */
    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    /**
     * Wrap onClose to reset form state before closing modal.
     */
    const onCloseReset = () => {
        reset(); // reset Formspree state
        Object.keys(formData).forEach(field => formData[field] = "");
        onClose();
    };

    return (
        <Modal closeIcon open={open} onClose={onCloseReset} size="large" dimmer="blurring" transition={{ animation: "scale", duration: 1 }}>
            <Modal.Header style={{ marginTop: "30px" }}>
                <Icon name="comments" size="large"/>&nbsp;<FormattedMessage id="contact.title" defaultMessage="We are genuinely happy to hear from you"/><br/>
            </Modal.Header>
            <Modal.Content>
                <Grid stackable columns={2} className="contact-form-grid">
                    <Grid.Column width={7} textAlign="center" verticalAlign="bottom">
                        {/* Reasons */}
                        <div className="contact-reasons">
                            <Icon name="warning circle"/>&nbsp;
                            <FormattedMessage id="contact.reason.bug" defaultMessage="Did you encounter any unexpected behavior or errors?"/><br/>
                            <Icon name="idea"/>&nbsp;
                            <FormattedMessage id="contact.reason.change" defaultMessage="Is there anything you think we could add or change?"/><br/>
                            <Icon name="compass"/>&nbsp;
                            <FormattedMessage id="contact.reason.ux" defaultMessage="Is the app easy and intuitive to use?"/><br/>
                            <Icon name="help circle"/>&nbsp;
                            <FormattedMessage id="contact.reason.help" defaultMessage="Do you need assistance with using the app?"/><br/>
                            <Icon name="handshake"/>&nbsp;
                            <FormattedMessage id="contact.reason.partnering" defaultMessage="Are you interested in partnering or collaborating with us?"/><br/>
                            <br/>
                            <FormattedMessage id="contact.reason.share" defaultMessage="If there is anything you'd like to share, please don’t hesitate to reach us."/>
                        </div>
                        {/* Image */}
                        <Image id="contact-form-image" src="/assets/contact-form.png"/>
                    </Grid.Column>
                    {/* Form */}
                    <Grid.Column width={7} className="contact-form-column" verticalAlign="top">
                        <Form ref={formRef} onSubmit={handleSubmitWithCooldown} style={{ position: "relative" }}>
                            <Form.Field >
                                <label htmlFor="name">
                                    <FormattedMessage id="contact.name" defaultMessage="Your name"/>
                                </label>
                                <input id="name" name="name" type="text" onChange={onChange} placeholder={
                                    intl.formatMessage({id: "contact.name.placeholder", defaultMessage: "You"})
                                } value={formData.name ?? ""}/>
                            </Form.Field>

                            <Form.Field>
                                <label htmlFor="email">
                                    <FormattedMessage id="contact.email" defaultMessage="Your e-mail address"/>
                                </label>
                                <input id="email" name="email" type="email" onChange={onChange} placeholder="you@email.com" value={formData.email ?? ""}/>
                                <ValidationError prefix="Email" field="email" errors={state.errors}/>
                            </Form.Field>

                            <Form.Field>
                                <label htmlFor="country">
                                    <FormattedMessage id="contact.country" defaultMessage="Your country"/>
                                </label>
                                <div className="narrow-select">
                                    <select id="country" name="country" onChange={onChange} value={formData.country ?? ""}>
                                        <option value="">
                                            {intl.formatMessage({id: "contact.country.placeholder", defaultMessage: "Select a country"})}
                                        </option>
                                        {sortedCountries.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                                    </select>
                                </div>
                                <ValidationError prefix="Country" field="country" errors={state.errors}/>
                            </Form.Field>

                            <Form.Field>
                                <label htmlFor="message">
                                    <FormattedMessage id="contact.message" defaultMessage="How can we help you?"/>
                                </label>
                                <Form.TextArea id="message" name="message" rows={8} onChange={onChange} placeholder={
                                    intl.formatMessage({id: "contact.message.placeholder", defaultMessage: "Write us what’s on your mind..."})
                                } value={formData.message ?? ""}/>
                                <ValidationError prefix="Message" field="message" errors={state.errors}/>
                            </Form.Field>


                            {state.succeeded ? (
                                <Message positive className="contact-message" content={
                                    <FormattedMessage id="contact.success.body" defaultMessage="Thanks! We have received your message."/>
                                }/>
                            ) : (
                                <>
                                    <Button primary fluid type="submit" disabled={state.submitting || !isFormValid}>
                                        <FormattedMessage id="contact.submit" defaultMessage="Submit"/>
                                    </Button>
                                    {!submitCooldown() && (
                                        <Message negative className="contact-message cooldown-message" content={
                                            <FormattedMessage id="contact.cooldown" defaultMessage="Please wait 1 minute before posting again."/>
                                        }/>
                                    )}
                                </>
                            )}
                        </Form>
                    </Grid.Column>
                </Grid>
            </Modal.Content>
            {/* We speak... */}
            <div id="we-speak">
                <FormattedMessage id="contact.we.speak" defaultMessage="We speak" />&nbsp;
                {i18nLanguages.map((lang) => (
                    <span key={lang}>
                        {/*className={lang === intl.locale ? "selected-language" : ""}*/}
                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                        <a href="#" onClick={(e) => { e.preventDefault(); onI18nLanguage(lang); }}>
                            <FormattedMessage id={`i18n.language.${lang}`} defaultMessage={lang} />
                        </a>
                    </span>
                ))}
            </div>
        </Modal>
    );
}
