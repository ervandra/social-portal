/**
 * To Wrap JSX without additional <div>, no other usage
 */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';
import { Query } from 'react-apollo';
import { getMyPaths } from '../../store/gql/queries';

class WidgetPath extends Component {
  componentDidMount() {
    document.addEventListener('mouseup', this.handleClickOutside);
  }
  componentWillUnmount() {
    document.addEventListener('mouseup', this.handleClickOutside);
  }

  closeAllWidget = () => {
    const { togglePath } = this.props;
    togglePath(false);
  }

  handleClickOutside = e => {
    const { openPath } = this.props;
    if (openPath) {
      const domNodeTogglePath = this.widgetPathRef;
      const btn = document.querySelector('.btn-menu-path');
      // console.log('e', btn, btn.contains(e.target));
      if (!btn.contains(e.target) && (!domNodeTogglePath || !domNodeTogglePath.contains(e.target))) {
        this.closeAllWidget();
      }
    }
  };
  render() {
    const { openPath, username } = this.props;
    return (
      <div className={`widget ${openPath ? 'open' : ''}`} ref={e => (this.widgetPathRef = e)}>

        <h5>My Courses</h5>
        <div className="widget-path">
          {username && (
            <Query query={getMyPaths}>
              {({ data, loading, error }) => {
                if (loading || error) return null;
                const paths = data.viewer.paths.edges;
                return (
                  <ul>
                    {paths.map((path, index) => (
                      <li key={path.node.id + index}>
                        <Link to={`/path/${path.node.id}`}>
                          <span className="img"><img src={path.node.imageUrl} width="40" height="40" alt={path.node.title} /></span>
                          <span className="info">
                            <span className="title">{path.node.title}</span>
                            <span className="user-count">{path.node.userCount} Users</span>
                            <span className="mentor"><img src={path.node.mentorImageUrl} width="16" height="16" alt={path.node.mentorName} />{path.node.mentorName}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )
              }}
            </Query>
          )}
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
    username: state.auth.username,
    openPath: state.app.openPath,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    togglePath: open => dispatch(actions.togglePath(open)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(WidgetPath)