import React, { Component } from 'react';
import Axios from 'axios';
import Moment from 'react-moment';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { decodePathStep, decodeStickyChat, cleanChats } from '../../helpers';

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

	componentWillUnmount() {
		this.setState({
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
		})
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

	getStickyChat = async () => {
		const { mastodonAuthToken, limit } = this.state;
		if (mastodonAuthToken) {
			const { pathId, step } = this.props;
			this.setState({ isLoadingSticky: true, stickyData: [] });
			const mastodonURL = process.env.REACT_APP_MASTODON_SERVER || 'https://mastodon.lifelearnplatform.com/';
			await Axios.get(`${mastodonURL}api/v1/timelines/tag/${decodeStickyChat(pathId, step.id)}?limit=${limit}`, {
				headers: {
					Authorization: `Bearer ${mastodonAuthToken}`
				}
			})
				.then(response => {
					if (response.data.length > 0) {
						this.setState({
							stickyData: [...response.data],
						})
						// this.getMoreChats();
					}
				})
				.catch(err => console.log(err))
				.finally(() => {
					this.setState({
						isLoadingSticky: false
					})
				})
		} else {
			this.setState({
				isErrorSticky: true
			})
		}
	}

	getChats = async () => {
		const { mastodonAuthToken, limit } = this.state;
		if (mastodonAuthToken) {
			const { pathId, step } = this.props;
			this.setState({ isLoading: true, timelineData: [] });
			const mastodonURL = process.env.REACT_APP_MASTODON_SERVER || 'https://mastodon.lifelearnplatform.com/';
			await Axios.get(`${mastodonURL}api/v1/timelines/tag/${decodePathStep(pathId, step.id)}?limit=${limit}`, {
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
							hasSticky: true,
						})
						this.getStickyChat();
					} else {
						this.setState({
							hasSticky: false
						});
						this.getStickyChat();
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
			const { pathId, step } = this.props;
			this.setState({ isLoadMore: true });
			const mastodonURL = process.env.REACT_APP_MASTODON_SERVER || 'https://mastodon.lifelearnplatform.com/';
			await Axios.get(`${mastodonURL}api/v1/timelines/tag/${decodePathStep(pathId, step.id)}?limit=${limit}&max_id=${maxId}`, {
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
			const { pathId, step } = this.props;
			this.setState({ isRefetch: true });
			setTimeout(() => {
				if (this.timeline) {
					this.timeline.scrollTop = 999999;
				}
			}, 200);
			const mastodonURL = process.env.REACT_APP_MASTODON_SERVER || 'https://mastodon.lifelearnplatform.com/';
			await Axios.get(`${mastodonURL}api/v1/timelines/tag/${decodePathStep(pathId, step.id)}?limit=${limit}&min_id=${minId}`, {
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

	componentDidUpdate = (prevProps) => {
		if (prevProps.mastodonAuthToken !== this.props.mastodonAuthToken) {
			this.setState({
				mastodonAuthToken: this.props.mastodonAuthToken,
				mastodonUser: this.props.mastodonUser
			})
			if (!prevProps.mastodonAuthToken && this.props.mastodonAuthToken) {
				this.openDiscussion();
			}
		}
	}

	sendMessage = async (messageId, userId) => {
		await this.getReplyProfile(userId)
		this.setState({
			replyToId: messageId
		})
	}

	submitFormMessage = evt => {
		evt.preventDefault();
		const form = evt.target;
		const { mastodonAuthToken, stickyData } = this.state;
		if (mastodonAuthToken) {
			const { pathId, step } = this.props;
			const { timelineData } = this.state;
			const status = timelineData.length > 0 || stickyData.length > 0 ? form.querySelector('#mst-message-content').value + ` #${decodePathStep(pathId, step.id)}` : form.querySelector('#mst-message-content').value + ` #${decodeStickyChat(pathId, step.id)}`;
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
					if (timelineData.length > 0 || stickyData.length > 0) {
						const newTimelineData = [...timelineData, ...new Array(response.data)];
						this.setState({
							timelineData: newTimelineData,
							statusText: '',
							minId: response.data.id
						})
					} else {
						this.setState({
							stickyData: new Array(response.data),
							statusText: '',
							hasSticky: true,
						})
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
		const { pathId, step } = this.props;
		if (prevProps.pathId !== pathId || prevProps.step.id !== step.id) {
			this.getChats();
		}
	}

	render() {
		// const { timelineData, isLoading, isModalOpen, isModalMessageOpen, userProfile, isSubmit, statusText, replyProfile, replyText } = this.state;
		const { timelineData, hasLoadMore, isLoadMore, userProfile, isSubmit, statusText, mastodonAuthToken, stickyData } = this.state;
		const { pathId, step, close, standalone = false } = this.props;
		const { t } = this.props;
		// if (isLoading) return <p className="loading">Loading..</p>
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
								<div className="mst-chat-header-with-tools">
									<h4>{step.title}</h4>
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

							{(stickyData.length > 0) ? (
								<div className="mst-sticky">
									{stickyData.map((sticky, index) => {
										const mastodonURL = process.env.REACT_APP_MASTODON_SERVER || 'https://mastodon.lifelearnplatform.com/';
										const cleanPathChat = sticky.content.replace(`<a href="${mastodonURL}tags/${decodeStickyChat(pathId, step.id)}" class="mention hashtag" rel="tag">#<span>${decodeStickyChat(pathId, step.id)}</span></a>`, '');
										const cleanChat = cleanChats(cleanPathChat, sticky.tags, sticky.mentions);
										return (
											<div className="sticky-chat-item" key={sticky.id + index}>
												<div className="mst-user">
													<h5>{sticky.account.display_name}</h5>
													{/* <h6>@{sticky.account.username}</h6> */}
													<div className="mst-meta"><Moment fromNow>{sticky.created_at}</Moment></div>
												</div>
												<div className="sticky-chat-content" dangerouslySetInnerHTML={{ __html: cleanChat }} />
											</div>
										)
									})}
								</div>
							) : (
									null
								)}

							{(timelineData.length < 1 && stickyData.length === 0) && (
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
											const cleanPathChat = chat.content.replace(`<a href="${mastodonURL}tags/${decodePathStep(pathId, step.id)}" class="mention hashtag" rel="tag">#<span>${decodePathStep(pathId, step.id)}</span></a>`, '')
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
								<textarea name="mst-message-content" id="mst-message-content" placeholder={t('iWantToDiscuss')} onChange={(e) => this.setState({ statusText: e.target.value })} value={statusText} disabled={isSubmit ? 'disabled' : false}>{statusText !== '' && statusText}</textarea>
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
