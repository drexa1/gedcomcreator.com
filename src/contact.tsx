import React, {useEffect, useRef, useState} from "react";
import {useForm, ValidationError} from "@formspree/react";
import {Button, Form, Grid, Icon, Image, Message, Modal,} from "semantic-ui-react";
import {FormattedMessage, useIntl} from "react-intl";
import countries from "i18n-iso-countries";
import enCountries from "i18n-iso-countries/langs/en.json";
import esCountries from "i18n-iso-countries/langs/es.json";
import plCountries from "i18n-iso-countries/langs/pl.json";


// Register country locales
countries.registerLocale(enCountries);
countries.registerLocale(esCountries);
countries.registerLocale(plCountries);

type ContactFormProps = {
    open: boolean;
    onClose: () => void;
};

export function ContactForm({ open, onClose }: ContactFormProps) {
    const [state, handleSubmit, reset] = useForm("mwpqrkle");
    const intl = useIntl();
    const lang = intl.locale;
    const i18nCountryNames = countries.getNames(lang, { select: "official" });
    const sortedCountries = Object.entries(i18nCountryNames).sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB, lang));
    const formRef = useRef<HTMLFormElement>(null);
    const [formData, setFormData] = useState({name: "", email: "", country: "", message: ""});
    const isFormValid = formData.name?.trim() !== "" && formData.email?.trim() !== "" && formData.country?.trim() !== "" && formData.message?.trim() !== "";

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
        <Modal /* closeIcon */ open={open} onClose={onCloseReset} size="large" dimmer="blurring" transition={{ animation: "scale", duration: 1 }}>
            <Modal.Header style={{ marginTop: "30px" }}>
                <Icon name="comments" size="large"/>&nbsp;<FormattedMessage id="contact.title" defaultMessage="We are genuinely happy to hear from you"/>
            </Modal.Header>
            <Modal.Content>
                <Grid stackable columns={2} className="contact-form-grid">
                    {/* IMAGE */}
                    <Grid.Column width={7} textAlign="center" verticalAlign="bottom">
                        <Image src="/assets/contact-form.png" style={{ maxWidth: "100%", height: "auto" }}/>
                    </Grid.Column>
                    {/* FORM */}
                    <Grid.Column width={7} className="contact-form-column" verticalAlign="bottom">
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
                                    <FormattedMessage id="contact.message" defaultMessage="How can you help you?"/>
                                </label>
                                <Form.TextArea id="message" name="message" rows={8} onChange={onChange} placeholder={
                                    intl.formatMessage({
                                        id: "contact.message.placeholder",
                                        defaultMessage:
                                            "• Did you encounter any unexpected behavior or errors?\n" +
                                            "• Is there's anything you think we could add or change?\n" +
                                            "• Is the app easy and intuitive to use?\n" +
                                            "• Do you need assistance with using the app?\n" +
                                            "• Are you interested in partnering or collaborating with us?\n\n" +
                                            "If there is anything you'd like to share, please don’t hesitate to reach us."
                                    })
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
                                        <FormattedMessage id="contact.submit" defaultMessage="Submit" />
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
        </Modal>
    );
}
