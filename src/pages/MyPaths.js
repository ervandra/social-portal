import React, { Component } from 'react';
import Wrapper from '../components/layouts/wrapper';

import Navigation from '../components/layouts/Navigation';

import { compose } from 'redux';
import { connect } from 'react-redux';
import { Redirect, withRouter, Link } from 'react-router-dom';
import { graphql } from 'react-apollo';
import { getMyPaths } from '../store/gql/queries';
import { withTranslation } from 'react-i18next';

class PathViewer extends Component {
	render() {
		if (!this.props.data.loading && !this.props.isAuthenticated) {
			return <Redirect to="/error" />;
		}

		const { loading, error } = this.props.data;
		const { t } = this.props;

		if (loading) return <div className="loading">{t('loading')}</div>;
		if (error) return <Redirect to="/error" />;

		const { paths } = this.props.data.viewer;

		return (
			<Wrapper>
				<Navigation title={t('myProfile')} style={{ background: '#ffffff' }} />
				<div id="maincontent" className="section">
					<div className="app-container">
						<div className="grid-x grid-margin-x">
							<div className="cell">
								<div className="grid-x grid-margin-x">
									<div className="cell small-12">
										<h3>{t('myPaths')}</h3>
										<div className="my-available-paths">
											{paths.edges.map(path => {
												return (
													<div className="path-item" key={path.node.id}>
														<Link to={`/view/${path.node.id}`}>
															<img src={path.node.bgimage} alt={path.node.title} />
															<span className="path-item-title">{path.node.title}</span>
														</Link>
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
	graphql(getMyPaths),
	withTranslation()
)(PathViewer);
