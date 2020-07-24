/**
 * To Wrap JSX without additional <div>, no other usage
 */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';
import { Query } from 'react-apollo';
import { getMyTimeline } from '../../store/gql/queries';
import Moment from 'react-moment';
import { withTranslation } from 'react-i18next';

class WidgetNotification extends Component {

  componentDidMount() {
    document.addEventListener('mouseup', this.handleClickOutside);
  }
  componentWillUnmount() {
    document.addEventListener('mouseup', this.handleClickOutside);
  }

  closeAllWidget = () => {
    const { toggleNotification } = this.props;
    toggleNotification(false);
  }

  handleClickOutside = e => {
    const { openNotification } = this.props;
    if (openNotification) {
      const domNodetoggleNotification = this.widgetNotificationRef;
      const btn = document.querySelector('.btn-menu-notification');
      // console.log('e', btn, btn.contains(e.target));
      if (!btn.contains(e.target) && (!domNodetoggleNotification || !domNodetoggleNotification.contains(e.target))) {
        this.closeAllWidget();
      }
    }
  };


  resolveEventMessage = (eventData) => {
    const { t } = this.props;
    const { actor, targetType, name, excerpt } = eventData;
    let username = actor;

    if (username === null) {
      username = t('anonymousUser');
    }

    let verb = '';
    if (targetType === 'question' && name === 'CREATED') {
      verb = `${username} ${t('askedVerb')}: `;
    } else if (targetType === 'answer' && name === 'CREATED') {
      verb = `${username} ${t('answeredVerb')}: `;
    } else if (targetType === 'vuo_chapters' && name === 'CREATED') {
      verb = `${username} ${t('newDocument')} `;
    } else if (targetType === 'vuo_achsoreply' && name === 'CREATED') {
      verb = `${username} ${t('newAchsoreply')} `;
    } else if (targetType === 'vuo_answers' && name === 'CREATED') {
      verb = `${username} ${t('newVuoAnswer')} `;
    } else if (targetType === 'vuo_answerreviews' && name === 'CREATED') {
      verb = `${t('newVuoAnswerreview')}`;
    } else if (targetType === 'vuo_openquestion_answer_evaluation' && name === 'CREATED') {
      verb = `${t('newVuoOpenquestionAnswerEvaluation')}`;
    } else if (targetType === 'vuo_openquestion_attribution' && name === 'CREATED') {
      verb = `${t('newVuoOpenquestionAttribution')}`;
    } else if (targetType === 'vuo_openquestion_answer_manual_grading' && name === 'CREATED') {
      verb = `${t('newVuoOpenquestionAnswerManualGrading')}`;
    } else if (targetType === 'vuo_openquestion_appreciation' && name === 'CREATED') {
      verb = `${t('newVuoOpenquestionAppreciation')}`;
    } else if (targetType === 'vuo_ckc_reflect' && name === 'CREATED') {
      verb = `${t('newVuoCkcReflect')}`;
    } else if (targetType === 'vuo_mcr_answer' && name === 'CREATED') {
      verb = `${t('newVuoMcrAnswer')}`;
    } else if (name !== 'CREATED') {
      verb = name.substring(0, 8) === 'MESSAGE:' ? `${name.substring(8)}` : ``;
    }

    const body = verb + ' ' + excerpt;

    return body;
  }

  resolveUrl = (eventData) => {
    const { targetId, contextId } = eventData;
    let url = `/view/${targetId}/0/${contextId}`
    return url;
  }
  render() {
    const { openNotification, username } = this.props;
    let date = null;

    return (
      <div className={`widget ${openNotification ? 'open' : ''}`} ref={e => (this.widgetNotificationRef = e)}>

        <h5>Notifications</h5>
        <div className="widget-timeline">
          {username && (
            <Query query={getMyTimeline} variables={{ count: 100, cursor: '' }}>
              {({ data, loading, error }) => {
                if (loading || error) return null;
                const timelines = data.viewer.timelineEvents.edges;
                return (
                  <div className="widget-timeline-container">
                    {timelines.map((evt, index) => {
                      const evtDate = new Date(evt.node.timestamp);
                      let shouldRenderHeaderTime = true;
                      if (index === 0) {
                        date = new Date(evt.node.timestamp);
                      } else if (evtDate.getDate() === date.getDate() && evtDate.getMonth() === date.getMonth() && evtDate.getFullYear() === date.getFullYear()) {
                        shouldRenderHeaderTime = false;
                      } else {
                        shouldRenderHeaderTime = true;
                        date = evtDate
                      }

                      return (
                        <div className="timeline-item" key={evt.node.id + index}>
                          {shouldRenderHeaderTime && (
                            <div className="timeline-header">
                              <h6><Moment format="MMM DD, YYYY">{evtDate}</Moment></h6>
                            </div>
                          )}
                          <div className="timeline-content">
                            <div className="timeline-time">
                              <div className="timeline-moment"><Moment format="HH:mm">{evt.node.timestamp}</Moment></div>
                            </div>
                            <div className="timeline-info">
                              <p>
                                <strong>{this.resolveEventMessage(evt.node)}</strong>
                                <br />
                                {evt.node.metadata1}
                                <br />
                                {evt.node.metadata2}
                              </p>
                            </div>
                            <Link to={this.resolveUrl(evt.node)} className="timeline-link">{evt.node.id}</Link>
                          </div>
                        </div>
                      )
                    }
                    )}
                  </div>
                )
              }}
            </Query>
          )}
          {/* <ul>
          <li>Path 1</li>
          <li>Path 1</li>
          <li>Path 1</li>
          <li>Path 1</li>
          <li>Path 1</li>
          <li>Path 1</li>
          <li>Path 1</li>
          <li>Path 1</li>
          <li>Path 1</li>
          <li>Path 1</li>
          <li>Path 1</li>
          <li>Path 1</li>
          <li>Path 1</li>
          <li>Path 1</li>
          <li>Path 1</li>
          <li>Path 1</li>
          <li>Path 1</li>
          <li>Path 1</li>
        </ul> */}
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    username: state.auth.username,
    openNotification: state.app.openNotification,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    toggleNotification: open => dispatch(actions.toggleNotification(open)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(WidgetNotification))