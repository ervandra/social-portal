import React, { Component } from 'react';
import Wrapper from '../components/layouts/wrapper';

import Header from '../components/layouts/Header';
import DynamicNavigation from '../components/layouts/DynamicNavigation';
// import ActivityGrid from '../components/global/ActivityGrid';

// import PathGrid from '../components/global/PathGrid';
import SkillContent from '../components/sections/SkillContent';
import SecurePrompt from '../components/sections/SecurePrompt';

import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter, Redirect, Link } from 'react-router-dom';
import { graphql, Query } from 'react-apollo';
import { getPaths, checkOrgUser } from '../store/gql/queries';

import { SECURE_ORGANISATIONS, ROOT_ROUTES } from '../constant';
import { getUserToken } from '../helpers';
import { withTranslation } from 'react-i18next';

import { Loader } from 'semantic-ui-react';

class PublicSkill extends Component {
	state = {
		skillId: this.props.match.params.skillId,
		activeTab: 'path'
	}

	handleTabsChanges = tab => {
		this.setState({
			activeTab: tab,
		});
	};

	render() {
		const isSecureOrganisation = SECURE_ORGANISATIONS.findIndex(org => org === this.props.match.params.organisationId);
		if (isSecureOrganisation !== -1 && !getUserToken() && !this.props.data) return <SecurePrompt />;

		const isSPPL = this.props.match.params.organisationId && this.props.match.params.organisationId === 'sppl' ? true : false;

		const { loading, error, organisations } = this.props.data;
		const { t } = this.props;

		if (loading) return <Loader active content={t("loading")} indeterminate={true} size="small" />;
		if (error || organisations.edges.length < 1 || organisations.edges[0].node.skills.edges.length < 1) return <Redirect to="/error" />;

		// const { socialKeyword } = organisations.edges[0].node.skills.edges[0].node || '';

		return (
			<Query query={checkOrgUser} variables={{ name: this.props.match.params.organisationId }}>
				{({ data, loading, error }) => {
					if (loading) return <Loader active content={t("loading")} indeterminate={true} size="small" />
					if (error) return <p>{t('error')}</p>
					const { isViewerAMember } = data.organisations.edges[0].node;
					if (!isViewerAMember && isSPPL) return <SecurePrompt isLogin />;
					return (
						<Wrapper>
							{isSPPL && <Header url={ROOT_ROUTES} />}
							<DynamicNavigation {...this.props} style={!isSPPL ? { background: '#ffffff' } : null} />
							<div id="maincontent" className="section">
								<div className="app-container">
									<div className="grid-x grid-margin-x">
										<div className="cell">
											<div className="grid-x grid-margin-x">
												{/* <div className="cell small-12 medium-4 large-3">
										<div className="section-sticky">
											<div className="section-title">
												<ul className="tabs">
													<li className={this.state.activeTab === 'path' ? 'active' : ''} onClick={() => this.handleTabsChanges('path')} >{t('myPaths')}</li>
													{/* <li className={this.state.activeTab === 'people' ? 'active' : ''} onClick={() => this.handleTabsChanges('people')} >People</li>
												</ul>
											</div>
											<div className="section-content">
												<div className="tabs-content">
													<div className={this.state.activeTab === 'path' ? 'tabs-item active' : 'tabs-item'} id="tab-path">
														<div className="available-paths">
															{organisations.edges[0].node.skills.edges[0].node.paths.edges.map((path, index) => (
																<PathGrid key={index} data={path.node} url={`/${this.props.match.params.organisationId}/${this.props.match.params.skillId}/${path.node.id}`} />
															))}
														</div>
													</div>
													<div className={this.state.activeTab === 'people' ? 'tabs-item active' : 'tabs-item'} id="tab-people">
														<h3>{t('people')}</h3>
													</div>
												</div>
											</div>
										</div>
									</div> */}
												<div className="cell small-12 medium-12 large-12">
													<SkillContent data={organisations.edges[0].node.skills.edges[0].node} />
													<div className="path-collection">
														{organisations.edges[0].node.skills.edges[0].node.paths.edges.map((path, index) => (
															<div className="path-card" key={path.node.id}>
																<div className="card boxShadowDeep">
																	<div className="card-image">
																		<img src={path.node.imageUrl} alt={path.node.title} />
																	</div>
																	<div className="card-content">
																		<h6>{path.node.title}</h6>
																		<div className="card-extra">
																			<div className="flex-container align-between">
																				<p><span className="fa fa-stack"><i className="fa fa-circle fa-stack-2x"></i><i className="fa fa-users fa-stack-1x fa-inverse"></i></span> {path.node.userCount} users</p>
																				<p><span className="mentor-img"><img src={path.node.mentorImageUrl} width="16" alt={path.node.mentorName} /></span> {path.node.mentorName}</p>
																			</div>
																		</div>
																	</div>
																	<Link className="card-link" to={`/${this.props.match.params.organisationId}/${this.props.match.params.skillId}/${path.node.id}`}>{path.node.title}</Link>
																</div>
															</div>
															// <PathGrid key={index} data={path.node} url={`/${this.props.match.params.organisationId}/${this.props.match.params.skillId}/${path.node.id}`} />
														))}
													</div>
												</div>
												{/* <div className="cell small-12 medium-12 large-3">
									{socialKeyword !== '' &&
										<div className="activity-section section-sticky">
											<div className="section-title">
												<h2>{t('activityStream')}</h2>
											</div>
											<div className="section-content">
												<div className="activity-streams">
													<div className="activity">
														<ActivityGrid socialKeyword={socialKeyword} />
													</div>
												</div>
											</div>
										</div>
									}
								</div> */}
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
	connect(mapStateToProps, null),
	graphql(getPaths, {
		skip: (props) => {
			const isSecureOrganisation = SECURE_ORGANISATIONS.findIndex(org => org === props.match.params.organisationId);
			const token = localStorage.getItem('token');
			if (isSecureOrganisation !== -1 && !token) {
				return true
			}
			return false
		},
		options: props => {
			return {
				variables: {
					name: props.match.params.organisationId ? props.match.params.organisationId : null,
					skillId: props.match.params.skillId ? props.match.params.skillId : null,
				},
			};
		},
	}),
	withTranslation()
)(PublicSkill);
