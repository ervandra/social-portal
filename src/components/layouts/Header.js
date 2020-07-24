import React, { Component } from "react";
import { Link } from "react-router-dom";
// import logoImg from "../../assets/images/singporepools_logo.png";
import logoLNK from "../../assets/images/logo-lnk.png";

class Header extends Component {
  render () {
    const {logo, url} = this.props;
    return <header className="header">
        <div className="grid-container">
          <div className="grid-x grid-margin-x">
            <div className="cell">
             { logo !== "false" &&
              <div className="logo">
                <Link to={`/${url ? url : ''}`}>
                  <img src={logoLNK} alt="LNK" width="160" height="80" />
                </Link>
              </div>
             }
            </div>
          </div>
        </div>
      </header>;
  }
}

export default Header;