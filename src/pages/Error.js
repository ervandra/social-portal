import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import Wrapper from '../components/layouts/wrapper';
import Navigation from '../components/layouts/Navigation';
import qs from 'query-string';
import { withTranslation } from 'react-i18next';

import imgGeneralError from '../assets/images/error-general.png';

class Error extends Component {
	state = {
		qs: null
	};

	componentDidMount() {
		const parsed = qs.parse(this.props.location.search);
		if (parsed) {
			this.setState({
				qs: parsed
			})
		}
	}

	render() {
		const { qs } = this.state;
		const errorMessage = qs && qs.error ? qs.error : false;
		const errorOrganisation = qs && qs.org ? qs.org : false;
		const { t } = this.props;

		return (
			<Wrapper>
				<Navigation type="static" title={t('error')} deep="1" style={{ background: '#ffffff' }} />
				<div id="maincontent" className="section">
					<div className="app-container">
						<div className="grid-x grid-margin-x align-center">
							<div className="cell small-12 medium-12 large-10">
								{errorOrganisation ? (
									<div className="error-page">
										<div className="grid-x grid-margin-x align-middle">
											<div className="cell small-12 medium-4 large-3">
												<img src={imgGeneralError} alt="Error" />
											</div>
											<div className="cell small-12 medium-8 large-9">
												<div className="error-content">
													<h4>{t('notFound')}</h4>
													<p>{t('weCouldNotFind')} <strong>“{errorOrganisation}”</strong> {t('youWereLookingFor')}</p>
													<p>{t('communityNotFoundError')}</p>
													<p>
														<Link to="/" className="button small">
															{t('goToHomepage')}
														</Link>
													</p>
												</div>
											</div>
										</div>
									</div>
								) : (
										<div className="error-page">
											<div className="grid-x grid-margin-x align-middle">
												<div className="cell small-12 medium-4 large-3">
													<img src={imgGeneralError} alt="Error" />
												</div>
												<div className="cell small-12 medium-8 large-9">
													<div className="error-content">
														<h4>{t('unfortunateErrorHeading')}</h4>
														{errorMessage && (
															<h5>{decodeURI(errorMessage)}</h5>
														)}
														<p>{t('unfortunateErrorText')}</p>
														<p>
															<Link to="/" className="button small">
																{t('goToHomepage')}
															</Link>
														</p>
													</div>
												</div>
											</div>
										</div>
									)}
							</div>
						</div>
					</div>
				</div>
			</Wrapper>
		);
	}
}

export default withTranslation()(Error);
