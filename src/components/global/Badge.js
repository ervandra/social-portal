import React from "react";

const Badge = (props) => {
  const { profileBadgeUrl } = props;
  return (
    <div className="profile-badge">
      <img src={profileBadgeUrl} alt="Badge" />
    </div>
  )
};

export default Badge;