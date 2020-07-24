import React from "react";
import { Link } from 'react-router-dom';
import Slider from 'rc-slider';
import Tooltip from 'rc-tooltip';
import 'rc-slider/assets/index.css';
import { Mutation } from 'react-apollo';
import { SET_PERSONAL_TARGET } from '../../store/gql/queries';
import { withTranslation } from "react-i18next";

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

class NewSkillItem extends React.Component {
  state = {
    isExpanded: false,
    myTargetValue: 0,
    hasChanges: false,
    myProgress: 0,
    myPersonalProgress: 0,
    orgAverageProgress: 0,
    orgTargetProgress: 0,
    industryProgress: 0,
    globalProgress: 0,
    timeout: false,
    togglePersonal: false,
    toggleOrg: false,
  }
  handleExpand = () => {
    // console.log('expand');
    const { isExpanded } = this.state;
    this.setState({ isExpanded: !isExpanded })
  }
  handleTogglePersonal = () => {
    const { togglePersonal } = this.state;
    this.setState({ togglePersonal: !togglePersonal })
  }
  handleToggleOrg = () => {
    const { toggleOrg } = this.state;
    this.setState({ toggleOrg: !toggleOrg })
  }

  onSliderChange = (value) => {
    this.setState({
      myTargetValue: value
    })
  }
  onAfterChange = (value) => {
    this.setState({
      hasChanges: true,
      timeout: false,
    })
  }
  componentDidMount() {
    const { myTarget, value, orgAverage, orgTarget, maxValue, industryAverage, globalAverage } = this.props;
    const myProgress = ((value / maxValue) * 100).toFixed(0);
    const myPersonalProgress = myTarget > maxValue ? 100 : ((myTarget / maxValue) * 100).toFixed(0);
    const orgAverageProgress = ((orgAverage / maxValue) * 100).toFixed(0);
    const orgTargetProgress = ((orgTarget / maxValue) * 100).toFixed(0);
    const industryProgress = ((industryAverage / maxValue) * 100).toFixed(0);
    const globalProgress = ((globalAverage / maxValue) * 100).toFixed(0);
    this.setState({
      myTargetValue: myTarget,
      myProgress,
      myPersonalProgress,
      orgAverageProgress,
      orgTargetProgress,
      industryProgress,
      globalProgress
    })
  }
  setNewTarget = val => {
    this.setState({
      myTargetValue: val,
      timeout: true,
    })
    setTimeout(() => this.setState({ timeout: false, hasChanges: false }), 2000);
  }
  render() {
    const { isExpanded, myTargetValue, hasChanges, myProgress, myPersonalProgress, orgAverageProgress, orgTargetProgress, industryProgress, globalProgress, timeout, togglePersonal, toggleOrg } = this.state;
    const { skillId, userId, title, url, value, industryAverage, globalAverage, orgAverage, showTarget, orgTarget, maxValue, t } = this.props;

    return (
      <div className="sv-skill-item">
        <div className="sv-skill-header">
          <div className={`sv-skill-toggle ${isExpanded ? 'active' : ''}`}><a href="#handle" onClick={this.handleExpand}><span className="fa fa-caret-right" /></a></div>
          <h5><Link to={url}>{title}</Link></h5>
        </div>
        <div className={`sv-skill-content ${isExpanded ? 'active' : ''}`} onClick={!isExpanded ? this.handleExpand : null} title={!isExpanded ? 'Click to expand your skill detail' : ''}>
          <div className="sv-progress">
            <h6>
              <strong>{t('myProgress')} &nbsp;
                <span className="toggle-personal" onClick={this.handleTogglePersonal}>
                  {togglePersonal ? (
                    <span className="fa fa-minus-circle"></span>
                  ) : (
                      <span className="fa fa-plus-circle"></span>
                    )}

                </span>
              </strong>
            </h6>
            {isExpanded && togglePersonal && (
              <ul className="progress-detail">
                <li>{t('myValue')}: <mark>{value}</mark> pt</li>
                <li>{t('myTarget')}: <mark>{myTargetValue}</mark> pt</li>
              </ul>
            )}
            <div className="sv-progress-bar">
              <div className={`sv-progress-meter ${myProgress === '100' ? 'completed' : 'not-completed'}`} style={{ width: myProgress + '%' }}><span className="sv-progress-text">{myProgress}%</span></div>
              {showTarget && (
                <div>
                  {isExpanded ? (
                    <div>
                      <React.Fragment>
                        {/* <div className="sv-drag-target" title="Organisation Target" style={{left: orgAverageProgress+'%'}}><span className="fa fa-star" /></div>
                        <div className="sv-drag-target" title="Organisation Average" style={{left: orgTargetProgress+'%'}}><span className="fa fa-line-chart" /></div> */}
                        <LLSlider
                          min={0}
                          max={maxValue}
                          className="rc-slider-bar rc-slider-user"
                          value={myTargetValue}
                          handle={handle}
                          tipFormatter={value2 => `${value2} pt`}
                          handleStyle={{
                            border: '1px solid #db8326',
                            height: 24,
                            width: 24,
                            marginLeft: -12,
                            marginTop: 0,
                            backgroundColor: '#f8a832',
                          }}
                          onChange={this.onSliderChange}
                          onAfterChange={this.onAfterChange}
                        />
                      </React.Fragment>
                    </div>
                  ) : (
                      <React.Fragment>

                        <div className="sv-presentation-bar">
                          {orgTarget !== 0 && (
                            <div className="sv-drag-target" title={`Organisation Target: ${orgTarget}pt`} style={{ left: orgTargetProgress + '%' }}><span className="fa fa-line-chart" /></div>
                          )}
                          {/* <div className="sv-drag-target drag-org-average" title="Organisation Average" style={{left: orgAverageProgress+'%'}}><span className="fa fa-star" /></div> */}
                          <div className="sv-drag-target drag-target-user" title="Set your target" style={{ left: myPersonalProgress + '%' }}><span className="fa fa-user" /></div>
                        </div>

                      </React.Fragment>
                    )}
                </div>
              )}
            </div>

            {isExpanded && showTarget && (
              <p>{t('setTargetText')}
                {/* {isModalOpen && (
                  <strong style={{color: '#006cad', animation: 'blink 1s infinite linear'}}><em> &nbsp;This feature will be available on the next release.</em></strong>
                )} */}
              </p>
            )}
            {hasChanges && (
              <Mutation mutation={SET_PERSONAL_TARGET} onCompleted={data => {
                const { setPersonalSkillTarget } = data;
                const { userskillpointsNode } = setPersonalSkillTarget;
                const { target } = userskillpointsNode;
                this.setNewTarget(target);
              }} fetchPolicy="no-cache">
                {(setPersonalSkillTarget, { data, loading, error }) => {
                  if (data && timeout) {
                    return <div className="alert success" style={{ marginTop: '-8px' }}><p style={{ margin: '0' }}>{t('setTargetSuccess')}</p></div>
                  }
                  return (
                    <div className="sv-mutation-button" style={{ display: isExpanded ? 'block' : 'none' }}>
                      <p style={{ marginTop: '-1rem' }}>
                        <a
                          href="#load"
                          className="button small success"
                          style={{ color: '#ffffff', animation: 'blink .5s 1 ease-out' }}
                          onClick={async () => {
                            await setPersonalSkillTarget({ variables: { clientMutationId: 'set_personal_target', skillId: skillId, target: myTargetValue, userId: userId } })
                          }}
                        >
                          {t('savePersonalTarget')}
                        </a>
                      </p>
                    </div>
                  )
                }
                }
              </Mutation>
            )}
          </div>

          {isExpanded && (
            <React.Fragment>
              <div className="sv-progress">
                <hr />
                <h6>{t('orgProgress')} &nbsp;
                  <span className="toggle-org" onClick={this.handleToggleOrg}>
                    {toggleOrg ? (
                      <span className="fa fa-minus-circle"></span>
                    ) : (
                        <span className="fa fa-plus-circle"></span>
                      )}
                  </span>
                </h6>
                {isExpanded && toggleOrg && (
                  <ul className="progress-detail">
                    <li>{t('orgAvg')}: <mark>{orgAverage.toFixed(0)}</mark> pt</li>
                    <li>{t('orgTarget')}: <mark>{orgTarget}</mark> pt</li>
                  </ul>
                )}
                {/* <h6>Organisation Average: <mark>{orgAverage.toFixed(0)}</mark> pt</h6> */}
                <div className="sv-progress-bar">
                  {orgTarget !== 0 && (
                    <div className="sv-drag-target" title={`Organisation Target: ${orgTarget}pt`} style={{ left: orgTargetProgress + '%' }}><span className="fa fa-line-chart" /></div>
                  )}
                  <div className={`sv-progress-meter sv-progress-org`} style={{ width: orgAverageProgress + '%' }}><span className="sv-progress-text">{orgAverageProgress}%</span></div>
                </div>
              </div>

              <div className="sv-progress">
                <h6>{t('industryAvg')}: <mark>{industryAverage}</mark> pt</h6>
                <div className="sv-progress-bar">
                  <div className={`sv-progress-meter`} style={{ width: 100 + '%', background: '#aaa' }}><span className="sv-progress-text">{industryProgress}%</span></div>
                </div>
              </div>

              <div className="sv-progress">
                <h6>{t('globalAvg')}: <mark>{globalAverage}</mark> pt</h6>
                <div className="sv-progress-bar">
                  <div className={`sv-progress-meter`} style={{ width: 100 + '%', background: '#aaa' }}><span className="sv-progress-text">{globalProgress}%</span></div>
                </div>
              </div>
            </React.Fragment>
          )}

        </div>
      </div>
    )
  }
}

export default withTranslation()(NewSkillItem)