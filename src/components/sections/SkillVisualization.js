import React, { Component } from 'react';
import Wrapper from '../layouts/wrapper';
import SkillItem from '../global/SkillItem';
import { withTranslation } from 'react-i18next';

class SkillVisualization extends Component {
  state = {
    showTarget: true,
  }

  render() {
    const { showTarget } = this.state;
    const { data } = this.props;
    const { t } = this.props;
    return (
      <Wrapper>
        <div className="skill-visualization">
          <div className="sv-header">
            <h3><span className="fa fa-signal"></span> {t('skillProgress')}</h3>
          </div>
          <div className="sv-body">
            <div className="sv-section">
              <div className="sv-legends">
                <ul>
                  <li>
                    <span className="legend-box" style={{ backgroundColor: '#006cad' }} />
                    <span className="legend-title">{t('me')}</span>
                  </li>

                  <li>
                    <span className="legend-box" style={{ backgroundColor: '#006cad', opacity: '.6' }} />
                    <span className="legend-title">{t('orgAvg')}</span>
                  </li>

                  <li>
                    <span className="legend-box" />
                    <span className="legend-title">{t('industryAvg')}</span>
                  </li>

                  <li>
                    <span className="legend-box" />
                    <span className="legend-title">{t('globalAvg')}</span>
                  </li>
                  {showTarget && (
                    <React.Fragment>
                      <li>
                        <span className="legend-box legend-icon"><span className="fa fa-user" /></span>
                        <span className="legend-title">{t('myTarget')}</span>
                      </li>

                      <li>
                        <span className="legend-box legend-icon"><span className="fa fa-star" /></span>
                        <span className="legend-title">{t('orgTarget')}</span>
                      </li>
                    </React.Fragment>
                  )}

                </ul>
              </div>

              <div className="sv-skill-progress">

                {data && data.edges.map((skill, index) => (
                  <SkillItem key={skill.node.id} name={t('myTarget')} title={skill.node.title} url={`/skill/${skill.node.id}`} averageValue={Math.floor(skill.node.averageValue * 100, 0)} value={Math.floor(skill.node.value * 100, 0)} orgTargetValue={Math.floor(Math.random() * 30) + 70} industryAvg="100" globalAvg="100" showTarget={showTarget} />
                ))}

              </div>

            </div>
          </div>
        </div>
      </Wrapper>
    );
  }
}

export default withTranslation()(SkillVisualization);
