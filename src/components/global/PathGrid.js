import React from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

const PathGrid = props => {
  const { data, active, url } = props;
  const { t } = props;
  // let unAnsweredCount = 0;
  // if (data.steps && data.steps.edges.length > 0) {
  //   for (let s = 0; s < data.steps.edges.length; s++) {
  //     const step = data.steps.edges[s].node;
  //     if (step.contents && step.contents.edges.length > 0) {
  //       for (let c = 0; c < step.contents.edges.length; c++) {
  //         const content = step.contents.edges[c].node;
  //         const vuoBlock = content.vuoBlocks && content.vuoBlocks.edges.length > 0 ? content.vuoBlocks.edges : [];
  //         for (let v = 0; v < vuoBlock.length; v++) {
  //           const block = vuoBlock[v].node;
  //           if (block.type === 'openquestion' && block.hasAnswer === false) {
  //             unAnsweredCount++;
  //           }
  //         }
  //       }
  //     }
  //   }
  // }
  return (
    <div className={`${active === data.id ? "path active" : "path"}`}>
      <Link to={url} title={data.title}>
        <span className="path-img">
          <img
            src={data.imageUrl ? data.imageUrl : data.bgimage}
            alt={data.title}
            width="120"
            height="120"
          />
        </span>
        <span className="path-info">
          <span className="path-title">{data.title}</span>
          {/* {unAnsweredCount > 0 && (
            <span className="path-vuo-blocks">
              <span className="text">{t('unAnsweredQuestions')}: {unAnsweredCount}</span>
            </span>
          )} */}
          <span className="path-users"><span className="fa fa-stack"><i className="fa fa-circle fa-stack-2x"></i><i className="fa fa-users fa-stack-1x fa-inverse"></i></span> {data.userCount} {t('users')}</span>
          <span className="path-author"><img src={data.mentorImageUrl} width="24" height="24" alt={data.mentorName} />{data.mentorName}</span>
        </span>
      </Link>
    </div>
  )
};

export default withTranslation()(PathGrid);