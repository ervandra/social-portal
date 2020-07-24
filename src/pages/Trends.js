import React, { Component } from 'react';
import Wrapper from '../components/layouts/wrapper';
import Navigation from '../components/layouts/Navigation';
// import PathGrid from '../components/global/PathGrid';
// import Conversation from '../components/sections/Conversation';
import TrendDiscussion from '../components/sections/TrendDiscussion';
import { decodeTrend, decodeStickyChat, cleanChats } from '../helpers';
// import Drawer from '../components/global/Drawer';
import { withTranslation } from 'react-i18next';
import Draggable from 'react-draggable';
import Modal from 'react-modal';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Redirect, withRouter } from 'react-router-dom';
import { graphql } from 'react-apollo';
import { getMyProfile } from '../store/gql/queries';
import { getObject } from '../helpers';
// import TimelineEvents from '../components/sections/TimelineEvents';
import SecurePrompt from '../components/sections/SecurePrompt';
import Loader from '../components/global/Loader';
import axios from 'axios';

class Trends extends Component {
  state = {
    isLoading: false,
    isError: false,
    activeTrend: [],
    search: '',
    discussionOpen: false,
    notFound: false,
    hasTrendUpdate: false,
    hasCommentUpdate: false,
    x: 0,
    y: 0,
    allTrendsData: [],
    activeDiscussionTrend: null,
    promptText: '',
    isSubmit: false,
    activeIndex: -1
  }

  handleSearch = event => {
    event.preventDefault();
    const value = event.target.value;
    this.setState({ search: value });
  }

  submitFormMessage = evt => {
    evt.preventDefault();
    const form = evt.target;
    const { mastodonAuthToken } = this.props;
    const { activeIndex, allTrendsData } = this.state;
    if (mastodonAuthToken) {
      const status = form.querySelector('#mst-prompt-content').value + ` #${decodeTrend(allTrendsData[activeIndex].id)}`;
      const data = {
        status: status
      }
      this.setState({
        isSubmit: true
      })
      const mastodonURL = process.env.REACT_APP_MASTODON_SERVER || 'https://mastodon.lifelearnplatform.com/';
      const postStatusUrl = `${mastodonURL}api/v1/statuses`;
      axios.post(postStatusUrl, data, {
        headers: {
          Authorization: `Bearer ${mastodonAuthToken}`
        }
      })
        .then(response => {

          const { promptText } = this.state;
          this.handlePrompt(true, promptText);
        })
        .catch(err => console.log(err))
        .finally(() => {
          console.log('done')
        })
    } else {
      this.setState({
        isError: true
      })
    }
  }

  handleStop = (data, index) => {
    // console.log('abc', data.x, data.y);
    const { activeTrend } = this.state;
    const { x_coord, y_coord } = activeTrend[index];
    if (data.x !== x_coord || data.y !== y_coord) {
      this.setState({ hasTrendUpdate: true, x: data.x, y: data.y, activeIndex: index })
      console.log('a', activeTrend, index, data.x, data.y)
    }
  }

  handlePrompt = async (status, data = null) => {
    this.setState({ hasTrendUpdate: false })
    if (!status) {
      console.log('cancelled');
    } else {

      // await axios.post('https://future-trends.herokuapp.com/user-trends/', payload)
      const { allTrendsData, activeIndex, x, y, promptText } = this.state;
      const { viewer } = this.props.data;
      const activeTrend = allTrendsData[activeIndex];
      console.log('a', activeIndex, activeTrend.id)
      const payload = {
        trend_name: activeTrend.trend_name,
        trend_id: activeTrend.id,
        username: viewer.username,
        display_name: viewer.firstName + ' ' + viewer.lastName,
        comment: promptText,
        x_coord: x,
        y_coord: y
      }
      await axios.post('https://future-trends.herokuapp.com/user-trends/', payload)
        .then(resp => {
          if (resp.status === 200) {
            // console.log('re', resp.data);
            const { x_coord, y_coord } = resp.data;
            const { allTrendsData } = this.state;
            const newTrend = allTrendsData;
            newTrend[activeIndex].x_coord = x_coord;
            newTrend[activeIndex].y_coord = y_coord;
            this.setState({ allTrendsData: newTrend, promptText: '', activeIndex: -1 });
          }
        })

    }
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    const { search } = this.state;
    this.setState({ isLoading: true });
    await axios.get('https://future-trends.herokuapp.com/trends')
      .then(resp => {
        if (resp.status === 200) {
          const data = resp.data;
          const index = data.findIndex(e => e.trend_name.toLowerCase() === search.toLowerCase());
          if (index !== -1) {
            this.setState({ activeTrend: data[index] });
          } else {
            this.setState({ notFound: true })
          }
        } else {
          this.setState({
            isError: true
          })
        }
      })
      .catch(err => {
        console.log('err', err)
        this.setState({ isError: true })
      })
      .finally(() => {
        this.setState({ isLoading: false })
      })
  }

  getTrendsData = async () => {
    await axios.get('https://future-trends.herokuapp.com/trends')
      .then(resp => {
        if (resp.status === 200) {
          this.setState({
            allTrendsData: resp.data
          });
        }
      }).catch(err => {
        console.log('err', err)
      })
  }

  selectTrend = (trend, active) => {
    const { activeTrend } = this.state;
    if (active) {
      const newActiveTrend = activeTrend.filter(e => e.id !== trend.id);
      this.setState({
        activeTrend: newActiveTrend
      })
    } else {
      this.setState({
        activeTrend: [...activeTrend, trend]
      })
    }
  }

  closeTrend = () => {
    this.setState({
      activeTrend: []
    })
  }

  componentDidMount() {
    this.getTrendsData();
  }

  openDiscussion = trend => {
    const { activeDiscussionTrend } = this.state;
    if (activeDiscussionTrend && activeDiscussionTrend.id === trend.id) {
      this.setState({
        activeDiscussionTrend: null
      })
    } else {
      this.setState({
        activeDiscussionTrend: trend
      })
    }
  }
  closeDiscussion = () => {
    this.setState({
      activeDiscussionTrend: null
    })
  }

  render() {

    const { viewer, loading, error } = getObject(['data'], this.props);
    const { t } = this.props;

    if (loading) return <Loader title={t("loading")} size="small" />
    if (error) return <Redirect to="/error" />;

    if (viewer === null) return <SecurePrompt />;
    const { allTrendsData, activeTrend, search, promptText, isSubmit, hasTrendUpdate, isLoading, isError, notFound, activeDiscussionTrend } = this.state;
    const { mastodonUser } = this.props;
    // console.log('a', activeTrend);
    return (
      <Wrapper className={``}>
        <Navigation title={t('trends')} style={{ background: '#ffffff' }} />
        <div id="maincontent" className="section trend-container">

          <div className={`trend-search ${activeTrend ? 'is-active' : ''}`}>
            <h3>Select Trends</h3>
            {/* <div className="form-trend">
              {activeTrend ? (
                <form action="#" onSubmit={() => false}>
                  <input type="search" id="search" name="search" value={search} disabled />
                  <button type="submit" className={`button ${isLoading ? 'is-loading' : ''}`} disabled><span className="fa fa-search"></span></button>
                </form>
              ) : (
                  <form action="#" onSubmit={this.handleSubmit}>
                    <input type="search" id="search" name="search" value={search} onChange={this.handleSearch} />
                    <button type="submit" className={`button ${isLoading ? 'is-loading' : ''}`}><span className="fa fa-search"></span></button>
                  </form>
                )}
              {isLoading && (
                <p className="" style={{ textAlign: 'left' }}><em>Loading..</em></p>
              )}
              {((notFound && !isLoading) || isError) && (
                <p><em>Trend not found, please try again.</em></p>
              )}
              {activeTrend && (
                <div className="active-trend-item">
                  <div className="trend-item"><p>{activeTrend.trend_name}</p>
                    <button classname="button"><span className="fa fa-times"></span></button>
                  </div>
                </div>
              )}
            </div> */}
            {allTrendsData.length > 0 && (
              <div className="all-trends-data">
                <ul>
                  {allTrendsData.map((trend, index) => {
                    const isActive = activeTrend.length > 0 ? activeTrend.findIndex(e => e.id === trend.id) !== -1 : false;
                    return (
                      <li key={trend.id + index}>
                        <button className={`button ${isActive ? 'active' : ''}`} onClick={() => this.selectTrend(trend, isActive)}>{trend.trend_name}
                          {isActive && (
                            <span className="close"><span className="fa fa-times"></span></span>
                          )}</button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            {activeTrend.length > 0 && (
              <div className="trend-box">
                <div className="prefered"><span>Prefered</span></div>
                <div className="likely"><span>Likely</span></div>
                {activeTrend.map((trend, index) => (
                  <Draggable bounds="parent" handle=".handle" onStop={data => this.handleStop(data, index)}
                    defaultPosition={{ x: trend.x_coord, y: trend.y_coord }}
                    position={{ x: trend.x_coord, y: trend.y_coord }}
                    key={trend.id + index}
                  >
                    <div className="trend-item">
                      <div className="handle"><span className="fa fa-arrows"></span></div>
                      <div className="text median item" onClick={() => this.openDiscussion(trend)}><strong>{trend.trend_name}</strong></div>
                    </div>

                  </Draggable>
                ))}
              </div>
            )}
          </div>


          {allTrendsData.length > 0 && (
            <div className={`trend-discussion is-active`}>
              {activeDiscussionTrend && (
                <div className="trend-discussion-window">
                  <TrendDiscussion isPrompt={hasTrendUpdate} closePrompt={this.handlePrompt} trendId={activeDiscussionTrend.id} trend={activeDiscussionTrend} />
                </div>
              )}
            </div>
          )}
        </div>
        <Modal
          isOpen={hasTrendUpdate}
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
              {mastodonUser && (
                <div className="mst-room-user-profile">
                  <div className="mst-user-avatar">
                    <img src="https://gql.lifelearnplatform.com/static/ll_anonymous_user.png" alt={mastodonUser.display_name} width="32" height="32" />
                  </div>
                  <div className="mst-user-info">
                    <h5>{mastodonUser.display_name}</h5>
                    <h6>@{mastodonUser.username}</h6>
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
      </Wrapper >
    );
  }
}

const mapStateToProps = state => {
  return {
    isAuthenticated: state.auth.isAuthenticated,
    mastodonAuthToken: state.auth.mastodonAuthToken,
    mastodonUser: state.auth.mastodonUser,
    userId: state.auth.userId,
  };
};

export default compose(
  withRouter,
  connect(
    mapStateToProps,
    null
  ),
  graphql(getMyProfile),
  withTranslation(),
)(Trends);
