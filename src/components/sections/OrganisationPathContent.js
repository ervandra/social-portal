import React, { Component } from 'react';
import Wrapper from '../layouts/wrapper';
import { compose } from 'redux';
import { Helmet } from 'react-helmet';
import { Redirect, withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

class OrganisationPathContent extends Component {

	render() {
		const { loading, error } = this.props.data;
		const { t } = this.props;

		if (loading) return <div className="loading">{t('loading')}</div>;
		if (error) return <div className="error">{t('error')}</div>;

		const organisation = this.props.data.organisations ? this.props.data.organisations.edges[0].node : null;
		const pathIndex = organisation.paths.edges.findIndex(
			path => path.node.id === this.props.match.params.pathId
		);

		if (pathIndex === -1) return <Redirect to="/error" />;

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
								organisation.paths.edges[pathIndex].node.lowColor +
								' 0%, ' +
								organisation.paths.edges[pathIndex].node.highColor +
								' 100%)',
							filter:
								"progid:DXImageTransform.Microsoft.gradient( startColorstr='#000000', endColorstr='#ffffff',GradientType=0 )",
						}}
					>
						<div className="path-detail-image">
							<img
								src={organisation.paths.edges[pathIndex].node.imageUrl}
								alt={organisation.paths.edges[pathIndex].node.title}
								width="350"
								height="350"
							/>
						</div>
						<div className="path-detail-info">
							<div className="path-detail-container">
								<h3
									style={{
										color:
											organisation.paths.edges[pathIndex].node
												.maxColor,
									}}
								>
									{organisation.paths.edges[pathIndex].node.title}
								</h3>
								<div className="flex-container align-middle">
									<h5
										style={{
											color:
												organisation.paths.edges[pathIndex].node
													.maxColor,
										}}
									>
										<span className="fa fa-stack"><i className="fa fa-circle fa-stack-2x"></i><i className="fa fa-users fa-stack-1x fa-inverse"></i></span>{organisation.paths.edges[pathIndex].node.userCount}{' '}
										{t('users')}
									</h5>
									<h4
										style={{
											color:
												organisation.paths.edges[pathIndex].node
													.maxColor,
										}}
									>
										<img src={organisation.paths.edges[pathIndex].node.mentorImageUrl} alt={organisation.paths.edges[pathIndex].node.mentorName} />
										{organisation.paths.edges[pathIndex].node.mentorName}
									</h4>
								</div>
								<p
									style={{
										color:
											organisation.paths.edges[pathIndex].node
												.maxColor,
									}}
								>
									{organisation.paths.edges[pathIndex].node.description}
								</p>
								<div className="path-detail-link">
									<a
										href={organisation.paths.edges[pathIndex].node.goUrl}
										className="button btn-link"
										target="_blank"
										rel="noopener noreferrer"
										style={{
											color:
												organisation.paths.edges[pathIndex].node
													.lowColor,
										}}
									>
										{t('discussInLifelearn')}
									</a>
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
)(OrganisationPathContent);
