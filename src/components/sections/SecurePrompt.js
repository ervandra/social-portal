import React, { Component } from 'react';
import Wrapper from '../layouts/wrapper';
import { withRouter, Link } from 'react-router-dom';
import Navigation from '../layouts/Navigation';
import imgAccessError from '../../assets/images/error-access.png';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';

class SecurePrompt extends Component {

	render() {
		const { isLogin } = this.props || null;
		const { t } = this.props;

		return (
			<Wrapper>
				<Navigation style={{ background: '#ffffff' }} title={t('errorNoAccess')} />
				<div id="maincontent" className="section">
					<div className="app-container">
						<div className="grid-x grid-margin-x align-center">
							<div className="cell small-12 medium-8 large-6">
								<div className="error-page">
									<div className="grid-x grid-margin-x align-middle">
										<div className="cell small-12 medium-4 large-3">
											<img src={imgAccessError} alt={t('errorNoAccess')} />
										</div>
										<div className="cell small-12 medium-8 large-9">
											<div className="error-content">
												<h4>{t('welcome')}</h4>
												{!isLogin ? (
													<p>{t('errorPleaseLogin')}</p>
												) : (
														<p>{t('errorForbiddenAccess')}</p>
													)}
												{!isLogin ? (
													<p>
														<a href={`${process.env.REACT_APP_OAUTH_SIGNIN_URL}&state=${encodeURIComponent(this.props.location.pathname)}`} className="button small">{t('signIn')}</a>
													</p>
												) : (
														<p>
															<Link to="/" className="button small">{t('goToHomepage')}</Link>
														</p>
													)}

											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Wrapper>

		);
	}
}

export default compose(
	withRouter,
	withTranslation()
)(SecurePrompt);
