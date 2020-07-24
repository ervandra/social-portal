import React from "react";
import { Link } from 'react-router-dom';

export default class SkillProgress extends React.Component {
  state = {
    isExpanded: false
  }
  handleExpand = () => {
    this.setState({ isExpanded: true })
  }
  render() {
    const { title, url, averageValue, value } = this.props;
    return (
      <div className="skill-progress">
        {title &&
          <h5>
            {url ?
              <Link to={url}>{title}</Link>
              :
              <span>{title}</span>
            }
          </h5>
        }
        <div className="skill-progress-bar">
          <div className="skill-progress-meter">
            {averageValue > 0 && (
              <div className="progress-average-value" style={{ width: `${averageValue * 100}%` }} />
            )}
            {value > 0 && (
              <div className="progress-value" style={{ width: `${value * 100}%` }} />
            )}
          </div>
        </div>
      </div>
    )
  }
}