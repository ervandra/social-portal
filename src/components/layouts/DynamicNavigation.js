import React, { Component } from 'react';
import { Link, withRouter, Redirect } from 'react-router-dom';
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';

import UserInfo from './UserInfo';
import lifelearnLogo from '../../assets/images/lifelearn_logo.png';


class DynamicNavigation extends Component {
	state = {
		pathId: this.props.match.params.pathId ? this.props.match.params.pathId : null
	};
	componentWillReceiveProps(nextProps) {
		if (this.props.match.params.organisationId) {
			if (this.state.pathId !== nextProps.match.params.pathId) {
				this.setState({ pathId: nextProps.match.params.pathId })
			}
		}
	}
	render() {
		const { noSkill, t } = this.props;
		const { loading, error } = this.props.data;
		if (loading) return <div className="loading">{t('loading')}</div>;
		if (error) return <div className="error">{t('error')}</div>;

		const organisation = this.props.data.organisations.edges.length > 0 ? this.props.data.organisations.edges[0].node : null;
		if (organisation === null) return <Redirect to="/" />

		const skillIndex = !noSkill ? organisation.skills.edges.findIndex(skill => skill.node.id === this.props.match.params.skillId) : -1;
		const pathIndex = skillIndex !== -1 && organisation.skills.edges[skillIndex].node.paths.edges.findIndex(path => path.node.id === this.state.pathId);

		return (
			<div className="navigation-wrapper" style={this.props.style}>
				<div className="navigation">
					<div className="flex-container align-between align-top">
						<div className="left-navigation">
							<ul className="lifelearn-link">
								<li className="logo-menu">
									<Link to="/">
										<img src={lifelearnLogo} alt="LifeLearn" width="36" height="36" />
									</Link>
								</li>
							</ul>
						</div>

						<div className="mid-navigation">
							<ul className="breadcrumbs">
								{this.props.data.organisations &&
									<li>
										{this.props.match.params.skillId || noSkill ? (
											<Link to={`/${this.props.match.params.organisationId}`}>
												<span>{this.props.data.organisations.edges[0].node.title}</span>
											</Link>
										) : (
												<span>{this.props.data.organisations.edges[0].node.title}</span>
											)}

									</li>
								}
								{(this.props.match.params.skillId && skillIndex !== -1) && (
									<li>
										{this.props.match.params.pathId ? (
											<Link to={`/${this.props.match.params.organisationId}/${this.props.match.params.skillId}`}>
												<span>{skillIndex !== -1 && organisation.skills.edges[skillIndex].node.title}</span>
											</Link>
										) : (
												<span>{skillIndex !== -1 && organisation.skills.edges[skillIndex].node.title}</span>
											)}

									</li>
								)
								}
								{(this.props.match.params.pathId && pathIndex !== -1) &&
									<li>
										{!noSkill ? (
											<span>{pathIndex !== -1 && organisation.skills.edges[skillIndex].node.paths.edges[pathIndex].node.title}</span>
										) : (
												<span>{pathIndex !== -1 && organisation.paths.edges[0].node.title}</span>
											)}
									</li>
								}
							</ul>
						</div>

						<div className="right-navigation">
							<UserInfo />
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default compose(
	withRouter,
	withTranslation()
)(DynamicNavigation);
