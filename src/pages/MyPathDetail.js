import React, { Component } from 'react';
import Wrapper from '../components/layouts/wrapper';

import AuthNavigation from '../components/layouts/AuthNavigation';
import StepTimeline from '../components/sections/StepTimeline';
import MaterialLink from '../components/global/MaterialLink';

import { compose } from 'redux';
import { connect } from 'react-redux';
import { Redirect, withRouter } from 'react-router-dom';
import { graphql } from 'react-apollo';
import { getMyPathDetail } from '../store/gql/queries';
import { withTranslation } from 'react-i18next';

class PathViewer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			pathId: this.props.match.params.pathId,
		};
	}
	componentDidUpdate() {
		if (this.props.match.params.pathId !== this.state.pathId) {
			this.setState({
				pathId: this.props.match.params.pathId,
			});
		}
	}
	render() {
		if (!this.props.data.loading && !this.props.isAuthenticated) {
			return <Redirect to="/error" />;
		}

		const { loading, error } = this.props.data;
		const { t } = this.props;

		if (loading) return <div className="loading">{t('loading')}</div>;
		if (error) return <Redirect to="/error" />;

		const {
			bgimage,
			lowColor,
			highColor,
			title,
			maxColor,
			steps,
			mentorImageUrl,
		} = this.props.data.viewer.paths.edges[0].node;

		return (
			<Wrapper>
				<AuthNavigation {...this.props} title={title} style={{ background: '#ffffff' }} />
				<div id="maincontent" className="section">
					<div className="app-container">
						<div className="grid-x grid-margin-x">
							<div className="cell">
								<div className="grid-x grid-margin-x align-center">
									<div className="cell small-12 medium-8 large-9">
										<h3>{title}</h3>
										<div className="my-path-detail">
											<div
												className="path-content path-viewer"
												style={{
													backgroundImage: bgimage ? `url(${bgimage})` : `none`,
													filter:
														"progid:DXImageTransform.Microsoft.gradient( startColorstr='#000000', endColorstr='#ffffff',GradientType=0 )",
												}}
											>
												<div className="path-content-viewer">
													<div
														className="path-background-overlay"
														style={{ background: lowColor }}
													/>
													<div className="steps-container">
														{steps.edges.map((step, stepIndex) => {
															return (
																<div
																	className="viewer-step"
																	key={step.node.id}
																	style={{ color: maxColor }}
																>
																	<div
																		className="viewer-overlay"
																		style={{
																			background: `linear-gradient(to bottom,rgba(255, 255, 255, 0) 50%,rgba(255, 255, 255, 0) 66%,rgba(255, 255, 255, 0) 58%, ${highColor} 100%)`,
																		}}
																	/>
																	<div className="viewer-content">
																		<h3>
																			{/* <strong style={{ color: highColor }}>
																				{stepIndex + 1}
																			</strong>
																			&nbsp; */}
																			{step.node.title}
																		</h3>
																		<p>{step.node.description}</p>
																		{step.node.contents.edges.length > 0 && (
																			<div className="viewer-image">
																				{step.node.contents.edges.map(
																					content => {
																						if (content.node.contentType !== 'vuocontent' && content.node.contentType !== 'filecontent') return null;
																						return (
																							<div
																								className="viewer-image-item"
																								key={content.node.id}
																							>
																								{content.node
																									.imageUrl && (
																										<img
																											src={
																												content.node
																													.imageUrl
																											}
																											alt={
																												content.node
																													.title
																											}
																										/>
																									)}
																								<MaterialLink content={content} pathId={this.props.match.params.pathId} stepIndex={stepIndex} selectedDocument={null} contentIndex={null} lowColor={lowColor} highColor={highColor} />
																							</div>
																						);
																					}
																				)}
																			</div>
																		)}
																		<div className="viewer-action">
																			<div className="flex-container align-middle align-between">
																				<StepTimeline pathId={this.props.match.params.pathId} step={step.node} lowColor={lowColor} highColor={highColor} maxColor={maxColor} />
																				<div className="viewer-avatar">
																					<img
																						src={mentorImageUrl}
																						alt="Mentor"
																					/>
																				</div>
																			</div>
																		</div>
																	</div>
																</div>
															);
														})}
													</div>
												</div>
											</div>
										</div>
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
		isAuthenticated: state.auth.isAuthenticated,
	};
};

export default compose(
	withRouter,
	connect(
		mapStateToProps,
		null
	),
	graphql(getMyPathDetail, {
		options: props => {
			return {
				variables: {
					pathId: props.match.params.pathId ? props.match.params.pathId : null,
				},
			};
		},
	}),
	withTranslation()
)(PathViewer);
