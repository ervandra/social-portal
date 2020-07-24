import React, { Component } from "react";
// import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import EnrollButton from './EnrollButton';
import { withTranslation } from 'react-i18next';

class MaterialEnroll extends Component {
  state = {
    isOpen: false,
    isEnrolled: false,
  }
  openModal = () => {
    this.setState({
      isOpen: true
    })
  }
  closeModal = () => {
    this.setState({
      isOpen: false
    })
  }
  render() {
    const { t } = this.props;
    const { title, path } = this.props;
    const { isOpen } = this.state;
    return (
      <React.Fragment>
        <button
          className={`btn-viewer btn-viewer-enroll`}

          onClick={this.openModal}
        >
          <span
            className="viewer-border"
            style={{
              background: 'rgba(0,0,0,.66)'
            }}
          />
          <span className="vuo-material-icon vuo-document"></span>
          <span className="document-title">
            {title}
          </span>
        </button>
        <Modal
          isOpen={isOpen}
          contentLabel="Enroll"
          ariaHideApp={false}
          className="reveal"
          onRequestClose={this.closeModal}
        >
          <div className="enroll-container">
            <div className="flex-container align-middle">
              {/* <p>Enroll to {path.title}</p>
              <EnrollButton sharecode={path.goUrl.substring(35)} isAuth={true} /> */}

              <div className="path-content " style={{ padding: '0' }}>

                <div
                  className="path-detail"
                  style={{
                    margin: 0,
                    background:
                      'linear-gradient(to bottom, ' +
                      path.lowColor +
                      ' 0%, ' +
                      path.highColor +
                      ' 100%)',
                    filter:
                      "progid:DXImageTransform.Microsoft.gradient( startColorstr='#000000', endColorstr='#ffffff',GradientType=0 )",
                  }}
                >
                  <div className="path-detail-image">
                    <img
                      src={path.imageUrl}
                      alt={path.title}
                      width="350"
                      height="350"
                    />
                  </div>
                  <div className="path-detail-info">
                    <div className="path-detail-container">
                      <h3
                        style={{
                          color:
                            path
                              .maxColor,
                        }}
                      >
                        {path.title}
                      </h3>
                      <div className="flex-container align-middle">
                        <h5
                          style={{
                            color:
                              path
                                .maxColor,
                          }}
                        >
                          <span className="fa fa-stack"><i className="fa fa-circle fa-stack-2x"></i><i className="fa fa-users fa-stack-1x fa-inverse"></i></span>{path.userCount}{' '}
                          {t('users')}
                        </h5>
                        <h4
                          style={{
                            color:
                              path
                                .maxColor,
                          }}
                        >
                          <img src={path.mentorImageUrl} alt={path.mentorName} />
                          {path.mentorName}
                        </h4>
                      </div>
                      <p
                        style={{
                          color:
                            path
                              .maxColor,
                        }}
                      >
                        {path.description}
                      </p>
                      <div className="path-detail-link">
                        <EnrollButton sharecode={path.goUrl.substring(35)} isAuth={true} redirect={`/path/${path.id}`} />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
          <button className="close-reveal" onClick={this.closeModal}>&times;</button>
        </Modal>
      </React.Fragment>
    )
  }
};

export default withTranslation()(MaterialEnroll);