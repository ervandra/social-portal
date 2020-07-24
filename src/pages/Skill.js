import React, { Component } from 'react';
import Wrapper from '../components/layouts/wrapper';

import Navigation from '../components/layouts/Navigation';
import ActivityGrid from '../components/global/ActivityGrid';

import SkillContent from '../components/sections/SkillContent';
import PathGrid from '../components/global/PathGrid';
import SecurePrompt from '../components/sections/SecurePrompt';

import { compose } from 'redux';
import { withRouter, Redirect } from 'react-router-dom';
import { graphql } from 'react-apollo';
import { getAuthSkill } from '../store/gql/queries';

import { getUserToken } from '../helpers';
import { withTranslation } from 'react-i18next';

class Skill extends Component {
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
		if (!getUserToken()) return <SecurePrompt />

		const { loading, error, viewer } = this.props.data;
		const { t } = this.props;

		if (loading) return <div className="loading">{t('loading')}</div>;
		if (error) return <Redirect to="/error" />;

		const { skillId } = this.state;

		const idx = viewer.skills.edges.findIndex(s => s.node.id === skillId);
		const { socialKeyword } = viewer.skills.edges[idx].node || '';

		return (
			<Wrapper>
				<Navigation title={viewer.skills.edges[idx].node.title} style={{ background: '#ffffff' }} referer="profile" refTitle={t('myProfile')} />
				<div id="maincontent" className="section">
					<div className="app-container">
						<div className="grid-x grid-margin-x">
							<div className="cell">
								<div className="grid-x grid-margin-x">
									<div className="cell small-12 medium-4 large-3">
										<div className="section-sticky">
											<div className="section-title">
												<ul className="tabs">
													<li className={this.state.activeTab === 'path' ? 'active' : ''} onClick={() => this.handleTabsChanges('path')} >{t('myPaths')}</li>
													{/* <li className={this.state.activeTab === 'people' ? 'active' : ''} onClick={() => this.handleTabsChanges('people')} >People</li> */}
												</ul>
											</div>
											<div className="section-content">
												<div className="tabs-content">
													<div className={this.state.activeTab === 'path' ? 'tabs-item active' : 'tabs-item'} id="tab-path">
														<div className="available-paths">
															{viewer.skills.edges[idx].node.paths.edges.map((path, index) => {
																const pathId = path.node.id.match(/UHVibGlj/g) ? path.node.id.substr(8, path.node.id.length) : path.node.id;
																return (
																	<PathGrid key={index} data={path.node} url={`/path/${pathId}`} />
																)
															})}
														</div>
													</div>
													<div className={this.state.activeTab === 'people' ? 'tabs-item active' : 'tabs-item'} id="tab-people">
														<h3>{t('people')}</h3>
													</div>
												</div>
											</div>
										</div>
									</div>
									<div className="cell small-12 medium-8 large-6">
										<SkillContent data={viewer.skills.edges[idx].node} />
									</div>
									<div className="cell small-12 medium-12 large-3">
										{socialKeyword !== '' && (
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
										)}
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
	graphql(getAuthSkill, {
		skip: () => {
			const token = localStorage.getItem('token');
			if (!token) {
				return true
			}
			return false
		},
		options: props => {
			return {
				variables: {
					skillId: props.match.params.skillId ? props.match.params.skillId : null,
				},
			};
		},
	}),
	withTranslation()
)(Skill);
