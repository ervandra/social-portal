import React, { Component } from 'react';
import Wrapper from '../layouts/wrapper';
// import { Link } from 'react-router-dom';
// import Modal from 'react-modal';
// import SkillTarget from '../global/SkillTarget';
import { Query, Mutation } from 'react-apollo';
import { NEW_ENTERPRISE_DASHBOARD, NE_PATHS_PARTICIPANTS, NE_SKILL_PARTICIPANTS, NE_PATH_FROM_SKILL, NE_SKILL_INFO, NE_SKILL_TARGET, SET_ORG_SKILL_TARGET } from '../../store/gql/queries';
import { withTranslation } from 'react-i18next';

import Slider from 'rc-slider';
import Tooltip from 'rc-tooltip';
import 'rc-slider/assets/index.css';

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const LLSlider = createSliderWithTooltip(Slider);
const Handle = Slider.Handle;

const handle = (props) => {
  const { value, dragging, index, ...restProps } = props;
  return (
    <Tooltip
      prefixCls="rc-slider-tooltip"
      overlay={value}
      visible={dragging}
      placement="top"
      key={index}
    >
      <Handle value={value} {...restProps} />
    </Tooltip>
  );
};
class NewEnterprise extends Component {

  state = {
    tab: 'paths',
    seachedPath: null,
    seachedSkill: null,
    seachedUser: null,
    selectedPath: null,
    selectedSkill: null,
    selectedUser: null,
    pathParticipant: null,
    skillParticipant: null,
    pathParticipantSort: true,
    pathParticipantSkillSort: true,
    skillParticipantSort: true,
    searchedSkillUser: null,
    searchedPathUser: null,
    skillMax: 0,
    pathSkillMax: [],
    mutationTarget: 0,
    globalTarget: 0,
  }

  handleExpand = () => {
    console.log('expand');
    const { isExpanded } = this.state;
    this.setState({ isExpanded: !isExpanded })
  }

  changeTab = tab => {
    this.setState({
      tab,
      searchedPath: null,
      searchedSkill: null,
      searchedUser: null,
      selectedPath: null,
      selectedSkill: null,
      selectedUser: null,
      pathParticipant: null,
      skillParticipant: null,
      pathParticipantSort: true,
      pathParticipantSkillSort: true,
      skillParticipantSort: true,
      searchedSkillUser: null,
      searchedPathUser: null,
      skillMax: 0,
      pathSkillMax: [],
      mutationTarget: 0,
      globalTarget: 0,
    })
  }

  searchPath = ev => {
    const val = ev.target.value;
    // console.log('v', val);
    this.setState({
      searchedPath: val,
    })
  }

  searchSkill = ev => {
    const val = ev.target.value;
    // console.log('v', val);
    this.setState({
      searchedSkill: val,
    })
  }

  searchUser = ev => {
    const val = ev.target.value;
    // console.log('v', val);
    this.setState({
      searchedUser: val,
    })
  }

  searchSkillUser = ev => {
    const val = ev.target.value;
    this.setState({
      searchedSkillUser: val,
    })
  }

  searchSkillUser = ev => {
    const val = ev.target.value;
    this.setState({
      searchedSkillUser: val,
    })
  }

  searchPathUser = ev => {
    const val = ev.target.value;
    this.setState({
      searchedPathUser: val,
    })
  }

  selectPath = id => {
    const { selectedPath } = this.state;
    const newPath = selectedPath === id ? null : id;
    this.setState({
      selectedPath: newPath,
      pathParticipant: null,
    })
  }

  selectSkill = id => {
    const { selectedSkill } = this.state;
    const newSkill = selectedSkill === id ? null : id;
    this.setState({
      selectedSkill: newSkill,
      skillMax: 0,
      mutationTarget: 0,
      globalTarget: 0,
    })
  }

  selectUser = user => {
    const { selectedUser } = this.state;
    const newUser = selectedUser ? selectedUser.id === user.id ? null : user : user;
    this.setState({
      selectedUser: newUser,
    })
  }

  selectPathParticipant = user => {
    const { pathParticipant } = this.state;
    const newPathParticipant = pathParticipant !== null && pathParticipant.id === user.id ? null : user;
    this.setState({
      pathParticipant: newPathParticipant,
    })
  }

  selectSkillParticipant = user => {
    const { skillParticipant } = this.state;
    const newSkillParticipant = skillParticipant !== null && skillParticipant.id === user.id ? null : user;
    this.setState({
      skillParticipant: newSkillParticipant,
    })
  }

  changePathParticipantSort = sort => {
    this.setState({
      pathParticipantSort: sort
    })
  }

  changePathParticipantSkillSort = sort => {
    this.setState({
      pathParticipantSkillSort: sort
    })
  }

  changeSkillParticipantSort = sort => {
    this.setState({
      skillParticipantSort: sort
    })
  }

  setMax = max => {
    const { skillMax } = this.state;
    if (skillMax === 0) {
      if (skillMax !== max) {
        this.setState({
          skillMax: max,
        })
      }
    }
  }

  setSkillMax = skills => {
    const { pathSkillMax } = this.state;
    if (pathSkillMax.length === 0) {
      this.setState({
        pathSkillMax: skills,
      })
    }
  }

  setMutationTarget = value => {
    this.setState({
      globalTarget: value,
      mutationTarget: value,
    })
  }

  onSliderChange = value => {
    this.setState({
      globalTarget: value
    })
  }

  render() {
    const { organisation, t } = this.props;
    const { tab, searchedPath, searchedSkill, searchedUser, selectedPath, selectedSkill, selectedUser, pathParticipant, pathParticipantSort, pathParticipantSkillSort, skillParticipantSort, searchedSkillUser, searchedPathUser, mutationTarget, globalTarget } = this.state;
    return (
      <Wrapper>
        <Query query={NEW_ENTERPRISE_DASHBOARD} variables={{ name: organisation }}>
          {({ data, loading, error }) => {
            if (loading || error) return null;

            const { organisations } = data;
            const org = organisations.edges.length ? organisations.edges[0].node : null;
            const orgPaths = org.paths.edges.length ? org.paths.edges : [];
            const orgSkills = org.skills.edges.length ? org.skills.edges : [];
            const orgUsers = (org.users && org.users.edges && org.users.edges.length) ? org.users.edges : [];

            if (!org) return <p className="loading">{t('orgNotFound')}</p>;
            if (orgUsers.length === 0) return null;

            const sortedPathParticipants = pathParticipant ? {
              id: pathParticipant.id,
              username: pathParticipant.username,
              firstName: pathParticipant.firstName,
              lastName: pathParticipant.lastName,
              profilePictureUrl: pathParticipant.profilePictureUrl,
              skillPoints: []
            } : null;
            let psp = [];
            if (sortedPathParticipants) {
              for (let w = 0; w < pathParticipant.skillPoints.edges.length; w++) {
                const pspw = pathParticipant.skillPoints.edges[w].node;
                const data = {
                  id: pspw.id,
                  value: pspw.value,
                  target: pspw.target,
                  skill: pspw.skill,
                }
                psp.push(data);
              }
            }
            const newSortedPathParticipantSkill = psp.length > 0 ? psp.slice().sort((a, b) => pathParticipantSkillSort ? b.value - a.value : a.value - b.value) : [];
            if (pathParticipant) {
              sortedPathParticipants.skillPoints = newSortedPathParticipantSkill;
            }



            return (
              <div className="new-enterprise-dashboard">

                <div className="enterprise-intro">
                  <h5><span className="fa fa-building-o"></span> &nbsp;<strong>{org.title}</strong></h5>
                  <div className="enterprise-summaries">
                    <p>{t('numOfPaths')}: <strong>{orgPaths.length}</strong></p>
                    <p>{t('numOfSkills')}: <strong>{orgSkills.length}</strong></p>
                    <p>{t('numOfUsers')}: <strong>{orgUsers.length}</strong></p>
                    {selectedSkill && (
                      <Query query={NE_SKILL_INFO} variables={{ skillId: selectedSkill }}>
                        {({ data, loading, error }) => {
                          if (loading || error) return null;
                          const stats = data.skills.edges[0].node.stats.edges;
                          const average = stats.length > 0 ? stats[0].node.average : 0;
                          if (!average) return null;
                          return (
                            <p>{t('skill')} <b>{data.skills.edges[0].node.title}</b> {t('average')}: <strong>{average.toFixed(2)}</strong></p>
                          )
                        }}
                      </Query>
                    )}
                  </div>
                </div>

                <div className="alert warning">
                  <p><span className="fa fa-info-circle"></span> <em>{t('changeTabToSeeMore')}</em></p>
                </div>
                <div className="enterprise-header">
                  <ul>
                    <li className={tab === 'paths' ? 'active' : ''} onClick={() => this.changeTab('paths')}>{t('paths')}</li>
                    <li className={tab === 'skills' ? 'active' : ''} onClick={() => this.changeTab('skills')}>{t('skills')}</li>
                    <li className={tab === 'users' ? 'active' : ''} onClick={() => this.changeTab('users')}>{t('users')}</li>
                  </ul>
                </div>

                <div className="enterprise-content">

                  <div className="grid-margin-x grid-x">

                    {tab === 'paths' && orgPaths.length && (
                      <div className="cell small-12 medium-4">
                        <div className="ebox">
                          <div className="box-header">
                            <h6>{t('pathLists')}</h6>
                          </div>
                          <div className="box-content">
                            <div className="box-search">
                              <input type="search" name="search-paths" placeholder={t('searchPaths')} onChange={this.searchPath} />
                            </div>
                            <ul>
                              {orgPaths.map((path, index) => {
                                const { title, id, imageUrl } = path.node;

                                if (searchedPath && title.toLowerCase().indexOf(searchedPath.toLowerCase()) === -1) return null;

                                return (
                                  <li key={id + index} className={`clickable ${selectedPath === id ? 'active' : ''}`} onClick={() => this.selectPath(id)}>
                                    <span className="img"><img src={imageUrl} alt="" width="20" height="20" /></span>
                                    {searchedPath ? (
                                      <div dangerouslySetInnerHTML={{ __html: title.replace(searchedPath, `<strong>${searchedPath}</strong>`) }} />
                                    ) : (
                                        <span>{title}</span>
                                      )}
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {tab === 'paths' && orgPaths.length > 0 && (
                      <div className="cell small-12 medium-4">
                        <div className="ebox">
                          {selectedPath ? (
                            <div className="box-header secondary">
                              <h6>{t('participants')}</h6>
                              {/* {pathParticipantSort ? (
                                <h6 className="sort-header" title="Descending" onClick={() => this.changePathParticipantSort(false)}>{t('sort')} <span className="fa fa-sort-amount-desc"></span></h6>
                              ) : (
                                <h6 className="sort-header" title="Ascending" onClick={() => this.changePathParticipantSort(true)}>{t('sort')} <span className="fa fa-sort-amount-asc"></span></h6>
                              )} */}
                            </div>
                          ) : (
                              <div className="box-header secondary">
                                <h6>{t('participants')}</h6>
                              </div>
                            )}
                          <div className="box-content">
                            {selectedPath && (
                              <div className="box-search">
                                <input type="search" name="search-path-users" placeholder={t('searchUsers')} onChange={this.searchPathUser} />
                              </div>
                            )}
                            {selectedPath ? (
                              <div className="box-wrapper">
                                <Query query={NE_PATHS_PARTICIPANTS} variables={{ pathId: selectedPath.substring(8) }}
                                  onCompleted={data => {
                                    const { paths } = data;
                                    const participants = paths.edges.length > 0 && paths.edges[0].node.participants.edges.length > 0 ? paths.edges[0].node.participants.edges : [];
                                    if (participants.length > 0) {
                                      let skills = [];
                                      for (let d = 0; d < participants.length; d++) {
                                        const pp = participants[d].node;
                                        const sp = pp.skillPoints.edges.length > 0 ? pp.skillPoints.edges : [];
                                        for (let e = 0; e < sp.length; e++) {
                                          const point = sp[e].node;
                                          const val = point.value;
                                          const skillId = point.skill.id;
                                          const skillTitle = point.skill.title;
                                          let data = {
                                            id: skillId,
                                            value: val,
                                            title: skillTitle,
                                          }
                                          if (skills.length === 0) {
                                            skills.push(data)
                                          } else {
                                            const sidx = skills.findIndex(s => s.id === skillId);
                                            if (sidx !== -1) {
                                              if (skills[sidx].value < val) {
                                                skills[sidx].value = val;
                                              }
                                            } else {
                                              skills.push(data);
                                            }
                                          }
                                        }
                                      }
                                      this.setSkillMax(skills);
                                    }
                                  }}
                                >
                                  {({ data, loading, error }) => {
                                    if (loading) return <p className="loading">{t('loading')}</p>
                                    if (error) return <p className="error">{t('error')}</p>

                                    const { paths } = data;
                                    const pathPaths = paths.edges.length > 0 ? paths.edges : [];

                                    if (pathPaths.length === 0) return (
                                      <div className="box-empty">
                                        <div className="box-icon"><span className="fa fa-warning"></span></div>
                                        <h5>{t('userDetailWarning')}</h5>
                                      </div>
                                    )
                                    const participants = pathPaths[0].node.participants.edges.length ? pathPaths[0].node.participants.edges : [];
                                    let dataParticipants = [];
                                    for (let y = 0; y < participants.length; y++) {
                                      const p = participants[y].node;
                                      let total = 0;
                                      if (p.skillPoints.edges.length) {
                                        for (let x = 0; x < p.skillPoints.edges.length; x++) {
                                          const sp = p.skillPoints.edges[x].node;
                                          total += sp.value;
                                        }
                                      }
                                      const data = {
                                        user: p,
                                        totalPoints: total
                                      }
                                      dataParticipants.push(data);
                                    }
                                    const sortedParticipants = dataParticipants.slice().sort((a, b) => pathParticipantSort ? b.totalPoints - a.totalPoints : a.totalPoints - b.totalPoints);
                                    return (
                                      <ul className="path-participants user-points">
                                        {sortedParticipants.length > 0 && sortedParticipants.map((userNode, index) => {
                                          const { user } = userNode;
                                          const { id, username, firstName, lastName, profilePictureUrl } = user;
                                          const sname = firstName !== '' && lastName !== '' ? firstName + ' ' + lastName : firstName !== '' ? firstName : lastName === '' ? username : lastName;

                                          if (searchedPathUser && sname.toLowerCase().indexOf(searchedPathUser.toLowerCase()) === -1) return null;

                                          return (
                                            <li key={username + index} className={`clickable ${pathParticipant && pathParticipant.id === id ? 'active' : ''}`} onClick={() => this.selectPathParticipant(user)}>
                                              <span className="img"><img src={profilePictureUrl} alt="" /></span>
                                              <span className="text">{sname}</span>
                                              {/* <span className="total-points">
                                                {totalPoints} pt
                                              </span> */}
                                            </li>
                                          )
                                        })}
                                      </ul>
                                    )
                                  }}
                                </Query>
                              </div>
                            ) : (
                                <div className="box-empty">
                                  <div className="box-icon"><span className="fa fa-hand-o-left"></span></div>
                                  <h5>{t('pleaseSelectAPath')}</h5>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    )}

                    {tab === 'paths' && orgPaths.length > 0 && selectedPath && sortedPathParticipants && (
                      <div className="cell small-12 medium-4">
                        <div className="ebox">
                          <div className="box-header secondary">
                            <h6>{t('userSkillPoints')}</h6>
                            {pathParticipantSkillSort ? (
                              <h6 className="sort-header" title="Descending" onClick={() => this.changePathParticipantSkillSort(false)}>{t('sort')} <span className="fa fa-sort-amount-desc"></span></h6>
                            ) : (
                                <h6 className="sort-header" title="Ascending" onClick={() => this.changePathParticipantSkillSort(true)}>{t('sort')} <span className="fa fa-sort-amount-asc"></span></h6>
                              )}
                          </div>
                          <div className="box-content">
                            {sortedPathParticipants.skillPoints.length > 0 ? (
                              <ul className="skill-points">
                                {sortedPathParticipants.skillPoints.map((sp, index) => {
                                  const { value, id, skill } = sp;
                                  const maxValue = skill.stats.edges.length > 0 ? skill.stats.edges[0].node.maxValue : null;
                                  const myProgress = maxValue && (value < maxValue) ? parseFloat((value / maxValue) * 100).toFixed(2) : 100;
                                  const isThisOrgSkill = orgSkills.length > 0 ? orgSkills.findIndex(ss => {
                                    const match = ss.node.id === skill.id;
                                    return match;
                                  }) : -1;

                                  if (isThisOrgSkill === -1) return null;
                                  return (
                                    <Query query={NE_PATH_FROM_SKILL} variables={{ skillId: skill.id }} key={id + index}>
                                      {({ data, loading, error }) => {
                                        if (loading || error) return null;
                                        const { skills } = data;
                                        const pathData = skills.edges[0].node.paths.edges.length > 0 ? skills.edges[0].node.paths.edges : [];
                                        if (pathData.length === 0) return null;
                                        if (pathData.findIndex(p => p.node.id === selectedPath) === -1) return null;
                                        return (
                                          <li key={id + index}>
                                            {maxValue && (
                                              <span className="average" style={{ width: `${myProgress}%` }}></span>
                                            )}
                                            <span className="img"><img src={skill.imageUrl} alt="" /></span>
                                            <span className="text">{skill.title}</span>
                                            <strong>{value} pt</strong>
                                          </li>
                                        )
                                      }}
                                    </Query>

                                  )
                                })}
                              </ul>

                            ) : (
                                <div className="box-empty">
                                  <div className="box-icon"><span className="fa fa-warning"></span></div>
                                  <h5>{t('dontHaveSkillPoints')}</h5>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    )}

                    {tab === 'skills' && orgSkills.length && (
                      <div className="cell small-12 medium-4">
                        <div className="ebox">
                          <div className="box-header">
                            <h6>{t('skillLists')}</h6>
                          </div>
                          <div className="box-content">
                            <div className="box-search">
                              <input type="search" name="search-skills" placeholder={t('searchSkills')} onChange={this.searchSkill} />
                            </div>
                            <ul>
                              {orgSkills.map((skill, index) => {
                                const { title, id, imageUrl } = skill.node;

                                if (searchedSkill && title.toLowerCase().indexOf(searchedSkill.toLowerCase()) === -1) return null;

                                return (
                                  <li key={id + index} className={`clickable ${selectedSkill === id ? 'active' : ''}`} onClick={() => this.selectSkill(id)}>
                                    <span className="img"><img src={imageUrl} alt="" width="20" height="20" /></span>
                                    {searchedSkill ? (
                                      <div dangerouslySetInnerHTML={{ __html: title.replace(searchedSkill, `<strong>${searchedSkill}</strong>`) }} />
                                    ) : (
                                        <span>{title}</span>
                                      )}
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {tab === 'skills' && orgSkills.length > 0 && (
                      <div className="cell small-12 medium-4">
                        <div className="ebox">
                          <div className="box-header secondary">
                            <h6>{t('userPoints')}</h6>
                            {skillParticipantSort ? (
                              <h6 className="sort-header" title="Descending" onClick={() => this.changeSkillParticipantSort(false)}>{t('sort')} <span className="fa fa-sort-amount-desc"></span></h6>
                            ) : (
                                <h6 className="sort-header" title="Ascending" onClick={() => this.changeSkillParticipantSort(true)}>{t('sort')} <span className="fa fa-sort-amount-asc"></span></h6>
                              )}
                          </div>
                          <div className="box-content">
                            {selectedSkill && (
                              <div className="box-search">
                                <input type="search" name="search-skill-users" placeholder={t('searchUsers')} onChange={this.searchSkillUser} />
                              </div>
                            )}
                            {selectedSkill ? (
                              <Query query={NE_SKILL_PARTICIPANTS} variables={{ skillId: selectedSkill }} onCompleted={data => {
                                const { skills } = data;
                                const { userStats } = skills.edges[0].node;
                                let max = 0;
                                if (userStats.edges.length > 0) {
                                  for (let x = 0; x < userStats.edges.length; x++) {
                                    const s = userStats.edges[x].node;
                                    if (s.value > max) {
                                      max = s.value;
                                    }
                                  }
                                }
                                this.setMax(max);
                              }} fetchPolicy="network-only" notifyOnNetworkStatusChange={true}>
                                {({ data, loading, error }) => {
                                  if (loading) return <p className="loading">{t('loading')}</p>
                                  if (error) return <p className="error">{t('error')}</p>

                                  const { skills } = data;
                                  const skillData = skills.edges.length > 0 ? skills.edges[0].node : null;
                                  if (!skillData) return (
                                    <div className="box-empty">
                                      <div className="box-icon"><span className="fa fa-warning"></span></div>
                                      <h5>{t('errorGettingSkillData')}</h5>
                                    </div>
                                  )
                                  const skillParticipants = skillData.userStats.edges;
                                  if (skillParticipants.length === 0) return (
                                    <div className="box-empty">
                                      <div className="box-icon"><span className="fa fa-warning"></span></div>
                                      <h5>{t('errorGettingSkillData')}</h5>
                                    </div>
                                  )
                                  const sortedSkillParticipants = skillParticipants.slice().sort((a, b) => skillParticipantSort ? b.node.value - a.node.value : a.node.value - b.node.value);
                                  return (
                                    <ul className="skill-points">
                                      {sortedSkillParticipants.map((s, index) => {
                                        const { id, value, user } = s.node;
                                        const { username, firstName, lastName, profilePictureUrl } = user;
                                        const sname = firstName !== '' && lastName !== '' ? firstName + ' ' + lastName : firstName !== '' ? firstName : lastName === '' ? username : lastName;
                                        const maxValue = skillData.stats.edges ? skillData.stats.edges[0].node.maxValue : null;
                                        // const theAvg = maxValue > 0 && skillMax > average ? skillMax : average;
                                        const myProgress = maxValue && (value < maxValue) ? parseFloat((value / maxValue) * 100).toFixed(2) : 100;

                                        if (searchedSkillUser && sname.toLowerCase().indexOf(searchedSkillUser.toLowerCase()) === -1) return null;

                                        return (
                                          <li className={``} key={id + index}>
                                            {maxValue && (
                                              <span className="average" style={{ width: `${myProgress}%` }}></span>
                                            )}
                                            <span className="img"><img src={profilePictureUrl} alt="" /></span>
                                            <span className="text">{sname}</span>
                                            <strong>{value} pt</strong>
                                          </li>
                                        )
                                      })}
                                    </ul>
                                  )
                                }}
                              </Query>
                            ) : (
                                <div className="box-empty">
                                  <div className="box-icon"><span className="fa fa-hand-o-left"></span></div>
                                  <h5>{t('pleaseSelectASkill')}</h5>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    )}

                    {tab === 'skills' && orgSkills.length > 0 && selectedSkill && (
                      <div className="cell small-12 medium-4">
                        <div className="ebox">
                          <div className="box-header secondary">
                            <h6>{t('setSkillTarget')}</h6>
                          </div>
                          <div className="box-content">
                            <Query query={NE_SKILL_TARGET} variables={{ skillId: selectedSkill }} fetchPolicy="network-only">
                              {({ data, loading, error }) => {
                                if (loading || error) return null;
                                const { skills } = data;
                                const statsEdges = skills.edges[0].node.stats.edges.length > 0 ? skills.edges[0].node.stats.edges : [];
                                const target2 = statsEdges.length > 0 ? statsEdges[0].node.target : null;
                                const maxValue = statsEdges.length > 0 ? statsEdges[0].node.maxValue : 0;
                                const averageValue = statsEdges.length > 0 ? statsEdges[0].node.average.toFixed(0) : 0;

                                return (
                                  <div className="set-target" style={{ padding: '1rem' }}>
                                    <div className="skill-img" style={{ margin: '0 0 1rem' }}><img src={skills.edges[0].node.imageUrl} alt="" width="100" height="100" /></div>
                                    <h6><strong>{skills.edges[0].node.title}</strong></h6>
                                    <hr />
                                    <h6><strong>{t('currentTarget')}</strong>: <mark>{mutationTarget === 0 ? target2 : mutationTarget}</mark> pt</h6>
                                    <h6><strong>{t('average')}</strong>: <mark>{averageValue}</mark> pt</h6>
                                    <h6><strong>{t('max')}</strong>: <mark>{maxValue}</mark> pt</h6>
                                    <Mutation mutation={SET_ORG_SKILL_TARGET} onCompleted={data => {
                                      const { setSkillTarget } = data;
                                      const { skillpointstatsNode } = setSkillTarget;
                                      const { target } = skillpointstatsNode || 0;

                                      this.setMutationTarget(target);

                                    }} fetchPolicy="no-cache">
                                      {(setSkillTarget, { data, loading, error }) => {
                                        if (data) {
                                          return <div className="alert success"><p>{t('successUpdateSkillTarget')}</p></div>
                                        }
                                        return (
                                          <div >
                                            <hr />
                                            <h6>{t('setNewTarget')}: <strong>{globalTarget} pt</strong></h6>
                                            <div className="sv-progress-bar" style={{ margin: '0 0 1rem' }}>
                                              <div className="sv-progress-meter" style={{ width: '100%', backgroundColor: '#006cad' }}><span className="sv-progress-text">&nbsp;</span></div>
                                              <LLSlider
                                                min={0}
                                                max={maxValue}
                                                className="rc-slider-bar"
                                                value={globalTarget}
                                                handle={handle}
                                                tipFormatter={value => `${value} pt`}
                                                handleStyle={{
                                                  border: '1px solid #db8326',
                                                  height: 24,
                                                  width: 24,
                                                  marginLeft: -12,
                                                  marginTop: 0,
                                                  backgroundColor: '#f8a832',
                                                }}
                                                onChange={this.onSliderChange}
                                              />
                                            </div>
                                            {/* <input type="number" placeholder="Set Skill Target" value={mutationTarget} onChange={this.changeMutationTarget}/> */}
                                            <button className="button small success" style={{ color: 'white' }} type="button" onClick={async () => {
                                              await setSkillTarget({ variables: { clientMutationId: 'set_target_org', skillId: selectedSkill, target: globalTarget } })
                                            }}>{t('setTarget')}</button>
                                          </div>
                                        )
                                      }}
                                    </Mutation>
                                  </div>
                                )
                              }}
                            </Query>
                          </div>
                        </div>
                      </div>
                    )}


                    {tab === 'users' && orgUsers.length && (
                      <div className="cell small-12 medium-4">
                        <div className="ebox">
                          <div className="box-header">
                            <h6>{t('userLists')}</h6>
                          </div>
                          <div className="box-content">
                            <div className="box-search">
                              <input type="search" name="search-users" placeholder={t('searchUsers')} onChange={this.searchUser} />
                            </div>
                            <ul>
                              {orgUsers.map((user, index) => {
                                const { username, id, firstName, lastName, profilePictureUrl } = user.node;

                                const sname = firstName !== '' && lastName !== '' ? firstName + ' ' + lastName : firstName !== '' ? firstName : lastName === '' ? username : lastName;

                                if (searchedUser && sname.toLowerCase().indexOf(searchedUser.toLowerCase()) === -1) return null;

                                return (
                                  <li key={id + index} className={`clickable ${selectedUser ? selectedUser.id === id ? 'active' : '' : ''}`} onClick={() => this.selectUser(user.node)}>
                                    <span className="img"><img src={profilePictureUrl} alt="" width="20" height="20" /></span>
                                    {searchedUser ? (
                                      <div dangerouslySetInnerHTML={{ __html: sname.replace(searchedUser, `<strong>${searchedUser}</strong>`) }} />
                                    ) : (
                                        <span>{sname}</span>
                                      )}
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {tab === 'users' && orgUsers.length > 0 && (
                      <div className="cell small-12 medium-4">
                        <div className="ebox">
                          <div className="box-header secondary">
                            <h6>{t('userBasicInformation')}</h6>
                          </div>
                          <div className="box-content">
                            {selectedUser ? (
                              <div className="box-wrapper">
                                <div className="box-profile">
                                  <div className="bp-avatar">
                                    <img src={selectedUser.profilePictureUrl} alt="" width="60" height="60" />
                                  </div>
                                  <div className="bp-info">
                                    <h6>{selectedUser.fistName !== '' && selectedUser.lastName !== '' ? selectedUser.firstName + ' ' + selectedUser.lastName : selectedUser.firstName !== '' ? selectedUser.firstName : selectedUser.lastName === '' ? selectedUser.username : selectedUser.lastName}</h6>
                                    <p>{selectedUser.bio !== '' ? selectedUser.bio : `This user doesn't have Bio yet`}</p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                                <div className="box-empty">
                                  <div className="box-icon"><span className="fa fa-hand-o-left"></span></div>
                                  <h5>{t('pleaseSelectAUser')}</h5>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              </div>
            )

          }}
        </Query>
      </Wrapper>
    );
  }
}

export default withTranslation()(NewEnterprise);
