import React, { Component } from 'react';
import Wrapper from '../components/layouts/wrapper';
import Modal from 'react-modal';

import Header from '../components/layouts/Header';
import DynamicNavigation from '../components/layouts/DynamicNavigation';
import PathGrid from '../components/global/PathGrid';
import PathContent from '../components/sections/PathContent';
import DocumentContent from '../components/sections/DocumentContent';
import PathTimeline from '../components/sections/PathTimeline';
import StepTimeline from '../components/sections/StepTimeline';
import Badge from '../components/global/Badge';
import { withTranslation } from 'react-i18next';
import BadgeContainer from '../components/global/BadgeContainer';
import SkillBar from '../components/global/SkillBar';
import ParticipantSkills from '../components/global/ParticipantSkills';
import Moment from 'react-moment';
import TickerDiscussion from '../components/sections/TickerDiscussion';
import Drawer from '../components/global/Drawer';

import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter, Redirect, Link } from 'react-router-dom';
import { graphql, Query, Mutation } from 'react-apollo';
import { getAuthPath, getPathParticipants, getSkillProgress, checkOrgUser, GET_TICKERS, INPUT_TICKER } from '../store/gql/queries';

import { SECURE_ORGANISATIONS, ROOT_ROUTES } from '../constant';
import SecurePrompt from '../components/sections/SecurePrompt';
import { getUserToken, decodePathStep } from '../helpers';

import Loader from '../components/global/Loader';

class PublicPath extends Component {
	state = {
		organisation: this.props.match.params.organisationId,
		skillId: this.props.match.params.skillId,
		pathId: this.props.match.params.pathId,
		activeTab: 'path',
		showPeopleModal: false,
		peopleIndex: null,
		isScrolled: false,
		isLoadMoreParticipants: false,
		selectedDocument: null,

		newBadges: [],
		newAllAvailableBadges: [],

		activeTab2: 'topics',
		selectedStep: null,
		mainTab: 'contents',

		tickerKeys: [
			{ title: 'weight', unit: 'kg' },
			{ title: 'waist', unit: 'cm' }
		],
		tickerData: [],
		selectedKey: 'weight',
		keyValue: '',
		conversationState: [],
		conversationReady: false,
		tickerId: null,
		openDrawer: false,
		openDiscussion: false,
	};

	componentDidUpdate(prevProps) {
		if (this.props.match.params.pathId !== prevProps.match.params.pathId) {
			this.setState({
				pathId: this.props.match.params.pathId,
				isScrolled: false,
				isImagesLoaded: false,
				newAllAvailableBadges: [],
				activeTab2: 'topics',
				selectedStep: null,
				mainTab: 'contents',
				newBadges: [],
				tickerKeys: [
					{ title: 'weight', unit: 'kg' },
					{ title: 'waist', unit: 'cm' }
				],
				tickerData: [],
				selectedKey: 'weight',
				keyValue: '',
				conversationState: [],
				conversationReady: false,
				openDrawer: false,
				openDiscussion: false,
			})
		}
		const { data } = this.props || null;
		const { conversationReady } = this.state;
		if (data && !data.loading && !conversationReady) {
			// check if mastodonTags is available on the data
			const mastodonTags = data.mastodonTags || [];
			if (mastodonTags.length > 0) {
				try {
					const { localStorage } = window;
					if (localStorage) {
						const localTags = localStorage.getItem('lastConversations');
						const storageMyOpenedDiscussion = JSON.parse(localStorage.getItem('myOpenedDiscussion'))
						if (!storageMyOpenedDiscussion) {
							const newArr = []
							localStorage.setItem('myOpenedDiscussion', JSON.stringify(newArr))
						}
						if (!localTags) {
							let localTagsData = [];
							for (let t = 0; t < mastodonTags.length; t++) {
								const d = {
									name: mastodonTags[t].name,
									read: false
								}
								localTagsData.push(d);
							}
							localStorage.setItem('lastConversations', JSON.stringify(localTagsData));
							const now = new Date();
							localStorage.setItem('conversationExpire', new Date(now.setDate(now.getDate() + 1)));
						} else {
							let parsedTags = JSON.parse(localTags);
							if (parsedTags.length !== mastodonTags.length) {
								const newTags = mastodonTags.filter(nt => parsedTags.findIndex(pt => pt.name === nt.name) === -1);
								let newTagsData = [];
								if (newTags.length > 0) {
									for (let td = 0; td < newTags.length; td++) {
										const newTag = newTags[td].name;
										const pushData = {
											name: newTag,
											read: false,
										}
										newTagsData.push(pushData);
									}
									const newParsedData = [...parsedTags, ...newTagsData];
									localStorage.setItem('lastConversations', JSON.stringify(newParsedData));
								} else {
									let newParsedTags = parsedTags;
									const expire = localStorage.getItem('conversationExpire');
									if (expire) {
										const now = new Date();
										const expireDate = new Date(expire);
										if (expireDate.getTime() <= now.getTime()) {
											for (let t2 = 0; t2 < mastodonTags.length; t2++) {
												const tag = mastodonTags[t2].name;
												const lcIdx = newParsedTags.findIndex(lctag => lctag.name === tag);
												if (lcIdx !== -1) {
													newParsedTags[lcIdx].read = false;
												}
											}
											const now = new Date();
											const myOpenedDiscussion = []
											localStorage.setItem('myOpenedDiscussion', JSON.stringify(myOpenedDiscussion))
											localStorage.removeItem('lastConversations')
											localStorage.setItem('conversationExpire', new Date(now.setDate(now.getDate() + 1)));
										}
									}
									localStorage.setItem('lastConversations', JSON.stringify(newParsedTags));
								}
							}
						}
					}
				} catch (err) {
					console.log('failed to load updated localStorage');
				}
				if (!conversationReady) {
					this.setState({
						conversationReady: true
					})
				}
			}

		}
	};

	updateBadges = data => {
		this.setState({
			newBadges: data,
		})
	}

	updateAvailableBadges = data => {
		this.setState({
			newAllAvailableBadges: data,
		})
	}

	selectDocument = (newStepIndex, newContentIndex, ev) => {
		ev.preventDefault();
		const { selectedDocument } = this.state;
		setTimeout(() => {
			if (selectedDocument) {
				const { stepIndex, contentIndex } = selectedDocument;
				if (stepIndex !== newStepIndex || contentIndex !== newContentIndex) {
					this.setState({
						selectedDocument: {
							stepIndex: newStepIndex,
							contentIndex: newContentIndex
						}
					})
				}
			} else {
				this.setState({
					selectedDocument: {
						stepIndex: newStepIndex,
						contentIndex: newContentIndex
					}
				})
			}
		}, 300);
		const docId = `#content-${newStepIndex}-${newContentIndex}`;
		const el = document.querySelector(docId);
		if (el) {
			el.scrollIntoView();
		}
	}

	selectContent = (stepIndex, ev) => {
		ev.preventDefault();
		const docId = `#step-${stepIndex}`;
		const el = document.querySelector(docId);
		if (el) {
			el.scrollIntoView();
			const { openDrawer } = this.state;
			setTimeout(() => {
				this.handleDrawer(!openDrawer);
			}, 500);
		}
	}

	handleStepScroll = () => {
		// const { isScrolled } = this.state;
		// if (!isScrolled) {
		// 	const { data } = this.props;
		// 	const { loading, viewer } = data;
		// 	if (!loading && viewer && viewer.paths.edges.length > 0) {
		// 		const findIndex = viewer.paths.edges[0].node.steps.edges.findIndex(step => step.node.completed !== true);
		// 		const stepViewer = document.getElementById(`viewer-step-${findIndex}`);
		// 		const pathcontent = document.getElementsByClassName('path-content');
		// 		if (stepViewer) {
		// 			this.setState({ isScrolled: true })
		// 			setTimeout(() => {
		// 				pathcontent[0].scrollTop = stepViewer.offsetTop;
		// 			}, 0);
		// 		}
		// 	}
		// }
	}

	componentDidMount = () => {
		const { conversationState } = this.state;
		if (conversationState.length === 0) {
			const { localStorage } = window;
			if (localStorage) {
				try {
					const localTags = localStorage.getItem('lastConversations');
					if (localTags) {
						const parsedTags = JSON.parse(localTags);
						this.setState({
							conversationState: parsedTags
						})
					}
				} catch (err) {
					console.log('failed to load localStorage');
				}
			}
		}
	}

	componentWillUnmount() {
		this.setState({ isScrolled: false });
	}

	handleTabsChanges = tab => {
		this.setState({
			activeTab: tab,
		});
	};

	handleTabs2Changes = tab => {
		this.setState({
			activeTab2: tab,
			selectedStep: null,
		});
	};

	handleOpenPeopleModal = (id, e) => {
		e.preventDefault();
		this.setState({
			showPeopleModal: true,
			peopleIndex: id
		});
	}

	handleClosePeopleModal = () => {
		this.setState({
			showPeopleModal: false,
			peopleIndex: null
		});
	};

	handleOpenDiscussion = (step, hashtag) => {
		const { selectedStep } = this.state;
		try {
			const { localStorage } = window;
			if (localStorage) {
				const expire = localStorage.getItem('conversationExpire');
				if (expire) {
					const now = new Date();
					const expireDate = new Date(expire);
					if (expireDate.getTime() <= now.getTime()) {
						const now = new Date();
						const myOpenedDiscussion = [hashtag]
						localStorage.setItem('myOpenedDiscussion', JSON.stringify(myOpenedDiscussion))
						localStorage.setItem('conversationExpire', new Date(now.setDate(now.getDate() + 1)));
					}
				}
				const storageMyOpenedDiscussion = JSON.parse(localStorage.getItem('myOpenedDiscussion'))
				if (storageMyOpenedDiscussion) {
					const isContain = storageMyOpenedDiscussion.some(arr => arr === hashtag)
					if (!isContain) {
						const myOpenedDiscussion = [...storageMyOpenedDiscussion, hashtag]
						localStorage.setItem('myOpenedDiscussion', JSON.stringify(myOpenedDiscussion))
					}
				} else {
					const myOpenedDiscussion = [hashtag]
					localStorage.setItem('myOpenedDiscussion', JSON.stringify(myOpenedDiscussion))
				}
			}

		} catch (err) {
			console.log('failed to get local storage')
		}

		if (selectedStep && selectedStep.id === step.id) {
			this.setState({
				selectedStep: null,
				mainTab: 'contents'
			})
		} else {
			this.setState({
				selectedStep: step,
				mainTab: 'discussions'
			})
			const storageLocalTags = JSON.parse(localStorage.getItem('lastConversations'))

			if (storageLocalTags.length > 0) {
				const cvIdx = storageLocalTags.findIndex(t => t.name === hashtag);
				if (cvIdx !== -1) {
					storageLocalTags[cvIdx].read = true;
					try {
						const { localStorage } = window;
						if (localStorage) {
							localStorage.setItem('lastConversations', JSON.stringify(storageLocalTags));
						}
					} catch (err) {
						console.log('failed to save localStorage');
					}
				}
			}
		}
	}

	changeMainTab = tab => {
		this.setState({
			mainTab: tab,
		})
		if (tab === 'discussions') {
			this.setState({
				activeTab2: 'topics'
			})
		}
	}

	closeDiscussion = () => {
		this.setState({
			selectedStep: null,
			mainTab: 'contents',
		})
	}

	initTickerData = data => {
		const { tickerData } = this.state;
		if (tickerData.length !== data.length) {
			this.setState({
				tickerData: data,
			})
		}
	}

	openTickerModal = () => {
		this.setState({
			openTicker: true,
		})
	}

	closeTickerModal2 = () => {
		this.setState({
			openTicker2: false,
		})
	}

	openTickerModal2 = () => {
		this.setState({
			openTicker2: true,
		})
	}

	closeTickerModal = () => {
		this.setState({
			openTicker: false,
		})
	}

	openTickerDiscussionModal = id => {
		this.setState({
			openTickerDiscussion: true,
			tickerId: id
		})
	}

	closeTickerDiscussionModal = () => {
		this.setState({
			openTickerDiscussion: false,
		})
	}

	openTickerDiscussionModal2 = () => {
		this.setState({
			openTickerDiscussion2: true,
		})
	}

	closeTickerDiscussionModal2 = () => {
		this.setState({
			openTickerDiscussion2: false,
		})
	}

	updateTickerData = newData => {
		const { tickerData } = this.state;
		const newTickerData = [...newData, ...tickerData];
		this.setState({
			tickerData: newTickerData,
			openTicker: false,
			selectedKey: 'weight',
			keyValue: '',
		})
	}

	changeTickerKey = (event) => {
		this.setState({
			selectedKey: event.target.value
		})
	}

	changeKeyValue = (event) => {
		const value = event.target.value;
		this.setState({
			keyValue: value
		})
	}

	handleDrawer = open => {
		this.setState({
			openDrawer: open
		})
	}

	handleDiscussion = open => {
		this.setState({
			openDiscussion: open
		})
	}

	render() {
		const { t } = this.props;
		const isSecureOrganisation = SECURE_ORGANISATIONS.findIndex(org => org === this.props.match.params.organisationId);
		if (isSecureOrganisation !== -1 && !getUserToken() && !this.props.data) return <SecurePrompt />;

		const { loading, error, organisations } = this.props.data;

		if (loading) return <Loader active content={t("loading")} indeterminate={true} size="small" />
		if (error || organisations.edges.length < 1 || organisations.edges[0].node.skills.edges.length < 1) return <Redirect to="/error" />;

		const isSPPL = this.state.organisation && this.state.organisation === 'sppl' ? true : false;
		const { mastodonAuthToken } = this.props || null;


		const { selectedDocument, newBadges, newAllAvailableBadges, activeTab2, selectedStep, mainTab } = this.state;

		const { viewer, mastodonTags } = this.props.data || null;
		const hasPath = viewer && viewer.paths.edges.length > 0;

		const lowColor = (hasPath) ? viewer.paths.edges[0].node.lowColor : '#333';
		const highColor = (hasPath) ? viewer.paths.edges[0].node.highColor : '#ccc';
		const maxColor = (hasPath) ? viewer.paths.edges[0].node.maxColor : '#fff';
		const steps = (hasPath) ? viewer.paths.edges[0].node.steps : null;

		// const availableBadges = (viewer && viewer.paths.edges[0].node.availableBadges) ? viewer.paths.edges[0].node.availableBadges.edges : [];

		const availableBadges = viewer && viewer.paths.edges.length > 0 && viewer.paths.edges[0].node.availableBadges && viewer.paths.edges[0].node.availableBadges.edges.length > 0 ? [...viewer.paths.edges[0].node.availableBadges.edges, ...newAllAvailableBadges] : newAllAvailableBadges;

		const tickerEnabled = (hasPath) ? viewer.paths.edges[0].node.tickerEnabled : false;

		const now = new Date();
		const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		const currentDate = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()} - ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

		const { tickerKeys, tickerData } = this.state;
		const mentorMastodonUsername = hasPath ? viewer.paths.edges[0].node.mentorMastodonUsername : null;

		const { isMentor } = this.props;
		const { openDrawer, openDiscussion } = this.state;

		return (
			<Query query={checkOrgUser} variables={{ name: this.props.match.params.organisationId }}>
				{({ data, loading, error }) => {
					if (loading) return <Loader title={t("loading")} size="small" />
					if (error) return <p>{t('error')}</p>
					const { isViewerAMember } = data.organisations.edges[0].node;
					if (!isViewerAMember && isSPPL) return <SecurePrompt isLogin />;
					return (
						<Wrapper>
							{isSPPL && <Header url={ROOT_ROUTES} />}
							<DynamicNavigation {...this.props} style={!isSPPL ? { background: '#ffffff' } : null} />
							<div id="maincontent" className="section">
								<div className="app-container">
									<div className="grid-x grid-margin-x">
										<div className="cell">
											<div className="container-baru">
												<div className={`fluid-container ${openDrawer ? 'widget-active' : ''}`}>

													<div className="fluid-section fluid-full">

														{/* <div className="flex-container align-between align-middle">
															<button className={`button button-fixed button-fixed-left hide-for-mobile ${openDrawer ? 'button-fixed-active' : ''}`} onClick={() => this.handleDrawer(!openDrawer)}><span className="fa fa-bars" /> <span className="text">Menu</span></button>
															<button className={`button button-fixed button-fixed-right hide-for-mobile ${openDiscussion ? 'button-fixed-active' : ''}`} onClick={() => this.handleDiscussion(!openDiscussion)}><span className="fa fa-comments-o" /> <span className="text">Chat</span></button>
														</div> */}

														<div className="content-tengah">

															{(hasPath) && (
																<div className="main-content-tabs">
																	<ul className="main-tabs tabs-center">
																		<li className={mainTab === 'contents' ? 'active' : ''} style={mainTab === 'contents' ? { background: lowColor, color: highColor } : {}} onClick={() => this.changeMainTab('contents')}>{t('contents')}</li>
																		{tickerEnabled && (
																			<li className={mainTab === 'ticker' ? 'active' : ''} style={mainTab === 'ticker' ? { background: lowColor, color: highColor } : {}} onClick={() => this.changeMainTab('ticker')}>{t('ticker')}</li>
																		)}
																		<li className={mainTab === 'discussions' ? 'active' : ''} style={mainTab === 'discussions' ? { background: lowColor, color: highColor } : {}} onClick={() => this.changeMainTab('discussions')}>{t('discussions')}</li>
																	</ul>
																</div>
															)}
															{mainTab === 'discussions' && (
																<div>
																	{selectedStep ? (
																		<StepTimeline pathId={this.props.match.params.pathId} step={selectedStep} lowColor={lowColor} highColor={highColor} maxColor={maxColor} close={this.closeDiscussion} />

																	) : (
																			<div className="select-topics">
																				<div className="box-icon"><span className="fa fa-hand-o-right"></span></div>
																				<p>Select one of the discussion step <strong>topics</strong></p>
																			</div>
																		)}
																</div>
															)}

															{mainTab === 'ticker' && (
																<React.Fragment>
																	<div className="ticker">
																		{isMentor ? (
																			<div className="ticker-dashboard">
																				<h4>Ticker Discussion</h4>
																				<p>{t('newFeatureWarning')}</p>
																			</div>
																		) : (
																				<Query query={GET_TICKERS} variables={{ pathId: this.props.match.params.pathId }} fetchPolicy="network-only"
																					onCompleted={(data) => {
																						if (data) {
																							const dataToPush = data.viewer.tickers.edges;
																							this.initTickerData(dataToPush);
																						}
																					}}
																				>
																					{({ loading, error, data, refetch }) => {
																						if (loading) return <Loader active content={t("loading")} indeterminate={true} size="small" />
																						if (error) return <p>{t('error')}</p>;
																						const { tickerSummary } = data.viewer || null;
																						const weightSummary = tickerSummary && tickerSummary.weight ? tickerSummary.weight.toFixed(2) * -1 : null;
																						const waistSummary = tickerSummary && tickerSummary.waist ? tickerSummary.waist.toFixed(2) * -1 : null;
																						const totalDays = tickerSummary && tickerSummary.totalDays ? tickerSummary.totalDays : '-';

																						if (tickerData.length === 0) return (
																							<div className="ticker-container">
																								<div className="ticker-summary">
																									<div className="ticker-date">
																										<strong>{totalDays}</strong>
																										<small>{totalDays !== 0 ? t('days') : t('day')}</small>
																									</div>
																									<div className="ticker-keys">
																										<div className={`ticker-key ticker-key-weight`}>
																											<strong>{weightSummary ? weightSummary : '-'}</strong>
																											<span className="ticker-unit">kg</span>
																										</div>
																										<div className={`ticker-key ticker-key-waist`}>
																											<strong>{waistSummary ? waistSummary : '-'}</strong>
																											<span className="ticker-unit">cm</span>
																										</div>
																									</div>
																									<div className="ticker-note">{t('greatKeepItUp')}</div>
																								</div>

																								<div className="ticker-progress">
																									<div className="ticker-empty">
																										<div className="ticker-item ticker-empty">
																											{t('pleaseAddFirstProgress')}
																										</div>
																									</div>
																									<Modal
																										isOpen={this.state.openTicker}
																										contentLabel="Ticker Information"
																										onRequestClose={this.closeTickerModal}
																										className="reveal reveal-ticker "
																										ariaHideApp={false}
																									>
																										<div className="ticker-modal-container">
																											<h3>{t('updateYourProgress')}</h3>
																											<hr />
																											<div className="entry-ticker">
																												<Mutation mutation={INPUT_TICKER} onCompleted={(data) => {
																													if (data) {
																														const { tickerInput } = data;
																														const newNode = [{
																															node: tickerInput.tickerNode
																														}]
																														this.updateTickerData(newNode);
																														refetch();
																													}
																												}}>
																													{(tickerInput, { data }) => {
																														if (data) return null;
																														return (
																															<div>
																																<div className="entry-date">
																																	<strong><span className="fa fa-calendar"></span> {currentDate}</strong>
																																</div>

																																<div className="entry-input">
																																	<div className="entry-box">
																																		<label htmlFor="key-weight">
																																			<span className="text">{t('your')}</span>
																																			<select onChange={this.changeTickerKey} value={this.state.selectedKey}>
																																				<option value="weight">{t('weight')}</option>
																																				<option value="waist">{t('waist')}</option>
																																			</select>
																																			<span className="text">:</span>
																																		</label>
																																		<input type="number" name="keyValue" id="key-value" step="any" value={this.state.keyValue} onChange={this.changeKeyValue} className={`ticker-input ${this.state.selectedKey === 'waist' ? 'input-waist' : 'input-weight'}`} />
																																	</div>
																																</div>

																																<div className="entry-action">
																																	<button className="button large success"
																																		type="button"
																																		onClick={async () => {
																																			await tickerInput({ variables: { clientMutationId: this.state.selectedKey, courseId: this.props.match.params.pathId, userId: this.props.userId, title: this.state.selectedKey, value: this.state.keyValue } })
																																		}}
																																	>{t('submit')}</button>
																																</div>

																															</div>
																														)
																													}}
																												</Mutation>

																											</div>
																										</div>
																										<button className="close-reveal" onClick={() => this.closeTickerModal()}>&times;</button>
																									</Modal>
																								</div>
																								<div className="ticker-action" onClick={this.openTickerModal}>
																									<div className="ticker-date">
																										<strong><Moment format="DD">{new Date().getTime()}</Moment></strong>
																										<small><Moment format="MMM">{new Date().getTime()}</Moment></small>
																									</div>
																									<div className="ticker-keys">
																										<div className="ticker-btn ticker-success">
																											<span className="fa fa-plus"></span>
																										</div>
																									</div>
																									<div className="ticker-note">{t('howDoYouFeelToday')}</div>
																								</div>
																							</div>
																						)
																						return (
																							<div className="ticker-container">
																								<div className="ticker-summary">
																									<div className="ticker-date">
																										<strong>{totalDays}</strong>
																										<small>{totalDays !== 0 ? t('days') : t('day')}</small>
																									</div>
																									<div className="ticker-keys">
																										<div className={`ticker-key ticker-key-weight`}>
																											<strong>{weightSummary ? weightSummary : '-'}</strong>
																											<span className="ticker-unit">kg</span>
																										</div>
																										<div className={`ticker-key ticker-key-waist`}>
																											<strong>{waistSummary ? waistSummary : '-'}</strong>
																											<span className="ticker-unit">cm</span>
																										</div>
																									</div>
																									<div className="ticker-note">{t('greatKeepItUp')}</div>
																								</div>


																								<div className="ticker-progress">
																									{tickerData.length > 0 && tickerData.map((ticker, index) => {
																										const { timestamp, id, value, title } = ticker.node;
																										const keyIndex = tickerKeys.findIndex(t => t.title === title);
																										if (keyIndex === -1) return null;
																										const tickerTime = new Date(timestamp);
																										const tickerDate = `${months[tickerTime.getMonth()]} ${tickerTime.getDate()}, ${tickerTime.getFullYear()} - ${tickerTime.getHours()}:${tickerTime.getMinutes()}:${tickerTime.getSeconds()}`;
																										return (
																											<div className="ticker-item" key={id + index}>
																												<div className="ticker-date" title={tickerDate}>
																													<strong><Moment format="DD">{timestamp}</Moment></strong>
																													<small><Moment format="MMM">{timestamp}</Moment></small>
																												</div>
																												<div className="ticker-keys">
																													<div className={`ticker-key ticker-key-${title}`}>
																														<strong>{value}</strong>
																														<span className="ticker-unit">{tickerKeys[keyIndex].unit}</span>
																													</div>
																												</div>
																												<div className="ticker-message-count" onClick={() => this.openTickerDiscussionModal(id)} title="Open Discussion"><span className="fa fa-comments-o"></span></div>
																											</div>
																										)
																									})}
																									<Modal
																										isOpen={this.state.openTicker}
																										contentLabel="Ticker Information"
																										onRequestClose={this.closeTickerModal}
																										className="reveal reveal-ticker "
																										ariaHideApp={false}
																									>
																										<div className="ticker-modal-container">
																											<h3>{t('updateYourProgress')}</h3>
																											<hr />
																											<div className="entry-ticker">
																												<Mutation mutation={INPUT_TICKER} onCompleted={(data) => {
																													if (data) {
																														const { tickerInput } = data;
																														const newNode = [{
																															node: tickerInput.tickerNode
																														}]
																														this.updateTickerData(newNode);
																														refetch();
																													}
																												}}>
																													{(tickerInput, { data }) => {
																														if (data) return null;
																														return (
																															<div>
																																<div className="entry-date">
																																	<strong><span className="fa fa-calendar"></span> {currentDate}</strong>
																																</div>

																																<div className="entry-input">
																																	<div className="entry-box">
																																		<label htmlFor="key-weight">
																																			<span className="text">{t('your')}</span>
																																			<select onChange={this.changeTickerKey} value={this.state.selectedKey}>
																																				<option value="weight">{t('weight')}</option>
																																				<option value="waist">{t('waist')}</option>
																																			</select>
																																			<span className="text">:</span>
																																		</label>
																																		<input type="number" name="keyValue" id="key-value" step="any" value={this.state.keyValue} onChange={this.changeKeyValue} className={`ticker-input ${this.state.selectedKey === 'waist' ? 'input-waist' : 'input-weight'}`} />
																																	</div>
																																</div>

																																<div className="entry-action">
																																	<button className="button large success"
																																		type="button"
																																		onClick={async () => {
																																			await tickerInput({ variables: { clientMutationId: this.state.selectedKey, courseId: this.props.match.params.pathId, userId: this.props.userId, title: this.state.selectedKey, value: this.state.keyValue } })
																																		}}
																																	>{t('submit')}</button>
																																</div>

																															</div>
																														)
																													}}
																												</Mutation>

																											</div>
																										</div>
																										<button className="close-reveal" onClick={() => this.closeTickerModal()}>&times;</button>
																									</Modal>
																								</div>
																								<div className="ticker-action" onClick={this.openTickerModal}>
																									<div className="ticker-date">
																										<strong><Moment format="DD">{new Date().getTime()}</Moment></strong>
																										<small><Moment format="MMM">{new Date().getTime()}</Moment></small>
																									</div>
																									<div className="ticker-keys">
																										<div className="ticker-btn ticker-success">
																											<span className="fa fa-plus"></span>
																										</div>
																										{/* <div className="ticker-btn ticker-btn2">
																							<span className="fa fa-plus"></span>
																						</div> */}
																									</div>
																									<div className="ticker-note">{t('howDoYouFeelToday')}</div>
																								</div>
																							</div>
																						)
																					}}
																				</Query>
																			)}

																		{this.state.openTickerDiscussion && (
																			<TickerDiscussion pathId={this.props.match.params.pathId} tickerId={this.state.tickerId} close={this.closeTickerDiscussionModal} mentor={mentorMastodonUsername ? mentorMastodonUsername : null} />
																		)}


																		<Modal
																			isOpen={this.state.openTicker2}
																			contentLabel="Ticker Information2"
																			onRequestClose={this.closeTickerModal2}
																			className="reveal reveal-ticker "
																			ariaHideApp={false}
																		>
																			<div className="ticker-modal-container">
																				<h3>{t('updateYourProgress')}</h3>
																				<hr />
																				<div className="entry-ticker">
																					<Mutation mutation={INPUT_TICKER}>
																						{(tickerInput, { data }) => {
																							if (data) return null;
																							return (
																								<div>
																									<div className="entry-date">
																										{/* <label>Today:</label> */}
																										<strong><span className="fa fa-calendar"></span> April 15, 2019 - 11:55:12</strong>
																									</div>

																									<div className="entry-input">
																										<div className="entry-box">
																											<label htmlFor="key-weight">
																												<span className="text">Your weight:</span>
																												<input type="number" name="ticker" id="key-weight" step="any" />
																												<span className="unit">kg</span>
																											</label>
																										</div>
																										<div className="entry-box">
																											<label htmlFor="key-waist">
																												<span className="text">Your waist:</span>
																												<input type="number" className="key-2" name="waist" id="key-waist" step="any" value="112" disabled />
																												<span className="unit">cm</span>
																											</label>
																										</div>
																									</div>

																									<div className="entry-mentor">
																										<div className="flex-container align-middle" style={{ whiteSpace: 'nowrap' }}>
																											<label htmlFor="mentor-notes" style={{ marginBottom: '1rem', marginRight: '1rem' }}>Notes for mentor:</label>
																											<select name="select-mentor" id="select-mentor" style={{ width: 'auto' }} disabled defaultValue="1">
																												<option value="1">Mentor 01</option>
																											</select>
																										</div>
																										<textarea name="mentor-notes" id="mentor-notes" cols="30" rows="3" placeholder="Write some notes to your mentor.."></textarea>
																									</div>

																									<div className="entry-action">
																										<button className="button large"
																											type="button"
																											onClick={async () => {
																												await tickerInput({ variables: { clientMutationId: this.state.selectedKey, courseId: this.props.match.param.pathId, userId: this.props.userId, title: this.state.selectedKey, value: this.state.keyValue } })
																											}}
																										>{t('submit')}</button>
																									</div>

																								</div>
																							)
																						}}
																					</Mutation>
																				</div>
																			</div>
																			<button className="close-reveal" onClick={() => this.closeTickerModal()}>
																				&times;
																		</button>
																		</Modal>

																	</div>
																</React.Fragment>
															)}

															{mainTab === 'contents' && (
																<div className="my-path-detail">
																	{this.props.isAuthenticated &&
																		this.props.data.viewer !== null &&
																		this.props.data.viewer.paths.edges.length > 0 ? (
																			<DocumentContent {...this.props} selectedDocument={selectedDocument} />
																		) : (
																			<PathContent {...this.props} />
																		)}
																	{getUserToken() && this.props.data.viewer && this.props.data.viewer.paths.edges.length > 0 &&
																		<Query query={getSkillProgress} variables={{ pathId: this.props.match.params.pathId }}>
																			{({ loading, error, data }) => {
																				if (loading) return <Loader active content={t("loading")} indeterminate={true} size="small" />
																				if (error) return <p>Something went wrong, please try again.</p>;
																				const { skills } = data.viewer;
																				return (
																					<div className="my-skill-progress" style={{ display: 'none' }}>
																						{skills.edges.map((skill, index0) => (
																							<React.Fragment key={index0}>
																								{skill.node.paths.edges.length > 0 && skill.node.paths.edges.map((path, index) => {
																									if (path.node.id !== this.props.match.params.pathId) return null;
																									return (
																										<React.Fragment key={path.node.id}>
																											<div className="skill-progress" key={skill.node.id}>
																												<h5><Link to={`/skill/${skill.node.id}`}>{skill.node.title}</Link></h5>
																												<div className="skill-progress-bar">
																													<div className="skill-progress-meter">
																														{skill.node.averageValue > 0 && (
																															<div
																																className="progress-average-value"
																																style={{
																																	width: `${skill.node
																																		.averageValue * 100}%`,
																																}}
																															/>
																														)}
																														{data.viewer !== null && data.viewer.skills.edges[index].node.value > 0 && (
																															<div
																																className="progress-value"
																																style={{
																																	width: `${data.viewer.skills.edges[index].node.value * 100}%`,
																																}}
																															/>
																														)}
																													</div>
																												</div>
																											</div>
																										</React.Fragment>
																									);
																								})
																								}
																							</React.Fragment>
																						))}
																					</div>
																				)
																			}}
																		</Query>
																	}
																</div>
															)}


														</div>
													</div>
												</div>

												<div className="container-kanan">
													{getUserToken() && mastodonAuthToken && this.props.data.viewer && this.props.data.viewer.paths.edges.length > 0 && (

														<div className="step-chat-container">
															<Drawer position="right" open={openDiscussion} handleOpen={this.handleDiscussion} external title="Chat" icon="comments-o">
																<div className="section-title">
																	<ul className="tabs tabs-secondary tabs-right">
																		<li className={activeTab2 === 'general' ? 'active' : ''} onClick={() => this.handleTabs2Changes('general')}>General</li>
																		<li className={activeTab2 === 'topics' ? 'active' : ''} onClick={() => this.handleTabs2Changes('topics')}>Topics</li>
																	</ul>
																</div>
																<div className="section-content">
																	<div className="tabs-container">
																		<div className={`tabs-item ${activeTab2 === 'general' ? 'active' : ''}`} id="general-chat">
																			<PathTimeline pathId={this.props.match.params.pathId} />
																		</div>
																		<div className={`tabs-item ${activeTab2 === 'topics' ? 'active' : ''}`} id="topics-chat">
																			<div className="step-topics">
																				{steps && steps.edges.map((step, stepIndex) => {

																					const hashtag = decodePathStep(this.props.match.params.pathId, step.node.id);
																					let storageMyOpenedDiscussion = JSON.parse(localStorage.getItem('myOpenedDiscussion'))
																					if (!storageMyOpenedDiscussion) {
																						storageMyOpenedDiscussion = []
																					}
																					const isReadGQL = mastodonTags.length > 0 ? mastodonTags.some(t => t.name === hashtag) : false;
																					const isReadLocal = storageMyOpenedDiscussion.length > 0 ? storageMyOpenedDiscussion.some(storageArr => storageArr === hashtag) : false;

																					const shouldUnread = isReadGQL && !isReadLocal;

																					return (
																						<div className={`topic-item ${shouldUnread ? 'unread' : ''}`} key={step.node.id + stepIndex}>
																							<div
																								className={`viewer-button ${selectedStep && selectedStep.id === step.node.id ? 'active' : ''} `}
																								onClick={() => this.handleOpenDiscussion(step.node, hashtag)}
																							>
																								<span className="viewer-comments">
																									<span className="fa fa-comments-o" />
																								</span>
																								<div className="viewer-label">{step.node.title}</div>
																							</div>

																						</div>
																					)
																				})}
																			</div>
																		</div>
																	</div>
																</div>
															</Drawer>

														</div>
													)}
													{/* {!mastodonAuthToken && (
														<p>{t('chatError')}</p>
													)} */}
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<Drawer position="left" open={openDrawer} handleOpen={this.handleDrawer} external={true}>
								<div className="section-title">
									<ul className="tabs">
										<li className={this.state.activeTab === 'path' ? 'active' : ''} onClick={() => this.handleTabsChanges('path')} >{t('paths')}</li>
										<li className={this.state.activeTab === 'people' ? 'active' : ''} onClick={() => this.handleTabsChanges('people')} >{t('people')}</li>
										{hasPath && viewer.paths.edges[0].node.steps && viewer.paths.edges[0].node.steps.edges.length && (
											<li className={this.state.activeTab === 'outline' ? 'active' : ''} onClick={() => this.handleTabsChanges('outline')} >{t('outline')}</li>
										)}
									</ul>
								</div>
								<div className="section-content">
									<div className="tabs-content">
										<div className={this.state.activeTab === 'path' ? 'tabs-item active' : 'tabs-item'} id="tab-path">
											<div className="available-paths">
												{organisations.edges[0].node.skills.edges[0].node.paths.edges.map((path, index) => {
													if (hasPath && viewer.paths.edges[0].node.id === path.node.id.substring(8)) {
														return (
															<PathGrid key={index} active={this.props.match.params.pathId.substring(8)} data={viewer.paths.edges[0].node} url={`/${this.props.match.params.organisationId}/${this.props.match.params.skillId}/${path.node.id}`} />
														)
													}
													return (
														<PathGrid key={index} active={this.props.match.params.pathId} data={path.node} url={`/${this.props.match.params.organisationId}/${this.props.match.params.skillId}/${path.node.id}`} />
													)
												})}
											</div>
										</div>

										<div className={this.state.activeTab === 'people' ? 'tabs-item active' : 'tabs-item'} id="tab-people">
											{getUserToken() && this.props.data.viewer && this.props.data.viewer.paths.edges.length > 0 ?

												<Query query={getPathParticipants} variables={{ cursor: '', count: 25, pathId: this.props.match.params.pathId, stringPathId: this.props.match.params.pathId }} fetchPolicy="network-only">
													{({ error, data, fetchMore }) => {
														if (error) return <p>{t('error')}</p>;
														const participants = data && data.paths ? data.paths.edges[0].node.participants : null;
														const canCreateBadge = data && data.paths ? data.paths.edges[0].node.canCreateBadge : false;
														const canAddBadge = data && data.paths ? data.paths.edges[0].node.canAssignBadge : false;

														return (
															<React.Fragment>
																<div className="user-paths">
																	<ul>
																		{participants && participants.edges.map((people, index) => {
																			const { profileBadgeUrl } = people.node;
																			return (

																				<li key={index}>
																					<div>
																						<span className="my-path-bgimage"><img src={people.node.profilePictureUrl} alt={people.node.username} width="48" height="48" /></span>
																						<span className="my-path-participant-info">
																							<BadgeContainer canAddBadge={canAddBadge} profileBadgeUrl={profileBadgeUrl} people={people.node} availableBadges={availableBadges} canCreateBadge={canCreateBadge} updateBadges={this.updateBadges} pathId={this.props.match.params.pathId} updateAvailableBadges={this.updateAvailableBadges} />
																							{people.node.firstName === '' && people.node.lastName === '' ?
																								<span className="my-path-title">{people.node.username}</span>
																								:
																								<span className="my-path-title">{people.node.firstName} {people.node.lastName}</span>
																							}
																							<SkillBar pathId={this.props.match.params.pathId} skills={people.node.skills} lowColor={lowColor} highColor={highColor} people={people.node} click={(e) => this.handleOpenPeopleModal(index, e)} />
																						</span>
																						<a href="#load" className="my-path-link" onClick={(e) => this.handleOpenPeopleModal(index, e)}>&nbsp;</a>
																					</div>
																				</li>
																			)
																		})}
																		{participants && participants.pageInfo.hasNextPage && (
																			<li className="load-more"><a href="#load" className={`btn-fetchmore fetchMore button small hollow ${this.state.isLoadMoreParticipants ? 'is-loading disabled' : ''}`} onClick={() => {
																				this.setState({ isLoadMoreParticipants: true }); fetchMore({
																					query: getPathParticipants,
																					variables: { cursor: participants.pageInfo.endCursor, count: 25, pathId: this.props.match.params.pathId, stringPathId: this.props.match.params.pathId },
																					updateQuery: (previousResult, { fetchMoreResult }) => {
																						const newEdges = fetchMoreResult.paths.edges[0].node.participants.edges;
																						const pageInfo = fetchMoreResult.paths.edges[0].node.participants.pageInfo;
																						this.setState({ isLoadMoreParticipants: false });
																						const newResult = newEdges.length ? {
																							paths: {
																								__typename: previousResult.paths.__typename,
																								edges: [
																									{
																										__typename: previousResult.paths.edges[0].__typename,
																										node: {
																											__typename: previousResult.paths.edges[0].node.__typename,
																											id: previousResult.paths.edges[0].node.id,
																											canCreateBadge: previousResult.paths.edges[0].node.canCreateBadge,
																											canAssignBadge: previousResult.paths.edges[0].node.canAssignBadge,
																											participants: {
																												__typename: previousResult.paths.edges[0].node.participants.__typename,
																												edges: [...previousResult.paths.edges[0].node.participants.edges, ...newEdges],
																												pageInfo
																											}
																										}
																									}
																								]
																							}
																						} : previousResult;
																						return newResult;
																					}
																				})
																			}}>{t('loadMore')}</a></li>
																		)}
																	</ul>
																</div>
																<Modal
																	isOpen={this.state.showPeopleModal}
																	contentLabel="People Information"
																	onRequestClose={() => this.handleClosePeopleModal()}
																	className="reveal "
																	ariaHideApp={false}
																>
																	<div className="people-container">
																		{participants && participants.edges.map((people, index) => {
																			const { id, username, firstName, lastName, profilePictureUrl, bio, profileBadgeUrl, skills } = people.node;

																			return (
																				<div className={this.state.peopleIndex === index ? 'people active' : 'people'} id={`people-${index}`} key={index}>
																					<div className="user-profile">
																						<div className="user-avatar">
																							<img
																								src={profilePictureUrl}
																								alt={firstName}
																							/>
																						</div>
																						<div className="user-information">
																							{firstName !== '' || lastName !== '' ?
																								<h2>
																									{firstName}{' '}
																									{lastName}
																								</h2>
																								:
																								<h2>{username}</h2>
																							}
																							{bio !== '' ?
																								<p>{bio}</p>
																								:
																								<p>This person doesn't have bio yet.</p>
																							}

																						</div>
																					</div>

																					<div className="user-badges">
																						{newBadges.length > 0 && newBadges.findIndex(ub => ub.id === id) !== -1 ? (
																							<React.Fragment>
																								{newBadges[newBadges.findIndex(ub => ub.id === id)].badges.map((ubadge, index) => {
																									if (profileBadgeUrl.length > 0 && profileBadgeUrl.findIndex(pbu => pbu === ubadge) !== -1) return null;
																									return (
																										<Badge key={index} profileBadgeUrl={ubadge} />
																									)
																								})}
																							</React.Fragment>
																						) : null}
																						{profileBadgeUrl.map((badgeUrl, index) => (
																							<Badge key={index} profileBadgeUrl={badgeUrl} />
																						))}
																					</div>

																					<ParticipantSkills pathId={this.props.match.params.pathId} skills={skills} lowColor={lowColor} highColor={highColor} people={people.node} />

																				</div>
																			)
																		})}
																	</div>
																	<button className="close-reveal" onClick={() => this.handleClosePeopleModal()}>
																		&times;
																	</button>
																</Modal>
															</React.Fragment>
														);
													}}
												</Query>
												:
												<React.Fragment>
													{getUserToken() ?
														<p>You need to join this path to view other participants.</p>
														:
														<p>You need to <a href={process.env.REACT_APP_OAUTH_SIGNIN_URL}>Sign In</a> first to view participants.</p>
													}
												</React.Fragment>
											}
										</div>

										{hasPath && viewer.paths.edges[0].node.steps && viewer.paths.edges[0].node.steps.edges.length && (
											<div className={this.state.activeTab === 'outline' ? 'tabs-item active' : 'tabs-item'} id="tab-outline">
												<div className="path-outline">
													{viewer.paths.edges[0].node.steps.edges.map((step, stepIndex) => {
														const { completed } = step.node;
														return (
															<div className={`step-progress ${completed ? 'completed' : 'uncomplete'}`} key={step.node.id + step.node.title} style={completed ? { borderColor: viewer.paths.edges[0].node.lowColor } : {}}>
																<div className="step-progress-header">
																	<div className="flex-container align-between">
																		<h6>
																			<a href={`#step-${stepIndex}`} onClick={ev => this.selectContent(stepIndex, ev)}>
																				<strong style={{ color: viewer.paths.edges[0].node.highColor }}>
																					{stepIndex + 1}
																				</strong>
																				&nbsp;
																									{step.node.title}
																			</a>
																		</h6>
																		<div className={`step-progress-status`}>
																			<span className="fa fa-check"
																				style={completed ? { color: viewer.paths.edges[0].node.lowColor } : {}}
																			/>
																		</div>
																	</div>
																</div>

																<div className="step-progress-content">
																	{step.node.contents.edges.length > 0 && (
																		<ul className="content-items">
																			{step.node.contents.edges.map(
																				(content, contentIndex) => {
																					if (content.node.contentType !== 'vuocontent' && content.node.contentType !== 'filecontent') return null;
																					const vuoBlock = content.node.vuoBlocks.edges;
																					let unAnsweredCount = 0;
																					if (vuoBlock.length > 0) {
																						for (let v = 0; v < vuoBlock.length; v++) {
																							const block = vuoBlock[v].node;
																							if (block.type === 'openquestion' && block.hasAnswer === false) {
																								unAnsweredCount++;
																							}
																						}
																					}
																					return (
																						<li
																							className="content-item"
																							key={content.node.id}
																						>
																							<a href={`#content-${stepIndex}-${contentIndex}`} onClick={(ev) => this.selectDocument(stepIndex, contentIndex, ev)}>
																								<span className="block-link">
																									<span className="fa fa-circle" style={{ color: viewer.paths.edges[0].node.lowColor }}></span>
																									{content.node.title !== '' ? content.node.title : (<em>Unnamed</em>)}
																								</span>
																								{unAnsweredCount > 0 && (
																									<span className="unanswered-block" style={{ background: lowColor, color: highColor }}>
																										<span className="text">{t('questions')}</span>
																										<span className="count">{unAnsweredCount}</span>
																									</span>
																								)}
																							</a>
																						</li>
																					)
																				}
																			)}
																		</ul>
																	)}
																</div>

															</div>
														)
													})}
												</div>
											</div>
										)}

									</div>
								</div>
							</Drawer>
						</Wrapper>
					)
				}}
			</Query>
		);
	}
}

const mapStateToProps = state => {
	return {
		isAuthenticated: getUserToken(),
		userId: state.auth.userId,
		isMentor: state.auth.isMentor,
		mastodonAuthToken: state.auth.mastodonAuthToken,
	};
};

export default compose(
	withRouter,
	connect(
		mapStateToProps,
		null
	),
	withTranslation(),
	graphql(getAuthPath, {
		skip: (props) => {
			const isSecureOrganisation = SECURE_ORGANISATIONS.findIndex(org => org === props.match.params.organisationId);
			const token = localStorage.getItem('token');
			if (isSecureOrganisation !== -1 && !token) {
				return true
			}
			return false
		},
		options: props => {
			return {
				fetchPolicy: 'network-only',
				variables: {
					name: props.match.params.organisationId ? props.match.params.organisationId : null,
					skillId: props.match.params.skillId ? props.match.params.skillId : null,
					pathId: props.match.params.pathId ? props.match.params.pathId : null,
					since: (new Date(new Date().setDate(new Date().getDate() - 1)).getTime()) / 1000,
				},
			};
		},
	})
)(PublicPath);
