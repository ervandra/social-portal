import React, { Component } from "react";
import Modal from 'react-modal';
import { Mutation } from 'react-apollo';
import { ASSIGN_BADGE, CREATE_BADGE } from '../../store/gql/queries';
import { withTranslation } from "react-i18next";


class BadgeContainer extends Component {
  state = {
    openModal: false,
    newBadges: [],
    peopleBadgeIndex: null,
    badgeId: null,
    badgeUrl: '',
    validUrl: false,
    showBadgeModal: false,
    userBadgeData: [],
    newAvailableBadges: [],
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.pathId !== this.props.pathId) {
      this.setState({
        newBadges: [],
        peopleBadgeIndex: null,
        badgeId: null,
        badgeUrl: '',
        validUrl: false,
        userBadgeData: [],
        newAvailableBadges: [],
      })
    }
  }

  handleOpenBadgeModal = id => {
    this.setState({
      showBadgeModal: true,
      peopleBadgeIndex: id,
      badgeId: null,
    });
  }

  handleCloseBadgeModal = () => {
    this.setState({
      showBadgeModal: false,
      peopleBadgeIndex: null,
      badgeId: null,
      badgeUrl: '',
      validUrl: false,
    });
  };

  selectBadge = id => {
    this.setState({
      badgeId: id,
    })
  }

  addUserBadgeData = data => {
    const { userBadgeData } = this.state;
    const { updateBadges } = this.props;
    if (userBadgeData.length > 0) {
      const oldUser = userBadgeData.findIndex(u => u.id === data.id);
      if (oldUser !== -1) {
        userBadgeData[oldUser].badges = [...data.badges];
        this.setState({
          userBadgeData
        })
        updateBadges(userBadgeData);
      } else {
        const badgeData = {
          id: data.id,
          badges: data.badges
        }
        const newData = [...userBadgeData, badgeData];
        this.setState({
          userBadgeData: newData
        })
        updateBadges(newData);
      }
    } else {
      const badgeData = {
        id: data.id,
        badges: [...data.badges]
      }
      this.setState({
        userBadgeData: [badgeData],
      })
      updateBadges([badgeData]);
    }
    setTimeout(() => {
      this.handleCloseBadgeModal();
    }, 500);
  }

  handleBadgeUrlInput = ev => {
    const value = ev.target.value;
    const regex = /(http(s?):\/\/)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/g;
    if (regex.test(value)) {
      this.setState({
        badgeUrl: value,
        validUrl: true,
      })
    } else {
      this.setState({
        badgeUrl: value,
        validUrl: false,
      })
    }
  }

  addNewAvailableBadge = data => {
    const newAllAvailableBadges = [data];
    this.setState({
      badgeUrl: '',
      validUrl: '',
    })
    const { updateAvailableBadges } = this.props;
    updateAvailableBadges(newAllAvailableBadges);
  }

  render() {
    const { showBadgeModal, userBadgeData, badgeUrl, validUrl, newAvailableBadges } = this.state;
    const { profileBadgeUrl, people, canAddBadge, availableBadges, canCreateBadge, pathId, t } = this.props;

    const allAvailableBadges = [...availableBadges, ...newAvailableBadges];

    return (
      <span className="my-path-badges">
        {canAddBadge && (
          <button type="button" onClick={() => this.handleOpenBadgeModal(people.id)} className="badge-add badge-item"><span className="fa fa-plus"></span></button>
        )}
        <React.Fragment>
          {userBadgeData.length > 0 && userBadgeData.findIndex(ub => ub.id === people.id) !== -1 ?
            (
              <React.Fragment>
                {userBadgeData[userBadgeData.findIndex(ub => ub.id === people.id)].badges.map((ubadge, index) => {
                  if (profileBadgeUrl.length > 0 && profileBadgeUrl.findIndex(pbu => pbu === ubadge) !== -1) return null;
                  return (
                    <span key={ubadge + index} className="new-badge badge-item"><img src={ubadge} alt={ubadge} width="16" height="16" /></span>
                  )
                })}
              </React.Fragment>
            ) : null}
          {profileBadgeUrl.length > 0 && profileBadgeUrl.map((badge, index) => {
            if (index >= 10) return null;
            return (
              <span key={badge + index} className="badge-item"><img src={badge} alt={badge} width="16" height="16" /></span>
            )
          })}
        </React.Fragment>
        <Modal
          isOpen={showBadgeModal}
          contentLabel="Badge Information"
          onRequestClose={() => this.handleCloseBadgeModal()}
          className="reveal small "
          ariaHideApp={false}
        >
          <div className="badge-container">
            <h3>{t('assignBadgeToThisUser')}</h3>
            {allAvailableBadges && allAvailableBadges.length > 0 ? (
              <React.Fragment>
                <h5>{t('selectOneOfBadge')}</h5>
                <div className="available-badges">
                  {allAvailableBadges.map((badge, index) => {
                    const { id, url } = badge.node;
                    return (
                      <div className={`available-badge-item ${this.state.badgeId === id ? 'selected' : ''} `} key={id + index} onClick={() => this.selectBadge(id)}>
                        <img src={url} alt={url} />
                      </div>
                    )
                  })}
                </div>
                {this.state.badgeId ? (
                  <Mutation mutation={ASSIGN_BADGE} onCompleted={(data) => {
                    if (data) {
                      const dataToPush = {
                        id: data.assignUserBadge.userNode.id,
                        badges: [...data.assignUserBadge.userNode.profileBadgeUrl]
                      }
                      this.addUserBadgeData(dataToPush);
                    }
                  }}>
                    {(assignUserBadge, { data }) => {
                      if (data) return (
                        <button className="button disabled" disabled>{t('badgeAssigned')}</button>
                      )
                      return (
                        <button className="button success btn-assign"
                          onClick={async () => {
                            await assignUserBadge({ variables: { clientMutationId: this.state.badgeId, userId: this.state.peopleBadgeIndex, badgeId: this.state.badgeId } })
                          }}
                        >{t('assignBadge')}</button>
                      )
                    }}
                  </Mutation>
                ) : (
                    <button className="button disabled" disabled>{t('assignBadge')}</button>
                  )}
                <hr />
              </React.Fragment>
            ) : (
                <div>
                  {canCreateBadge ? (
                    <React.Fragment>
                      <p><em>{t('dontHaveBadge')}</em></p>
                      <hr />
                    </React.Fragment>
                  ) : (
                      <p><em>{t('cannotCreateBadge')}</em></p>
                    )}
                </div>
              )}
            {canCreateBadge && (
              <React.Fragment>
                <div className="upload-badge-container">
                  <h4><span className="fa fa-upload"></span> {t('uploadNewBadge')}</h4>
                  {badgeUrl && validUrl && (
                    <div className="upload-badge-preview">
                      <h6>{t('badgePreview')}</h6>
                      <img src={badgeUrl} alt="badge-preview" width="96" height="96" />
                    </div>
                  )}
                  <div className="upload-badge-field">
                    <label htmlFor="badge-url">{t('badgeImgUrl')}</label>
                    <input type="url" placeholder="https://social.lifelearnplatform.com/badges/image.png" id="badge-url" name="badge-url" value={badgeUrl} onChange={ev => this.handleBadgeUrlInput(ev)} required className={` ${badgeUrl !== '' && !validUrl ? 'error' : ''}`} />
                  </div>
                  {badgeUrl !== '' && validUrl ? (
                    <Mutation mutation={CREATE_BADGE} onCompleted={(data) => {
                      if (data) {
                        const { createUserBadge } = data;
                        const { badgeNode } = createUserBadge;
                        const newBadgeData = {
                          node: {
                            id: badgeNode.id,
                            url: badgeNode.url,
                          }
                        }
                        this.addNewAvailableBadge(newBadgeData);
                      }
                    }}>
                      {(createUserBadge, { data }) => {
                        if (data) return (
                          <button className="button disabled" disabled>{t('badgeUploaded')}</button>
                        )
                        return (
                          <button className="button success btn-upload"
                            onClick={async () => {
                              await createUserBadge({ variables: { clientMutationId: 'create_badge_for_user', imgUrl: badgeUrl, pathId: pathId } })
                            }}
                          >{t('uploadBadge')}</button>
                        )
                      }}
                    </Mutation>
                  ) : (
                      <button className="button disabled btn-upload" disabled>{t('uploadBadge')}</button>
                    )}

                </div>
              </React.Fragment>
            )}
          </div>
          <button className="close-reveal" onClick={() => this.handleCloseBadgeModal()}>&times;</button>
        </Modal>
      </span>
    )
  }
};

export default withTranslation()(BadgeContainer);