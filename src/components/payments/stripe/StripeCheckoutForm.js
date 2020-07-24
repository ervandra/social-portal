import React, { Component } from 'react';
import { CardElement, injectStripe } from 'react-stripe-elements';
import { getUserToken } from '../../../helpers';
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';
import CountryData from '../../../shared/countries';

class CheckoutForm extends Component {
  state = {
    isLoading: false,
    isComplete: false,
    isError: false,
    name: '',
    email: '',
    postalCode: '',
    address_line1: '',
    address_line2: '',
    address_city: '',
    address_state: '',
    address_country: '',
    countries: CountryData
  }

  submitMutation = async (data) => {
    const token = getUserToken();
    const { marketItemId } = this.props;
    const { name, postalCode, address_line1, address_line2, address_country, email, address_city } = this.state;
    const query = JSON.stringify({
      variables: {
        clientMutationId: 'stripe_payment',
        stripeToken: data.id,
        marketitem: marketItemId,
        name,
        streetAddress1: address_line1,
        streetAddress2: address_line2,
        postalCode,
        city: address_city,
        country: address_country,
        email,
      },
      query: `mutation stripePaymentMutation($clientMutationId: String!, $stripeToken: String!, $marketitem: String, $name: String!, $streetAddress1: String!, $streetAddress2: String, $postalCode: String!, $city: String!, $country: String!, $email: String!){
        enrollWithStripeFixedPrice(input: {clientMutationId: $clientMutationId, stripeToken: $stripeToken, marketitem: $marketitem, name: $name, streetAddress1: $streetAddress1, streetAddress2: $streetAddress2, postalCode: $postalCode, city: $city, country: $country, email: $email}) {
          status,
          order{
            id,
            amountPaid,
            paymentBackend,
            status,
            statusCode,
            marketItem{
              id,
              title
            },
            created,
            uuid,
            amountDue,
            currency
          },
          clientMutationId,
        }
      }`});
    let resp = await fetch("https://gql.lifelearnplatform.com/api/2", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: query
    })
      .then(res => res.json())
      .catch(() => this.setState({ isError: true }));
    // console.log('resp', resp);
    if (resp) {
      this.setState({ isLoading: false })
      if (resp.errors && resp.errors.length > 0) {
        this.setState({ isError: true });
      } else if (resp.data && !resp.data.enrollWithStripeFixedPrice) {
        this.setState({ isError: true });
      } else {
        this.setState({ isComplete: true });
        setTimeout(() => this.refresh(), 3000);
      }
    }
  }

  submit = async (ev) => {
    ev.preventDefault();
    const { name, email, address_line1, address_line2, address_city, address_state, address_country } = this.state;
    if (name === '' || email === '' || address_line1 === '' || address_line2 === '' || address_city === '' || address_state === '' || address_country === '') {
      if (name === '') {
        this.name.classList.add('error');
      } else {
        this.name.classList.remove('error');
      }

      if (email === '') {
        this.email.classList.add('error');
      } else {
        this.email.classList.remove('error');
      }

      if (address_line1 === '') {
        this.address1.classList.add('error');
      } else {
        this.address1.classList.remove('error');
      }

      if (address_line2 === '') {
        this.address2.classList.add('error');
      } else {
        this.address2.classList.remove('error');
      }

      if (address_city === '') {
        this.city.classList.add('error');
      } else {
        this.city.classList.remove('error');
      }

      if (address_state === '') {
        this.stateAddress.classList.add('error');
      } else {
        this.stateAddress.classList.remove('error');
      }

      if (address_country === '') {
        this.country.classList.add('error');
      } else {
        this.country.classList.remove('error');
      }
    } else {
      let { token } = await this.props.stripe.createToken({ name, email, address_line1, address_line2, address_city, address_state, address_country });
      // console.log('token', token);
      this.setState({ isLoading: true });
      this.submitMutation(token);
    }
    // let response = await fetch("/charge", {
    //   method: "POST",
    //   headers: { "Content-Type": "text/plain" },
    //   body: token.id
    // });

    // if (response.ok) console.log("Purchase Complete!")
  }

  handleChanges(e) {
    this.setState({
      [e.target.name]: e.target.value,
    })
  }

  handlePostalCode(e) {
    // console.log('e', e);
    this.setState({
      postalCode: e.value.postalCode,
    })
  }

  refresh = () => {
    window.location.reload();
  }

  render() {
    const { t } = this.props;
    const { isError, isComplete, countries, isLoading } = this.state;
    if (isComplete) return (
      <div className="payment-success">
        <h5>{t('paymentSuccess')}</h5>
        <p>{t('paymentYouWillBeRedirected')}</p>
        <button className="button success" onClick={this.refresh}>{t('refresh')}</button>
      </div>
    )
    return (
      <div className="checkout">
        {isError && (
          <div className="alert warning">
            <p>{t('purchaseFailedMessage')}</p>
          </div>
        )}
        <CardElement onChange={e => this.handlePostalCode(e)} />
        <hr />
        <div className="grid-x grid-margin-x">
          <div className="cell small-12 medium-6">
            <div className="input-field">
              <input
                required
                type="text"
                value={this.state.name}
                name="name"
                placeholder={t("cardHolderName")}
                onChange={e => this.handleChanges(e)}
                ref={e => (this.name = e)}
              />
            </div>
          </div>
          <div className="cell small-12 medium-6">
            <div className="input-field">
              <input
                required
                type="email"
                value={this.state.email}
                name="email"
                placeholder={t("email")}
                onChange={e => this.handleChanges(e)}
                ref={e => (this.email = e)}
              />
            </div>
          </div>
        </div>

        <div className="grid-x grid-margin-x">
          <div className="cell small-12 medium-6">
            <div className="input-field">
              <input
                required
                type="text"
                value={this.state.address_line1}
                name="address_line1"
                placeholder={t("address1")}
                onChange={e => this.handleChanges(e)}
                ref={e => (this.address1 = e)}
              />
            </div>
          </div>
          <div className="cell small-12 medium-6">
            <div className="input-field">
              <input
                required
                type="text"
                value={this.state.address_line2}
                name="address_line2"
                placeholder={t("address2")}
                onChange={e => this.handleChanges(e)}
                ref={e => (this.address2 = e)}
              />
            </div>
          </div>
        </div>

        <div className="grid-x grid-margin-x">
          <div className="cell small-12 medium-6">
            <div className="input-field">
              <input
                required
                type="text"
                value={this.state.address_city}
                name="address_city"
                placeholder={t("city")}
                onChange={e => this.handleChanges(e)}
                ref={e => (this.city = e)}
              />
            </div>
          </div>
          <div className="cell small-12 medium-6">
            <div className="input-field">
              <input
                required
                type="text"
                value={this.state.address_state}
                name="address_state"
                placeholder={t("state")}
                onChange={e => this.handleChanges(e)}
                ref={e => (this.stateAddress = e)}
              />
            </div>
          </div>
        </div>

        <div className="grid-x grid-margin-x">
          <div className="cell small-12 medium-12">
            <label htmlFor="country">{t("country")}: </label>
            <select
              required
              name="address_country"
              defaultValue="-1"
              placeholder={t("country")}
              onChange={e => this.handleChanges(e)}
              ref={e => (this.country = e)}
            >
              <option disabled value="-1">
                -- {t('selectACountry')} --
              </option>
              {countries.length > 0 && countries.map((country, index) => (
                <option key={country.code + index} value={country.code}>{country.name}</option>
              ))}
            </select>
            {/* <input required type="text" value={this.state.country} name="address_country" onChange={e => this.handleChanges(e)} placeholder="US, SG, ID or FI" maxLength="2" /> */}
          </div>
        </div>

        {/* <p>Would you like to purchase this course?</p> */}
        <div
          className="button-container"
          style={{ textAlign: "center", marginTop: "1rem" }}
        >
          {isLoading ? (
            <button className="button large success disabled is-loading" disabled>
              <span className="fa fa-circle-o-notch fa-spin"></span>
            </button>
          ) : (
              <button onClick={this.submit} className="button large success">
                {t('purchase')}
              </button>
            )}
        </div>
      </div>
    );
  }
}

export default compose(
  injectStripe,
  withTranslation()
)(CheckoutForm);
