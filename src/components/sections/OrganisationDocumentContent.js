import React, { Component } from 'react';
import Wrapper from '../layouts/wrapper';
import { compose } from 'redux';
import { Helmet } from 'react-helmet';
import { Redirect, withRouter } from 'react-router-dom';
import { Mutation } from 'react-apollo';
import { COMPLETE_STEP } from '../../store/gql/queries';
import ImagesLoaded from 'react-images-loaded';
import StepTimeline from './StepTimeline';
import MaterialLink from '../global/MaterialLink';
import { withTranslation } from 'react-i18next';


class DocumentContent extends Component {
	render() {
		const { loading, error, refetch } = this.props.data;
		const { t } = this.props;

		if (loading) return <div className="loading">{t('loading')}</div>;
		if (error) return <div className="error">{t('error')}</div>;

		const organisation = this.props.data.organisations ? this.props.data.organisations.edges[0].node : null;
		const pathIndex = organisation.paths.edges.findIndex(
			path => path.node.id === this.props.match.params.pathId
		);

		const viewer = this.props.data.viewer ? this.props.data.viewer : null;
		if (pathIndex === -1 || !viewer) return <Redirect to="/error" />;

		const {
			lowColor,
			highColor,
			maxColor,
			bgimage,
			mentorImageUrl,
			steps,
		} = this.props.data.viewer.paths.edges[0].node;

		return (
			<Wrapper>
				<Helmet titleTemplate="%s | Lifelearn Platform">
					<title>
						{organisation.paths.edges[0].node.title + ' - ' + organisation.title}
					</title>
				</Helmet>
				<div
					className="path-content path-viewer"
					style={{
						backgroundImage: bgimage ? `url(${bgimage})` : `none`,
						filter:
							"progid:DXImageTransform.Microsoft.gradient( startColorstr='#000000', endColorstr='#ffffff',GradientType=0 )",
					}}
				>
					<div className="path-content-viewer">
						<div className="path-background-overlay" style={{ background: lowColor }} />
						<div className="steps-container">
							<ImagesLoaded>
								{steps.edges.map((step, stepIndex) => {
									return (
										<div className="viewer-step" key={step.node.id} style={{ color: maxColor }} id={`viewer-step-${stepIndex}`}>
											<div
												className="viewer-overlay"
												style={{
													background: `linear-gradient(to bottom,rgba(255, 255, 255, 0) 50%,rgba(255, 255, 255, 0) 66%,rgba(255, 255, 255, 0) 58%, ${highColor} 100%)`,
												}}
											/>
											<div className="viewer-content">
												<h3>
													{/* <strong style={{ color: highColor }}>{stepIndex + 1}</strong>
												&nbsp; */}
													{step.node.title}
												</h3>
												<p>{step.node.description}</p>
												{step.node.contents.edges.length > 0 && (
													<div className="viewer-image">

														{step.node.contents.edges.map(content => {
															if (content.node.contentType !== 'vuocontent' && content.node.contentType !== 'filecontent') return null;
															return (
																<div className="viewer-image-item" key={content.node.id}>
																	{content.node.imageUrl && (
																		<img
																			src={content.node.imageUrl}
																			alt={content.node.title}
																		/>
																	)}
																	<MaterialLink content={content} pathId={this.props.match.params.pathId} stepIndex={stepIndex} selectedDocument={null} contentIndex={null} lowColor={lowColor} highColor={highColor} />
																</div>
															);
														})}
													</div>
												)}
												<div className="viewer-action">
													<div className="flex-container align-middle align-between">
														<Mutation mutation={COMPLETE_STEP}
														// UPDATE CACHE IS NOT POSSIBLE RIGHT NOW, TOO DEEP OBJECT, EITHER REFETCH, OR MORE INVESTIGATION NEEDED ON HOW TO SIMPLIFY THIS METHOD
														// update={(cache, { data: {completeStep}}) => {
														// const { viewer } = cache.readQuery({ query: getAuthPath2, variables:	{ pathId: this.props.match.params.pathId}});
														// console.log(viewer)
														// console.log(completeStep)
														// cache.writeQuery({
														// 	query: getAuthPath2,
														// 	data: { viewer: newViewer  }
														// });
														// }}
														>
															{(completeStep, { data }) => {
																if (data) return (
																	<div className={`viewer-complete-step ${data.completeStep.step.completed ? 'completed' : 'uncomplete'}`}
																		style={data.completeStep.step.completed ? { background: highColor } : { background: lowColor }}
																		title={data.completeStep.step.completed ? `Mark step as Uncomplete ?` : `Mark step as complete`}
																		onClick={async () => {
																			await completeStep({ variables: { clientMutationId: step.node.id, stepId: step.node.id, isCompleted: !data.completeStep.step.completed } }); refetch()
																		}
																		}
																	>
																		<span className="fa fa-check-square-o"
																			style={data.completeStep.step.completed ? { color: lowColor } : { color: highColor }}
																		/>
																	</div>
																)
																return (
																	<div className={`viewer-complete-step ${step.node.completed ? 'completed' : 'uncomplete'}`}
																		style={step.node.completed ? { background: highColor } : { background: lowColor }}
																		title={step.node.completed ? `Mark step as Uncomplete ?` : `Mark step as complete`}
																		onClick={async () => {
																			await completeStep({ variables: { clientMutationId: step.node.id, stepId: step.node.id, isCompleted: !step.node.completed } })
																			refetch();
																		}}
																	>
																		<span className="fa fa-check-square-o"
																			style={step.node.completed ? { color: lowColor } : { color: highColor }}
																		/>
																	</div>
																)
															}}
														</Mutation>
														<StepTimeline pathId={this.props.match.params.pathId} step={step.node} lowColor={lowColor} highColor={highColor} maxColor={maxColor} />
														<div className="viewer-avatar">
															<img src={mentorImageUrl} alt="Mentor" />
														</div>
													</div>
												</div>
											</div>
										</div>
									);
								})}
							</ImagesLoaded>
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
)(DocumentContent);
