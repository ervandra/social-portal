import React, { Component } from "react";
import { Mutation } from 'react-apollo';
import { ENROLL } from '../../store/gql/queries';
import Modal from 'react-modal';
import { withTranslation } from "react-i18next";
import { compose } from 'redux';
import { withRouter } from 'react-router-dom';
import qs from 'query-string';
import StripePayment from "../payments/stripe/StripePayment";

class EnrollButton extends Component {
  state = {
    isLoading: false,
    isError: false,
    isFail: false,
    isEnrolled: false,
    isOpen: true,
  }

  closeModal = () => {
    this.setState({
      isOpen: false
    })
  }

  successEnroll = () => {
    setTimeout(() => {
      const { redirect = null } = this.props;
      const newUrl = this.props.location ? this.props.location.pathname : '/';
      if (redirect) {
        this.props.history.push(redirect);
      } else {
        this.props.history.push(newUrl);
      }
    }, 1000);
  }

  componentDidMount = async () => {
    const { isAuth = false } = this.props;
    const parsed = qs.parse(this.props.location.search);
    const hasAutoEnroll = parsed && parsed.enroll ? true : false;
    if (isAuth && hasAutoEnroll) {
      const btn = this.enrolBtn;
      if (btn) {
        btn.click();
      }
    }
  }

  render() {
    const { sharecode, t, isAuth = false } = this.props;

    const parsed = qs.parse(this.props.location.search);
    const hasAutoEnroll = parsed && parsed.enroll ? true : false;

    const { isOpen } = this.state;

    if (!isAuth && !hasAutoEnroll) {
      const location = `${this.props.location.pathname}?enroll=true`;
      return (
        <div className={`path-enrollment`}>
          <a className="button enroll-btn" href={`${process.env.REACT_APP_OAUTH_SIGNIN_URL}&state=${location}`}>{t('enrollNow')}</a>
        </div>
      )
    }

    return (
      <Mutation mutation={ENROLL}
        // UPDATE CACHE IS NOT POSSIBLE RIGHT NOW, TOO DEEP OBJECT, EITHER REFETCH, OR MORE INVESTIGATION NEEDED ON HOW TO SIMPLIFY THIS METHOD
        // update={(cache, { data: {completeStep}}) => {
        // const { viewer } = cache.readQuery({ query: getAuthPath2, variables:	{ pathId: this.props.match.params.pathId}});
        // console.log(viewer)
        // console.log(completeStep)
        // cache.writeQuery({
        // 	query: getAuthPath2,
        // 	data: { viewer: newViewer  }
        // });
        // }}
        onCompleted={(data) => {
          if (data.enroll && data.enroll.status !== "fail") {
            this.successEnroll();
          }
          this.setState({
            isOpen: true,
          })
        }}
      >
        {(enroll, { data, loading, error }) => {
          if (loading || error) return (
            <div className={`path-enrollment`}>
              <button className="blink button enroll-btn disabled" disabled>{t('enrolling')}</button>
            </div>
          )
          if (data) {
            const { status } = data.enroll;
            const { enrollMarketItem2 } = data.enroll;
            const { itemType } = enrollMarketItem2;
            const isPaidCourse = itemType === "midtrans_fixed_price_path" || itemType === "fixed_price_path";
            return (
              <div className={`path-enrollment`}>
                {status === "success" ? (
                  <button className="button enroll-btn success">
                    {t('enrolled')}
                  </button>
                ) : (
                    <button className="button enroll-btn" onClick={async () => {
                      await enroll({ variables: { clientMutationId: `path_enrol_${sharecode}`, shareCode: sharecode } })
                    }}>
                      {t('enrollNow')}
                    </button>
                  )}
                {status === "fail" && (
                  <Modal
                    isOpen={isOpen}
                    contentLabel="Enroll failed"
                    ariaHideApp={false}
                    className="reveal small"
                    onRequestClose={this.closeModal}
                  >
                    {!isPaidCourse ? (
                      <div className="enrollment-container">
                        <div className="flex-container align-middle">
                          <h3><span className="fa fa-warning"></span></h3>
                          <p>{t('enrollError')}</p>
                        </div>
                      </div>
                    ) : (
                        <div className="payment-container">
                          <h3>{t('thisIsPaidCourse')}</h3>
                          <StripePayment marketItemId={enrollMarketItem2.id} />
                        </div>
                      )}
                    <button className="close-reveal" onClick={this.closeModal}>&times;</button>
                  </Modal>
                )}
              </div>
            )
          }
          return (
            <div className={`path-enrollment`}>
              <button className="button enroll-btn" ref={enrolBtn => this.enrolBtn = enrolBtn} onClick={async () => {
                await enroll({ variables: { clientMutationId: `path_enrol_${sharecode}`, shareCode: sharecode } })
              }}>{t('enrollNow')}</button>
            </div>
          )
        }}
      </Mutation>
    );
  }
}

export default compose(
  withRouter,
  withTranslation(),
)(EnrollButton);