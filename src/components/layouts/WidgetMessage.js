/**
 * To Wrap JSX without additional <div>, no other usage
 */
import React, { Component } from 'react';
// import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

class WidgetMessage extends Component {
  componentDidMount() {
    document.addEventListener('mouseup', this.handleClickOutside);
  }
  componentWillUnmount() {
    document.addEventListener('mouseup', this.handleClickOutside);
  }

  closeAllWidget = () => {
    const { toggleMessage } = this.props;
    toggleMessage(false);
  }

  handleClickOutside = e => {
    const { openMessage } = this.props;
    if (openMessage) {
      const domNodetoggleMessage = this.widgetMessageRef;
      const btn = document.querySelector('.btn-menu-message');
      // console.log('e', btn, btn.contains(e.target));
      if (!btn.contains(e.target) && (!domNodetoggleMessage || !domNodetoggleMessage.contains(e.target))) {
        this.closeAllWidget();
      }
    }
  };
  render() {
    const { openMessage } = this.props;
    return (
      <div className={`widget ${openMessage ? 'open' : ''}`} ref={e => (this.widgetMessageRef = e)}>
        <div className="widget-message">
          <h5>Messages</h5>
          {/* <ul>
          <li>Path 1</li>
          <li>Path 1</li>
          <li>Path 1</li>
          <li>Path 1</li>
          <li>Path 1</li>
          <li>Path 1</li>
          <li>Path 1</li>
          <li>Path 1</li>
          <li>Path 1</li>
          <li>Path 1</li>
          <li>Path 1</li>
          <li>Path 1</li>
          <li>Path 1</li>
          <li>Path 1</li>
          <li>Path 1</li>
          <li>Path 1</li>
          <li>Path 1</li>
          <li>Path 1</li>
        </ul> */}
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    openMessage: state.app.openMessage,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    toggleMessage: open => dispatch(actions.toggleMessage(open)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(WidgetMessage)