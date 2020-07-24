import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

import lifelearnLogo from '../../assets/images/lifelearn_logo.png';

import UserInfo from './UserInfo';

class Navigation extends Component {
	render() {
		const { username, openPath, togglePath, openNotification, toggleNotification, openMessage, toggleMessage } = this.props;
		// console.log('asdf', this.props)
		return (
			<div className="navigation-wrapper" style={this.props.style}>
				<div className="navigation">
					<div className="flex-container align-between align-middle">
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
								{this.props.referer &&
									<li>
										<Link to={`/${this.props.referer}`}>
											<span className="referer">{this.props.refTitle}</span>
										</Link>
									</li>
								}
								<li className="current">
									<span>{this.props.title}</span>
								</li>
							</ul>
						</div>

						<div className="right-navigation">
							{username && (
								<div className="header-menu">
									<ul>
										<li>
											<button className={`btn-menu-path btn-menu ${openPath ? 'active' : ''}`} onClick={() => togglePath(!openPath)}><span className="fa fa-book"></span></button>
										</li>
										<li>
											<button className={`btn-menu-message btn-menu ${openMessage ? 'active' : ''}`} onClick={() => toggleMessage(!openMessage)}><span className="fa fa-comments"></span></button>
										</li>
										<li>
											<button className={`btn-menu-notification btn-menu ${openNotification ? 'active' : ''}`} onClick={() => toggleNotification(!openNotification)}><span className="fa fa-bell"></span></button>
										</li>
										{/* <li>
										<button className={`btn-menu-more btn-menu ${openMore ? 'active' : ''}`} onClick={() => toggleMore(!openMore)}><span className="fa fa-caret-down"></span></button>
									</li> */}
										{/* <li><button className="btn-menu"><span className="fa fa-bell"></span></button></li> */}
									</ul>
								</div>
							)}
							<UserInfo />
						</div>
					</div>
				</div>


			</div>
		);
	}
}

const mapStateToProps = state => {
	return {
		username: state.auth.username,
		openPath: state.app.openPath,
		openMessage: state.app.openMessage,
		openNotification: state.app.openNotification,
	};
};

const mapDispatchToProps = dispatch => {
	return {
		togglePath: open => dispatch(actions.togglePath(open)),
		toggleMessage: open => dispatch(actions.toggleMessage(open)),
		toggleNotification: open => dispatch(actions.toggleNotification(open))
	};
};


export default connect(mapStateToProps, mapDispatchToProps)(Navigation);
