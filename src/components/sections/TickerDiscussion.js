import React, { Component } from 'react';
import Axios from 'axios';
import Moment from 'react-moment';
import Modal from 'react-modal';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { cleanMentionPrivate, decodeTickerChat, cleanChats } from '../../helpers';

import emptyChatImage from '../../assets/images/error-page.png';
import { withTranslation } from 'react-i18next';

class TickerDiscussion extends Component {
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

	getChats = async () => {
		const { mastodonAuthToken, limit } = this.state;
		if (mastodonAuthToken) {
			const { pathId, userId, tickerId, mentorId, mentoredId = null } = this.props;
			const cleanUserId = mentoredId ? mentoredId : userId;
			this.setState({ isLoading: true, timelineData: [] });
			const mastodonURL = process.env.REACT_APP_MASTODON_SERVER || 'https://mastodon.lifelearnplatform.com/';
			await Axios.get(`${mastodonURL}api/v1/timelines/tag/${decodeTickerChat(pathId, cleanUserId, tickerId, mentorId)}?limit=${limit}`, {
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

					} else {
						this.setState({
							hasSticky: false
						});

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
			const { pathId, userId, mentoredId = null, tickerId, mentorId } = this.props;
			const cleanUserId = mentoredId ? mentoredId : userId;
			this.setState({ isLoadMore: true });
			const mastodonURL = process.env.REACT_APP_MASTODON_SERVER || 'https://mastodon.lifelearnplatform.com/';
			await Axios.get(`${mastodonURL}api/v1/timelines/tag/${decodeTickerChat(pathId, cleanUserId, tickerId, mentorId)}?limit=${limit}&max_id=${maxId}`, {
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
			const { pathId, userId, tickerId, mentorId, mentoredId = null } = this.props;
			const cleanUserId = mentoredId ? mentoredId : userId;
			const { timelineData } = this.state;
			const status = `${form.querySelector('#mentor-notes').value} #${decodeTickerChat(pathId, cleanUserId, tickerId, mentorId)}`;
			const data = {
				status: status,
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
						minId: response.data.id
					})
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

	// componentDidUpdate(prevProps) {
	// 	const { pathId, step } = this.props;
	// 	if (prevProps.pathId !== pathId || prevProps.step.id !== step.id) {
	// 		this.getChats();
	// 	}
	// }

	render() {
		// const { timelineData, isLoading, isModalOpen, isModalMessageOpen, userProfile, isSubmit, statusText, replyProfile, replyText } = this.state;
		const { timelineData, hasLoadMore, isLoadMore, statusText } = this.state;
		const { pathId, close, userId, tickerId, mentorId, mentoredId = null } = this.props;
		const { t } = this.props;
		// if (isLoading) return <p className="loading">Loading..</p>
		return (
			<Modal
				isOpen={true}
				contentLabel="Ticker Discussion"
				onRequestClose={close}
				className="reveal reveal-ticker "
				ariaHideApp={false}
			>
				<div className="ticker-modal-container">
					<div className="mst-chat-header text-center">
						<div className="mst-chat-header-with-tools">
							<h4>Ticker Discussion</h4>
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
					</div>
					<hr />
					<form onSubmit={this.submitFormMessage}>
						<div className="entry-ticker">
							<div className="discussion-mentor">

								{timelineData.length < 1 && (
									<div className="mst-timeline empty text-center" ref={(el) => (this.timeline = el)}>
										<p><img src={emptyChatImage} alt="no active discussion" /></p>
										<h6>There is no discussion on this ticker item yet.</h6>
									</div>
								)}

								{timelineData.length > 0 && (
									<div>
										<div className="discussion-messages mst-timeline" ref={(el) => (this.timeline = el)}>
											{timelineData.map((chat, index) => {
												const mastodonURL = process.env.REACT_APP_MASTODON_SERVER || 'https://mastodon.lifelearnplatform.com/';
												const cleanUserId = mentoredId ? mentoredId : userId;
												const cleanPathChat = chat.content.replace(`<a href="${mastodonURL}tags/${decodeTickerChat(pathId, cleanUserId, tickerId, mentorId)}" class="mention hashtag" rel="tag">#<span>${decodeTickerChat(pathId, cleanUserId, tickerId, mentorId)}</span></a>`, '')
												const cleanChat = cleanChats(cleanPathChat, chat.tags, chat.mentions);
												const cleanMentionChat = cleanMentionPrivate(cleanChat, chat.mentions);
												return (
													<div className="msg" key={chat.id + index}>
														<div className="msg-header">
															<h5>{chat.account.display_name}</h5>
															<h6><Moment fromNow>{chat.created_at}</Moment></h6>
														</div>
														<p dangerouslySetInnerHTML={{ __html: cleanMentionChat }} />
													</div>
												)
											})}

										</div>
									</div>
								)}
								<textarea name="mentor-notes" id="mentor-notes" cols="30" rows="2" placeholder="Write some notes to your mentor.." value={statusText} onChange={(e) => this.setState({ statusText: e.target.value })}></textarea>
							</div>

							<div className="discussion-action">
								<button type="submit" className="button">{t('submit')}</button>
							</div>
						</div>
					</form>
				</div>
				<button className="close-reveal" onClick={close}>&times;</button>
			</Modal>

		)
	}
}

const mapStateToProps = state => {
	return {
		userId: state.auth.userId,
		mastodonAuthToken: state.auth.mastodonAuthToken,
		mastodonUser: state.auth.mastodonUser,
	};
};

export default compose(
	connect(mapStateToProps, null),
	withTranslation()
)(TickerDiscussion);
