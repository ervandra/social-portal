import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';
import * as actions from '../../store/actions/index';

class UserInfo extends Component {
	render() {
		const { t } = this.props;
		const { openMore, toggleMore } = this.props;
		return (
			<div className="user-cp">
				{this.props.username &&
					<div className={`user-profile-menu btn-menu-more btn-menu ${openMore ? 'active' : ''}`} onClick={() => toggleMore(!openMore)}>
						<span className="user-info">

							<span className="user-avatar">
								{this.props.avatar ?
									<img src={this.props.avatar} alt={this.props.firstName} />
									:
									<span className="fa fa-user" />
								}
							</span>
							<span className="user-name">{this.props.firstName !== "" ? this.props.firstName : this.props.username}</span>
							<span className="fa fa-caret-down"></span>

						</span>
						{/* <div className="user-menu">
							<ul>
								<li><Link to="/profile">{t('myProfile')}</Link></li>
								<li><Link to="/logout">{t('signOut')}</Link></li>
							</ul>
						</div> */}
					</div>
				}
				{!this.props.username &&
					<div className="user-login">
						<a href={`${process.env.REACT_APP_OAUTH_SIGNIN_URL}&state=${encodeURIComponent(this.props.location.pathname)}`}>{t('signIn')}</a>
					</div>
				}
			</div>
		);
	}
}

const mapStateToProps = state => {
	return {
		username: state.auth.username,
		avatar: state.auth.avatar,
		firstName: state.auth.firstName,
		lastName: state.auth.lastName,
		openMore: state.app.openMore,
	}
}

const mapDispatchToProps = dispatch => {
	return {
		toggleMore: open => dispatch(actions.toggleMore(open)),
	};
};

export default compose(
	withRouter,
	connect(mapStateToProps, mapDispatchToProps),
	withTranslation(),
)(UserInfo);
