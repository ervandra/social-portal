import React, { Component } from "react";

import dummyImage from '../../assets/images/ambassadorImage.png';

class PeopleGrid extends Component {
  render () {
    return (
    <div className="people">
      <div className="img">
        <img src={dummyImage} alt="People"/>
      </div>
      <div className="name">People {this.props.people.node.title}</div>
    </div>
    );
  }
}

export default PeopleGrid;