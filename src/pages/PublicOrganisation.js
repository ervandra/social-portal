import React, { Component } from 'react';

import Wrapper from '../components/layouts/wrapper';
import DynamicNavigation from '../components/layouts/DynamicNavigation';
import ListSkills from '../components/sections/ListSkills';
import NewEnterprise from '../components/sections/NewEnterprise';
import Loader from '../components/global/Loader';
import { withTranslation } from 'react-i18next';

import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter, Redirect } from 'react-router-dom';
import { graphql, Query } from 'react-apollo';
import { getSkills, checkOrgUser } from '../store/gql/queries';

import { SECURE_ORGANISATIONS } from '../constant';
import SecurePrompt from '../components/sections/SecurePrompt';

import { getUserToken } from '../helpers';

class PublicOrganisation extends Component {
	state = {
		isLoading: true
	}

	componentWillMount() {
		const isAuth = this.props.location.search.match(/auth/g);
		if (isAuth && !getUserToken()) {
			window.location = `${process.env.REACT_APP_OAUTH_SIGNIN_URL}&state=${this.props.match.params.organisationId}`;
		} else {
			this.setState({ isLoading: false })
		}
	}

	render() {
		const { t } = this.props;
		const isSecureOrganisation = SECURE_ORGANISATIONS.findIndex(org => org === this.props.match.params.organisationId);
		if (this.state.isLoading) return <Loader active content={t("loading")} indeterminate={true} size="small" />;
		if (isSecureOrganisation !== -1 && !getUserToken() && !this.props.data) return <SecurePrompt />;

		const isSPPL = this.props.match.params.organisationId && this.props.match.params.organisationId === 'sppl' ? true : false;

		const { loading, error } = this.props.data;

		if (loading) return <Loader title={t("loading")} size="small" />;
		if (error) return <Redirect to="/error" />;

		const validOrganisation = this.props.data.organisations.edges.length > 0 ? true : false;

		if (!validOrganisation) return <Redirect to={`/error?org=${this.props.match.params.organisationId}`} />;

		const isMentor = this.props.location.search.match(/mentor/g) ? true : false;
		const inclusive = ['sppl', 'demo', 'kehyspilotti', 'keuda', 'indonesia', 'horses_first', 'millennia', 'utumay'];
		const inclusiveOrganisations = this.props.match.params.organisationId && inclusive.findIndex(e => e === this.props.match.params.organisationId) !== -1 ? true : false;
		const skills = this.props.data.organisations.edges.length > 0 && this.props.data.organisations.edges[0].node.skills ? this.props.data.organisations.edges[0].node.skills : null;

		return (
			<Query query={checkOrgUser} variables={{ name: this.props.match.params.organisationId }} fetchPolicy="network-only">
				{({ data, loading, error }) => {
					// console.log('asd', data, loading, error)
					if (loading) return <Loader active content={t("loading")} indeterminate={true} size="small" />
					if (error) return <p>{t('error')}</p>;
					const { isViewerAMember } = data.organisations.edges[0].node;
					if (!isViewerAMember && isSPPL) return <SecurePrompt isLogin />;
					return (
						<Wrapper>
							{/* {isSPPL && <Header url={ROOT_ROUTES} />} */}
							<DynamicNavigation {...this.props} style={!isSPPL ? { background: '#ffffff' } : null} />
							<div id="maincontent" className="section">
								<div className="app-container">
									<div className="grid-x grid-margin-x">
										<div className="cell">

											<h2>{t('availableSkills')}</h2>

											<div className="section-content">
												{this.props.data.loading ? (
													<Loader active content={t("loading")} indeterminate={true} size="small" />
												) : (
														<ListSkills {...this.props} />
													)}

												{isViewerAMember && isMentor && inclusiveOrganisations && getUserToken() && (
													<NewEnterprise skills={skills} organisation={this.props.match.params.organisationId} />
												)}
											</div>
										</div>
									</div>
								</div>
							</div>
						</Wrapper>
					)
				}}
			</Query>
		);
	}
}

const mapStateToProps = state => {
	return {
		isAuthenticated: state.auth.isAuthenticated,
		userId: state.auth.userId
	};
};

export default compose(
	withRouter,
	connect(
		mapStateToProps,
		null
	),
	withTranslation(),
	graphql(getSkills, {
		skip: props => {
			const isSecureOrganisation = SECURE_ORGANISATIONS.findIndex(org => org === props.match.params.organisationId);
			const token = localStorage.getItem('token');
			if (isSecureOrganisation !== -1 && !token) {
				return true
			}
			return false
		},
		options: props => {
			return {
				variables: { name: props.match.params.organisationId ? props.match.params.organisationId : null },
			};
		},
	})
)(PublicOrganisation);
