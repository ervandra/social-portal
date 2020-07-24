import React, { Component } from 'react';
import Wrapper from '../components/layouts/wrapper';
import Navigation from '../components/layouts/Navigation';
// import PathGrid from '../components/global/PathGrid';
import Badge from '../components/global/Badge';
import UserAvatar from '../components/global/UserAvatar';
import NewVisualization from '../components/sections/NewVisualization';
// import Conversation from '../components/sections/Conversation';
// import Drawer from '../components/global/Drawer';
import { withTranslation } from 'react-i18next';

import { compose } from 'redux';
import { connect } from 'react-redux';
import { Redirect, withRouter } from 'react-router-dom';
import { graphql, Query } from 'react-apollo';
import { getMyProfile, VIEWER_SKILL_POINTS } from '../store/gql/queries';
import { getObject } from '../helpers';
// import TimelineEvents from '../components/sections/TimelineEvents';
import SecurePrompt from '../components/sections/SecurePrompt';
import { isMobile } from 'react-device-detect';
import Loader from '../components/global/Loader';

class PathViewer extends Component {
	state = {
		activeTab: 'path',
		openDrawer: isMobile ? false : true,
		openDiscussion: false,
	};

	handleTabsChanges = tab => {
		this.setState({
			activeTab: tab,
		});
	};

	handleDrawer = open => {
		this.setState({
			openDrawer: open
		});
	};

	handleDiscussion = open => {
		this.setState({
			openDiscussion: open
		});
	};

	render() {

		const { viewer, loading, error } = getObject(['data'], this.props);
		const { t } = this.props;

		if (loading) return <Loader title={t("loading")} size="small" />
		if (error) return <Redirect to="/error" />;

		if (viewer === null) return <SecurePrompt />;
		const { userId } = this.props;

		const { profileBadgeUrl } = viewer;
		// const { mastodonAuthToken } = this.props || null;
		const { openDrawer, openDiscussion } = this.state;

		return (
			<Wrapper className={`${openDiscussion ? 'blur' : ''}`}>
				<Navigation title={t('myProfile')} style={{ background: '#ffffff' }} />
				<div id="maincontent" className="section">
					<div className="grid-x grid-margin-x">
						<div className="cell">
							<div className={`fluid-container ${openDrawer ? 'widget-active' : ''}`}>

								{/* <Drawer position="left">
									<div className="section-title">
										<ul className="tabs">
											<li className={activeTab === 'path' ? 'active' : ''} onClick={() => this.handleTabsChanges('path')} >{t('myPaths')}</li>
											<li className={activeTab === 'timeline' ? 'active' : ''} onClick={() => this.handleTabsChanges('timeline')} >{t('timeline')}</li>
										</ul>
									</div>
									<div className="section-content">
										<div className="tabs-content">
											<div className={activeTab === 'path' ? 'tabs-item active' : 'tabs-item'} id="tab-path">
												{viewer.paths.edges.length > 0 &&
													<div className="available-paths">
														{viewer.paths.edges.map((path, index) => {
															return (
																<PathGrid key={index} data={path.node} url={`/path/${path.node.id}`} />
															)
														})}
													</div>
												}
											</div>
											<div className={activeTab === 'timeline' ? 'tabs-item active' : 'tabs-item'} id="tab-timeline">
												<TimelineEvents />
											</div>
										</div>
									</div>
								</Drawer> */}

								<div className="fluid-section fluid-full">

									{/* <div className="flex-container align-between align-middle">
										<button className="button secondary hide-for-mobile" onClick={() => this.handleDrawer(!openDrawer)}><span className="fa fa-bars" /> {openDrawer ? <span>Collapse menu</span> : <span>Expand menu</span>}</button>
									</div> */}

									<div className="grid-x grid-margin-x">
										<div className="cell small-12 medium-6">
											<div className="user-profile">
												<div className="user-avatar">
													<UserAvatar src={viewer.profilePictureUrl} alt={viewer.firstName} />
												</div>
												<div className="user-information">
													{viewer.firstName === '' && viewer.lastName === '' ?
														<h2>{viewer.username}</h2>
														:
														<h2>
															{viewer.firstName}{' '}
															{viewer.lastName}
														</h2>
													}
													{viewer.bio !== '' && <p>{viewer.bio}</p>}
												</div>
											</div>
											{profileBadgeUrl.length > 0 &&
												<div className="boxShadowDeep panel">
													<div className="panel-header">
														<h6>User Badges</h6>
													</div>
													<div className="user-badges">
														{profileBadgeUrl.map((badgeUrl, index) => (
															<Badge key={index} profileBadgeUrl={badgeUrl} />
														))}
													</div>
												</div>
											}

										</div>
										<div className="cell small-12 medium-6">
											<Query query={VIEWER_SKILL_POINTS} fetchPolicy="network-only">
												{({ data, loading, error }) => {
													if (loading) return <p className="loading">{t('loading')}</p>;
													if (error) return <p>{t('error')}</p>
													const skillData = data.userSkillPoints.edges.length > 0 ? data.userSkillPoints.edges : [];
													let newData = [];
													for (let n = 0; n < skillData.length; n++) {
														const s = skillData[n].node;
														const data = {
															id: s.skill.id,
															title: s.skill.title,
															value: s.value,
															myTarget: s.target,
															maxValue: s.skill.stats.edges[0].node.maxValue,
															orgTarget: s.skill.stats.edges[0].node.target,
															orgAverage: s.skill.stats.edges[0].node.average,
															industryAverage: s.skill.stats.edges[0].node.industryAverage,
															globalAverage: s.skill.stats.edges[0].node.globalAverage,
														}
														newData.push(data);
													}
													return (
														<div className="new-skill-profile">
															<NewVisualization data={newData} userId={userId} />
														</div>
													)
												}}
											</Query>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					{/* <div className={`chat-widget ${openDiscussion ? 'active' : ''}`}>
						<div className="chat-widget-button">
							<button className="button secondary" onClick={() => this.handleDiscussion(!openDiscussion)}>
								{openDiscussion ? (
									<span><span className="fa fa-comments-o" /> Close Discussions</span>
								) : (
										<span><span className="fa fa-comments-o" /> Open Discussions</span>
									)}
								<span className={`fa ${openDiscussion ? 'fa-close' : 'fa-chevron-up'}`} />
							</button>
						</div>
					</div> */}
					{/* <Drawer position="right" title="Chat" icon="comments-o">
						<div className="section-title">
							<ul className="tabs">
								<li className="active">{t('myConversations')}</li>
							</ul>
						</div>
						<div className="section-content">
							<div className="chat-widget-content">
								{!mastodonAuthToken ? (
									<p>{t('chatError')}</p>
								) : (
										<Conversation />
									)}
							</div>
						</div>
					</Drawer> */}

					{/* <div className="mobile-bottom-nav">
						<button className="button secondary" onClick={() => this.handleDrawer(!openDrawer)}><span className="fa fa-bars" />  Menu</button>
						<button className="button secondary" onClick={() => this.handleDiscussion(!openDiscussion)}>
							<span><span className="fa fa-comments-o" /> Discussions</span>
						</button>
					</div> */}
				</div>
			</Wrapper>
		);
	}
}

const mapStateToProps = state => {
	return {
		isAuthenticated: state.auth.isAuthenticated,
		mastodonAuthToken: state.auth.mastodonAuthToken,
		userId: state.auth.userId,
	};
};

export default compose(
	withRouter,
	connect(
		mapStateToProps,
		null
	),
	graphql(getMyProfile),
	withTranslation(),
)(PathViewer);
