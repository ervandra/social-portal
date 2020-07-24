import React, { Component } from 'react';
import Wrapper from '../components/layouts/wrapper';

import AuthNavigation from '../components/layouts/AuthNavigation';
import VuoViewer from '../components/global/VuoViewer';

import { compose } from 'redux';
import { Redirect, withRouter } from 'react-router-dom';
import { graphql } from 'react-apollo';
import { getVuoDocument } from '../store/gql/queries';
import { withTranslation } from 'react-i18next';

import { getUserToken } from '../helpers';

class PathViewer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			pathId: this.props.match.params.pathId,
			docId: this.props.match.params.documentId,
		};
	}
	componentDidUpdate() {
		if (this.props.match.params.documentId !== this.state.docId) {
			this.setState({
				docId: this.props.match.params.documentId
			})
		}
	}
	render() {
		if (!this.props.data.loading && !getUserToken()) {
			return <Redirect to="/error" />
		}

		const { loading, error, viewer } = this.props.data;
		const { t } = this.props;

		if (loading) return <div className="loading">{t('loading')}</div>
		if (error || !viewer || !viewer.paths || viewer.paths.edges.length < 0 || !viewer.paths.edges[0].node.steps || viewer.paths.edges[0].node.steps.edges.length < 0) return <Redirect to="/error" />

		const { docId } = this.state;

		let sIdx = -1;

		for (let i = 0; i <= this.props.data.viewer.paths.edges[0].node.steps.edges.length; i++) {
			const step = this.props.data.viewer.paths.edges[0].node.steps.edges[i].node;
			for (let y = 0; y <= step.contents.edges.length; y++) {
				const content = step.contents.edges[y];
				if (content && content.node && content.node.id === docId) {
					sIdx = i;
					break;
				}
			}
			if (sIdx !== -1) {
				break;
			}
		}
		const stepIndex = sIdx;
		if (stepIndex === -1) return <Redirect to="/error" />

		const documentIndex = this.props.data.viewer.paths.edges[0].node.steps.edges[stepIndex].node.contents && this.props.data.viewer.paths.edges[0].node.steps.edges[stepIndex].node.contents.edges.findIndex(doc => doc.node.id === docId);
		const documentId = this.props.data.viewer.paths.edges[0].node.steps.edges[stepIndex].node.contents.edges[documentIndex] && this.props.data.viewer.paths.edges[0].node.steps.edges[stepIndex].node.contents.edges[documentIndex].node.documentId;

		const contentLength = this.props.data.viewer.paths.edges[0].node.steps.edges[stepIndex].node.contents.edges.length;
		const prevIndex = documentIndex > 0 ? documentIndex - 1 : -1;
		const nextIndex = documentIndex < contentLength - 1 ? documentIndex + 1 : -1;
		const prevDocumentId = prevIndex !== -1 ? this.props.data.viewer.paths.edges[0].node.steps.edges[stepIndex].node.contents && this.props.data.viewer.paths.edges[0].node.steps.edges[stepIndex].node.contents.edges[prevIndex].node.id : null;
		const nextDocumentId = nextIndex !== -1 ? this.props.data.viewer.paths.edges[0].node.steps.edges[stepIndex].node.contents && this.props.data.viewer.paths.edges[0].node.steps.edges[stepIndex].node.contents.edges[nextIndex].node.id : null;

		const prevUrl = prevIndex !== -1 ? `/view/${this.props.match.params.pathId}/${stepIndex}/${prevDocumentId}` : null;
		const nextUrl = nextIndex !== -1 ? `/view/${this.props.match.params.pathId}/${stepIndex}/${nextDocumentId}` : null;
		const backUrl = `/path/${this.props.match.params.pathId}`;
		return (
			<Wrapper>
				<AuthNavigation {...this.props} title={t('myProfile')} style={{ background: '#ffffff' }} />
				<div id="maincontent" className="section">
					<div className="app-container">
						<div className="grid-x grid-margin-x">
							<div className="cell">
								<div className="grid-x grid-margin-x align-center">
									<div className="cell small-12 medium-8">
										<div className="vuo-back-button">
											<a
												href={backUrl}
												className="button btn-back"
											>
												<span className="fa fa-list" /> {t('backToContents')}
											</a>
											<div className="vuo-navigation">
												{prevUrl ? (
													<a href={prevUrl} className="button btn-back btn-prev">
														<span className="fa fa-angle-up" /> {t('previous')}
													</a>
												) : (
														<button className="button btn-back btn-prev disabled" disabled>
															<span className="fa fa-angle-up" /> {t('previous')}
														</button>
													)}
												{nextUrl ? (
													<a href={nextUrl} className="button btn-back btn-next">
														{t('next')} <span className="fa fa-angle-down" />
													</a>
												) : (
														<button className="button btn-back btn-next disabled" disabled>
															{t('next')} <span className="fa fa-angle-down" />
														</button>
													)}
											</div>
										</div>
										<VuoViewer documentId={documentId} />
										<div className="vuo-back-button">
											<a
												href={backUrl}
												className="button btn-back"
											>
												<span className="fa fa-list" /> {t('backToContents')}
											</a>
											<div className="vuo-navigation">
												{prevUrl ? (
													<a href={prevUrl} className="button btn-back btn-prev">
														<span className="fa fa-angle-up" /> {t('previous')}
													</a>
												) : (
														<button className="button btn-back btn-prev disabled" disabled>
															<span className="fa fa-angle-up" /> {t('previous')}
														</button>
													)}
												{nextUrl ? (
													<a href={nextUrl} className="button btn-back btn-next">
														{t('next')} <span className="fa fa-angle-down" />
													</a>
												) : (
														<button className="button btn-back btn-next disabled" disabled>
															{t('next')} <span className="fa fa-angle-down" />
														</button>
													)}
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


export default compose(
	withRouter,
	graphql(getVuoDocument, {
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
