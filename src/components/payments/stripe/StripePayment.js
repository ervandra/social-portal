import React, { Component } from 'react';
import { Elements, StripeProvider } from 'react-stripe-elements';
import StripeCheckoutForm from './StripeCheckoutForm';

class StripePayment extends Component {
  render() {
    const { marketItemId } = this.props;
    return (
      <StripeProvider apiKey={process.env.REACT_APP_STRIPE_APIKEY}>
        <div className="stripe-payment">
          <Elements>
            <StripeCheckoutForm marketItemId={marketItemId} />
          </Elements>
        </div>
      </StripeProvider>
    );
  }
}

export default StripePayment;