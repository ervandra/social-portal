import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { withCookies } from 'react-cookie';
import { compose } from 'redux';
import qs from 'query-string';

import Wrapper from '../components/layouts/wrapper';
import Navigation from '../components/layouts/Navigation';

import { connect } from 'react-redux';
import * as actions from '../store/actions';

import { getUserToken } from '../helpers';
import { withTranslation } from 'react-i18next';

class Login extends Component {
	componentDidMount() {
		const parsed = qs.parse(this.props.location.search);
		if (parsed.code) {
			if (getUserToken()) {
				this.props.history.push('/');
			} else {
				this.props.onAuth(parsed.code);
			}
		} else {
			this.props.history.push('/');
		}
	}
	componentWillReceiveProps(nextProps) {
		if (nextProps.isAuthenticated) {
			const parsed = qs.parse(this.props.location.search);
			if (parsed.state) {
				window.location = parsed.state;
			} else {
				window.location = '/';
			}
		}
	}

	render() {
		const { t } = this.props;
		if (this.props.isLoading) {
			return <div className="loading">{t('authenticating')}</div>;
		}
		return (
			<Wrapper>
				<Navigation type="static" title={t('signIn')} style={{ background: '#ffffff' }} />
				<div id="maincontent" className="section">
					<div className="app-container">
						<div className="grid-x grid-margin-x">
							<div className="cell text-center">
								<div className="loading">{t('authenticating')}</div>
							</div>
						</div>
					</div>
				</div>
			</Wrapper>
		);
	}
}

const mapStateToProps = state => {
	return {
		isAuthenticated: state.auth.isAuthenticated,
		isLoading: state.auth.isLoading,
	};
};

const mapDispatchToProps = dispatch => {
	return {
		onAuth: code => dispatch(actions.authToken(code)),
	};
};

export default compose(
	withRouter,
	withCookies,
	connect(
		mapStateToProps,
		mapDispatchToProps
	),
	withTranslation()
)(Login);