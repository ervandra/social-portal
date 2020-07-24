import React, { Component } from "react";
import { Link } from 'react-router-dom';

class PublicPathGrid extends Component {
  render() {
    return (
      <div className={this.props.active === this.props.path.node.id ? "path active" : "path"}>
        <Link to={`/${this.props.organisation.name}/${this.props.skillId}/${this.props.path.node.id}`} title={this.props.path.node.title}>
          <span className="path-img">
            <img
              src={this.props.path.node.imageUrl}
              alt={this.props.path.node.title}
              width="120"
              height="120"
            />
          </span>
          <span className="path-info">
            <span className="path-title">{this.props.path.node.title}</span>
            <span className="path-users">{this.props.path.node.userCount} users</span>
            <span className="path-author"><img src={this.props.path.node.mentorImageUrl} width="24" height="24" alt={this.props.path.node.mentorName} />{this.props.path.node.mentorName}</span>
          </span>
        </Link>
      </div>
    );
  }
}

export default PublicPathGrid;