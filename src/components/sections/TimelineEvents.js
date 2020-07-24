import React, { Component } from 'react';
import Wrapper from '../layouts/wrapper';
import { Query } from 'react-apollo';
import { GET_TIMELINE } from '../../store/gql/queries';
import Moment from 'react-moment';
import { withTranslation } from 'react-i18next';

class TimelineEvents extends Component {
  state = {
    isLoadMoreEvents: false
  }

  resolveEventMessage = (eventData) => {
    const { actor, targetType, name, excerpt } = eventData;
    const { t } = this.props;
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
    const { isLoadMoreEvents } = this.state;
    const { t } = this.props;
    return (
      <Wrapper>
        <Query query={GET_TIMELINE} variables={{ cursor: '', count: 25 }}>
          {({ data, loading, error, fetchMore }) => {
            if (loading) return <p className="loading">{t('loading')}</p>
            if (error) return <p className="error">{t('error')}</p>
            const { timelineEvents } = data.viewer;
            let date = null;
            // console.log(timelineEvents);
            return (
              <React.Fragment>
                <div className="timeline-container">
                  {timelineEvents.edges.length && timelineEvents.edges.map((evt, index) => {
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

                    // if(evt.node.name !== 'CREATED') return null;

                    return (
                      <div className={`timeline-wrapper ${shouldRenderHeaderTime ? 'with-header' : ''}`} key={evt.node.id + index}>
                        {shouldRenderHeaderTime && (
                          <div className="timeline-header">
                            <h5><Moment format="MMM DD, YYYY">{evtDate}</Moment></h5>
                          </div>
                        )}

                        <div className="timeline-content">
                          <div className="timeline-time">
                            <div className="timeline-moment"><Moment format="HH:mm">{evt.node.timestamp}</Moment></div>
                          </div>
                          <div className="timeline-info">
                            <p>
                              {/* <Link to={this.resolveUrl(evt.node)} className="timeline-link"> */}

                              <strong>{this.resolveEventMessage(evt.node)}</strong>
                              <br />
                              {evt.node.metadata1}
                              <br />
                              {evt.node.metadata2}
                              {/* </Link> */}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  )}
                </div>
                {timelineEvents.pageInfo.hasNextPage && (
                  <div className="load-more"><a href="#loadmore" className={`button small secondary ${isLoadMoreEvents ? 'is-loading disabled' : ''}`} onClick={() => {
                    this.setState({ isLoadMoreEvents: true }); fetchMore({
                      query: GET_TIMELINE,
                      variables: { cursor: timelineEvents.pageInfo.endCursor, count: 25 },
                      updateQuery: (previousResult, { fetchMoreResult }) => {
                        const newEdges = fetchMoreResult.viewer.timelineEvents.edges;
                        const pageInfo = fetchMoreResult.viewer.timelineEvents.pageInfo;
                        this.setState({ isLoadMoreEvents: false });
                        const newResult = newEdges.length ? {
                          viewer: {
                            __typename: previousResult.viewer.__typename,
                            timelineEvents: {
                              __typename: previousResult.viewer.timelineEvents.__typename,
                              edges: [...previousResult.viewer.timelineEvents.edges, ...newEdges],
                              pageInfo
                            }
                          }
                        } : previousResult;
                        return newResult;
                      }
                    })
                  }}>{t('loadMore')}</a></div>
                )}
              </React.Fragment>
            )
          }}
        </Query>
      </Wrapper>
    );
  }
}

export default withTranslation()(TimelineEvents);
