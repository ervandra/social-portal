import React, { Component } from 'react';
import Axios from 'axios';
import Moment from 'react-moment';
import Modal from 'react-modal';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { decodePath, cleanChats } from '../../helpers';
import { withTranslation } from 'react-i18next';

class PathTimeline extends Component {
	state = {
		isLoading: false,
		isLoadMore: false,
		isAuthenticating: false,
		isSubmit: false,
		timelineData: [],
		isModalOpen: false,
		isModalMessageOpen: false,
		userProfile: null,
		statusText: '',
		replyProfile: null,
		replyText: '',
		replyToId: null,
		localPathId: null,
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
	}
	componentWillMount() {
		const { mastodonUser = {} } = this.props;
		this.setState({
			userProfile: mastodonUser
		})
	}
	componentDidMount() {
		this.getChats();
	}

	getMastodonProfile = async () => {
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
		else {
			this.setState({
				isError: true
			})
		}
	}

	getReplyProfile = async (userId) => {
		const { mastodonAuthToken } = this.state;
		if (mastodonAuthToken) {
			this.setState({ isAuthenticating: true });
			const mastodonURL = process.env.REACT_APP_MASTODON_SERVER || 'https://mastodon.lifelearnplatform.com/';
			await Axios.get(`${mastodonURL}api/v1/accounts/${userId}`, {
				headers: {
					Authorization: `Bearer ${mastodonAuthToken}`
				}
			})
				.then(response => {
					this.setState({
						replyProfile: response.data
					})
				})
				.catch(err => console.log(err))
				.finally(() => {
					this.setState({
						isAuthenticating: false
					})
				})
		}
		else {
			this.setState({
				isError: true
			})
		}
	}

	getChats = async () => {
		const { pathId } = this.props;
		const { mastodonAuthToken, limit, refreshTime } = this.state;

		this.setState({ isLoading: true, timelineData: [], refreshCount: 0, maxId: null, minId: null });
		const mastodonURL = process.env.REACT_APP_MASTODON_SERVER || 'https://mastodon.lifelearnplatform.com/';
		await Axios.get(`${mastodonURL}api/v1/timelines/tag/${decodePath(pathId)}?limit=${limit}`, {
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
					// this.getMoreChats();
				}
			})
			.catch(err => console.log(err))
			.finally(() => {
				this.setState({
					isLoading: false
				})
			})
	}

	getMoreChats = async () => {
		const { pathId } = this.props;
		const { mastodonAuthToken, limit, maxId, isLoadMore } = this.state;

		if (mastodonAuthToken && !isLoadMore) {
			this.setState({
				isLoadMore: true,
			})
			const mastodonURL = process.env.REACT_APP_MASTODON_SERVER || 'https://mastodon.lifelearnplatform.com/';
			await Axios.get(`${mastodonURL}api/v1/timelines/tag/${decodePath(pathId)}?limit=${limit}&max_id=${maxId}`, {
				headers: {
					Authorization: `Bearer ${mastodonAuthToken}`
				}
			})
				.then(response => {
					if (response.data.length > 0) {
						const { timelineData } = this.state;
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
						isLoadMore: false,
					})
				})
		}
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
			isModalMessageOpen: false,
			userProfile: null,
			statusText: '',
			replyProfile: null,
			replyText: '',
			replyToId: null,
			localPathId: null,
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
			hasNewChat: false,
			isDialogOpen: false,
		})
	}


	getRefreshChats = async () => {
		const { pathId } = this.props;
		const { mastodonAuthToken, limit, minId, refreshCount } = this.state;
		if (mastodonAuthToken && refreshCount < 200) {
			this.setState({ isRefetch: true });
			const mastodonURL = process.env.REACT_APP_MASTODON_SERVER || 'https://mastodon.lifelearnplatform.com/';
			await Axios.get(`${mastodonURL}api/v1/timelines/tag/${decodePath(pathId)}?limit=${limit}&min_id=${minId}`, {
				headers: {
					Authorization: `Bearer ${mastodonAuthToken}`
				}
			})
				.then(response => {
					const { timelineData } = this.state;
					if (response.data.length > 0) {
						this.setState({
							timelineData: [...response.data, ...timelineData],
							minId: response.data[0].id,
							hasNewChat: true,
						})
					} else {
						this.setState({
							hasNewChat: false
						})
					}
					const newRefreshCount = refreshCount + 1;
					this.setState({
						refreshCount: newRefreshCount,
					})
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



	openModalMessage = () => {
		this.setState({
			isModalMessageOpen: true
		})
	}

	closeModalMessage = () => {
		this.setState({
			isModalMessageOpen: false
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
		const { pathId } = this.props;
		const { timelineData, mastodonAuthToken } = this.state;

		if (mastodonAuthToken) {
			const status = form.querySelector('#mst-message-content').value + ` #${decodePath(pathId)}`;
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
						minId: response.data.id,
					})
				})
				.catch(err => console.log(err))
				.finally(() => {
					this.setState({
						isSubmit: false
					})
					this.closeModalMessage();
					// window.scrollTo(0,0)
				})
		}
		else {
			this.setState({
				isError: true
			})
		}
	}

	submitReplyForm = evt => {
		evt.preventDefault();
		const form = evt.target;
		const { mastodonAuthToken } = this.state;

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
					// const newTimelineData = [...new Array(response.data), ...timelineData];
					this.setState({
						// timelineData: newTimelineData,
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

	componentDidUpdate(prevProps) {
		const { pathId } = this.props;
		if (prevProps.pathId !== pathId) {
			this.getChats();
		}
	}

	render() {
		const { timelineData, isLoading, hasLoadMore, hasNewChat, isModalOpen, isDialogOpen, isLoadMore, isModalMessageOpen, userProfile, isSubmit, statusText, replyProfile, replyText, mastodonAuthToken } = this.state;
		const { pathId, t } = this.props;

		if (isLoading) return <p className="loading">{t('loading')}</p>

		return (
			<div className="mastodon-container">

				{!mastodonAuthToken && (
					<p>{t('chatError')}</p>
				)}

				{timelineData.length < 1 && (
					<div className="mst-timeline empty">
						<p>{t('noActiveChats')}</p>
					</div>
				)}

				{mastodonAuthToken && (
					<button type="button" className="button secondary" onClick={this.openModalMessage}>{t('writeDiscussionNow')}</button>
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
								const mastodonURL = process.env.REACT_APP_MASTODON_SERVER || 'https://mastodon.lifelearnplatform.com/';
								const cleanPathChat = chat.content.replace(`<a href="${mastodonURL}tags/${decodePath(pathId)}" class="mention hashtag" rel="tag">#<span>${decodePath(pathId)}</span></a>`, '')
								const cleanChat = cleanChats(cleanPathChat, chat.tags, chat.mentions);
								return (
									<div className="mst-chat" key={chat.id}>
										<div className="mst-header">
											<div className="mst-avatar">
												<img src="https://gql.lifelearnplatform.com/static/ll_anonymous_user.png" alt={chat.account.display_name} width="48" height="48" />
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
											<div className="mst-reply mst-tools">
												{chat.account.id !== userProfile.id && (
													<button className="button tiny clear secondary" onClick={() => this.sendMessage(chat.id, chat.account.id)}>
														<span className="fa fa-send" />
														<span className="text">{t('chatSendMessage')}</span>
													</button>
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
					isOpen={isDialogOpen}
					contentLabel="Message sent"
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

				<Modal
					isOpen={isModalMessageOpen}
					contentLabel="Send Message"
					ariaHideApp={false}
					onRequestClose={() => this.closeModalMessage()}
					className="reveal small chat-modal"
				>
					<form onSubmit={this.submitFormMessage}>
						<div className="mst-chat-room">
							<div className="mst-room-header">
								<h3>{t('chatSendPathChat')}</h3>
							</div>
							<hr />
							{userProfile && (
								<div className="mst-room-user-profile">
									<div className="mst-user-avatar">
										<img src="https://gql.lifelearnplatform.com/static/ll_anonymous_user.png" alt={userProfile.display_name} width="32" height="32" />
									</div>
									<div className="mst-user-info">
										<h5>{userProfile.display_name}</h5>
										<h6>@{userProfile.username}</h6>
									</div>
								</div>
							)}
							<div className="mst-room-body">
								<textarea name="mst-message-content" maxLength="400" id="mst-message-content" placeholder={t('chatPlaceholderText')} onChange={(e) => this.setState({ statusText: e.target.value })} value={statusText} disabled={isSubmit ? 'disabled' : false}>{statusText !== '' && statusText}</textarea>
								<div className="mst-chat-tooltip">
									<p>&nbsp;</p>
									<div className="mst-text-counter">
										<p>{statusText.length} / 400</p>
									</div>
								</div>
							</div>
							<div className="mst-room-footer">
								<button type="submit" className="button small" disabled={isSubmit || statusText.length < 2 ? 'disabled' : false}>
									<span className="fa fa-send" />
									<span className="text">{t('send')}</span>
								</button>
							</div>
						</div>
					</form>
					<button className="close-reveal" onClick={() => this.closeModalMessage()}>&times;</button>
				</Modal>

				<Modal
					isOpen={isModalOpen}
					contentLabel="Send Message"
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
									<textarea name="mst-chat-content" maxLength="400" id="mst-chat-content" placeholder={`Write some text..`} onChange={(e) => this.setState({ replyText: e.target.value })} value={replyText} disabled={isSubmit ? 'disabled' : false}>{replyText !== '' && replyText}</textarea>
									<div className="mst-chat-tooltip">
										<p>{t('chatVisibilityInfo')}</p>
										<div className="mst-text-counter">
											<p>{replyText.length} / 400</p>
										</div>
									</div>
								</div>
								<div className="mst-room-footer">
									{replyText && replyText.length > 1 ? (
										<button type="submit" className="button small">
											<span className="fa fa-send" />
											<span className="text">{t('send')}</span>
										</button>
									) : (
											<button type="button" className="button disabled small" disabled>
												<span className="fa fa-send" />
												<span className="text">{t('send')}</span>
											</button>
										)}
								</div>
							</div>
						) : (
								<p className="loading">{t('chatLoading')}</p>
							)}
					</form>
					<button className="close-reveal" onClick={() => this.closeModal()}>&times;</button>
				</Modal>
			</div>
		)
	}
}


const mapStateToProps = state => {
	return {
		mastodonAuthToken: state.auth.mastodonAuthToken,
		mastodonUser: state.auth.mastodonUser,
	};
};

export default compose(
	connect(mapStateToProps, null),
	withTranslation()
)(PathTimeline);
