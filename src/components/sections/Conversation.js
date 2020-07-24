import React, { Component } from 'react';
import Axios from 'axios';
import Moment from 'react-moment';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import { cleanAllChats, cleanMentionPrivate } from '../../helpers';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';

class Conversation extends Component {
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
		replyText: '',
		replyProfile: null,
		isDialogOpen: false,
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
			replyText: '',
			replyProfile: null,
			isDialogOpen: false,
		})
	}

	getChats = async () => {
		const { mastodonAuthToken, limit, refreshTime } = this.state;
		if (mastodonAuthToken) {
			this.setState({ isLoading: true, timelineData: [], refreshCount: 0, maxId: null, minId: null });
			const mastodonURL = process.env.REACT_APP_MASTODON_SERVER || 'https://mastodon.lifelearnplatform.com/';
			await Axios.get(`${mastodonURL}api/v1/conversations?limit=${limit}`, {
				headers: {
					Authorization: `Bearer ${mastodonAuthToken}`
				}
			})
				.then(response => {
					if (response.data.length > 0) {
						this.setState({
							timelineData: response.data,
							maxId: response.data[response.data.length - 1].last_status.id,
							minId: response.data[0].last_status.id,
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
			await Axios.get(`${mastodonURL}api/v1/conversations?limit=${limit}&max_id=${maxId}`, {
				headers: {
					Authorization: `Bearer ${mastodonAuthToken}`
				}
			})
				.then(response => {
					if (response.data.length > 0) {
						this.setState({
							timelineData: [...timelineData, ...response.data],
							maxId: response.data[response.data.length - 1].last_status.id,
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
			await Axios.get(`${mastodonURL}api/v1/conversations?min_id=${minId}&limit=${limit}`, {
				headers: {
					Authorization: `Bearer ${mastodonAuthToken}`
				}
			})
				.then(response => {
					if (response.data.length > 0) {
						this.setState({
							timelineData: [...response.data, ...timelineData],
							minId: response.data[0].last_status.id,
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

	openDialog = () => {
		this.setState({
			isDialogOpen: true
		})
	}

	closeDialog = () => {
		this.setState({
			isDialogOpen: false,
		})
	}

	sendMessage = async (messageId, user) => {
		// await this.getReplyProfile(userId)
		this.setState({
			isModalOpen: true,
			replyToId: messageId,
			replyProfile: user,
		})
	}

	submitReplyForm = evt => {
		evt.preventDefault();
		const form = evt.target;
		const { mastodonAuthToken, timelineData } = this.state;

		if (mastodonAuthToken) {
			const status = `@${form.querySelector('#mst-reply-username').value} ${form.querySelector('#mst-chat-content').value}`;
			const data = {
				status: status,
				visibility: 'direct'
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
					const newResponse = {
						last_status: response.data
					};
					const newTimelineData = [...new Array(newResponse), ...timelineData];
					this.setState({
						timelineData: newTimelineData,
						minId: response.data.id,
						replyText: ''
					})
				})
				.catch(err => console.log(err))
				.finally(() => {
					this.setState({
						isSubmit: false,
						replyToId: null
					})
					this.closeModal();
					this.openDialog();
				})
		}
		else {
			this.setState({
				isError: true
			})
		}
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
		const { timelineData, isLoading, isLoadMore, hasLoadMore, hasNewChat, userProfile, isSubmit, replyText, replyProfile, mastodonAuthToken, isModalOpen, isDialogOpen } = this.state;
		const { t } = this.props;

		if (isLoading) return <p className="loading">{t('chatInitializing')}</p>

		if (!mastodonAuthToken) return <p>{t('chatError')}</p>

		return (
			<div className="mastodon-container mastodon-home-timeline">

				{/* <h4>Conversations / Direct Messages</h4> */}

				{/* <form onSubmit={this.submitFormMessage}>
					<div className="mst-chat-room">
						{userProfile && (
							<div className="mst-room-user-profile">
								<div className="mst-user-avatar">
									<img src="https://gql.lifelearnplatform.com/static/ll_anonymous_user.png" width="32" height="32" alt={userProfile.display_name}/>
								</div>
								<div className="mst-user-info">
									<h5>{userProfile.display_name}</h5>
									<h6>@{userProfile.username}</h6>
								</div>
							</div>
						)}
						<div className="mst-room-body">
							<textarea name="mst-message-content" id="mst-message-content" placeholder="Update a post here.." onChange={(e) => this.setState({ statusText: e.target.value })} value={statusText} disabled={isSubmit ? 'disabled' : false}>{statusText !== '' && statusText}</textarea>
							<p>Your chat will be visible to other participants on this path.</p>
						</div>
						<div className="mst-room-footer">
							<button type="submit" className="button small" disabled={isSubmit || statusText.length < 5 ? 'disabled' : false}>
								<span className="fa fa-send" />
								<span className="text">Send</span>
							</button>
						</div>
					</div>
				</form> */}

				{/* <hr/> */}

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
							{timelineData.map(chats => {
								const chat = chats.last_status;
								const cleanPathChat = chat.content;
								const cleanChat = cleanAllChats(cleanPathChat, chat.tags, chat.mentions);
								const cleanMentionChat = cleanMentionPrivate(cleanChat, chat.mentions);
								return (
									<div className="mst-chat" key={chat.id}>
										<div className="mst-header">
											<div className="mst-avatar">
												<img src="https://gql.lifelearnplatform.com/static/ll_anonymous_user.png" width="32" height="32" alt={chat.account.display_name} />
											</div>
											<div className="mst-user">
												{chat.mentions.length > 0 && userProfile.id !== chat.mentions[0].id ? (
													<h5><small style={{ margin: '0 0 8px', display: 'inline-block' }}>{chat.account.display_name}</small> <br /><span className="fa fa-hand-o-right"></span> {chat.mentions[0].username}</h5>
												) : (
														<h5>{chat.account.display_name}</h5>
													)}
												<h6>@{chat.account.username}</h6>
											</div>
											<div className="mst-meta"><Moment fromNow>{chat.created_at}</Moment></div>
										</div>
										<div className="mst-content">
											<div dangerouslySetInnerHTML={{ __html: cleanMentionChat }} />
										</div>
										<div className="mst-footer">
											<div className="mst-reply mst-tools">
												{userProfile && chat.account.id !== userProfile.id && (
													<a href="#load" className="button tiny clear secondary" onClick={() => this.sendMessage(chats.id, chats.accounts[0])}>
														<span className="fa fa-send" />
														<span className="text">{t('chatSendMessage')}</span>
													</a>
												)}
											</div>
										</div>
									</div>
								)
							}
							)}
						</div>
						{hasLoadMore && (
							<div className="mst-load-more">
								{isLoadMore ? (
									<a href="#load" className={`button small is-loading disabled`}><span className="fa fa-circle-o-notch fa-spin"></span></a>
								) : (
										<a href="#load" onClick={this.getMoreChats} className={`button small`}>{t('chatLoadMore')}</a>
									)}
							</div>
						)}
					</div>
				)}
				<Modal
					isOpen={isModalOpen}
					contentLabel={t('chatSendMessage')}
					ariaHideApp={false}
					onRequestClose={() => this.closeModal()}
					className="reveal small chat-modal"
				>
					<form onSubmit={this.submitReplyForm}>
						{replyProfile ? (
							<div className="mst-chat-room">
								<div className="mst-room-header">
									<h3><span className="fa fa-warning"></span> {t('chatSendPrivateMessageTo')} {replyProfile && replyProfile.display_name}</h3>
								</div>
								<div className="mst-room-body">
									<input type="hidden" value={replyProfile.username} id="mst-reply-username" />
									<textarea name="mst-chat-content" maxLength="400" id="mst-chat-content" placeholder={t('chatPlaceholderText')} onChange={(e) => this.setState({ replyText: e.target.value })} value={replyText} disabled={isSubmit ? 'disabled' : false}>{replyText !== '' && replyText}</textarea>
									<div className="mst-chat-tooltip">
										<p>{t('chatVisibilityInfo')}</p>
										<div className="mst-text-counter">
											<p>{replyText.length} / 400</p>
										</div>
									</div>
								</div>
								{replyText !== '' && replyText.length > 1 ? (
									<div className="mst-room-footer">
										<button type="submit" className="button small">
											<span className="fa fa-send" />
											<span className="text">{t('send')}</span>
										</button>
									</div>
								) : (
										<div className="mst-room-footer">
											<button type="button" disabled className="button small disabled">
												<span className="fa fa-send" />
												<span className="text">{t('send')}</span>
											</button>
										</div>
									)}
							</div>
						) : (
								<p className="loading">{t('chatLoading')}</p>
							)}
					</form>
					<button className="close-reveal" onClick={() => this.closeModal()}>&times;</button>
				</Modal>

				<Modal
					isOpen={isDialogOpen}
					contentLabel={t('chatSent')}
					ariaHideApp={false}
					onRequestClose={() => this.closeDialog()}
					className="reveal small dialog-modal success"
				>
					<div className="text-center">
						<p><span className="fa fa-check-circle"></span>	{t('chatPrivateMessageSent')}</p>
						<button type="button" onClick={this.closeDialog} className="button small success">{t('ok')}</button>
					</div>
					<button className="close-reveal" onClick={() => this.closeDialog()}>&times;</button>
				</Modal>

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
	withTranslation(),
)(Conversation);
