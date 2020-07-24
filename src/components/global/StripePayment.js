import React, { Component } from 'react';
import { Elements, StripeProvider } from 'react-stripe-elements';
import CheckoutForm from './CheckoutForm';

class StripePayment extends Component {
  render() {
    return (
      <StripeProvider apiKey="pk_test_TYooMQauvdEDq54NiTphI7jx">
        <div className="stripe-payment">
          <Elements>
            <StripeCheckoutForm />
          </Elements>
        </div>
      </StripeProvider>
    );
  }
}

export default StripePayment;