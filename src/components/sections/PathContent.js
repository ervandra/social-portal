import React, { Component } from 'react';
import Wrapper from '../layouts/wrapper';
import { compose } from 'redux';
import { Helmet } from 'react-helmet';
import { Redirect, withRouter } from 'react-router-dom';
import EnrollButton from '../global/EnrollButton';
import { withTranslation } from 'react-i18next';

class PathContent extends Component {
	render() {
		const { loading, error } = this.props.data;
		const { t } = this.props;

		if (loading) return <div className="loading">{t('loading')}</div>;
		if (error) return <div className="error">{t('error')}</div>;

		const organisation = this.props.data.organisations ? this.props.data.organisations.edges[0].node : null;
		const skillIndex = organisation.skills.edges.findIndex(
			skill => skill.node.id === this.props.match.params.skillId
		);
		const pathIndex =
			skillIndex !== -1 &&
			organisation.skills.edges[skillIndex].node.paths.edges.findIndex(
				path => path.node.id === this.props.match.params.pathId
			);

		if (skillIndex === -1 || pathIndex === -1) return <Redirect to="/error" />;

		return (
			<Wrapper>
				<Helmet titleTemplate="%s | Lifelearn Platform">
					<title>{organisation.title}</title>
				</Helmet>
				<div className="path-content ">

					<div
						className="path-detail"
						style={{
							background:
								'linear-gradient(to bottom, ' +
								organisation.skills.edges[skillIndex].node.paths.edges[pathIndex].node.lowColor +
								' 0%, ' +
								organisation.skills.edges[skillIndex].node.paths.edges[pathIndex].node.highColor +
								' 100%)',
							filter:
								"progid:DXImageTransform.Microsoft.gradient( startColorstr='#000000', endColorstr='#ffffff',GradientType=0 )",
						}}
					>
						<div className="path-detail-image">
							<img
								src={organisation.skills.edges[skillIndex].node.paths.edges[pathIndex].node.imageUrl}
								alt={organisation.skills.edges[skillIndex].node.paths.edges[pathIndex].node.title}
								width="350"
								height="350"
							/>
						</div>
						<div className="path-detail-info">
							<div className="path-detail-container">
								<h3
									style={{
										color:
											organisation.skills.edges[skillIndex].node.paths.edges[pathIndex].node
												.maxColor,
									}}
								>
									{organisation.skills.edges[skillIndex].node.paths.edges[pathIndex].node.title}
								</h3>
								<div className="flex-container align-middle">
									<h5
										style={{
											color:
												organisation.skills.edges[skillIndex].node.paths.edges[pathIndex].node
													.maxColor,
										}}
									>
										<span className="fa fa-stack"><i className="fa fa-circle fa-stack-2x"></i><i className="fa fa-users fa-stack-1x fa-inverse"></i></span>{organisation.skills.edges[skillIndex].node.paths.edges[pathIndex].node.userCount}{' '}
										{t('users')}
									</h5>
									<h4
										style={{
											color:
												organisation.skills.edges[skillIndex].node.paths.edges[pathIndex].node
													.maxColor,
										}}
									>
										<img src={organisation.skills.edges[skillIndex].node.paths.edges[pathIndex].node.mentorImageUrl} alt={organisation.skills.edges[skillIndex].node.paths.edges[pathIndex].node.mentorName} />
										{organisation.skills.edges[skillIndex].node.paths.edges[pathIndex].node.mentorName}
									</h4>
								</div>
								<p
									style={{
										color:
											organisation.skills.edges[skillIndex].node.paths.edges[pathIndex].node
												.maxColor,
									}}
								>
									{organisation.skills.edges[skillIndex].node.paths.edges[pathIndex].node.description}
								</p>
								<div className="path-detail-link">
									<EnrollButton sharecode={organisation.skills.edges[skillIndex].node.paths.edges[pathIndex].node.goUrl.substring(35)} isAuth={this.props.isAuthenticated} />
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
	withTranslation()
)(PathContent);
