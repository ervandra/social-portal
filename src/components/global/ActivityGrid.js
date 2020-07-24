import React from "react";
import { TwitterTimelineEmbed } from 'react-twitter-embed';

const ActivityGrid = (props) => {
  const { socialKeyword } = props;
  const isList = socialKeyword.match(/;/g);
  const keywords = isList ? socialKeyword.split(';') : socialKeyword;

  return (
    <div className="twitter-wrapper">
      {isList ?
        <TwitterTimelineEmbed
          sourceType="list"
          ownerScreenName={keywords[0]}
          slug={keywords[1]}
          options={{ height: 600 }}
        />
        :
        <TwitterTimelineEmbed
          sourceType="profile"
          screenName={socialKeyword}
          options={{ height: 600 }}
        />
      }
    </div>
  )
};

export default ActivityGrid;