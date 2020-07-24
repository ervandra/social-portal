import React from "react";
import { Link } from 'react-router-dom';
import MaterialEnroll from './MaterialEnroll';

const MaterialLink = (props) => {
  const { highColor, lowColor, content, stepIndex, pathId, contentIndex = null, selectedDocument = null } = props;
  const { id, title, contentType, url, marketItem = null } = content.node;

  if (contentType === 'sellablecontent_path' && marketItem && marketItem.isEnrolled && marketItem.path && marketItem.path.id) return (
    <a
      href={`/path/${marketItem.path.id}`}
      className={`btn-viewer ${
        selectedDocument &&
          selectedDocument.stepIndex ===
          stepIndex &&
          selectedDocument.contentIndex ===
          contentIndex
          ? "active"
          : ""
        }`}
      style={{
        color: lowColor,
        background: highColor
      }}
    >
      <span
        className="viewer-border"
        style={{
          background: highColor
        }}
      />
      <span className="vuo-material-icon vuo-document"></span>
      <span className="document-title">
        {title}
      </span>
    </a>
  )

  if (contentType === 'sellablecontent_path' && marketItem && !marketItem.isEnrolled) return (
    <MaterialEnroll path={marketItem.path} title={title} />
  )

  if (contentType === 'filecontent') return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={url}
      className={`btn-viewer ${
        selectedDocument &&
          selectedDocument.stepIndex ===
          stepIndex &&
          selectedDocument.contentIndex ===
          contentIndex
          ? "active"
          : ""
        }`}
      style={{
        color: lowColor,
        background: highColor
      }}
    >
      <span
        className="viewer-border"
        style={{
          background: highColor
        }}
      />
      <span className="vuo-material-icon vuo-download"></span>
      <span className="document-title">
        {title}
      </span>
    </a>
  )
  return (
    <Link
      to={`/view/${pathId}/${stepIndex}/${id}`}
      className={`btn-viewer ${
        selectedDocument &&
          selectedDocument.stepIndex ===
          stepIndex &&
          selectedDocument.contentIndex ===
          contentIndex
          ? "active"
          : ""
        }`}
      style={{
        color: lowColor,
        background: highColor
      }}

    >
      <span
        className="viewer-border"
        style={{
          background: highColor
        }}
      />
      <span className="vuo-material-icon vuo-document"></span>
      <span className="document-title">
        {title}
      </span>
    </Link>
  )
};

export default MaterialLink;