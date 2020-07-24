import React, { Component } from 'react';
import Wrapper from '../layouts/wrapper';
import { Helmet } from 'react-helmet';
import { Redirect, Link } from 'react-router-dom';

import { withTranslation } from 'react-i18next';
import ErrorImage from '../../assets/images/error-general.png';

class ListSkills extends Component {
  render() {

    const { loading, error } = this.props.data;
    const { t } = this.props;

    if (loading) return <div className="loading">{t('loading')}</div>;
    if (error) return <div className="error">{t('error')}</div>;

    const organisation = this.props.data.organisations.edges.length !== 0 ? this.props.data.organisations.edges[0].node : null;

    if (organisation === null) return <Redirect to="/error" />

    return (
      <Wrapper>
        <Helmet titleTemplate="%s | Lifelearn Platform">
          <title>{organisation.title}</title>
        </Helmet>
        {/* <div className="available_skills"> */}
        <div className="grid-x grid-margin-x align-stretch">
          {/* {organisation.skills.edges.map((skill, index) => <SkillGrid key={index} skill={skill} organisation={organisation} />)} */}
          {organisation.skills.edges.map((skill, index) =>
            <div className="cell small-6 medium-3 large-2" key={skill.node.id}>
              <div className="card boxShadowDeep">
                <div className="card-image">
                  {skill.node.imageUrl ? (
                    <img src={skill.node.imageUrl} alt={skill.node.title} />
                  ) : (
                      <img src={ErrorImage} alt={skill.node.title} />
                    )}
                </div>
                <div className="card-content">
                  <h6>{skill.node.title}</h6>
                </div>
                <Link className="card-link" to={`/${organisation.name}/${skill.node.id}`}>{skill.node.title}</Link>
              </div>
            </div>
          )}
        </div>
        {/* </div> */}
      </Wrapper>
    );
  }
}

export default withTranslation()(ListSkills);
