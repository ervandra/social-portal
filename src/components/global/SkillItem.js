import React from "react";
import { Link } from 'react-router-dom';
import Slider from 'rc-slider';
import Tooltip from 'rc-tooltip';
import 'rc-slider/assets/index.css';
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

class SkillItem extends React.Component {
  state = {
    isExpanded: false,
    myTargetValue: 0,
    isModalOpen: false,
  }
  handleExpand = () => {
    console.log('expand');
    const { isExpanded } = this.state;
    this.setState({ isExpanded: !isExpanded })
  }
  openModal = () => {
    this.setState({
      isModalOpen: true,
    })

  }
  closeModal = () => {
    this.setState({
      isModalOpen: false,
    })
  }

  onSliderChange = (value) => {
    this.setState({
      myTargetValue: value
    })
    // console.log('value', value)
  }
  onAfterChange = (value) => {
    this.openModal();
  }
  componentDidMount() {
    const { value } = this.props;
    const avgMyTargetValue = value < 90 ? value + (value * 1 / 10) : value;
    this.setState({
      myTargetValue: avgMyTargetValue
    })
  }
  render() {
    const { isExpanded, myTargetValue, isModalOpen } = this.state;
    const { name, title, url, averageValue, value, orgTargetValue, industryAvg, globalAvg, showTarget, t } = this.props;
    return (
      <div className="sv-skill-item">
        <div className="sv-skill-header">
          <div className={`sv-skill-toggle ${isExpanded ? 'active' : ''}`}><a onClick={this.handleExpand}><span className="fa fa-caret-right" /></a></div>
          <h5><Link to={url}>{title}</Link></h5>
        </div>
        <div className={`sv-skill-content ${isExpanded ? 'active' : ''}`} onClick={!isExpanded ? this.handleExpand : null} title={!isExpanded ? 'Click to expand your skill detail' : ''}>
          <div className="sv-progress">
            {name && (
              <h6>
                {name}
              </h6>
            )}
            <div className="sv-progress-bar">
              <div className="sv-progress-meter" style={{ width: value + '%', backgroundColor: '#006cad' }}><span className="sv-progress-text">{value}%</span></div>
              {showTarget && (
                <div>
                  {isExpanded ? (
                    <LLSlider
                      min={0}
                      max={100}
                      className="rc-slider-bar rc-slider-user"
                      value={myTargetValue}
                      handle={handle}
                      tipFormatter={value => `${value}%`}
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
                  ) : (
                      <div className="sv-drag-target drag-target-user" title="Set your target" style={{ left: myTargetValue + '%' }}><span className="fa fa-user" /></div>
                    )}
                </div>
              )}
            </div>

            {isExpanded && showTarget && (
              <p>{t('setTargetText')}
                {isModalOpen && (
                  <strong style={{ color: '#006cad', animation: 'blink 1s infinite linear' }}><em> &nbsp;{t('newFeatureWarning')}</em></strong>
                )}
              </p>
            )}
          </div>

          <div className="sv-progress">
            <h6>{t('orgAvg')}</h6>
            <div className="sv-progress-bar">
              <div className="sv-progress-meter sv-progress-org" style={{ width: averageValue + '%', backgroundColor: '#006cad', opacity: '.6' }}><span className="sv-progress-text">{averageValue}%</span></div>
            </div>
            {showTarget && (
              <div className="sv-drag-target" title={t('orgTarget')} style={{ left: orgTargetValue + '%' }}><span className="fa fa-star" /></div>
            )}
          </div>

          <div className="sv-progress">
            <h6>{t('industryAvg')}</h6>
            <div className="sv-progress-bar">
              <div className="sv-progress-meter" style={{ width: industryAvg + '%' }}></div>
            </div>
          </div>

          <div className="sv-progress">
            <h6>{t('globalAvg')}</h6>
            <div className="sv-progress-bar">
              <div className="sv-progress-meter" style={{ width: globalAvg + '%' }}></div>
            </div>
          </div>

        </div>
      </div>
    )
  }
}

export default withTranslation()(SkillItem)