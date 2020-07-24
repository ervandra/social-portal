import React, { Component } from 'react';
import Wrapper from '../layouts/wrapper';
import { Helmet } from 'react-helmet';
import { Redirect, withRouter } from 'react-router-dom';
import { compose } from 'redux';

import PathGrid from '../global/PathGrid';
import PeopleGrid from '../global/PeopleGrid';
import { withTranslation } from 'react-i18next';

class listPaths extends Component {
	constructor(props) {
		super(props);
		this.state = {
			activeTab: 'path',
		};
	}
	handleTabsChanges = tab => {
		this.setState({
			activeTab: tab,
		});
	};
	render() {
		const { loading, error } = this.props.data;
		const { t } = this.props;

		if (loading) return <div className="loading">{t('loading')}</div>;
		if (error) return <div className="error">{t('error')}</div>;

		const organisations = this.props.data.organisations.edges[0].node;
		const skillId = this.props.match.params.skillId ? this.props.match.params.skillId : false;
		const skillIndex = organisations.skills.edges.findIndex(skill => skill.node.id === skillId);
		const pathId = this.props.match.params.pathId ? this.props.match.params.pathId : false;

		if (skillIndex === -1) return <Redirect to="/error" />;

		return (
			<Wrapper>
				<Helmet titleTemplate="%s | Lifelearn Platform">
					<title>{organisations.title}</title>
				</Helmet>
				<div className="section-sticky">
					<div className="section-title">
						<ul className="tabs">
							<li
								className={this.state.activeTab === 'path' ? 'active' : ''}
								onClick={() => this.handleTabsChanges('path')}
							>
								Paths
							</li>
							{this.props.people === 'true' ? (
								<li
									className={this.state.activeTab === 'people' ? 'active' : ''}
									onClick={() => this.handleTabsChanges('people')}
								>
									{t('people')}
								</li>
							) : null}
						</ul>
					</div>
					<div className="section-content">
						<div className="tabs-content">
							<div
								className={this.state.activeTab === 'path' ? 'tabs-item active' : 'tabs-item'}
								id="tab-path"
							>
								<div className="available-paths sticky">
									{organisations.skills.edges[skillIndex].node.paths.edges.map((path, index) => (
										<PathGrid key={index} data={path.node} active={pathId} url={`/${organisations.name}/${skillId}/${path.node.id}`} />
									))}
								</div>
							</div>
							{this.props.people === 'true' ? (
								<div
									className={this.state.activeTab === 'people' ? 'tabs-item active' : 'tabs-item'}
									id="tab-people"
								>
									{organisations.skills.edges.map((skill, index) => (
										<PeopleGrid key={index} people={skill} />
									))}
								</div>
							) : null}
						</div>
					</div>
				</div>
			</Wrapper>
		);
	}
}

export default compose(withRouter, withTranslation())(listPaths);
