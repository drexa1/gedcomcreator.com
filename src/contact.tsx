import React from "react";
import {useForm, ValidationError} from "@formspree/react";
import {Button, Form, Grid, Image, Message, Modal,} from "semantic-ui-react";
import {FormattedMessage, useIntl} from "react-intl";
import countries from "i18n-iso-countries";


// Register country locales
import enCountries from "i18n-iso-countries/langs/en.json";
import esCountries from "i18n-iso-countries/langs/es.json";
import plCountries from "i18n-iso-countries/langs/pl.json";

countries.registerLocale(enCountries);
countries.registerLocale(esCountries);
countries.registerLocale(plCountries);

type ContactFormProps = {
    open: boolean;
    onClose: () => void;
};

export function ContactForm({ open, onClose }: ContactFormProps) {
    const [state, handleSubmit] = useForm("mwpqrkle");
    const intl = useIntl();
    const lang = intl.locale;
    const i18nCountryNames = countries.getNames(lang, { select: "official" });
    const sortedCountries = Object.entries(i18nCountryNames).sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB, lang));

    return (
        <Modal /* closeIcon */ open={open} onClose={onClose} size="large">
            <Modal.Header style={{ marginTop: "30px" }}>
                💬️&nbsp;&nbsp;<FormattedMessage id="contact.title" defaultMessage="We are genuinely interested in hearing from you"/>
            </Modal.Header>
            <Modal.Content>
                <Grid stackable columns={2} className="contact-form-grid">
                    {/* IMAGE */}
                    <Grid.Column width={7} textAlign="center" verticalAlign="bottom">
                        <Image src="/assets/contact-form.png" style={{ maxWidth: "100%", height: "auto" }}/>
                    </Grid.Column>
                    {/* FORM */}
                    <Grid.Column width={7} className="contact-form-column" verticalAlign="bottom">
                        {state.succeeded ? (
                            <Message success header={<FormattedMessage id="contact.success.header" defaultMessage="Thanks for your message!"/>
                            }
                                content={<FormattedMessage id="contact.success.body" defaultMessage="We'll get back to you soon."/>}
                            />
                        ) : (
                            <Form onSubmit={handleSubmit}>

                                <Form.Field >
                                    <label htmlFor="name">
                                        <FormattedMessage id="contact.name" defaultMessage="Your name"/>&nbsp;*
                                    </label>
                                    <input id="name" type="text" name="name" placeholder={
                                        intl.formatMessage({id: "contact.name.placeholder", defaultMessage: "You"})
                                    }/>
                                </Form.Field>

                                <Form.Field>
                                    <label htmlFor="email">
                                        <FormattedMessage id="contact.email" defaultMessage="Your e-mail address"/>&nbsp;*
                                    </label>
                                    <input id="email" type="email" name="email" placeholder="you@email.com"/>
                                    <ValidationError prefix="Email" field="email" errors={state.errors}/>
                                </Form.Field>

                                <Form.Field>
                                    <label htmlFor="country">
                                        <FormattedMessage id="contact.country" defaultMessage="Your country"/>
                                    </label>
                                    <div className="narrow-select">
                                        <select id="country" name="country" defaultValue="">
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
                                        <FormattedMessage id="contact.message" defaultMessage="Message"/>
                                    </label>
                                    <Form.TextArea id="message" name="message" rows={8} placeholder={
                                        intl.formatMessage({
                                            id: "contact.message.placeholder",
                                            defaultMessage:
                                                "• Did you encounter any unexpected behavior or errors?\n" +
                                                "• Is there’s anything you think we could add or change?\n" +
                                                "• Is the app easy and intuitive to use?\n" +
                                                "• Do you need assistance with using the app?\n" +
                                                "• Are you interested in partnering or collaborating with us?\n\n" +
                                                "If there is anything you’d like to share, please don’t hesitate to reach us." +
                                                ""
                                        })
                                    }/>
                                    <ValidationError prefix="Message" field="message" errors={state.errors}/>
                                </Form.Field>

                                <Button type="submit" primary disabled={state.submitting} fluid>
                                    <FormattedMessage id="contact.submit" defaultMessage="Submit"/>
                                </Button>
                            </Form>
                        )}
                    </Grid.Column>
                </Grid>
            </Modal.Content>
        </Modal>
    );
}
