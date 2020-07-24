import React, { Component } from 'react';
import Axios from 'axios';
import Moment from 'react-moment';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { decodeTrend, decodeStickyChat, cleanChats } from '../../helpers';
import Modal from 'react-modal';
import emptyChatImage from '../../assets/images/error-page.png';
import { withTranslation } from 'react-i18next';

class PathTimeline extends Component {
	state = {
		isLoading: false,
		isLoadingSticky: false,
		isLoadMore: false,
		isAuthenticating: false,
		isSubmit: false,
		timelineData: [],
		stickyData: [],
		userProfile: null,
		statusText: '',
		mastodonAuthToken: this.props.mastodonAuthToken || null,
		isError: false,
		isErrorSticky: false,
		isRefetch: false,
		maxId: null,
		minId: null,
		limit: 20,
		refreshTime: 5000,
		shouldRefresh: false,
		intervalObj: null,
		refreshCount: 0,
		hasLoadMore: false,
		hasSticky: false,
		promptText: '',
	}
	componentWillMount() {
		const { mastodonUser } = this.props;
		this.setState({
			userProfile: mastodonUser
		})
	}
	componentDidMount() {
		this.openDiscussion();
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
		} else {
			this.setState({
				isError: true
			})
		}
	}

	getChats = async () => {
		const { mastodonAuthToken, limit } = this.state;
		if (mastodonAuthToken) {
			const { trendId } = this.props;
			this.setState({ isLoading: true, timelineData: [] });
			const mastodonURL = process.env.REACT_APP_MASTODON_SERVER || 'https://mastodon.lifelearnplatform.com/';
			await Axios.get(`${mastodonURL}api/v1/timelines/tag/${decodeTrend(trendId)}?limit=${limit}`, {
				headers: {
					Authorization: `Bearer ${mastodonAuthToken}`
				}
			})
				.then(response => {
					if (response.data.length > 0) {
						this.setState({
							timelineData: [...response.data.reverse()],
							maxId: response.data[0].id,
							minId: response.data[response.data.length - 1].id,
							hasLoadMore: true,
						})
						// this.getStickyChat();
					}
				})
				.catch(err => console.log(err))
				.finally(() => {
					this.setState({
						isLoading: false
					})
					setTimeout(() => {
						if (this.timeline) {
							this.timeline.scrollTop = 999999;
						}
					}, 0);
				})
		} else {
			this.setState({
				isError: true
			})
		}
	}

	getMoreChats = async () => {
		const { mastodonAuthToken, limit, maxId, isLoadMore } = this.state;
		if (mastodonAuthToken && !isLoadMore) {
			const { trendId } = this.props;
			this.setState({ isLoadMore: true });
			const mastodonURL = process.env.REACT_APP_MASTODON_SERVER || 'https://mastodon.lifelearnplatform.com/';
			await Axios.get(`${mastodonURL}api/v1/timelines/tag/${decodeTrend(trendId)}?limit=${limit}&max_id=${maxId}`, {
				headers: {
					Authorization: `Bearer ${mastodonAuthToken}`
				}
			})
				.then(response => {
					if (response.data.length > 0) {
						const { timelineData } = this.state;
						const newData = response.data.reverse();
						this.setState({
							timelineData: [...newData, ...timelineData],
							maxId: response.data[0].id,
							hasLoadMore: true,
						})
						// this.getMoreChats();
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
					setTimeout(() => {
						if (this.timeline) {
							this.timeline.scrollTop = 0;
						}
					}, 0);
				})
		} else {
			this.setState({
				isError: true,
			})
		}
	}

	getRefreshChats = async () => {
		const { mastodonAuthToken, limit, minId, refreshCount } = this.state;
		if (mastodonAuthToken && refreshCount < 200) {
			const { trendId } = this.props;
			this.setState({ isRefetch: true });
			setTimeout(() => {
				if (this.timeline) {
					this.timeline.scrollTop = 999999;
				}
			}, 200);
			const mastodonURL = process.env.REACT_APP_MASTODON_SERVER || 'https://mastodon.lifelearnplatform.com/';
			await Axios.get(`${mastodonURL}api/v1/timelines/tag/${decodeTrend(trendId)}?limit=${limit}&min_id=${minId}`, {
				headers: {
					Authorization: `Bearer ${mastodonAuthToken}`
				}
			})
				.then(response => {
					const { timelineData } = this.state;
					if (response.data.length > 0) {
						const newData = response.data.reverse();
						this.setState({
							timelineData: [...timelineData, ...newData],
							minId: response.data[response.data.length - 1].id,
						})
					}
					const newRefreshCount = refreshCount + 1;
					this.setState({
						refreshCount: newRefreshCount
					})
				})
				.catch(err => console.log(err))
				.finally(() => {
					setTimeout(() => {
						this.setState({
							isRefetch: false
						})
					}, 1000);
					setTimeout(() => {
						this.timeline.scrollTop = 999999;
					}, 100);
				})
		} else {
			this.setState({
				isError: true
			})
		}
	}


	openDiscussion = () => {
		const { mastodonAuthToken } = this.props || null;
		if (mastodonAuthToken) {
			this.getChats();

			// this.getRefreshChats();
		}
		// this.getChats();
		// if(mastodonAuthToken){
		// 	setTimeout(() => {
		// 		this.timeline.scrollTop = 999999;
		// 	}, 100);
		// }
		// this.getChats();
	}

	// componentDidUpdate = (prevProps) => {
	// 	if (prevProps.mastodonAuthToken !== this.props.mastodonAuthToken) {
	// 		this.setState({
	// 			mastodonAuthToken: this.props.mastodonAuthToken,
	// 			mastodonUser: this.props.mastodonUser
	// 		})
	// 		if (!prevProps.mastodonAuthToken && this.props.mastodonAuthToken) {
	// 			this.openDiscussion();
	// 		}
	// 	}
	// }

	sendMessage = async (messageId, userId) => {
		await this.getReplyProfile(userId)
		this.setState({
			replyToId: messageId
		})
	}

	submitFormMessage = evt => {
		evt.preventDefault();
		const form = evt.target;
		const { mastodonAuthToken } = this.state;
		if (mastodonAuthToken) {
			const { trendId } = this.props;
			const { timelineData } = this.state;
			const { isPrompt } = this.props;
			const status = isPrompt ? form.querySelector('#mst-prompt-content').value + ` #${decodeTrend(trendId)}` : form.querySelector('#mst-message-content').value + ` #${decodeTrend(trendId)}`;
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

					const newTimelineData = [...timelineData, ...new Array(response.data)];
					this.setState({
						timelineData: newTimelineData,
						statusText: '',
						promptText: '',
						minId: response.data.id
					})
					if (isPrompt) {
						const { closePrompt } = this.props;
						closePrompt(true, form.querySelector('#mst-prompt-content').value);
					}

				})
				.catch(err => console.log(err))
				.finally(() => {
					this.setState({
						isSubmit: false
					})
					// this.closeModalMessage();
					// window.scrollTo(0, 0)
					setTimeout(() => {
						if (this.timeline) {
							this.timeline.scrollTop = 999999;
						}
					}, 200);
				})
		} else {
			this.setState({
				isError: true
			})
		}
	}

	componentDidUpdate(prevProps) {
		const { trendId } = this.props;
		if (prevProps.trendId !== trendId) {
			this.getChats();
		}
	}

	closeModal = () => {
		const { isPrompt } = this.props;
		if (isPrompt) {
			const { closePrompt } = this.props;
			closePrompt(false, null);
		}
	}

	render() {
		// const { timelineData, isLoading, isModalOpen, isModalMessageOpen, userProfile, isSubmit, statusText, replyProfile, replyText } = this.state;
		const { timelineData, hasLoadMore, isLoadMore, userProfile, isSubmit, statusText, mastodonAuthToken, stickyData, isModalOpen, promptText } = this.state;
		const { trendId, trend = null, close, standalone = true, isPrompt } = this.props;

		const { t } = this.props;
		// if (isLoading) return <p className="loading">Loading..</p>
		if (!trend) return null
		return (
			<div className="step-discussion-container">

				{!mastodonAuthToken ? (
					<div className="mastodon-container mastodon-step-chat">

						<div className="mst-chat-header text-center">
							<h4>{t('stepDiscussion')}</h4>
							<hr />
						</div>
						<p>{t('chatError')}</p>
					</div>
				) : (
						<div className="mastodon-container mastodon-step-chat">

							<div className="mst-chat-header text-center">
								<h4>Trend Discussion: {trend.trend_name}</h4>
								<div className="mst-chat-header-with-tools">
									{hasLoadMore && (
										<div className="mst-load-more">
											{isLoadMore ? (
												<a href="#load" className={`button tiny is-loading disabled`}><span className="fa fa-circle-o-notch fa-spin"></span></a>
											) : (
													<a href="#load" onClick={this.getMoreChats} className={`button tiny`}>{t('chatLoadMore')}</a>
												)}
										</div>
									)}
								</div>
								<hr />
							</div>

							{(timelineData.length < 1) && (
								<div className="mst-timeline empty text-center" ref={(el) => (this.timeline = el)}>
									<p><img src={emptyChatImage} alt="no active discussion" /></p>
									<h6>{t('noActiveChats')}</h6>
								</div>
							)}

							{timelineData.length > 0 && (
								<div>
									<div className="mst-timeline" ref={(el) => (this.timeline = el)}>
										{timelineData.map(chat => {
											const mastodonURL = process.env.REACT_APP_MASTODON_SERVER || 'https://mastodon.lifelearnplatform.com/';
											const cleanPathChat = chat.content.replace(`<a href="${mastodonURL}tags/${decodeTrend(trendId)}" class="mention hashtag" rel="tag">#<span>${decodeTrend(trendId)}</span></a>`, '')
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
														{/* <div className="mst-footer">
												<div className="mst-reply mst-tools">
													{userProfile && userProfile.id !== chat.account.id && (
															<a className="button tiny clear secondary">
																<span className="fa fa-send" />
																<span className="text">Send Message</span>
															</a>
														)}

												</div>
											</div> */}
													</div>
												</div>
											)
										}
										)}
									</div>
								</div>
							)}
						</div>
					)}

				<hr />

				{mastodonAuthToken && (
					<form className="mst-fixed-chat" onSubmit={this.submitFormMessage}>
						<div className="mst-chat-room">
							<div className="mst-room-body">
								<textarea name="mst-message-content" id="mst-message-content" placeholder="Discuss about this current Trend" onChange={(e) => this.setState({ statusText: e.target.value })} value={statusText} disabled={isSubmit ? 'disabled' : false}>{statusText !== '' && statusText}</textarea>
								{/* <p>Your chat will be visible to other participants on this path.</p> */}
							</div>
							{userProfile && (
								<div className="mst-room-user-profile">
									<div className="mst-user-avatar">
										<img src="https://gql.lifelearnplatform.com/static/ll_anonymous_user.png" alt={userProfile.display_name} width="32" height="32" />
									</div>
									<div className="mst-user-info">
										<h5>{userProfile.display_name}</h5>
									</div>
									<button type="submit" className="button small" disabled={isSubmit || statusText.length < 5 ? 'disabled' : false}>
										<span className="fa fa-send" />
										<span className="text">{t('send')}</span>
									</button>
								</div>
							)}
						</div>
					</form>
				)}
				{!standalone && (
					<button className="close-reveal" onClick={() => close()}>&times;</button>
				)}
				<Modal
					isOpen={isPrompt}
					contentLabel="Send Message"
					ariaHideApp={false}
					onRequestClose={this.closeModal}
					className="reveal small chat-modal"
				>
					<form onSubmit={this.submitFormMessage}>
						<div className="mst-chat-room">
							<div className="mst-room-header">
								<h3>Attention.</h3>
								<p>You need to submit discussion about why you're updating this trend position.</p>
								<p>We will review your submission and update the trend accordingly.</p>
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
								<textarea name="mst-message-content" id="mst-prompt-content" placeholder="I change this trend because.." onChange={(e) => this.setState({ promptText: e.target.value })} value={promptText} disabled={isSubmit ? 'disabled' : false}>{promptText !== '' && promptText}</textarea>
								<div className="mst-chat-tooltip">
									<p>&nbsp;</p>
									<div className="mst-text-counter">
										<p>{promptText.length} / 400</p>
									</div>
								</div>
							</div>
							<div className="mst-room-footer">
								<button type="submit" className="button small" disabled={isSubmit || promptText.length < 2 ? 'disabled' : false}>
									<span className="fa fa-send" />
									<span className="text">{t('send')}</span>
								</button>
							</div>
						</div>
					</form>
					<button className="close-reveal" onClick={this.closeModal}>&times;</button>
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
