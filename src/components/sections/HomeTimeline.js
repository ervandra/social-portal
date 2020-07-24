import React, { Component } from 'react';
import Axios from 'axios';
import Moment from 'react-moment';
// import Modal from 'react-modal';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { cleanAllChats } from '../../helpers';
import { withTranslation } from 'react-i18next';

class HomeTimeline extends Component {
	state = {
		isLoading: false,
		isLoadMore: false,
		isAuthenticating: false,
		isSubmit: false,
		timelineData: [],
		isModalOpen: false,
		userProfile: null,
		statusText: '',
		mastodonAuthToken: this.props.mastodonAuthToken || null,
		isError: false,
		isRefetch: false,
		maxId: null,
		minId: null,
		limit: 20,
		refreshTime: 5000,
		shouldRefresh: false,
		intervalObj: null,
		refreshCount: 0,
	}
	componentWillMount() {
		// this.getMastodonProfile();
		this.setState({
			userProfile: this.props.mastodonUser || null,
		});
	}
	componentDidMount() {
		this.getChats();
	}

	componentWillUnmount() {
		const { intervalObj } = this.state;
		clearInterval(intervalObj);
		this.setState({
			isLoading: false,
			isLoadMore: false,
			isAuthenticating: false,
			isSubmit: false,
			timelineData: [],
			isModalOpen: false,
			userProfile: null,
			statusText: '',
			mastodonAuthToken: this.props.mastodonAuthToken || null,
			isError: false,
			isRefetch: false,
			maxId: null,
			minId: null,
			limit: 20,
			refreshTime: 5000,
			shouldRefresh: false,
			intervalObj: null,
			refreshCount: 0,
			hasLoadMore: false,
			hasNewChat: false,
		})
	}

	getMastodonProfile = async () => {
		// const { userProfile } = this.state;
		const { mastodonAuthToken } = this.state;
		if (mastodonAuthToken) {
			this.setState({ isAuthenticating: true });
			const mastodonURL = process.env.REACT_APP_MASTODON_SERVER || 'https://mastodon.lifelearnplatform.com/';
			await Axios.get(`${mastodonURL}api/v1/accounts/verify_credentials`, {
				headers: {
					Authorization: `Bearer ${mastodonAuthToken}`
				}
			})
				.then(response => {
					this.setState({
						userProfile: response.data
					})
				})
				.catch(err => console.log(err))
				.finally(() => {
					this.setState({
						isAuthenticating: false
					})
				})
		}
	}

	getChats = async () => {
		const { mastodonAuthToken, limit, refreshTime } = this.state;
		if (mastodonAuthToken) {
			this.setState({ isLoading: true, timelineData: [], refreshCount: 0, maxId: null, minId: null });
			const mastodonURL = process.env.REACT_APP_MASTODON_SERVER || 'https://mastodon.lifelearnplatform.com/';
			await Axios.get(`${mastodonURL}api/v1/timelines/home?limit=${limit}`, {
				headers: {
					Authorization: `Bearer ${mastodonAuthToken}`
				}
			})
				.then(response => {
					if (response.data.length > 0) {
						this.setState({
							timelineData: response.data,
							maxId: response.data[response.data.length - 1].id,
							minId: response.data[0].id,
							hasLoadMore: true,
						})
						const iv = setInterval(this.getRefreshChats, refreshTime);
						this.setState({
							intervalObj: iv,
						})
					}
				})
				.catch(err => console.log(err))
				.finally(() => {
					this.setState({
						isLoading: false
					})
				})
		}
	}

	getMoreChats = async () => {
		const { timelineData, mastodonAuthToken, limit, maxId, isLoadMore } = this.state;
		if (mastodonAuthToken && !isLoadMore) {
			this.setState({
				isLoadMore: true,
			})
			const mastodonURL = process.env.REACT_APP_MASTODON_SERVER || 'https://mastodon.lifelearnplatform.com/';
			await Axios.get(`${mastodonURL}api/v1/timelines/home?limit=${limit}&max_id=${maxId}`, {
				headers: {
					Authorization: `Bearer ${mastodonAuthToken}`
				}
			})
				.then(response => {
					if (response.data.length > 0) {
						this.setState({
							timelineData: [...timelineData, ...response.data],
							maxId: response.data[response.data.length - 1].id,
							hasLoadMore: true,
						})
						setTimeout(() => {
							const timeline = this.timeline;
							timeline.scrollTop = 999999;
						}, 0)
					} else {
						this.setState({
							hasLoadMore: false
						})
					}
				})
				.catch(err => console.log(err))
				.finally(() => {
					this.setState({
						isLoadMore: false
					})
				})
		}
	}

	getRefreshChats = async () => {
		const { timelineData, mastodonAuthToken, limit, minId, refreshCount } = this.state;
		if (mastodonAuthToken && refreshCount < 200) {
			this.setState({ isRefetch: true });
			const mastodonURL = process.env.REACT_APP_MASTODON_SERVER || 'https://mastodon.lifelearnplatform.com/';
			await Axios.get(`${mastodonURL}api/v1/timelines/home?limit=${limit}&min_id=${minId}`, {
				headers: {
					Authorization: `Bearer ${mastodonAuthToken}`
				}
			})
				.then(response => {
					if (response.data.length > 0) {
						this.setState({
							timelineData: [...response.data, ...timelineData],
							minId: response.data[0].id,
							hasNewChat: true,
						})
					} else {
						this.setState({
							hasNewChat: false,
						})
					}
				})
				.catch(err => console.log(err))
				.finally(() => {
					setTimeout(() => {
						this.setState({
							isRefetch: false
						})
					}, 1000)
				})
		} else {
			const { intervalObj } = this.state;
			clearInterval(intervalObj);
			this.setState({
				intervalObj: null
			})

		}
	}

	closeChatNotif = () => {
		this.setState({
			hasNewChat: false,
		})
	}

	openModal = () => {
		this.setState({
			isModalOpen: true
		})
	}

	closeModal = () => {
		this.setState({
			isModalOpen: false,
			replyProfile: null
		})
	}

	sendMessage = async (messageId, userId) => {
		await this.getReplyProfile(userId)
		this.setState({
			isModalOpen: true,
			replyToId: messageId
		})
	}

	submitFormMessage = evt => {
		evt.preventDefault();
		const form = evt.target;
		const { timelineData, mastodonAuthToken } = this.state;
		if (mastodonAuthToken) {
			const status = form.querySelector('#mst-message-content').value;
			const data = {
				status: status
			}
			this.setState({
				isSubmit: true
			})
			const mastodonURL = process.env.REACT_APP_MASTODON_SERVER || 'https://mastodon.lifelearnplatform.com/';
			const postStatusUrl = `${mastodonURL}api/v1/statuses`;
			Axios.post(postStatusUrl, data, {
				headers: {
					Authorization: `Bearer ${mastodonAuthToken}`
				}
			})
				.then(response => {
					const newTimelineData = [...new Array(response.data), ...timelineData];
					this.setState({
						timelineData: newTimelineData,
						statusText: '',
						minId: response.data.id
					})
				})
				.catch(err => console.log(err))
				.finally(() => {
					this.setState({
						isSubmit: false
					})
					this.closeModal();
				})
		} else {
			this.setState({
				isError: true
			})
		}
	}

	render() {
		const { timelineData, isLoading, isLoadMore, hasLoadMore, hasNewChat, userProfile, isSubmit, statusText, mastodonAuthToken } = this.state;
		const { t } = this.props;

		if (isLoading) return <p className="loading">{t('chatInitializing')}</p>

		if (!mastodonAuthToken) return <p>{t('chatError')}</p>

		return (
			<div className="mastodon-container mastodon-home-timeline">

				<form onSubmit={this.submitFormMessage}>
					<div className="mst-chat-room">
						{userProfile && (
							<div className="mst-room-user-profile">
								<div className="mst-user-avatar">
									<img src="https://gql.lifelearnplatform.com/static/ll_anonymous_user.png" width="32" height="32" alt={userProfile.display_name} />
								</div>
								<div className="mst-user-info">
									<h5>{userProfile.display_name}</h5>
									<h6>@{userProfile.username}</h6>
								</div>
							</div>
						)}
						<div className="mst-room-body">
							<textarea name="mst-message-content" id="mst-message-content" placeholder={t('chatUpdateStatus')} onChange={(e) => this.setState({ statusText: e.target.value })} value={statusText} disabled={isSubmit ? 'disabled' : false}>{statusText !== '' && statusText}</textarea>
							{/* <p>Your chat will be visible to other participants on this path.</p> */}
						</div>
						<div className="mst-room-footer">
							<button type="submit" className="button small" disabled={isSubmit || statusText.length < 5 ? 'disabled' : false}>
								<span className="fa fa-send" />
								<span className="text">{t('send')}</span>
							</button>
						</div>
					</div>
				</form>

				<hr />

				{timelineData.length < 1 && (
					<div className="mst-timeline empty">
						<p>{t('chatEmptyTimeline')}</p>
					</div>
				)}


				{timelineData.length > 0 && (
					<div className="mst-timeline-container">
						{hasNewChat && (
							<div className="mst-has-new-chat">
								<p>{t('chatNewMessage')}</p>
							</div>
						)}
						<div className="mst-timeline" ref={e => (this.timeline = e)}>
							{timelineData.map(chat => {
								const cleanPathChat = chat.content;
								const cleanChat = cleanAllChats(cleanPathChat, chat.tags, chat.mentions);
								return (
									<div className="mst-chat" key={chat.id}>
										<div className="mst-header">
											<div className="mst-avatar">
												<img src="https://gql.lifelearnplatform.com/static/ll_anonymous_user.png" width="32" height="32" alt={chat.account.display_name} />
											</div>
											<div className="mst-user">
												<h5>{chat.account.display_name}</h5>
												<h6>@{chat.account.username}</h6>
											</div>
											<div className="mst-meta"><Moment fromNow>{chat.created_at}</Moment></div>
										</div>
										<div className="mst-content">
											<div dangerouslySetInnerHTML={{ __html: cleanChat }} />
										</div>
										<div className="mst-footer">
											{/* <div className="mst-reply mst-tools">
											{userProfile && userProfile.id !== chat.account.id && (
												<a className="button tiny clear secondary" onClick={() => this.sendMessage(chat.id, chat.account.id)}>
												<span className="fa fa-send" />
												<span className="text">Send Message</span>
											</a>
											)}

										</div> */}
										</div>
									</div>
								)
							}
							)}
						</div>
						{hasLoadMore && (
							<div className="mst-load-more">
								{isLoadMore ? (
									<a className={`button small is-loading disabled`}><span className="fa fa-circle-o-notch fa-spin"></span></a>
								) : (
										<a onClick={this.getMoreChats} className={`button small`}>{t('chatLoadMore')}</a>
									)}
							</div>
						)}
					</div>
				)}

			</div>
		)
	}
}

const mapStateToProps = state => {
	return {
		mastodonAuthToken: state.auth.mastodonAuthToken,
		mastodonUser: state.auth.mastodonUser
	};
};

export default compose(
	connect(mapStateToProps, null),
	withTranslation()
)(HomeTimeline);
