import React, { Component } from 'react'
import { withTranslation } from 'react-i18next';

class Participant extends Component {
	state = {
		pData: [...this.props.data.edges]
	}

	searchUser = ev => {
		const e = ev.target;
		const s = e.value;
		const { data } = this.props;
		let newData = [];
		if (data && data.edges.length > 0) {
			newData = data.edges.filter(e => e.node.username.indexOf(s) !== -1 || e.node.firstName.indexOf(s) !== -1 || e.node.lastName.indexOf(s) !== -1);
		}

		this.setState({
			pData: newData
		})

	}

	render() {
		const { pData } = this.state;
		const { selectUser, selectedUser, t } = this.props;
		const participants = pData;
		return (
			<div className="enterprise-box">
				<React.Fragment>
					<div className="search-participants">
						<input type="text" placeholder={t('searchUsers')} onChange={this.searchUser} />
					</div>
					<ul>
						{participants && participants.length > 0 && participants.map((p, index) => {
							const { id, profilePictureUrl, firstName, lastName, username } = p.node;
							return (
								<li key={id + index} className={selectedUser === id ? 'active' : ''}>
									<a onClick={() => selectUser(id)}>
										<span className="user-avatar"><img src={profilePictureUrl} alt="user avatar" width="20" height="20" /></span>
										{firstName !== '' || lastName !== '' ? (
											<span className="user-name">{firstName} {lastName}</span>
										) : (
												<span className="user-name">{username}</span>
											)}

									</a>
								</li>
							)
						})}
						{/* {selectedPathIndex !== null && combinedPath[selectedPathIndex].participants.map((user, index) => (
											<li key={user.id + index} className={selectedUser === user.id ? 'active' : ''}>
												<a onClick={() => this.selectUser(user.id)}>
													<span className="user-avatar"><img src={user.profilePictureUrl} alt="user avatar" width="20" height="20" /></span>
													{user.firstName !== '' || user.lastName !== '' ? (
														<span className="user-name">{user.firstName} {user.lastName}</span>
													) : (
															<span className="user-name">{user.username}</span>
														)}

												</a>
											</li>
										))} */}
					</ul>
				</React.Fragment>
			</div>
		)
	}
};

export default withTranslation()(Participant);
