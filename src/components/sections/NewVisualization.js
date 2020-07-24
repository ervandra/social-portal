import React, { Component } from 'react';
import Wrapper from '../layouts/wrapper';
import NewSkillItem from '../global/NewSkillItem';
import { withTranslation } from 'react-i18next';

class NewVisualization extends Component {
  state = {
    showTarget: true,
  }

  render() {
    const { showTarget } = this.state;
    const { data, userId, t } = this.props;
    return (
      <Wrapper>
        <div className="panel boxShadowDeep skill-visualization">
          <div className="panel-header">
            <h4>{t('skillProgress')}</h4>
          </div>
          <div className="sv-body">
            <div className="sv-section">
              <div className="sv-legends">
                <ul>
                  <li>
                    <span className="legend-box" style={{ backgroundColor: '#1FB6FF' }} />
                    <span className="legend-title">{t('me')}</span>
                  </li>

                  <li>
                    <span className="legend-box" style={{ backgroundColor: '#1FB6FF', opacity: '.6' }} />
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
                        <span className="legend-box legend-icon"><span className="fa fa-line-chart" /></span>
                        <span className="legend-title">{t('orgTarget')}</span>
                      </li>
                    </React.Fragment>
                  )}

                </ul>
              </div>

              <div className="sv-skill-progress">

                {data && data.map((skill, index) => {
                  const { id, title, value, myTarget, orgTarget, orgAverage, industryAverage, globalAverage, maxValue } = skill;
                  return (
                    <NewSkillItem key={id + index} skillId={id} name="My progress" title={title} url={`/skill/${id}`} value={value} maxValue={maxValue} myTarget={myTarget} showTarget={showTarget} orgTarget={orgTarget} orgAverage={orgAverage} industryAverage={industryAverage} globalAverage={globalAverage} userId={userId} />
                  )
                })}
              </div>

            </div>
          </div>
        </div>
      </Wrapper>
    );
  }
}
export default withTranslation()(NewVisualization);
