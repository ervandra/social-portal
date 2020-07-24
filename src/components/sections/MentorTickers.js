import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { Query } from 'react-apollo';
import TickerDiscussion from '../../components/sections/TickerDiscussion';
import { GET_MENTORED_PARTICIPANTS } from '../../store/gql/queries';

class MentorTickers extends Component {
  state = {
    tickerKeys: [
      { title: "weight", unit: "kg" },
      { title: "waist", unit: "cm" }
    ],
    openTickerDiscussion: false,
    tickerId: null,
    mentoredId: null
  };

  openTickerDiscussionModal = (id, userId) => {
    this.setState({
      openTickerDiscussion: true,
      tickerId: id,
      mentoredId: userId,
    });
  };

  closeTickerDiscussionModal = () => {
    this.setState({
      openTickerDiscussion: false,
      tickerId: null,
      mentoredId: null
    });
  };

  render() {
    const { pathId, mentorId, mentor, isMentor } = this.props;
    const { tickerKeys, tickerId } = this.state;
    const { t } = this.props;

    // const now = new Date();
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];
    // const currentDate = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()} - ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

    return (
      <div className="mentor-tickers-container">
        <Query
          query={GET_MENTORED_PARTICIPANTS}
          variables={{ pathId }}
          fetchPolicy="cache-and-network"
        >
          {({ data, loading, error }) => {
            if (loading || error) return null;
            const { paths } = data;
            const mentoredParticipants =
              paths.edges[0].node.mentoredParticipants;
            if (mentoredParticipants.edges.length === 0)
              return (
                <p style={{ textAlign: "center" }}>
                  No mentored participant yet.
                </p>
              );

            return (
              <div className="mentored-participant-container">
                {mentoredParticipants.edges.map((mentored, index) => {
                  const { id, firstName, lastName, username } = mentored.node;
                  const displayName =
                    firstName !== "" || lastName !== ""
                      ? `${firstName} ${lastName}`
                      : firstName === "" && lastName === ""
                        ? username
                        : firstName === ""
                          ? lastName
                          : firstName;
                  const tickerSummary = mentored.node.tickerSummary || null;
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
                  const tickerData = mentored.node.tickers.edges
                    ? mentored.node.tickers.edges
                    : [];

                  return (
                    <div key={id + index} className="user-ticker-container">
                      <hr />
                      <div className="user-ticker-header">
                        <h3>
                          <strong>Mentoring</strong>: {displayName}
                        </h3>
                      </div>

                      <div className="ticker-container">
                        <div className="ticker-summary">
                          <div className="ticker-date">
                            <strong>{totalDays}</strong>
                            <small>
                              {totalDays !== 0 ? t("days") : t("day")}
                            </small>
                          </div>
                          <div className="ticker-keys">
                            <div className={`ticker-key ticker-key-weight`}>
                              <strong>
                                {weightSummary ? weightSummary : "-"}
                              </strong>
                              <span className="ticker-unit">kg</span>
                            </div>
                            <div className={`ticker-key ticker-key-waist`}>
                              <strong>
                                {waistSummary ? waistSummary : "-"}
                              </strong>
                              <span className="ticker-unit">cm</span>
                            </div>
                          </div>
                          <div className="ticker-note">
                            {t("greatKeepItUp")}
                          </div>
                        </div>

                        {tickerData.length > 0 ? (
                          <div className="ticker-progress">
                            {tickerData.map((ticker, index) => {
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
                              const tickerTime = new Date(timestamp);
                              const tickerDate = `${
                                months[tickerTime.getMonth()]
                                } ${tickerTime.getDate()}, ${tickerTime.getFullYear()} - ${tickerTime.getHours()}:${tickerTime.getMinutes()}:${tickerTime.getSeconds()}`;
                              return (
                                <div className="ticker-item" key={id + index}>
                                  <div
                                    className="ticker-date"
                                    title={tickerDate}
                                  >
                                    <strong>
                                      <Moment format="DD">{timestamp}</Moment>
                                    </strong>
                                    <small>
                                      <Moment format="MMM">{timestamp}</Moment>
                                    </small>
                                  </div>
                                  <div className="ticker-keys">
                                    <div
                                      className={`ticker-key ticker-key-${title}`}
                                    >
                                      <strong>{Number.isInteger(value) ? value : value.toFixed(2)}</strong>
                                      <span className="ticker-unit">
                                        {tickerKeys[keyIndex].unit}
                                      </span>
                                    </div>
                                  </div>
                                  <div
                                    className="ticker-message-count"
                                    onClick={() =>
                                      this.openTickerDiscussionModal(id, mentored.node.id)
                                    }
                                    title="Open Discussion"
                                  >
                                    <span className="fa fa-comments-o"></span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                            <div className="ticker-progress">
                              <div className="ticker-empty">
                                <div className="ticker-item ticker-empty">
                                  {t("pleaseAddFirstProgress")}
                                </div>
                              </div>
                            </div>
                          )}
                        {/* {mentored.node.id} {mentored.node.firstName} */}
                      </div>


                    </div>
                  );
                })}
                {this.state.openTickerDiscussion && this.state.mentoredId && (
                  <TickerDiscussion
                    pathId={pathId}
                    mentoredId={this.state.mentoredId}
                    tickerId={tickerId}
                    mentorId={
                      mentorId
                    }
                    close={this.closeTickerDiscussionModal}
                    isMentor={isMentor}
                    mentor={
                      mentor
                    }
                    isMentorDiscussion
                  />
                )}
              </div>
            );
          }}
        </Query>
      </div>
    );
  }
}

export default withTranslation()(MentorTickers);
