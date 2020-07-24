import React from "react";

const Loader = ({title = null, size = 'small'}) => {
  return (
    <div className={`ll-loader loader-${size}`}>
      <div className="loader-icon"><span className="fa fa-spinner fa-pulse fa-2x fa-fw"></span></div>
      {title && (
        <div className="loader-text">{title}</div>
      )}
    </div>
  )
};

export default Loader;