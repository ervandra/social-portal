import React, { Component } from 'react';
import Wrapper from '../components/layouts/wrapper';
import Modal from 'react-modal';

import Header from '../components/layouts/Header';
import DynamicNavigation from '../components/layouts/DynamicNavigation';
import PathGrid from '../components/global/PathGrid';
// import PathTimeline from '../components/sections/PathTimeline';
import OrganisationPathContent from '../components/sections/OrganisationPathContent';
import OrganisationDocumentContent from '../components/sections/OrganisationDocumentContent';

import Badge from '../components/global/Badge';

import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter, Redirect, Link } from 'react-router-dom';
import { graphql, Query } from 'react-apollo';
import { GET_ORGANISATION_PATH, getPathParticipants, getSkillProgress } from '../store/gql/queries';

import { SECURE_ORGANISATIONS, ROOT_ROUTES } from '../constant';
import SecurePrompt from '../components/sections/SecurePrompt';
import { getUserToken } from '../helpers';
import { withTranslation } from 'react-i18next';

class PublicPath extends Component {
	state = {
		organisation: this.props.match.params.organisationId,
		skillId: this.props.match.params.skillId,
		pathId: this.props.match.params.pathId,
		activeTab: 'path',
		showPeopleModal: false,
		peopleIndex: null,
		isScrolled: false,
		isLoadMoreParticipants: false,
	};

	componentDidUpdate() {
		if (this.props.match.params.pathId !== this.state.pathId) {
			this.setState({
				pathId: this.props.match.params.pathId,
				isScrolled: false
			})
		}
	};

	handleStepScroll = () => {
		// const { isScrolled } = this.state;
		// if (!isScrolled) {
		// 	const { data } = this.props;
		// 	const { loading, viewer } = data;
		// 	if (!loading && viewer && viewer.paths.edges.length > 0) {
		// 		const findIndex = viewer.paths.edges[0].node.steps.edges.findIndex(step => step.node.completed !== true);
		// 		const stepViewer = document.getElementById(`viewer-step-${findIndex}`);
		// 		const OrganisationPathContent = document.getElementsByClassName('path-content');
		// 		if (stepViewer) {
		// 			this.setState({ isScrolled: true })
		// 			setTimeout(() => {
		// 				OrganisationPathContent[0].scrollTop = stepViewer.offsetTop;
		// 			}, 0);
		// 		}
		// 	}
		// }
	}

	componentWillUnmount() {
		this.setState({ isScrolled: false });
	}

	handleTabsChanges = tab => {
		this.setState({
			activeTab: tab,
		});
	};

	handleOpenPeopleModal = id => {
		this.setState({
			showPeopleModal: true,
			peopleIndex: id
		});
	}

	handleClosePeopleModal = () => {
		this.setState({
			showPeopleModal: false,
			peopleIndex: null
		});
	};

	render() {

		const isSecureOrganisation = SECURE_ORGANISATIONS.findIndex(org => org === this.props.match.params.organisationId);
		if (isSecureOrganisation !== -1 && !getUserToken() && !this.props.data) return <SecurePrompt />;

		const { loading, error, organisations } = this.props.data;
		const { t } = this.props;

		if (loading) return <div className="loading">{t('loading')}</div>;
		if (error || !organisations || organisations.edges.length < 1 || organisations.edges[0].node.paths.edges.length < 1) return <Redirect to={`/error?error=${error.message}`} />;

		const isSPPL = this.state.organisation && this.state.organisation === 'sppl' ? true : false;
		// const { socialKeyword } = organisations.edges[0].node.skills.edges[0].node || '';

		return (
			<Wrapper>
				{isSPPL && <Header url={ROOT_ROUTES} />}
				<DynamicNavigation {...this.props} noSkill="true" style={!isSPPL ? { background: '#ffffff' } : null} />
				<div id="maincontent" className="section">
					<div className="app-container">
						<div className="grid-x grid-margin-x">
							<div className="cell">
								<div className="grid-x grid-margin-x">
									<div className="cell small-12 medium-4 large-3">
										<div className="section-sticky">
											<div className="section-title">
												<ul className="tabs">
													<li className={this.state.activeTab === 'path' ? 'active' : ''} onClick={() => this.handleTabsChanges('path')} >{t('paths')}</li>
													<li className={this.state.activeTab === 'people' ? 'active' : ''} onClick={() => this.handleTabsChanges('people')} >{t('people')}</li>
												</ul>
											</div>
											<div className="section-content">
												<div className="tabs-content">
													<div className={this.state.activeTab === 'path' ? 'tabs-item active' : 'tabs-item'} id="tab-path">
														<div className="available-paths">
															{organisations.edges[0].node.paths.edges.map((path, index) => (
																<PathGrid key={index} active={this.props.match.params.pathId} data={path.node} url={`#`} />
															))}
														</div>
													</div>
													<div className={this.state.activeTab === 'people' ? 'tabs-item active' : 'tabs-item'} id="tab-people">
														{getUserToken() && this.props.data.viewer && this.props.data.viewer.paths.edges.length > 0 ?
															<Query query={getPathParticipants} variables={{ cursor: '', count: 25, pathId: this.props.match.params.pathId, publicPathId: `UHVibGlj${this.props.match.params.pathId}`, stringPathId: this.props.match.params.pathId }}>
																{({ loading, error, data, fetchMore }) => {
																	if (loading) return <div className="loading">{t('loading')}</div>;
																	if (error) return <p>{t('error')}</p>;
																	const { participants } = data.paths.edges[0].node;
																	return (
																		<React.Fragment>
																			<div className="user-paths">
																				<ul>
																					{participants.edges.map((people, index) => (
																						<li key={index}>
																							<a onClick={() => this.handleOpenPeopleModal(index)} href="#open">
																								<span className="my-path-bgimage"><img src={people.node.profilePictureUrl} alt={people.node.username} width="48" height="48" /></span>
																								{people.node.firstName === '' && people.node.lastName === '' ?
																									<span className="my-path-title">{people.node.username}</span>
																									:
																									<span className="my-path-title">{people.node.firstName} {people.node.lastName}</span>
																								}
																							</a>
																						</li>
																					))}
																					{participants.pageInfo.hasNextPage && (
																						<li className="load-more"><a href="#load" className={`btn-fetchmore fetchMore button small hollow ${this.state.isLoadMoreParticipants ? 'is-loading disabled' : ''}`} onClick={() => {
																							this.setState({ isLoadMoreParticipants: true }); fetchMore({
																								query: getPathParticipants,
																								variables: { cursor: participants.pageInfo.endCursor, count: 25, pathId: this.props.match.params.pathId, publicPathId: `UHVibGlj${this.props.match.params.pathId}`, stringPathId: this.props.match.params.pathId },
																								updateQuery: (previousResult, { fetchMoreResult }) => {
																									const newEdges = fetchMoreResult.paths.edges[0].node.participants.edges;
																									const pageInfo = fetchMoreResult.paths.edges[0].node.participants.pageInfo;
																									this.setState({ isLoadMoreParticipants: false });
																									const newResult = newEdges.length ? {
																										paths: {
																											__typename: previousResult.paths.__typename,
																											edges: [
																												{
																													__typename: previousResult.paths.edges[0].__typename,
																													node: {
																														__typename: previousResult.paths.edges[0].node.__typename,
																														participants: {
																															__typename: previousResult.paths.edges[0].node.participants.__typename,
																															edges: [...previousResult.paths.edges[0].node.participants.edges, ...newEdges],
																															pageInfo
																														}
																													}
																												}
																											]
																										}
																									} : previousResult;
																									return newResult;
																								}
																							})
																						}}>{t('loadMore')}</a></li>
																					)}
																				</ul>
																			</div>
																			<Modal
																				isOpen={this.state.showPeopleModal}
																				contentLabel="People Information"
																				onRequestClose={() => this.handleClosePeopleModal()}
																				className="reveal "
																				ariaHideApp={false}
																			>
																				<div className="people-container">
																					{participants.edges.map((people, index) => {
																						const { username, firstName, lastName, profilePictureUrl, bio, profileBadgeUrl } = people.node;
																						return (
																							<div className={this.state.peopleIndex === index ? 'people active' : 'people'} id={`people-${index}`} key={index}>
																								<div className="user-profile">
																									<div className="user-avatar">
																										<img
																											src={profilePictureUrl}
																											alt={firstName}
																										/>
																									</div>
																									<div className="user-information">
																										{firstName !== '' || lastName !== '' ?
																											<h2>
																												{firstName}{' '}
																												{lastName}
																											</h2>
																											:
																											<h2>{username}</h2>
																										}
																										{bio !== '' ?
																											<p>{bio}</p>
																											:
																											<p>{t('dontHaveBioYet')}</p>
																										}
																									</div>
																								</div>

																								{profileBadgeUrl.length > 0 &&
																									<div className="user-badges">
																										{profileBadgeUrl.map((badgeUrl, index) => (
																											<Badge key={index} profileBadgeUrl={badgeUrl} />
																										))}
																									</div>
																								}

																								{/* {skills.edges.length > 0 &&
																									<div className="participants-skill">
																										<hr />
																										<h4><span className="fa fa-list"></span> Skill Progress</h4>
																										<div className="participants-skill-list">
																											{skills.edges.map((skill, index) => (
																												<div className="skill-block" key={index}>
																													<Link to={`/skill/${skill.node.id}`}>
																														<img src={skill.node.imageUrl} alt={skill.node.title}/>
																														<span className="skill-block-title">{skill.node.title}</span>
																													</Link>
																												</div>
																											// <div className="skill-progress" key={index}>
																											// 	<h5><Link to={`/skill/${skill.node.id}`}>{skill.node.title}</Link></h5>
																											// 	<div className="skill-progress-bar" key={index}>
																											// 		<div className="skill-progress-meter">
																											// 			{skill.node.averageValue > 0 && (
																											// 				<div
																											// 					className="progress-average-value"
																											// 					style={{
																											// 						width: `${skill.node
																											// 							.averageValue * 100}%`,
																											// 					}}
																											// 				/>
																											// 			)}
																											// 			{skill.node.value > 0 && (
																											// 				<div
																											// 					className="progress-value"
																											// 					style={{
																											// 						width: `${skill.node.value * 100}%`,
																											// 					}}
																											// 				/>
																											// 			)}
																											// 		</div>
																											// 	</div>
																											// </div>
																										))}
																										</div>
																									</div>
																								} */}
																							</div>
																						)
																					})}
																				</div>
																				<button className="close-reveal" onClick={() => this.handleClosePeopleModal()}>
																					&times;
																</button>
																			</Modal>
																		</React.Fragment>
																	);
																}}
															</Query>
															:
															<React.Fragment>
																{getUserToken() ?
																	<p>{t('needToJoinPath')}</p>
																	:
																	<p>You need to <a href={process.env.REACT_APP_OAUTH_SIGNIN_URL}>{t('signIn')}</a> {t('firstToViewParticipants')}</p>
																}
															</React.Fragment>
														}
													</div>
												</div>
											</div>
										</div>
									</div>
									<div className="cell small-12 medium-8 large-6">
										<div className="my-path-detail">
											{this.props.isAuthenticated &&
												this.props.data.viewer !== null &&
												this.props.data.viewer.paths.edges.length > 0 ? (
													<OrganisationDocumentContent {...this.props} noSkill="true" />
												) : (
													<OrganisationPathContent {...this.props} />
												)}
										</div>

										{getUserToken() && this.props.data.viewer && this.props.data.viewer.paths.edges.length > 0 &&
											<Query query={getSkillProgress} variables={{ pathId: this.props.match.params.pathId }}>
												{({ loading, error, data }) => {
													if (loading) return <div className="loading">{t('loading')}</div>;
													if (error) return <p>{t('error')}</p>;
													const { skills } = data.viewer;
													return (
														<div className="my-skill-progress">
															{/* <hr />
															<h5><span className="fa fa-signal"></span> Skill Progress</h5> */}
															{skills.edges.map((skill, index0) => (
																<React.Fragment key={index0}>
																	{skill.node.paths.edges.length > 0 && skill.node.paths.edges.map((path, index) => {
																		if (path.node.id !== this.props.match.params.pathId) return null;
																		return (
																			<React.Fragment key={path.node.id}>
																				<div className="skill-progress" key={skill.node.id}>
																					<h5><Link to={`/skill/${skill.node.id}`}>{skill.node.title}</Link></h5>
																					<div className="skill-progress-bar">
																						<div className="skill-progress-meter">
																							{skill.node.averageValue > 0 && (
																								<div
																									className="progress-average-value"
																									style={{
																										width: `${skill.node
																											.averageValue * 100}%`,
																									}}
																								/>
																							)}
																							{data.viewer !== null && data.viewer.skills.edges[index].node.value > 0 && (
																								<div
																									className="progress-value"
																									style={{
																										width: `${data.viewer.skills.edges[index].node.value * 100}%`,
																									}}
																								/>
																							)}
																						</div>
																					</div>
																				</div>
																			</React.Fragment>
																		);
																	})
																	}
																</React.Fragment>
															))}
														</div>
													)
												}}
											</Query>
										}
									</div>
									<div className="cell small-12 medium-12 large-3">
										{/* <PathTimeline pathId={this.props.match.params.pathId} /> */}
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

const mapStateToProps = state => {
	return {
		isAuthenticated: getUserToken(),
	};
};

export default compose(
	withRouter,
	connect(
		mapStateToProps,
		null
	),
	graphql(GET_ORGANISATION_PATH, {
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
					pathId: props.match.params.pathId ? props.match.params.pathId : null,
				},
			};
		},
	}),
	withTranslation()
)(PublicPath);
