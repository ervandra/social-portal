import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import WidgetNotification from './WidgetNotification';
import WidgetPath from './WidgetPath';
import WidgetMessage from './WidgetMessage';
import WidgetMore from './WidgetMore';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

class ScrollToTop extends Component {

  closeAllWidget = () => {
    const { togglePath, toggleMessage, toggleNotification, toggleMore } = this.props;
    togglePath(false);
    toggleMessage(false);
    toggleNotification(false);
    toggleMore(false);
  }

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      window.scrollTo(0, 0);
      this.closeAllWidget();
    }
  }

  render() {
    return (
      <div id="app-container">
        {this.props.children}
        <WidgetPath />
        <WidgetMessage />
        <WidgetNotification />
        <WidgetMore />
        {/* <WidgetNotification ref={e => (this.widgetNotificationRef = e)} /> */}
      </div>
    )
  }
}

// const mapStateToProps = state => {
//   return {
//     openNotification: state.app.openNotification,
//     openPath: state.app.openPath,
//     openMessage: state.app.openMessage,
//   };
// };

const mapDispatchToProps = dispatch => {
  return {
    togglePath: open => dispatch(actions.togglePath(open)),
    toggleMessage: open => dispatch(actions.toggleMessage(open)),
    toggleNotification: open => dispatch(actions.toggleNotification(open)),
    toggleMore: open => dispatch(actions.toggleMore(open)),
  };
};

export default connect(null, mapDispatchToProps)(withRouter(ScrollToTop));