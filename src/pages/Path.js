import React, { Component } from 'react';
import Wrapper from '../components/layouts/wrapper';
import Modal from 'react-modal';
import BadgeContainer from '../components/global/BadgeContainer';
import Navigation from '../components/layouts/Navigation';
import PathGrid from '../components/global/PathGrid';
import PathTimeline from '../components/sections/PathTimeline';
import StepTimeline from '../components/sections/StepTimeline';
import TickerDiscussion from '../components/sections/TickerDiscussion';
import MaterialLink from '../components/global/MaterialLink';
// import MentorTickerDiscussion from '../components/sections/MentorTickerDiscussion';
import MentorTickers from '../components/sections/MentorTickers';
import Badge from '../components/global/Badge';
import SkillBar from '../components/global/SkillBar';
import ParticipantSkills from '../components/global/ParticipantSkills';
import Moment from 'react-moment';

import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter, Redirect } from 'react-router-dom';
import { graphql, Query, Mutation } from 'react-apollo';
import ImagesLoaded from 'react-images-loaded';
import { getAuthPath2, getUserPaths, getPathParticipants, COMPLETE_STEP, GET_TICKERS, INPUT_TICKER, SET_COACH } from '../store/gql/queries';
import { decodePathStep } from '../helpers';

import SecurePrompt from '../components/sections/SecurePrompt';
import { withTranslation } from 'react-i18next';

// import SkillItemPeople from '../components/global/SkillItemPeople';

import { getUserToken } from '../helpers';

import { Loader } from 'semantic-ui-react';

class Path extends Component {
  state = {
    pathId: this.props.match.params.pathId,
    activeTab: 'outline',
    showPeopleModal: false,
    peopleIndex: null,
    isScrolled: false,
    isLoadMoreParticipants: false,
    isImagesLoaded: false,
    selectedDocument: null,
    openTicker: false,
    openTicker2: false,
    openTickerDiscussion: false,
    openTickerDiscussion2: false,
    newAllAvailableBadges: [],
    newBadges: [],
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
    conversationReady: false,
    tickerId: null,
    chooseMentorModal: false,
    selectedMentor: null,
    selectedNewMentor: null
  };

  componentDidUpdate(prevProps) {
    if (this.props.match.params.pathId !== prevProps.match.params.pathId) {
      this.setState({
        pathId: this.props.match.params.pathId,
        isScrolled: false,
        isImagesLoaded: false,
        newAllAvailableBadges: [],
        newBadges: [],
        mainTab: 'contents',
        selectedStep: null,
        activeTab2: 'topics',
        tickerKeys: [
          { title: 'weight', unit: 'kg' },
          { title: 'waist', unit: 'cm' }
        ],
        tickerData: [],
        selectedKey: 'weight',
        keyValue: '',
        conversationReady: false,
        tickerId: null,
        chooseMentorModal: false,
        selectedMentor: null,
        selectedNewMentor: null
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

  imagesLoaded = () => {
    this.setState({
      isImagesLoaded: true
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
    }, 300)
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
    }
  }

  handleStepScroll = async () => {
    // const { isScrolled } = this.state;
    // if (!isScrolled) {
    // 	const { data } = this.props;
    // 	const { loading, viewer } = data;
    // 	if (!loading && viewer && viewer.paths.edges.length > 0) {
    // 		const findIndex = viewer.paths.edges[0].node.steps.edges.findIndex(step => step.node.completed !== true);
    // 		const stepViewer = await document.getElementById(`viewer-step-${findIndex}`);
    // 		const pathcontent = await document.getElementsByClassName('path-content');
    // 		if (stepViewer) {
    // 			this.setState({ isScrolled: true })
    // 			await setTimeout(() => {
    // 				console.log('scrolled');
    // 				pathcontent[0].scrollTop = stepViewer.offsetTop;
    // 			}, 0);
    // 		}
    // 	}
    // }
  }

  componentDidMount = () => {

  }

  componentWillUnmount() {
    this.setState({ isScrolled: false, selectedStep: null });
  }

  handleTabsChanges = tab => {
    this.setState({
      activeTab: tab,
      selectedStep: null
    });
  };

  handleTabs2Changes = tab => {
    this.setState({
      activeTab2: tab,
      selectedStep: null,
    });
  };

  handleOpenPeopleModal = id => {
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

  openChooseMentor = () => {
    this.setState({
      chooseMentorModal: true,
      selectedMentor: null
    })
  }

  closeChooseMentor = () => {
    this.setState({
      chooseMentorModal: false,
      selectedMentor: null
    })
  }

  selectMentor = mentorId => {
    const { selectedMentor } = this.state;
    if (selectedMentor !== mentorId) {
      this.setState({
        selectedMentor: mentorId
      })
    } else {
      this.setState({
        selectedMentor: null
      })
    }
  }

  selectNewMentor = mentor => {
    this.setState({
      selectedNewMentor: mentor
    })
    this.closeChooseMentor();
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
      tickerId: null
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

  updateBadges = data => {
    this.setState({
      newBadges: data,
    })
  }

  updateAvailableBadges = data => {
    const { newAllAvailableBadges } = this.state;
    const newAllBadges = [...newAllAvailableBadges, ...data];
    this.setState({
      newAllAvailableBadges: newAllBadges,
    })
  }

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

  render() {
    if (!getUserToken()) return <SecurePrompt />

    const { loading, error, viewer, refetch } = this.props.data;
    const { t, data: { mastodonTags } } = this.props;

    const mainRefetch = refetch;

    if (loading) return <Loader active content={t("loading")} indeterminate={true} size="small" />
    if (error || !viewer || !viewer.paths || viewer.paths.edges.length < 1) return <Redirect to="/error" />;

    const { selectedDocument, activeTab2, selectedStep, mainTab } = this.state;


    const {
      bgimage,
      lowColor,
      highColor,
      title,
      maxColor,
      steps,
      canCreateBadge,
      tickerEnabled,
      mentorMastodonUsername,
    } = viewer.paths.edges[0].node;

    const { newBadges, newAllAvailableBadges } = this.state;

    const availableBadges = viewer.paths.edges[0].node.availableBadges.edges.length > 0 ? [...viewer.paths.edges[0].node.availableBadges.edges, ...newAllAvailableBadges] : newAllAvailableBadges;

    const { mastodonAuthToken } = this.props || null;
    const availableMentors = viewer.paths.edges[0].node.availableMentors.edges ? viewer.paths.edges[0].node.availableMentors.edges : [];

    const now = new Date();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentDate = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()} - ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

    const { tickerKeys, tickerData } = this.state;

    const { isMentor } = this.props;
    const { selectedMentor, selectedNewMentor } = this.state;
    // const isTickerEnabled = viewer && viewer.isTickerEnabled ? viewer.isTickerEnabled : false;
    const pathCoach = viewer && viewer.pathCoach ? viewer.pathCoach : null;
    const selectedCoachName = selectedNewMentor ? (selectedNewMentor.firstName !== '' || selectedNewMentor.lastName !== '') ? `${selectedNewMentor.firstName} ${selectedNewMentor.lastName}` : selectedNewMentor.firstName === '' && selectedNewMentor.lastName === '' ? selectedNewMentor.username : selectedNewMentor.firstName === '' ? selectedNewMentor.lastName : selectedNewMentor.firstName : '';
    const coachName = pathCoach ? (pathCoach.firstName !== '' || pathCoach.lastName !== '') ? `${pathCoach.firstName} ${pathCoach.lastName}` : pathCoach.firstName === '' && pathCoach.lastName === '' ? pathCoach.username : pathCoach.firstName === '' ? pathCoach.lastName : pathCoach.firstName : selectedCoachName ? selectedCoachName : '';

    // const coachImage = pathCoach ? pathCoach.profilePictureUrl : selectedNewMentor ? selectedNewMentor.profilePictureUrl : '';


    // console.log('pathcoach', pathCoach)
    return (
      <Wrapper>
        <Navigation
          title={title}
          style={{ background: "#ffffff" }}
          referer="profile"
          refTitle={t("myProfile")}
        />
        <div id="maincontent" className="section" style={{
          backgroundImage: bgimage
            ? `url(${bgimage})`
            : `none`,
          filter:
            "progid:DXImageTransform.Microsoft.gradient( startColorstr='#000000', endColorstr='#ffffff',GradientType=0 )",
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover'
        }}>
          <div className="app-container">
            <div className="grid-x grid-margin-x">
              <div className="cell">
                <div className="grid-x grid-margin-x">
                  <div className="cell small-12 medium-4 large-3">
                    <div className="section-sticky">
                      <div className="section-title">
                        <ul className="tabs">
                          {/* <li
                            className={
                              this.state.activeTab === "path" ? "active" : ""
                            }
                            onClick={() => this.handleTabsChanges("path")}
                          >
                            {t("myPaths")}
                          </li> */}
                          <li
                            className={
                              this.state.activeTab === "outline" ? "active" : ""
                            }
                            onClick={() => this.handleTabsChanges("outline")}
                          >
                            {t("outline")}
                          </li>
                          <li
                            className={
                              this.state.activeTab === "people" ? "active" : ""
                            }
                            onClick={() => this.handleTabsChanges("people")}
                          >
                            {t("people")}
                          </li>

                        </ul>
                      </div>
                      <div className="section-content">
                        <div className="tabs-content">
                          <div
                            className={
                              this.state.activeTab === "path"
                                ? "tabs-item active"
                                : "tabs-item"
                            }
                            id="tab-path"
                          >
                            <Query query={getUserPaths}>
                              {({ loading, error, data }) => {
                                if (loading)
                                  return (
                                    <Loader active content={t("loading")} indeterminate={true} size="small" />
                                  );
                                if (error) return <p>{t("error")}</p>;
                                return (
                                  <div className="available-paths">
                                    {data.viewer.paths.edges.map(
                                      (path, index) => (
                                        <PathGrid
                                          key={index}
                                          active={
                                            this.props.match.params.pathId
                                          }
                                          data={path.node}
                                          url={`/path/${path.node.id}`}
                                        />
                                        // <li key={index} className={path.node.id === this.state.pathId ? 'active' : null}>
                                        // 	<Link to={`/path/${path.node.id}`}>
                                        // 		<span className="my-path-bgimage"><img src={path.node.bgimage} alt={path.node.title} width="48" height="48" /></span>
                                        // 		<span className="my-path-title">{path.node.title}</span>
                                        // 	</Link>
                                        // </li>
                                      )
                                    )}
                                  </div>
                                );
                              }}
                            </Query>
                          </div>
                          <div
                            className={
                              this.state.activeTab === "people"
                                ? "tabs-item active"
                                : "tabs-item"
                            }
                            id="tab-people"
                          >
                            <Query
                              query={getPathParticipants}
                              variables={{
                                cursor: "",
                                count: 25,
                                pathId: this.props.match.params.pathId,
                                stringPathId: this.props.match.params.pathId
                              }}
                              fetchPolicy="network-only"
                            >
                              {({ error, data, fetchMore }) => {
                                if (error) return <p>{t("error")}</p>;
                                const participants =
                                  data && data.paths
                                    ? data.paths.edges[0].node.participants
                                    : null;
                                const canAddBadge =
                                  data && data.paths
                                    ? data.paths.edges[0].node.canAssignBadge
                                    : false;
                                return (
                                  <React.Fragment>
                                    <div className="people-tabs">
                                      <ul>
                                        {participants &&
                                          participants.edges.map(
                                            (people, index) => {
                                              const {
                                                profileBadgeUrl
                                              } = people.node;
                                              // console.log('ppbadge', profileBadgeUrl);
                                              return (
                                                <li key={index}>
                                                  <div>
                                                    <span className="my-path-bgimage">
                                                      <img
                                                        src={
                                                          people.node
                                                            .profilePictureUrl
                                                        }
                                                        alt={
                                                          people.node.username
                                                        }
                                                        width="48"
                                                        height="48"
                                                      />
                                                    </span>
                                                    <span className="my-path-participant-info">
                                                      <BadgeContainer
                                                        canAddBadge={
                                                          canAddBadge
                                                        }
                                                        profileBadgeUrl={
                                                          profileBadgeUrl
                                                        }
                                                        people={people.node}
                                                        availableBadges={
                                                          availableBadges
                                                        }
                                                        canCreateBadge={
                                                          canCreateBadge
                                                        }
                                                        updateBadges={
                                                          this.updateBadges
                                                        }
                                                        pathId={
                                                          this.props.match
                                                            .params.pathId
                                                        }
                                                        updateAvailableBadges={
                                                          this
                                                            .updateAvailableBadges
                                                        }
                                                      />
                                                      {/* <span className="my-path-badges">
																										<React.Fragment>
																											{userBadgeData.length > 0 && userBadgeData.findIndex(ub => ub.id === people.node.id) !== -1 ?
																												(
																													<React.Fragment>
																														{userBadgeData[userBadgeData.findIndex(ub => ub.id === people.node.id)].badges.map((ubadge, index) => {
																															if (profileBadgeUrl.length > 0 && profileBadgeUrl.findIndex(pbu => pbu === ubadge) !== -1) return null;
																															if (index + profileBadgeUrl.length > 10) return null;
																															return (
																																<span key={ubadge + index} className="new-badge badge-item"><img src={ubadge} alt={ubadge} width="16" height="16" /></span>
																															)
																														})}
																													</React.Fragment>
																												) : null}
																											{profileBadgeUrl.length > 0 && profileBadgeUrl.map((badge, index) => {
																												if (index > 10) return null;
																												return (
																													<span key={badge + index} className="badge-item"><img src={badge} alt={badge} width="16" height="16" /></span>
																												)
																											})}
																										</React.Fragment>
																										{canAddBadge && (
																											<button type="button" onClick={() => this.handleOpenBadgeModal(people.node.id)} className="badge-add badge-item"><span className="fa fa-plus"></span></button>
																										)}
																									</span> */}
                                                      {people.node.firstName ===
                                                        "" &&
                                                        people.node.lastName ===
                                                        "" ? (
                                                          <span className="my-path-title">
                                                            {people.node.username}
                                                          </span>
                                                        ) : (
                                                          <span className="my-path-title">
                                                            {
                                                              people.node
                                                                .firstName
                                                            }{" "}
                                                            {people.node.lastName}
                                                          </span>
                                                        )}
                                                      <SkillBar
                                                        pathId={
                                                          this.props.match
                                                            .params.pathId
                                                        }
                                                        skills={
                                                          people.node.skills
                                                        }
                                                        lowColor={lowColor}
                                                        highColor={highColor}
                                                        people={people.node}
                                                        click={() =>
                                                          this.handleOpenPeopleModal(
                                                            index
                                                          )
                                                        }
                                                      />
                                                    </span>
                                                    <a
                                                      href="#load"
                                                      className="my-path-link"
                                                      onClick={() =>
                                                        this.handleOpenPeopleModal(
                                                          index
                                                        )
                                                      }
                                                    >
                                                      &nbsp;
                                                    </a>
                                                  </div>
                                                </li>
                                              );
                                            }
                                          )}
                                        {participants &&
                                          participants.pageInfo.hasNextPage && (
                                            <li className="load-more">
                                              <a
                                                href="#load"
                                                className={`btn-fetchmore fetchMore button small hollow ${
                                                  this.state
                                                    .isLoadMoreParticipants
                                                    ? "is-loading disabled"
                                                    : ""
                                                  }`}
                                                onClick={() => {
                                                  this.setState({
                                                    isLoadMoreParticipants: true
                                                  });
                                                  fetchMore({
                                                    query: getPathParticipants,
                                                    variables: {
                                                      cursor:
                                                        participants.pageInfo
                                                          .endCursor,
                                                      count: 25,
                                                      pathId: this.props.match
                                                        .params.pathId,
                                                      stringPathId: this.props
                                                        .match.params.pathId
                                                    },
                                                    updateQuery: (
                                                      previousResult,
                                                      { fetchMoreResult }
                                                    ) => {
                                                      const newEdges =
                                                        fetchMoreResult.paths
                                                          .edges[0].node
                                                          .participants.edges;
                                                      const pageInfo =
                                                        fetchMoreResult.paths
                                                          .edges[0].node
                                                          .participants
                                                          .pageInfo;
                                                      this.setState({
                                                        isLoadMoreParticipants: false
                                                      });
                                                      const newResult = newEdges.length
                                                        ? {
                                                          paths: {
                                                            __typename:
                                                              previousResult
                                                                .paths
                                                                .__typename,
                                                            edges: [
                                                              {
                                                                __typename:
                                                                  previousResult
                                                                    .paths
                                                                    .edges[0]
                                                                    .__typename,
                                                                node: {
                                                                  __typename:
                                                                    previousResult
                                                                      .paths
                                                                      .edges[0]
                                                                      .node
                                                                      .__typename,
                                                                  id:
                                                                    previousResult
                                                                      .paths
                                                                      .edges[0]
                                                                      .node
                                                                      .id,
                                                                  canCreateBadge:
                                                                    previousResult
                                                                      .paths
                                                                      .edges[0]
                                                                      .node
                                                                      .canCreateBadge,
                                                                  canAssignBadge:
                                                                    previousResult
                                                                      .paths
                                                                      .edges[0]
                                                                      .node
                                                                      .canAssignBadge,
                                                                  participants: {
                                                                    __typename:
                                                                      previousResult
                                                                        .paths
                                                                        .edges[0]
                                                                        .node
                                                                        .participants
                                                                        .__typename,
                                                                    edges: [
                                                                      ...previousResult
                                                                        .paths
                                                                        .edges[0]
                                                                        .node
                                                                        .participants
                                                                        .edges,
                                                                      ...newEdges
                                                                    ],
                                                                    pageInfo
                                                                  }
                                                                }
                                                              }
                                                            ]
                                                          }
                                                        }
                                                        : previousResult;
                                                      return newResult;
                                                    }
                                                  });
                                                }}
                                              >
                                                {t("loadMore")}
                                              </a>
                                            </li>
                                          )}
                                      </ul>
                                    </div>
                                    <Modal
                                      isOpen={this.state.showPeopleModal}
                                      contentLabel="People Information"
                                      onRequestClose={() =>
                                        this.handleClosePeopleModal()
                                      }
                                      className="reveal "
                                      ariaHideApp={false}
                                    >
                                      <div className="people-container">
                                        {participants &&
                                          participants.edges.map(
                                            (people, index) => {
                                              const {
                                                id,
                                                username,
                                                firstName,
                                                lastName,
                                                profilePictureUrl,
                                                bio,
                                                profileBadgeUrl,
                                                skills
                                              } = people.node;
                                              return (
                                                <div
                                                  className={
                                                    this.state.peopleIndex ===
                                                      index
                                                      ? "people active"
                                                      : "people"
                                                  }
                                                  id={`people-${index}`}
                                                  key={index}
                                                >
                                                  <div className="user-profile">
                                                    <div className="user-avatar">
                                                      <img
                                                        src={profilePictureUrl}
                                                        alt={firstName}
                                                      />
                                                    </div>
                                                    <div className="user-information">
                                                      {firstName !== "" ||
                                                        lastName !== "" ? (
                                                          <h2>
                                                            {firstName} {lastName}
                                                          </h2>
                                                        ) : (
                                                          <h2>{username}</h2>
                                                        )}
                                                      {bio !== "" ? (
                                                        <p>{bio}</p>
                                                      ) : (
                                                          <p>
                                                            {t("dontHaveBioYet")}
                                                          </p>
                                                        )}
                                                    </div>
                                                  </div>

                                                  <div className="user-badges">
                                                    {newBadges.length > 0 &&
                                                      newBadges.findIndex(
                                                        ub => ub.id === id
                                                      ) !== -1 ? (
                                                        <React.Fragment>
                                                          {newBadges[
                                                            newBadges.findIndex(
                                                              ub => ub.id === id
                                                            )
                                                          ].badges.map(
                                                            (ubadge, index) => {
                                                              if (
                                                                profileBadgeUrl.length >
                                                                0 &&
                                                                profileBadgeUrl.findIndex(
                                                                  pbu =>
                                                                    pbu === ubadge
                                                                ) !== -1
                                                              )
                                                                return null;
                                                              return (
                                                                <Badge
                                                                  key={index}
                                                                  profileBadgeUrl={
                                                                    ubadge
                                                                  }
                                                                />
                                                              );
                                                            }
                                                          )}
                                                        </React.Fragment>
                                                      ) : null}
                                                    {profileBadgeUrl.map(
                                                      (badgeUrl, index) => (
                                                        <Badge
                                                          key={index}
                                                          profileBadgeUrl={
                                                            badgeUrl
                                                          }
                                                        />
                                                      )
                                                    )}
                                                  </div>

                                                  <ParticipantSkills
                                                    pathId={
                                                      this.props.match.params
                                                        .pathId
                                                    }
                                                    skills={skills}
                                                    lowColor={lowColor}
                                                    highColor={highColor}
                                                    people={people.node}
                                                  />

                                                  {/* {skills.edges.length > 1000 && (
																								<ul className="content-items">
																									{skills.edges.map(
																										(skill, skillIndex) => {
																											return (
																												<SkillItemPeople key={skill.node.id} name="My progress" title={skill.node.title} url={`/skill/${skill.node.id}`} averageValue={Math.floor(skill.node.averageValue * 100, 0)} value={Math.floor(skill.node.value * 100, 0)} orgTargetValue={Math.floor(Math.random() * 30) + 70} industryAvg="100" globalAvg="100" showTarget="True" />
																											)
																										}
																									)}
																								</ul>
																							)} */}

                                                  {/* {skills.edges.length > 0 &&
																								<div className="participants-skill">
																									<hr />
																									<h4><span className="fa fa-list"></span> Skill Progress</h4>
																									<div className="participants-skill-list">
																										{skills.edges.map((skill, index) => (
																											<div className="skill-block" key={index}>
																												<Link to={`/skill/${skill.node.id}`}>
																													<img src={skill.node.imageUrl} alt={skill.node.title} />
																													<span className="skill-block-title">{skill.node.title}</span>
																												</Link>
																											</div>
																										))}
																									</div>
																								</div>
																							} */}
                                                </div>
                                              );
                                            }
                                          )}
                                      </div>
                                      <button
                                        className="close-reveal"
                                        onClick={() =>
                                          this.handleClosePeopleModal()
                                        }
                                      >
                                        &times;
                                      </button>
                                    </Modal>
                                  </React.Fragment>
                                );
                              }}
                            </Query>
                          </div>
                          <div
                            className={
                              this.state.activeTab === "outline"
                                ? "tabs-item active"
                                : "tabs-item"
                            }
                            id="tab-outline"
                          >
                            <div className="path-outline">
                              {steps.edges.map((step, stepIndex) => {
                                const { completed } = step.node;
                                return (
                                  <div
                                    className={`step-progress ${
                                      completed ? "completed" : "uncomplete"
                                      }`}
                                    key={step.node.id + step.node.title}
                                    style={
                                      completed ? { borderColor: lowColor } : {}
                                    }
                                  >
                                    <div className="step-progress-header">
                                      <div className="flex-container align-between">
                                        <h6>
                                          <a
                                            href={`#step-${stepIndex}`}
                                            onClick={ev =>
                                              this.selectContent(stepIndex, ev)
                                            }
                                          >
                                            {step.node.title}
                                          </a>
                                        </h6>
                                        <div className={`step-progress-status`}>
                                          <span
                                            className="fa fa-check"
                                            style={
                                              completed
                                                ? { color: lowColor }
                                                : {}
                                            }
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    <div className="step-progress-content">
                                      {step.node.contents.edges.length > 0 && (
                                        <ul className="content-items">
                                          {step.node.contents.edges.map(
                                            (content, contentIndex) => {
                                              if (content.node.contentType !== 'vuocontent' && content.node.contentType !== 'filecontent' && content.node.contentType !== 'sellablecontent_path') return null;
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
                                                  className={`content-item ${unAnsweredCount > 0 ? 'unanswered' : ''}`}
                                                  key={content.node.id}
                                                >
                                                  <a
                                                    href={`#content-${stepIndex}-${contentIndex}`}
                                                    onClick={ev =>
                                                      this.selectDocument(
                                                        stepIndex,
                                                        contentIndex,
                                                        ev
                                                      )
                                                    }
                                                  >
                                                    <span className="block-link">
                                                      <span
                                                        className="fa fa-circle"
                                                        style={{
                                                          color: lowColor
                                                        }}
                                                      ></span>
                                                      {content.node.title !==
                                                        "" ? (
                                                          content.node.title
                                                        ) : (
                                                          <em>{t("noname")}</em>
                                                        )}
                                                      {unAnsweredCount > 0 && (
                                                        <span className="unanswered-block" style={{ background: lowColor, color: highColor }}>
                                                          <span className="count">{unAnsweredCount}</span>
                                                        </span>
                                                      )}
                                                    </span>
                                                  </a>
                                                </li>
                                              );
                                            }
                                          )}
                                        </ul>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="cell small-12 medium-8 large-6">
                    <div className="main-content-tabs">
                      <ul className="tabs tabs-center">
                        <li
                          className={mainTab === "contents" ? "active" : ""}
                          style={
                            mainTab === "contents"
                              ? {}
                              : {}
                          }
                          onClick={() => this.changeMainTab("contents")}
                        >
                          {t("contents")}
                        </li>
                        {tickerEnabled && (
                          <li
                            className={mainTab === "ticker" ? "active" : ""}
                            style={
                              mainTab === "ticker"
                                ? {}
                                : {}
                            }
                            onClick={() => this.changeMainTab("ticker")}
                          >
                            {t("ticker")}
                          </li>
                        )}
                        <li
                          className={mainTab === "discussions" ? "active" : ""}
                          style={
                            mainTab === "discussions"
                              ? {}
                              : {}
                          }
                          onClick={() => this.changeMainTab("discussions")}
                        >
                          {t("discussions")}
                        </li>
                      </ul>
                    </div>
                    {mainTab === "discussions" && (
                      <div>
                        {selectedStep ? (
                          <StepTimeline
                            pathId={this.props.match.params.pathId}
                            step={selectedStep}
                            lowColor={lowColor}
                            highColor={highColor}
                            maxColor={maxColor}
                            close={this.closeDiscussion}
                          />
                        ) : (
                            <div className="select-topics">
                              <div className="box-icon">
                                <span className="fa fa-hand-o-right"></span>
                              </div>
                              <p>
                                {t("selectOneOf")} <strong>{t("topics")}</strong>
                              </p>
                            </div>
                          )}
                      </div>
                    )}
                    {mainTab === "contents" && (
                      <div className="my-path-detail">
                        <div
                          className="path-content path-viewer"
                          ref={viewer => (this.viewer = viewer)}
                        >
                          <div className="path-content-viewer">
                            <div
                              className="path-background-overlay"
                              style={{ background: lowColor }}
                            />
                            <div className="steps-container">
                              <ImagesLoaded
                                onAlways={() => this.imagesLoaded()}
                              >
                                {steps.edges.map((step, stepIndex) => {
                                  const stepOwner = step.node.owner;
                                  const ownerName = stepOwner.firstName !== '' ? stepOwner.lastName !== '' ? stepOwner.firstName + ' ' + stepOwner.lastName : stepOwner.firstName : stepOwner.username;
                                  const ownerImage = stepOwner.profilePictureUrl;
                                  return (
                                    <div
                                      id={`viewer-step-${stepIndex}`}
                                      className="viewer-step"
                                      key={step.node.id}
                                      style={{ color: maxColor }}
                                    >
                                      <a
                                        href="#anchor"
                                        className="step-anchor"
                                        id={`step-${stepIndex}`}
                                        name={`step-${stepIndex}`}
                                      >
                                        &nbsp;
                                      </a>
                                      <div
                                        className="viewer-overlay"
                                        style={{
                                          background: `linear-gradient(to bottom,rgba(255, 255, 255, 0) 50%,rgba(255, 255, 255, 0) 66%,rgba(255, 255, 255, 0) 58%, ${highColor} 100%)`
                                        }}
                                      />
                                      <div className="viewer-content">
                                        <h3>{step.node.title}</h3>
                                        <p>{step.node.description}</p>
                                        {step.node.contents.edges.length >
                                          0 && (
                                            <div className="viewer-image">
                                              {step.node.contents.edges.map(
                                                (content, contentIndex) => {
                                                  // const marketItem = content.node.marketItem ? content.node.marketItem : null;
                                                  // // console.log(marketItem);
                                                  if (content.node.contentType !== 'vuocontent' && content.node.contentType !== 'filecontent' && content.node.contentType !== 'sellablecontent_path') return null;
                                                  return (
                                                    <div
                                                      className="viewer-image-item"
                                                      key={content.node.id}
                                                    >
                                                      <a
                                                        href="#anchor"
                                                        className="step-anchor"
                                                        id={`content-${stepIndex}-${contentIndex}`}
                                                        name={`content-${stepIndex}-${contentIndex}`}
                                                      >
                                                        &nbsp;
                                                    </a>
                                                      {content.node.imageUrl && (
                                                        <img
                                                          src={`${
                                                            content.node.imageUrl
                                                            }?t=${new Date().getTime()}`}
                                                          alt={content.node.title}
                                                        />
                                                      )}
                                                      <MaterialLink content={content} pathId={this.props.match.params.pathId} stepIndex={stepIndex} selectedDocument={selectedDocument} contentIndex={contentIndex} lowColor={lowColor} highColor={highColor} />
                                                    </div>
                                                  );
                                                }
                                              )}
                                            </div>
                                          )}
                                        <div className="viewer-action">
                                          <div className="flex-container align-middle align-between">
                                            <Mutation
                                              mutation={COMPLETE_STEP}
                                            // UPDATE CACHE IS NOT POSSIBLE RIGHT NOW, TOO DEEP OBJECT, EITHER REFETCH, OR MORE INVESTIGATION NEEDED ON HOW TO SIMPLIFY THIS METHOD
                                            // update={(cache, { data: {completeStep}}) => {
                                            // const { viewer } = cache.readQuery({ query: getAuthPath2, variables:	{ pathId: this.props.match.params.pathId}});
                                            // console.log(viewer)
                                            // console.log(completeStep)
                                            // cache.writeQuery({
                                            // 	query: getAuthPath2,
                                            // 	data: { viewer: newViewer  }
                                            // });
                                            // }}
                                            >
                                              {(completeStep, { data }) => {
                                                if (data)
                                                  return (
                                                    <div
                                                      className={`viewer-complete-step ${
                                                        data.completeStep.step
                                                          .completed
                                                          ? "completed"
                                                          : "uncomplete"
                                                        }`}
                                                      style={
                                                        data.completeStep.step
                                                          .completed
                                                          ? {
                                                            background: highColor
                                                          }
                                                          : {
                                                            background: lowColor
                                                          }
                                                      }
                                                      title={
                                                        data.completeStep.step
                                                          .completed
                                                          ? `Mark step as Uncomplete ?`
                                                          : `Mark step as complete`
                                                      }
                                                      onClick={async () => {
                                                        await completeStep({
                                                          variables: {
                                                            clientMutationId:
                                                              step.node.id,
                                                            stepId:
                                                              step.node.id,
                                                            isCompleted: !data
                                                              .completeStep.step
                                                              .completed
                                                          }
                                                        });
                                                        refetch();
                                                      }}
                                                    >
                                                      <span
                                                        className="fa fa-check-square-o"
                                                        style={
                                                          data.completeStep.step
                                                            .completed
                                                            ? {
                                                              color: lowColor
                                                            }
                                                            : {
                                                              color: highColor
                                                            }
                                                        }
                                                      />
                                                      <span className="text">
                                                        {step.node.completed
                                                          ? t("completed")
                                                          : t("notCompleted")}
                                                      </span>
                                                    </div>
                                                  );
                                                return (
                                                  <div
                                                    className={`viewer-complete-step ${
                                                      step.node.completed
                                                        ? "completed"
                                                        : "uncomplete"
                                                      }`}
                                                    style={
                                                      step.node.completed
                                                        ? {
                                                          background: highColor
                                                        }
                                                        : {
                                                          background: lowColor
                                                        }
                                                    }
                                                    title={
                                                      step.node.completed
                                                        ? `Mark step as Uncomplete ?`
                                                        : `Mark step as complete`
                                                    }
                                                    onClick={async () => {
                                                      await completeStep({
                                                        variables: {
                                                          clientMutationId:
                                                            step.node.id,
                                                          stepId: step.node.id,
                                                          isCompleted: !step
                                                            .node.completed
                                                        }
                                                      });
                                                      refetch();
                                                    }}
                                                  >
                                                    <span
                                                      className="fa fa-check-square-o"
                                                      style={
                                                        step.node.completed
                                                          ? { color: lowColor }
                                                          : { color: highColor }
                                                      }
                                                    />
                                                    <span className="text">
                                                      {step.node.completed
                                                        ? t("completed")
                                                        : t("notCompleted")}
                                                    </span>
                                                  </div>
                                                );
                                              }}
                                            </Mutation>

                                            <div className="viewer-avatar">
                                              <span className="mentor-name">
                                                {ownerName}
                                              </span>
                                              <span className="image">
                                                <img
                                                  src={ownerImage}
                                                  alt={ownerName}
                                                  title={ownerName}
                                                />
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </ImagesLoaded>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {mainTab === "ticker" && tickerEnabled && (
                      <React.Fragment>
                        <div className="ticker">
                          {/* <div className="ticker-dashboard">
														<h4>Ticker Discussion</h4>
														<p>{t('newFeatureWarning')}</p>
														<hr />
														<div className="mentor-ticker-discussion-container">

														</div>
													</div> */}

                          <Query
                            query={GET_TICKERS}
                            variables={{
                              pathId: this.props.match.params.pathId
                            }}
                            fetchPolicy="network-only"
                            onCompleted={data => {
                              if (data) {
                                const dataToPush = data.viewer.tickers.edges;
                                this.initTickerData(dataToPush);
                              }
                            }}
                          >
                            {({ loading, error, data, refetch }) => {
                              if (loading)
                                return (
                                  <Loader active content={t("loading")} indeterminate={true} size="small" />
                                );
                              if (error) return <p>{t("error")}</p>;
                              // const { tickers } = data || null;
                              const { viewer } = data || null;
                              const { tickerSummary } = data.viewer || null;
                              const weightSummary =
                                tickerSummary && tickerSummary.weight
                                  ? tickerSummary.weight.toFixed(2) * -1
                                  : null;
                              const waistSummary =
                                tickerSummary && tickerSummary.waist
                                  ? tickerSummary.waist.toFixed(2) * -1
                                  : null;
                              const totalDays =
                                tickerSummary && tickerSummary.totalDays
                                  ? tickerSummary.totalDays
                                  : "-";
                              const displayName =
                                viewer &&
                                  (viewer.firstName !== "" ||
                                    viewer.lastName !== "")
                                  ? `${viewer.firstName} ${viewer.lastName}`
                                  : viewer.firstName === "" &&
                                    viewer.lastName === ""
                                    ? viewer.username
                                    : viewer.firstName === ""
                                      ? viewer.lastName
                                      : viewer.firstName;

                              if (tickerData.length === 0)
                                return (
                                  <div className="user-ticker-container">
                                    <div className="user-ticker-header">
                                      {viewer && (
                                        <h3>
                                          <strong>My ticker</strong>:{" "}
                                          {displayName}
                                        </h3>
                                      )}
                                      {availableMentors.length > 0 && (
                                        <div className="available-mentor-container">
                                          {pathCoach ? (
                                            <span>
                                              Mentor: {coachName}
                                              <img
                                                src={
                                                  pathCoach.profilePictureUrl
                                                }
                                                alt={coachName}
                                                width="20"
                                                height="20"
                                              />
                                            </span>
                                          ) : (
                                              <a onClick={this.openChooseMentor} href="#choose">
                                                Choose mentor{" "}
                                                <span className="fa fa-caret-down"></span>
                                              </a>
                                            )}
                                          <Modal
                                            isOpen={
                                              this.state.chooseMentorModal
                                            }
                                            contentLabel="Choose Mentor"
                                            onRequestClose={
                                              this.closeChooseMentor
                                            }
                                            className="reveal small reveal-choose-mentor "
                                            ariaHideApp={false}
                                          >
                                            <div className="choose-mentor-container">
                                              <h4>Choose mentor first</h4>
                                              <hr />
                                              <div className="choose-mentor-list">
                                                {availableMentors.map(
                                                  (mentor, index) => {
                                                    const {
                                                      id,
                                                      firstName,
                                                      lastName,
                                                      username,
                                                      profilePictureUrl
                                                    } = mentor.node;
                                                    const mentorName =
                                                      firstName === "" &&
                                                        lastName === ""
                                                        ? username
                                                        : `${firstName} ${lastName}`;
                                                    return (
                                                      <div
                                                        className={`choose-mentor-item ${
                                                          selectedMentor === id
                                                            ? "selected"
                                                            : ""
                                                          }`}
                                                        key={id + index}
                                                        onClick={() =>
                                                          this.selectMentor(id)
                                                        }
                                                      >
                                                        <img
                                                          src={
                                                            profilePictureUrl
                                                          }
                                                          alt={username}
                                                          width="48"
                                                          height="48"
                                                        />
                                                        <span className="text">
                                                          {mentorName}
                                                        </span>
                                                      </div>
                                                    );
                                                  }
                                                )}
                                              </div>
                                              <hr />
                                              <div className="text-center">
                                                {selectedMentor ? (
                                                  <Mutation
                                                    mutation={SET_COACH}
                                                    onCompleted={data => {
                                                      if (data) {
                                                        mainRefetch();
                                                        this.closeChooseMentor();
                                                      }
                                                    }}
                                                  >
                                                    {(setCoach, { data }) => {
                                                      if (data) return null;
                                                      return (
                                                        <button
                                                          className="button large success"
                                                          type="button"
                                                          onClick={async () => {
                                                            await setCoach({
                                                              variables: {
                                                                pathId: this
                                                                  .props.match
                                                                  .params
                                                                  .pathId,
                                                                coachId: selectedMentor
                                                              }
                                                            });
                                                          }}
                                                        >
                                                          {t("choose")}
                                                        </button>
                                                      );
                                                    }}
                                                  </Mutation>
                                                ) : (
                                                    <button
                                                      disabled
                                                      className="button disabled"
                                                    >
                                                      Choose
                                                    </button>
                                                  )}
                                              </div>
                                            </div>
                                            <button
                                              className="close-reveal"
                                              onClick={this.closeChooseMentor}
                                            >
                                              &times;
                                            </button>
                                          </Modal>
                                        </div>
                                      )}
                                    </div>
                                    <div className="ticker-container">
                                      <div className="ticker-summary">
                                        <div className="ticker-date">
                                          <strong>{totalDays}</strong>
                                          <small>
                                            {totalDays !== 0
                                              ? t("days")
                                              : t("day")}
                                          </small>
                                        </div>
                                        <div className="ticker-keys">
                                          <div
                                            className={`ticker-key ticker-key-weight`}
                                          >
                                            <strong>
                                              {weightSummary
                                                ? weightSummary
                                                : "-"}
                                            </strong>
                                            <span className="ticker-unit">
                                              kg
                                            </span>
                                          </div>
                                          <div
                                            className={`ticker-key ticker-key-waist`}
                                          >
                                            <strong>
                                              {waistSummary
                                                ? waistSummary
                                                : "-"}
                                            </strong>
                                            <span className="ticker-unit">
                                              cm
                                            </span>
                                          </div>
                                        </div>
                                        <div className="ticker-note">
                                          {t("greatKeepItUp")}
                                        </div>
                                      </div>

                                      <div className="ticker-progress">
                                        <div className="ticker-empty">
                                          <div className="ticker-item ticker-empty">
                                            {t("pleaseAddFirstProgress")}
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
                                            <h3>{t("updateYourProgress")}</h3>
                                            <hr />
                                            <div className="entry-ticker">
                                              <Mutation
                                                mutation={INPUT_TICKER}
                                                onCompleted={data => {
                                                  if (data) {
                                                    const {
                                                      tickerInput
                                                    } = data;
                                                    const newNode = [
                                                      {
                                                        node:
                                                          tickerInput.tickerNode
                                                      }
                                                    ];
                                                    this.updateTickerData(
                                                      newNode
                                                    );
                                                    refetch();
                                                  }
                                                }}
                                              >
                                                {(tickerInput, { data }) => {
                                                  if (data) return null;
                                                  return (
                                                    <div>
                                                      <div className="entry-date">
                                                        <strong>
                                                          <span className="fa fa-calendar"></span>{" "}
                                                          {currentDate}
                                                        </strong>
                                                      </div>

                                                      <div className="entry-input">
                                                        <div className="entry-box">
                                                          <label htmlFor="key-weight">
                                                            <span className="text">
                                                              {t("your")}
                                                            </span>
                                                            <select
                                                              onChange={
                                                                this
                                                                  .changeTickerKey
                                                              }
                                                              value={
                                                                this.state
                                                                  .selectedKey
                                                              }
                                                            >
                                                              <option value="weight">
                                                                {t("weight")}
                                                              </option>
                                                              <option value="waist">
                                                                {t("waist")}
                                                              </option>
                                                            </select>
                                                            <span className="text">
                                                              :
                                                            </span>
                                                          </label>
                                                          <input
                                                            type="number"
                                                            name="keyValue"
                                                            id="key-value"
                                                            step="any"
                                                            value={
                                                              this.state
                                                                .keyValue
                                                            }
                                                            onChange={
                                                              this
                                                                .changeKeyValue
                                                            }
                                                            className={`ticker-input ${
                                                              this.state
                                                                .selectedKey ===
                                                                "waist"
                                                                ? "input-waist"
                                                                : "input-weight"
                                                              }`}
                                                          />
                                                        </div>
                                                      </div>

                                                      {/* <div className="entry-mentor">
																										<div className="flex-container align-middle" style={{ whiteSpace: 'nowrap' }}>
																											<label htmlFor="mentor-notes" style={{ marginBottom: '1rem', marginRight: '1rem' }}>Notes for mentor:</label>
																											<select name="select-mentor" id="select-mentor" style={{ width: 'auto' }} disabled defaultValue="1">
																												<option value="1">Mentor 01</option>
																											</select>
																										</div>
																										<textarea name="mentor-notes" id="mentor-notes" cols="30" rows="3" placeholder="Write some notes to your mentor.."></textarea>
																									</div> */}

                                                      <div className="entry-action">
                                                        <button
                                                          className="button large success"
                                                          type="button"
                                                          onClick={async () => {
                                                            await tickerInput({
                                                              variables: {
                                                                clientMutationId: this
                                                                  .state
                                                                  .selectedKey,
                                                                courseId: this
                                                                  .props.match
                                                                  .params
                                                                  .pathId,
                                                                userId: this
                                                                  .props.userId,
                                                                title: this
                                                                  .state
                                                                  .selectedKey,
                                                                value: this
                                                                  .state
                                                                  .keyValue
                                                              }
                                                            });
                                                          }}
                                                        >
                                                          {t("submit")}
                                                        </button>
                                                      </div>
                                                    </div>
                                                  );
                                                }}
                                              </Mutation>
                                            </div>
                                          </div>
                                          <button
                                            className="close-reveal"
                                            onClick={() =>
                                              this.closeTickerModal()
                                            }
                                          >
                                            &times;
                                          </button>
                                        </Modal>
                                      </div>
                                      <div
                                        className="ticker-action"
                                        onClick={
                                          pathCoach
                                            ? this.openTickerModal
                                            : this.openChooseMentor
                                        }
                                      >
                                        <div className="ticker-date">
                                          <strong>
                                            <Moment format="DD">
                                              {new Date().getTime()}
                                            </Moment>
                                          </strong>
                                          <small>
                                            <Moment format="MMM">
                                              {new Date().getTime()}
                                            </Moment>
                                          </small>
                                        </div>
                                        <div className="ticker-keys">
                                          <div className="ticker-btn ticker-success">
                                            <span className="fa fa-plus"></span>
                                          </div>
                                          {/* <div className="ticker-btn ticker-btn2">
																					<span className="fa fa-plus"></span>
																				</div> */}
                                        </div>
                                        <div className="ticker-note">
                                          {t("howDoYouFeelToday")}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              return (
                                <div className="user-ticker-container">
                                  <div className="user-ticker-header">
                                    {viewer && (
                                      <h3>
                                        <strong>My ticker</strong>:{" "}
                                        {displayName}
                                      </h3>
                                    )}
                                    {availableMentors.length > 0 && (
                                      <div className="available-mentor-container">
                                        {pathCoach ? (
                                          <span>
                                            Coach: {coachName}
                                            <img
                                              src={pathCoach.profilePictureUrl}
                                              alt={coachName}
                                              width="20"
                                              height="20"
                                            />
                                          </span>
                                        ) : (
                                            <a onClick={this.openChooseMentor} href="#mentor">
                                              Choose mentor{" "}
                                              <span className="fa fa-caret-down"></span>
                                            </a>
                                          )}
                                        <Modal
                                          isOpen={this.state.chooseMentorModal}
                                          contentLabel="Choose Mentor"
                                          onRequestClose={
                                            this.closeChooseMentor
                                          }
                                          className="reveal small reveal-choose-mentor "
                                          ariaHideApp={false}
                                        >
                                          <div className="choose-mentor-container">
                                            <h4>Choose mentor first</h4>
                                            <hr />
                                            <div className="choose-mentor-list">
                                              {availableMentors.map(
                                                (mentor, index) => {
                                                  const {
                                                    id,
                                                    firstName,
                                                    lastName,
                                                    username,
                                                    profilePictureUrl
                                                  } = mentor.node;
                                                  const mentorName =
                                                    firstName === "" &&
                                                      lastName === ""
                                                      ? username
                                                      : `${firstName} ${lastName}`;
                                                  return (
                                                    <div
                                                      className={`choose-mentor-item ${
                                                        selectedMentor === id
                                                          ? "selected"
                                                          : ""
                                                        }`}
                                                      key={id + index}
                                                      onClick={() =>
                                                        this.selectMentor(id)
                                                      }
                                                    >
                                                      <img
                                                        src={profilePictureUrl}
                                                        alt={username}
                                                        width="48"
                                                        height="48"
                                                      />
                                                      <span className="text">
                                                        {mentorName}
                                                      </span>
                                                    </div>
                                                  );
                                                }
                                              )}
                                            </div>
                                            <hr />
                                            <div className="text-center">
                                              {selectedMentor ? (
                                                <Mutation
                                                  mutation={SET_COACH}
                                                  onCompleted={data => {
                                                    if (data) {
                                                      // const { coachNode } = data;
                                                      // this.selectNewMentor(coachNode);
                                                      mainRefetch();
                                                      this.closeChooseMentor();
                                                    }
                                                  }}
                                                >
                                                  {(setCoach, { data }) => {
                                                    if (data) return null;
                                                    return (
                                                      <button
                                                        className="button"
                                                        type="button"
                                                        onClick={async () => {
                                                          await setCoach({
                                                            variables: {
                                                              pathId: this.props
                                                                .match.params
                                                                .pathId,
                                                              coachId: selectedMentor
                                                            }
                                                          });
                                                        }}
                                                      >
                                                        {t("choose")}
                                                      </button>
                                                    );
                                                  }}
                                                </Mutation>
                                              ) : (
                                                  <button
                                                    disabled
                                                    className="button disabled"
                                                  >
                                                    Choose
                                                  </button>
                                                )}
                                            </div>
                                          </div>
                                          <button
                                            className="close-reveal"
                                            onClick={this.closeChooseMentor}
                                          >
                                            &times;
                                          </button>
                                        </Modal>
                                      </div>
                                    )}
                                  </div>
                                  <div className="ticker-container">
                                    <div className="ticker-summary">
                                      <div className="ticker-date">
                                        <strong>{totalDays}</strong>
                                        <small>
                                          {totalDays !== 0
                                            ? t("days")
                                            : t("day")}
                                        </small>
                                      </div>
                                      <div className="ticker-keys">
                                        <div
                                          className={`ticker-key ticker-key-weight`}
                                        >
                                          <strong>
                                            {weightSummary
                                              ? weightSummary
                                              : "-"}
                                          </strong>
                                          <span className="ticker-unit">
                                            kg
                                          </span>
                                        </div>
                                        <div
                                          className={`ticker-key ticker-key-waist`}
                                        >
                                          <strong>
                                            {waistSummary ? waistSummary : "-"}
                                          </strong>
                                          <span className="ticker-unit">
                                            cm
                                          </span>
                                        </div>
                                      </div>
                                      <div className="ticker-note">
                                        {t("greatKeepItUp")}
                                      </div>
                                    </div>

                                    <div className="ticker-progress">
                                      {tickerData.length > 0 &&
                                        tickerData.map((ticker, index) => {
                                          const {
                                            timestamp,
                                            id,
                                            value,
                                            title
                                          } = ticker.node;
                                          const keyIndex = tickerKeys.findIndex(
                                            t => t.title === title
                                          );
                                          if (keyIndex === -1) return null;
                                          const tickerTime = new Date(
                                            timestamp
                                          );
                                          const tickerDate = `${
                                            months[tickerTime.getMonth()]
                                            } ${tickerTime.getDate()}, ${tickerTime.getFullYear()} - ${tickerTime.getHours()}:${tickerTime.getMinutes()}:${tickerTime.getSeconds()}`;
                                          return (
                                            <div
                                              className="ticker-item"
                                              key={id + index}
                                            >
                                              <div
                                                className="ticker-date"
                                                title={tickerDate}
                                              >
                                                <strong>
                                                  <Moment format="DD">
                                                    {timestamp}
                                                  </Moment>
                                                </strong>
                                                <small>
                                                  <Moment format="MMM">
                                                    {timestamp}
                                                  </Moment>
                                                </small>
                                              </div>
                                              <div className="ticker-keys">
                                                <div
                                                  className={`ticker-key ticker-key-${title}`}
                                                >
                                                  <strong>{value}</strong>
                                                  <span className="ticker-unit">
                                                    {tickerKeys[keyIndex].unit}
                                                  </span>
                                                </div>
                                                {/* <div className="ticker-key ticker-key2">
																							<strong>110</strong>
																							<span className="ticker-unit">cm</span>
																						</div> */}
                                              </div>
                                              {pathCoach ? (
                                                <div
                                                  className="ticker-message-count"
                                                  onClick={() =>
                                                    this.openTickerDiscussionModal(
                                                      id
                                                    )
                                                  }
                                                  title="Open Discussion"
                                                >
                                                  <span className="fa fa-comments-o"></span>
                                                </div>
                                              ) : (
                                                  <div
                                                    className="ticker-message-count"
                                                    onClick={this.openChooseMentor}
                                                    title="Open Discussion"
                                                  >
                                                    <span className="fa fa-comments-o"></span>
                                                  </div>
                                                )}

                                            </div>
                                          );
                                        })}
                                      <Modal
                                        isOpen={this.state.openTicker}
                                        contentLabel="Ticker Information"
                                        onRequestClose={this.closeTickerModal}
                                        className="reveal reveal-ticker "
                                        ariaHideApp={false}
                                      >
                                        <div className="ticker-modal-container">
                                          <h3>{t("updateYourProgress")}</h3>
                                          <hr />
                                          <div className="entry-ticker">
                                            <Mutation
                                              mutation={INPUT_TICKER}
                                              onCompleted={data => {
                                                if (data) {
                                                  const { tickerInput } = data;
                                                  const newNode = [
                                                    {
                                                      node:
                                                        tickerInput.tickerNode
                                                    }
                                                  ];
                                                  this.updateTickerData(
                                                    newNode
                                                  );
                                                  refetch();
                                                }
                                              }}
                                            >
                                              {(tickerInput, { data }) => {
                                                if (data) return null;
                                                return (
                                                  <div>
                                                    <div className="entry-date">
                                                      <strong>
                                                        <span className="fa fa-calendar"></span>{" "}
                                                        {currentDate}
                                                      </strong>
                                                    </div>

                                                    <div className="entry-input">
                                                      <div className="entry-box">
                                                        <label htmlFor="key-weight">
                                                          <span className="text">
                                                            {t("your")}
                                                          </span>
                                                          <select
                                                            onChange={
                                                              this
                                                                .changeTickerKey
                                                            }
                                                            value={
                                                              this.state
                                                                .selectedKey
                                                            }
                                                          >
                                                            <option value="weight">
                                                              {t("weight")}
                                                            </option>
                                                            <option value="waist">
                                                              {t("waist")}
                                                            </option>
                                                          </select>
                                                          <span className="text">
                                                            :
                                                          </span>
                                                        </label>
                                                        <input
                                                          type="number"
                                                          name="keyValue"
                                                          id="key-value"
                                                          step="any"
                                                          value={
                                                            this.state.keyValue
                                                          }
                                                          onChange={
                                                            this.changeKeyValue
                                                          }
                                                          className={`ticker-input ${
                                                            this.state
                                                              .selectedKey ===
                                                              "waist"
                                                              ? "input-waist"
                                                              : "input-weight"
                                                            }`}
                                                        />
                                                      </div>
                                                    </div>

                                                    {/* <div className="entry-mentor">
																										<div className="flex-container align-middle" style={{ whiteSpace: 'nowrap' }}>
																											<label htmlFor="mentor-notes" style={{ marginBottom: '1rem', marginRight: '1rem' }}>Notes for mentor:</label>
																											<select name="select-mentor" id="select-mentor" style={{ width: 'auto' }} disabled defaultValue="1">
																												<option value="1">Mentor 01</option>
																											</select>
																										</div>
																										<textarea name="mentor-notes" id="mentor-notes" cols="30" rows="3" placeholder="Write some notes to your mentor.."></textarea>
																									</div> */}

                                                    <div className="entry-action">
                                                      <button
                                                        className="button large success"
                                                        type="button"
                                                        onClick={async () => {
                                                          await tickerInput({
                                                            variables: {
                                                              clientMutationId: this
                                                                .state
                                                                .selectedKey,
                                                              courseId: this
                                                                .props.match
                                                                .params.pathId,
                                                              userId: this.props
                                                                .userId,
                                                              title: this.state
                                                                .selectedKey,
                                                              value: this.state
                                                                .keyValue
                                                            }
                                                          });
                                                        }}
                                                      >
                                                        {t("submit")}
                                                      </button>
                                                    </div>
                                                  </div>
                                                );
                                              }}
                                            </Mutation>
                                          </div>
                                        </div>
                                        <button
                                          className="close-reveal"
                                          onClick={() =>
                                            this.closeTickerModal()
                                          }
                                        >
                                          &times;
                                        </button>
                                      </Modal>
                                    </div>
                                    <div
                                      className="ticker-action"
                                      onClick={
                                        pathCoach
                                          ? this.openTickerModal
                                          : this.openChooseMentor
                                      }
                                    >
                                      <div className="ticker-date">
                                        <strong>
                                          <Moment format="DD">
                                            {new Date().getTime()}
                                          </Moment>
                                        </strong>
                                        <small>
                                          <Moment format="MMM">
                                            {new Date().getTime()}
                                          </Moment>
                                        </small>
                                      </div>
                                      <div className="ticker-keys">
                                        <div className="ticker-btn ticker-success">
                                          <span className="fa fa-plus"></span>
                                        </div>
                                        {/* <div className="ticker-btn ticker-btn2">
																					<span className="fa fa-plus"></span>
																				</div> */}
                                      </div>
                                      <div className="ticker-note">
                                        {t("howDoYouFeelToday")}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            }}
                          </Query>

                          {isMentor && (
                            <MentorTickers
                              pathId={this.props.match.params.pathId}
                              mentorId={this.props.userId}
                              isMentor={isMentor}
                              mentor={
                                mentorMastodonUsername
                                  ? mentorMastodonUsername
                                  : null
                              }
                            />
                          )}

                          <Modal
                            isOpen={this.state.openTicker2}
                            contentLabel="Ticker Information2"
                            onRequestClose={this.closeTickerModal2}
                            className="reveal reveal-ticker "
                            ariaHideApp={false}
                          >
                            <div className="ticker-modal-container">
                              <h3>{t("updateYourProgress")}</h3>
                              <hr />
                              <div className="entry-ticker">
                                <Mutation mutation={INPUT_TICKER}>
                                  {(tickerInput, { data }) => {
                                    if (data) return null;
                                    return (
                                      <div>
                                        <div className="entry-date">
                                          {/* <label>Today:</label> */}
                                          <strong>
                                            <span className="fa fa-calendar"></span>{" "}
                                            April 15, 2019 - 11:55:12
                                          </strong>
                                        </div>

                                        <div className="entry-input">
                                          <div className="entry-box">
                                            <label htmlFor="key-weight">
                                              <span className="text">
                                                Your weight:
                                              </span>
                                              <input
                                                type="number"
                                                name="ticker"
                                                id="key-weight"
                                                step="any"
                                              />
                                              <span className="unit">kg</span>
                                            </label>
                                          </div>
                                          <div className="entry-box">
                                            <label htmlFor="key-waist">
                                              <span className="text">
                                                Your waist:
                                              </span>
                                              <input
                                                type="number"
                                                className="key-2"
                                                name="waist"
                                                id="key-waist"
                                                step="any"
                                                value="112"
                                                disabled
                                              />
                                              <span className="unit">cm</span>
                                            </label>
                                          </div>
                                        </div>

                                        <div className="entry-mentor">
                                          <div
                                            className="flex-container align-middle"
                                            style={{ whiteSpace: "nowrap" }}
                                          >
                                            <label
                                              htmlFor="mentor-notes"
                                              style={{
                                                marginBottom: "1rem",
                                                marginRight: "1rem"
                                              }}
                                            >
                                              Notes for mentor:
                                            </label>
                                            <select
                                              name="select-mentor"
                                              id="select-mentor"
                                              style={{ width: "auto" }}
                                              disabled
                                              defaultValue="1"
                                            >
                                              <option value="1">
                                                Mentor 01
                                              </option>
                                            </select>
                                          </div>
                                          <textarea
                                            name="mentor-notes"
                                            id="mentor-notes"
                                            cols="30"
                                            rows="3"
                                            placeholder="Write some notes to your mentor.."
                                          ></textarea>
                                        </div>

                                        <div className="entry-action">
                                          <button
                                            className="button large"
                                            type="button"
                                            onClick={async () => {
                                              await tickerInput({
                                                variables: {
                                                  clientMutationId: this.state
                                                    .selectedKey,
                                                  courseId: this.props.match
                                                    .param.pathId,
                                                  userId: this.props.userId,
                                                  title: this.state.selectedKey,
                                                  value: this.state.keyValue
                                                }
                                              });
                                            }}
                                          >
                                            {t("submit")}
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  }}
                                </Mutation>
                              </div>
                            </div>
                            <button
                              className="close-reveal"
                              onClick={() => this.closeTickerModal()}
                            >
                              &times;
                            </button>
                          </Modal>

                          {/* <Modal
														isOpen={this.state.openTickerDiscussion}
														contentLabel="Ticker Discussion"
														onRequestClose={this.closeTickerDiscussionModal}
														className="reveal reveal-ticker "
														ariaHideApp={false}
													>
														<div className="ticker-modal-container">
															<h3>{t('discussions')}</h3>
															<hr />
															<div className="entry-ticker">
																<form>
																	<div className="discussion-mentor">
																		<div className="discussion-messages">
																			<div className="msg">
																				<div className="msg-header">
																					<h5>mentor01</h5>
																					<h6>Jun 03, 2019 - 14:54</h6>
																				</div>
																				<p>I see you have progressing nicely last week! Great job</p>
																			</div>
																		</div>

																		<textarea name="mentor-notes" id="mentor-notes" cols="30" rows="2" placeholder="Write some notes to your mentor.."></textarea>
																	</div>

																	<div className="discussion-action">
																		<button type="submit" className="button">{t('submit')}</button>
																	</div>


																</form>
															</div>
														</div>
														<button className="close-reveal" onClick={this.closeTickerDiscussionModal}>
																&times;
														</button>
													</Modal> */}

                          {/*  <Modal
														isOpen={this.state.openTickerDiscussion2}
														contentLabel="Ticker Discussion"
														onRequestClose={this.closeTickerDiscussionModal2}
														className="reveal reveal-ticker "
														ariaHideApp={false}
													>
														<div className="ticker-modal-container">
															<h3>Discussion 2</h3>
															<hr />
															<div className="entry-ticker">
																<form>

																	<div className="discussion-mentor">
																		<div className="discussion-messages">
																			<div className="msg">
																				<div className="msg-header">
																					<h5>mentor01</h5>
																					<h6>Jun 03, 2019 - 14:54</h6>
																				</div>
																				<p>Great job on this!</p>
																			</div>
																			<div className="msg">
																				<div className="msg-header">
																					<h5>ervan.demo</h5>
																					<h6>Jun 03, 2019 - 16:54</h6>
																				</div>
																				<p>Thank you very much!</p>
																			</div>
																			<div className="msg">
																				<div className="msg-header">
																					<h5>ervan.demo</h5>
																					<h6>Jun 04, 2019 - 16:54</h6>
																				</div>
																				<p>I had gained 2 pounds after a buffet party, such a shame</p>
																			</div>

																			<div className="msg">
																				<div className="msg-header">
																					<h5>mentor01</h5>
																					<h6>Jun 05, 2019 - 16:54</h6>
																				</div>
																				<p>It's okay to have such a party sometimes, you can go back on track now :)</p>
																			</div>
																			<div className="msg">
																				<div className="msg-header">
																					<h5>ervan.demo</h5>
																					<h6>Jun 06, 2019 - 08:54</h6>
																				</div>
																				<p>Have lost another pound, i did a morning exercise :)</p>
																			</div>
																		</div>
																		<textarea name="mentor-notes" id="mentor-notes" cols="30" rows="2" placeholder="Write some notes to your mentor.."></textarea>
																	</div>

																	<div className="discussion-action">
																		<button type="submit" className="button">Submit</button>
																	</div>

																</form>
															</div>
														</div>
														<button className="close-reveal" onClick={() => this.closeTickerDiscussionModal2()}>
															&times;
													</button>
													</Modal> */}
                        </div>
                        {this.state.openTickerDiscussion && (
                          <TickerDiscussion
                            pathId={this.props.match.params.pathId}
                            tickerId={this.state.tickerId}
                            mentorId={
                              pathCoach
                                ? pathCoach.id
                                : selectedNewMentor
                                  ? selectedNewMentor.id
                                  : null
                            }
                            close={this.closeTickerDiscussionModal}
                            isMentor={isMentor}
                            mentor={
                              mentorMastodonUsername
                                ? mentorMastodonUsername
                                : null
                            }
                          />
                        )}
                      </React.Fragment>
                    )}
                  </div>
                  <div className="cell small-12 medium-12 large-3">
                    {!mastodonAuthToken ? (
                      <p>{t("chatError")}</p>
                    ) : (
                        <div className="step-chat-container">
                          <ul className="tabs tabs-secondary tabs-right">
                            <li
                              className={activeTab2 === "general" ? "active" : ""}
                              onClick={() => this.handleTabs2Changes("general")}
                            >
                              {t("general")}
                            </li>
                            <li
                              className={activeTab2 === "topics" ? "active" : ""}
                              onClick={() => this.handleTabs2Changes("topics")}
                            >
                              {t("topics")}
                            </li>
                          </ul>
                          <div className="tabs-container">
                            <div
                              className={`tabs-item ${
                                activeTab2 === "general" ? "active" : ""
                                }`}
                              id="general-chat"
                            >
                              <PathTimeline
                                pathId={this.props.match.params.pathId}
                              />
                            </div>
                            <div
                              className={`tabs-item ${
                                activeTab2 === "topics" ? "active" : ""
                                }`}
                              id="topics-chat"
                            >
                              <div className="step-topics">
                                {steps.edges.map((step, stepIndex) => {
                                  const hashtag = decodePathStep(
                                    this.props.match.params.pathId,
                                    step.node.id
                                  );
                                  let storageMyOpenedDiscussion = JSON.parse(
                                    localStorage.getItem("myOpenedDiscussion")
                                  );
                                  if (!storageMyOpenedDiscussion) {
                                    storageMyOpenedDiscussion = [];
                                  }
                                  const isReadGQL =
                                    mastodonTags.length > 0
                                      ? mastodonTags.some(t => t.name === hashtag)
                                      : false;
                                  const isReadLocal =
                                    storageMyOpenedDiscussion.length > 0
                                      ? storageMyOpenedDiscussion.some(
                                        storageArr => storageArr === hashtag
                                      )
                                      : false;

                                  const shouldUnread = isReadGQL && !isReadLocal;

                                  return (
                                    <div
                                      className={`topic-item ${
                                        shouldUnread ? "unread" : ""
                                        }`}
                                      key={step.node.id + stepIndex}
                                    >
                                      <div
                                        className={`viewer-button ${
                                          selectedStep &&
                                            selectedStep.id === step.node.id
                                            ? "active"
                                            : ""
                                          } `}
                                        onClick={() =>
                                          this.handleOpenDiscussion(
                                            step.node,
                                            hashtag
                                          )
                                        }
                                      >
                                        <span className="viewer-comments">
                                          <span className="fa fa-comments-o" />
                                        </span>
                                        <div className="viewer-label">
                                          {step.node.title}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Wrapper>
    );
  }
}

const mapStateToProps = state => {
  return {
    userId: state.auth.userId,
    isMentor: state.auth.isMentor,
    isAuthenticated: state.auth.isAuthenticated,
    mastodonAuthToken: state.auth.mastodonAuthToken,
  };
};

export default compose(
  withRouter,
  connect(
    mapStateToProps,
    null
  ),
  graphql(getAuthPath2, {
    options: props => {
      return {
        fetchPolicy: 'network-only',
        variables: {
          pathId: props.match.params.pathId ? props.match.params.pathId : null,
          stringPathId: props.match.params.pathId ? props.match.params.pathId : null,
          since: (new Date(new Date().setDate(new Date().getDate() - 1)).getTime()) / 1000
        }
      };
    },
  }),
  withTranslation()
)(Path);
