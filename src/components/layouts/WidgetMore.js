/**
 * To Wrap JSX without additional <div>, no other usage
 */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

class WidgetMore extends Component {
  componentDidMount() {
    document.addEventListener('mouseup', this.handleClickOutside);
  }
  componentWillUnmount() {
    document.addEventListener('mouseup', this.handleClickOutside);
  }

  closeAllWidget = () => {
    const { toggleMore } = this.props;
    toggleMore(false);
  }

  handleClickOutside = e => {
    const { openMore } = this.props;
    if (openMore) {
      const domNodetoggleMore = this.widgetMoreRef;
      const btn = document.querySelector('.btn-menu-more');
      // console.log('e', btn, btn.contains(e.target));
      if (!btn.contains(e.target) && (!domNodetoggleMore || !domNodetoggleMore.contains(e.target))) {
        this.closeAllWidget();
      }
    }
  };
  render() {
    const { openMore } = this.props;
    return (
      <div className={`widget widget-small ${openMore ? 'open' : ''}`} ref={e => (this.widgetMoreRef = e)}>
        <div className="widget-more">
          <ul>
            <li>
              <Link to="/profile">
                <span className="icon"><span className="fa fa-user"></span></span>
                <span className="text">Lihat Profile</span>
              </Link>
            </li>
            <li>
              <Link to="/logout">
                <span className="icon"><span className="fa fa-sign-out"></span></span>
                <span className="text">Sign Out</span>
              </Link>
            </li>
          </ul>
          <div className="copyright">
            <p><a href="#privacy">Privacy Policy</a> · <a href="#terms">Terms & Conditions</a></p>
            <p>&copy;LifeLearn Platform {new Date().getFullYear()}</p>
          </div>
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
    openMore: state.app.openMore,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    toggleMore: open => dispatch(actions.toggleMore(open)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(WidgetMore)