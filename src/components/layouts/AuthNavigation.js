import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';

import UserInfo from './UserInfo';
import lifelearnLogo from '../../assets/images/lifelearn_logo.png';

class DynamicNavigation extends Component {
	state = {
		pathId: this.props.match.params.pathId
	}
	componentWillReceiveProps(nextProps) {
		if (this.state.organisationId) {
			if (this.props.match.params.pathId !== nextProps.match.params.pathId) {
				this.setState({ pathId: nextProps.match.params.pathId })
			}
		}
	}
	render() {

		const { loading, error } = this.props.data;
		const { t } = this.props;
		if (loading) return <div className="loading">{t('loading')}</div>;
		if (error) return <div className="error">{t('error')}</div>;

		const paths = this.props.data.viewer.paths.edges[0].node;
		const contents = paths.steps.edges.length > 1 && this.props.match.params.stepIndex ? paths.steps.edges[this.props.match.params.stepIndex].node.contents : null
		const documentIndex = contents ? contents.edges.findIndex(doc => doc.node.id === this.props.match.params.documentId) : null;
		const documents = contents && documentIndex !== -1 ? contents.edges[documentIndex].node : null;
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
								<li>
									<Link to="/profile">
										<span>{t('myProfile')}</span>
									</Link>
								</li>
								{paths &&
									<li>
										{contents ? (
											<Link to={`/path/${paths.id}`}>
												<span>{paths.title}</span>
											</Link>
										) : (
												<span>{paths.title}</span>
											)}
									</li>
								}
								{contents && documents &&
									<li>
										<span>{documents.title}</span>
									</li>
								}

								{/* { ( this.props.data.organisations && pathIndex !== -1 && this.state.pathId !== null ) &&
                  <li>
										<span>{pathIndex !== -1 && organisation.skills.edges[skillIndex].node.paths.edges[pathIndex].node.title}</span>
										<Link to={`/${this.props.match.params.organisationId}/${this.props.match.params.skillId}`} className="close">
											<span className="fa fa-times" />
										</Link>
                  </li>
                } */}
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
