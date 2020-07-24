import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Modal from 'react-modal';
import { withTranslation } from 'react-i18next';

class VuoViewer extends Component {
	state = {
		isLoading: true,
		isFailToInit: false,
		enrolError: false,
	};

	manualEnrol = async (token) => {
		const query = JSON.stringify({
			query: `mutation enrollement {
				enroll(input:{ clientMutationId: "enroll_from_viewer", sharecode: "${token}" }){
					clientMutationId,
					status,
					pathEdge{
						node{
							id,
							title,
							isViewerEnrolled
						}
					}
				}
			}
			`
		});
		const gqlToken = localStorage.getItem('token');
		const response = await fetch(`https://gql.lifelearnplatform.com/api/2`, {
			headers: {
				'content-type': 'application/json',
				authorization: gqlToken ? `Bearer ${gqlToken}` : null
			},
			method: 'POST',
			body: query,
		});

		const responseJson = await response.json();
		if (responseJson && responseJson.data && responseJson.data.enroll && responseJson.data.enroll.pathEdge && responseJson.data.enroll.pathEdge.node && responseJson.data.enroll.pathEdge.node.isViewerEnrolled) {
			this.props.history.push(`/path/${responseJson.data.enroll.pathEdge.node.id}`)
		} else {
			this.setState({
				enrolError: true,
			})
		}
		return responseJson.data;
	};

	componentDidMount() {
		const { isFailToInit } = this.state;
		if (this.props.documentAuthToken && this.props.documentAuthToken !== '' && !isFailToInit) {
			window.VuoViewer.clear();
			window.VuoViewer.init({
				assetsPath: '',
				authToken: this.props.documentAuthToken,
				documentHash: this.props.documentId,
				domain: 'https://vuo1.lifelearnplatform.com',
				elementId: 'vuo-document',
				language: 'en',
			});
		} else {
			this.setState({
				isFailToInit: true
			})
		}
		if (typeof window !== undefined) {
			if (!window.enrolling) window.enrolling = this.manualEnrol;
		}
	}
	componentDidUpdate() {
		const { isFailToInit } = this.state;
		if (this.props.documentAuthToken && this.props.documentAuthToken !== '' && isFailToInit) {
			window.VuoViewer.init({
				assetsPath: '',
				authToken: this.props.documentAuthToken,
				documentHash: this.props.documentId,
				domain: 'https://vuo1.lifelearnplatform.com',
				elementId: 'vuo-document',
				language: 'en',
			});
			this.setState({
				isFailToInit: false
			})
		}
	}

	componentWillUnmount() {
		if (this.props.documentAuthToken && this.props.documentAuthToken !== '') {
			window.VuoViewer.clear();
		}
		if (typeof window !== undefined) {
			if (window.enrolling) window.enrolling = null;
		}
		this.setState({
			enrolError: false,
		})
	}

	closeEnrollErrorModal = () => {
		this.setState({
			enrolError: false,
		})
	}

	render() {
		const { t } = this.props;
		const { enrolError } = this.state;
		return (
			<div className="vuo-document-viewer">
				<div id="vuo-document" className="vuo-viewer-container" />
				<Modal
					isOpen={enrolError}
					contentLabel="Error enrolling"
					ariaHideApp={false}
					className="small reveal"
					onRequestClose={this.closeEnrollErrorModal}
				>
					<div className="enrollment-container">
						<div className="flex-container align-middle">
							<h3><span className="fa fa-warning"></span></h3>
							<p>{t('enrollError')}</p>
						</div>
					</div>
					<button className="close-reveal" onClick={this.closeEnrollErrorModal}>&times;</button>
				</Modal>
			</div>
		);
	}
}

const mapStateToProps = state => {
	return {
		documentAuthToken: state.auth.documentAuthToken,
	};
};

export default compose(
	withRouter,
	withTranslation(),
	connect(
		mapStateToProps,
		null
	)
)(VuoViewer);
