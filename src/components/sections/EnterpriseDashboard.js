import React, { Component } from 'react';
import Wrapper from '../layouts/wrapper';
// import { Link } from 'react-router-dom';
// import Modal from 'react-modal';
// import SkillTarget from '../global/SkillTarget';
import { Query } from 'react-apollo';
import { GET_ENTERPRISE_DASHBOARD, ENTERPRISE_PATHS, ENTERPRISE_PARTICIPANTS, ENTERPRISE_SKILLS, ENTERPRISE_SKILL_INFO } from '../../store/gql/queries';
import { decode64 } from '../../helpers';

import Participant from './enterprise/Participant';
import Skill from './enterprise/Skill';
import { withTranslation } from 'react-i18next';

class EnterpriseDashboard extends Component {
  state = {
    selectedUser: null,
    showSkillModal: false,
    selectedSkill: null,
    selectedPath: null,
    skillNode: null,
    tabs: 'paths'
  }
  selectUser = (index) => {
    this.setState({
      selectedUser: index
    })
  }
  selectPath = (pathId) => {
    this.setState({
      selectedPath: pathId,
      selectedUser: null,
    })
  }
  selectSkill = skill => {
    this.setState({
      selectedUser: null,
      selectedPath: null,
      selectedSkill: skill.id,
      skillNode: skill
    })
  }
  handleOpenSkillModal = (index) => {
    this.setState({
      showSkillModal: true,
      selectedSkill: index
    })
  }
  handleCloseSkillModal = () => {
    this.setState({
      showSkillModal: false,
      selectedSkill: null
    })
  }

  tabPath = () => {
    this.setState({
      tabs: 'paths',
      selectedSkill: null,
      skillNode: null,
    })
  }

  tabSkill = () => {
    this.setState({
      tabs: 'skills',
      selectedPath: null,
      selectedUser: null,
    })
  }

  render() {
    const { organisation, t } = this.props;
    const { selectedUser, selectedPath, tabs, selectedSkill, skillNode } = this.state;

    return (
      <Wrapper>
        <div className="container-enterprise">
          <Query query={GET_ENTERPRISE_DASHBOARD} variables={{ name: organisation }}>
            {({ data, loading, error }) => {
              if (loading) return <p className="loading">{t('loading')}</p>
              if (error) return <p>{t('error')}</p>

              const { organisations } = data;
              const orgPaths = organisations && organisations.edges.length > 0 && organisations.edges[0].node.paths && organisations.edges[0].node.paths.edges.length > 0 ? organisations.edges[0].node.paths.edges : [];
              const orgSkills = organisations && organisations.edges.length > 0 && organisations.edges[0].node.skills && organisations.edges[0].node.skills.edges.length > 0 ? organisations.edges[0].node.skills.edges : [];


              return (
                <div className="enterprise-dashboard">
                  <div className="grid-x grid-margin-x grid-margin-y">

                    <div className="cell small-12 medium-6 large-4">
                      <div className="ed-block" id="block-paths">
                        <div className="ed-block-header header-flex">
                          <h3 onClick={this.tabPath} className={tabs === 'paths' ? 'active' : ''}>{t('allPaths')}</h3>
                          <h3 onClick={this.tabSkill} className={tabs === 'skills' ? 'active' : ''}>{t('allSkills')}</h3>
                        </div>
                        <div className="ed-block-body">
                          <div className="ed-block-item">
                            {tabs === 'paths' ? (
                              <Query query={ENTERPRISE_PATHS}>
                                {({ data, loading, error }) => {
                                  if (loading) return <p className="loading">{t('loading')}</p>
                                  if (error) return <p className="error">{t('error')}</p>

                                  const { paths } = data;
                                  return (
                                    <div className="user-group-list ed-list">
                                      <ul>
                                        {paths.edges.length > 0 && paths.edges.map((path, index) => {
                                          const { id, title, bgimage } = path.node;

                                          const included = orgPaths.findIndex(o => {
                                            const a = decode64(o.node.id).split(':')[1];
                                            const b = decode64(id).split(':')[1];
                                            return a === b;
                                          })
                                          if (included === -1) return null;
                                          return (
                                            <li key={id + index} className={`path-item ${selectedPath === id ? 'active' : ''}`}>
                                              <a onClick={() => this.selectPath(id)}>
                                                <span className="img-cover"><img src={bgimage} alt={title} width="20" height="20" /></span>
                                                <span>{title}</span>
                                              </a>
                                            </li>
                                          )
                                        })}
                                        {/* {combinedPath.map((path, index) => {
                                            return (
                                              <li key={path.id + index} className={selectedPath === path.originalId ? 'active' : ''}>
                                                <a onClick={() => this.selectPath(path.originalId)}>
                                                  <span>{path.title}</span>
                                                </a>
                                              </li>
                                          )})} */}
                                      </ul>
                                    </div>
                                  )
                                }}
                              </Query>
                            ) : (
                                <div className="user-group-list ed-list">
                                  <ul>
                                    {orgSkills.map((s, index) => (
                                      <li key={s.node.id + index} className={`path-item ${selectedSkill === s.node.id ? 'active' : ''}`}>
                                        <a onClick={() => this.selectSkill(s.node)}>
                                          <span className="img-cover"><img src={s.node.imageUrl} alt={s.node.title} width="20" height="20" /></span>
                                          <span>{s.node.title}</span>
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedSkill !== null && tabs === 'skills' && (
                      <div className="cell small-12 medium-6 large-4">
                        <div className="ed-block" id="block-users">
                          <div className="ed-block-header">
                            <h3>{t('skillInformations')}</h3>
                          </div>
                          <div className="ed-block-body">
                            <div className="ed-block-item">
                              <Query query={ENTERPRISE_SKILL_INFO} variables={{ skillId: selectedSkill }}>
                                {({ data, loading, error }) => {
                                  if (loading) return <p className="loading">{t('loading')}</p>;
                                  if (error) return <p className="error">{t('error')}</p>;

                                  const { skills } = data;
                                  const average = skills.edges[0].node.stats.edges.length ? skills.edges[0].node.stats.edges[0].node.average : 0;
                                  const users = skills.edges[0].node.userStats.edges;
                                  return (
                                    <div className="ed-progress-bar">

                                      {users.length > 0 ? users.map((u, index) => {
                                        const stat = u.node;
                                        const user = u.node.user;
                                        const { value, target } = stat;
                                        const { profilePictureUrl, firstName, lastName, username } = user;
                                        return (
                                          <div className="progress-item" key={stat.id + index}>
                                            <div className="target-bar target-top" style={{ width: '100%' }}></div>
                                            <div className="target-bar target-organisation" style={{ width: `${(value / average) * 100}%` }}></div>
                                            <div className="target-bar target-users" style={{ width: `${target}%` }}></div>
                                            <div className="target-text">
                                              <span className="user-avatar"><img src={profilePictureUrl} alt="user avatar" width="20" height="20" /></span>
                                              {firstName !== '' || lastName !== '' ? (
                                                <span className="user-name">{firstName} {lastName}</span>
                                              ) : (
                                                  <span className="user-name">{username}</span>
                                                )}
                                              <strong className="skill-point">{value} pt</strong>
                                            </div>
                                          </div>
                                        )
                                      }) : (
                                          <div className="progress-item">
                                            <div className="target-bar target-top" style={{ width: '100%' }}></div>
                                            <div className="target-text">{t('noSkillPoints')}</div>
                                          </div>
                                        )}

                                    </div>
                                  )
                                }}
                              </Query>

                            </div>
                          </div>
                        </div>
                      </div>
                    )}


                    {selectedPath !== null && (
                      <div className="cell small-12 medium-6 large-4">
                        <div className="ed-block" id="block-users">
                          <div className="ed-block-header">
                            <h3>{t('pathInformations')}</h3>
                          </div>
                          <div className="ed-block-body">
                            <div className="ed-block-item">
                              <Query query={ENTERPRISE_PARTICIPANTS} variables={{ pathId: selectedPath }}>
                                {({ data, loading, error }) => {
                                  if (loading) return <p className="loading">{t('loading')}</p>
                                  if (error) return <p className="error">{t('error')}</p>

                                  const { paths } = data;
                                  const selPath = paths.edges.length > 0 && paths.edges.find(p => p.node.id === selectedPath);
                                  const participants = selPath !== -1 ? selPath.node.participants : null;
                                  return (
                                    <div className="ed-action-list">
                                      <ul>
                                        <li>{t('setOrgTarget')}</li>
                                        <li>{t('numOfUsers')}: {participants.edges.length}</li>
                                      </ul>
                                    </div>
                                  )
                                }}

                              </Query>

                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {tabs === 'paths' && (
                      <div className="cell small-12 medium-6 large-4">
                        <div className="ed-block" id="block-users">
                          <div className="ed-block-header">
                            <h3>{t('users')}</h3>
                          </div>
                          {selectedPath !== null ? (
                            <div className="ed-block-body">
                              <div className="ed-block-item">
                                <Query query={ENTERPRISE_PARTICIPANTS} variables={{ pathId: selectedPath }}>
                                  {({ data, loading, error }) => {
                                    if (loading) return <p className="loading">{t('loading')}</p>
                                    if (error) return <p className="error">{t('error')}</p>

                                    const { paths } = data;
                                    const selPath = paths.edges.length > 0 && paths.edges.find(p => p.node.id === selectedPath);
                                    const participants = selPath !== -1 ? selPath.node.participants : null;
                                    return (
                                      <div className="user-group-list ed-list">
                                        <Participant data={participants} selectUser={this.selectUser} selectedUser={selectedUser} />
                                      </div>
                                    )
                                  }}

                                </Query>
                              </div>
                            </div>
                          ) : (
                              <div className="ed-block-body ed-block-empty">
                                <div className="ed-block-icon"><span className="fa fa-hand-o-left"></span></div>
                                <h5>{t('pleaseSelectAPath')}</h5>
                              </div>
                            )}
                        </div>
                      </div>
                    )}

                    <div className="cell small-12 medium-6 large-4">
                      {selectedPath !== null && (
                        <div className="ed-block" id="block-skills">
                          <div className="ed-block-header">
                            <h3>{t('skills')}</h3>
                          </div>
                          {!selectedUser ? (
                            <div className="ed-block-body ed-block-empty">
                              <div className="ed-block-icon"><span className="fa fa-hand-o-left"></span></div>
                              <h5>{t('pleaseSelectAUser')}</h5>
                            </div>
                          ) : (
                              <div className="ed-block-body">

                                <Query query={ENTERPRISE_SKILLS} variables={{ pathId: selectedPath, participantId: selectedUser }} fetchPolicy="cache-and-network">
                                  {({ data, loading, error }) => {

                                    if (loading) return <p className="loading">{t('loading')}</p>
                                    if (error) return <p className="error">{t('error')}</p>

                                    const { paths } = data;

                                    const selPath = paths.edges.length > 0 && paths.edges.find(p => p.node.id === selectedPath);
                                    const participant = selPath.node.participants.edges.find(p => p.node.id === selectedUser);
                                    const skillPoints = participant ? participant.node.skillPoints : null;
                                    return (
                                      <div className="ed-block-item">

                                        <Skill data={skillPoints.edges} />

                                      </div>
                                    )
                                  }}

                                </Query>


                                {0 ? (
                                  <div className="ed-block-empty">
                                    <h6>{t('dontHaveSkillPoints')}</h6>
                                  </div>
                                ) : (
                                    <div className="ed-block-item">
                                      <div className="ed-progress-bar">
                                        {/* {selectedUserIndex !== null && combinedPath[selectedPathIndex].participants[selectedUserIndex].skillPoints.map((skill, index) => {
                                            const maxValue = skillData.find(e => e.id === skill.skill.id) || null;
                                            const userValue = maxValue ? (skill.value / maxValue.max)*100 : skill.value;
                                            return (
                                            // <div className="progress-item" onClick={() => this.handleOpenSkillModal(index)} key={skill.skill.id + index}>
                                            <div className="progress-item" key={skill.skill.id + index}>
                                              <div className="target-bar target-top" style={{ width: '100%' }}></div>
                                              <div className="target-bar target-organisation" style={{ width: `100%` }}></div>
                                              <div className="target-bar target-users" style={{ width:  `${userValue}%` }}></div>
                                              <div className="target-text">{skill.skill.title} <strong>{skill.value} pt</strong></div>
                                              <Link className="target-link" title={skill.node.title} to={`/${organisation}/${skill.node.id}`}>{skill.node.title}</Link>
                                            </div>
                                          )})} */}
                                      </div>
                                    </div>
                                  )}

                                {/* <Modal
                                      isOpen={showSkillModal}
                                      contentLabel="Skill Information"
                                      onRequestClose={this.handleCloseSkillModal}
                                      className="reveal enterprise-reveal"
                                      ariaHideApp={false}
                                    >
                                      <div className="enterprise-skill-container">
                                        {skills.edges.length && skills.edges.map((skill, index) => (
                                          <div className={`enterprise-skill ${index === selectedSkill ? 'active' : ''}`} key={skill.node.id + index}>
                                            <div className="flex-container align-middle align-between">
                                              <h5>Set Organisation Target</h5>
                                              <Link to={`/${organisation}/${skill.node.id}`} className="button small" style={{ margin: 0 }}>Go to Skill page</Link>
                                            </div>
                                            <hr />
                                            <SkillTarget url={`/${organisation}/${skill.node.id}`} name={skill.node.title} value={Math.floor(skill.node.value * 100)} averageValue={Math.floor(skill.node.averageValue * 100)} />
                                          </div>
                                        ))}
                                      </div>
                                      <button className="close-reveal" onClick={this.handleCloseSkillModal}>
                                        &times;
                                    </button>
                                    </Modal> */}
                              </div>
                            )}
                        </div>
                      )}
                    </div>


                    <div className="cell small-12 medium-6 large-12" style={{ display: 'none' }}>
                      <div className="ed-block" id="block-info">
                        <div className="ed-block-header">
                          <h3>{t('actionInformation')}</h3>
                        </div>
                        <div className="ed-block-body">
                          <div className="ed-block-item">
                            <div className="ed-action-list">
                              {selectedUser ? (
                                <ul>
                                  <li>User's reviews: {selectedUser + 1 * Math.floor(Math.random() * 8 + 1)} reviews</li>
                                  <li>Enrolled paths: {selectedUser + 1 * Math.floor(Math.random() * 6 + 1)} paths</li>
                                  <li>User's skills: {selectedUser + 1 * Math.floor(Math.random() * 6 + 1)} skills</li>
                                  <li>User's posts: {selectedUser + 1 * Math.floor(Math.random() * 7 + 1)} posts</li>
                                  <li>User's videos: {selectedUser + 1 * Math.floor(Math.random() * 2 + 1)} videos</li>
                                  <li>Give reactions: {selectedUser + 1 * Math.floor(Math.random() * 3 + 1)} reactions</li>
                                </ul>
                              ) : (
                                  <ul>
                                    <li>Number of Participants: 541 person</li>
                                    <li>Number of Review: 312 reviews</li>
                                    <li>Number of Paths: 45 paths</li>
                                    <li>Number of Skills: 22 skills</li>
                                    <li>Number of Posts: 3.201 posts</li>
                                    <li>Number of Videos: 79 videos</li>
                                    <li>Reactions: 19.123 reactions</li>
                                    <li>Overall Mentor Rating: 7 of 10</li>
                                  </ul>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }}
          </Query>
        </div>
      </Wrapper>
    );
  }
}

export default withTranslation()(EnterpriseDashboard);
