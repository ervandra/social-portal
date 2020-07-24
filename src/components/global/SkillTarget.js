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

class SkillTarget extends React.Component {
  state = {
    targetValue: 0,
    isModalOpen: false,
  }
  componentDidMount() {
    const { value } = this.props;
    this.setState({
      targetValue: value
    })
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
      targetValue: value
    })
  }
  onAfterChange = (value) => {
    this.openModal();
  }
  render() {
    const { targetValue, isModalOpen } = this.state;
    const { name, url, averageValue, t } = this.props;
    return (
      <div className="t-skill-item">
        <div className="t-skill-header">
          {url ? (
            <h5><Link to={url}>{name}</Link></h5>
          ) : (
              <h5>{name}</h5>
            )}
        </div>
        <div className="t-skill-content">
          <div className="t-progress">
            <div className="t-progress-bar">
              <div className="t-progress-meter" style={{ width: averageValue + '%', backgroundColor: '#006cad' }}><span className="t-progress-text">{averageValue}%</span></div>
              <LLSlider
                min={0}
                max={100}
                className="rc-slider-bar rc-slider-organisation"
                value={targetValue}
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
            </div>
          </div>
          <p>{t('changeOrgTargetWarning')}</p>
          {isModalOpen && (
            <p><strong style={{ color: '#006cad', animation: 'blink 1s infinite linear' }}><em> &nbsp;{t('newFeatureWarning')}</em></strong></p>
          )}
        </div>
      </div>
    )
  }
}

export default withTranslation()(SkillTarget)