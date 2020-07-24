import React from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { UPLOAD_PICTURE_URL } from '../../constant';
import { withTranslation } from 'react-i18next';

class UserAvatar extends React.Component {
  state = {
    isAvatarModalOpen: false,
    newProfilePicture: null,
    isUploading: false,
    imagePreviewUrl: null,
    wrongImage: false,
    successUpload: false,
  }

  handleOpenAvatarModal = () => {
    this.setState({ isAvatarModalOpen: true })
  }

  handleCloseAvatarModal = () => {
    this.setState({ isAvatarModalOpen: false })
  }

  imageOnLoad = (fileImage) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      this.setState({
        imagePreviewUrl: reader.result
      });
    }

    reader.readAsDataURL(fileImage)
  }
  handleAvatarChange = (event) => {
    const img = event.target.files[0];
    if (img.type.match(/image/g)) {
      this.imageOnLoad(img);
      this.setState({
        newProfilePicture: img
      })
    } else {
      this.setState({ wrongImage: true })
    }

  }
  handleFileUpload = () => {
    if (this.state.newProfilePicture) {
      const body = new FormData();
      body.append('photo', this.state.newProfilePicture);
      this.setState({ isUploading: true })
      axios.post(UPLOAD_PICTURE_URL, body, {
        withCredentials: 'include',
      })
        .finally(res => {
          this.setState({ isUploading: false, successUpload: true })
        })
    }
  }
  componentDidUpdate() {
    if (this.state.successUpload) {
      setTimeout(() => {
        window.location.reload(1)
      }, 1000);
    }
  }
  render() {
    const { src, alt } = this.props;
    const { t } = this.props;
    return (
      <div className="user-avatar-uploader">
        <div className="avatar-image" onClick={() => this.handleOpenAvatarModal()} >
          <img src={src} alt={alt} />
          <div className="avatar-image-overlay">
            <div className="avatar-image-button">
              <span className="fa fa-camera"></span>
              <span className="text">{t('changePhoto')}</span>
            </div>
          </div>
        </div>
        <Modal
          isOpen={this.state.isAvatarModalOpen}
          contentLabel={t('updateProfilePicture')}
          ariaHideApp={false}
          className="reveal avatar-upload"
        >
          <div className="uploader-modal">
            <h3>{t('updateProfilePicture')}</h3>
            {this.state.wrongImage &&
              <div className="alert warning"><span className="fa fa-exclamation-circle"></span>{t('wrongImageError')}</div>
            }
            {this.state.isUploading &&
              <div className="alert secondary"><span className="fa fa-cloud-upload"></span>{t('isUploadingPhoto')}</div>
            }
            {!this.state.isUploading && this.state.successUpload &&
              <div className="alert success"><span className="fa fa-check-circle"></span>{t('successUploadPhoto')}</div>
            }
            <div className="image-preview">
              {this.state.imagePreviewUrl ?
                <img src={this.state.imagePreviewUrl} alt={alt} onClick={() => this.fileInput.click()} />
                :
                <img src={src} alt={alt} onClick={() => this.fileInput.click()} />
              }
            </div>
            <input style={{ display: 'none' }} type="file" onChange={(e) => this.handleAvatarChange(e)} ref={fileInput => this.fileInput = fileInput} />
            {!this.state.isUploading ?
              <div className="flex-container">
                <button className="button secondary" onClick={() => this.fileInput.click()}>{t('changePhoto')}</button>
                <button className="button warning" onClick={() => this.handleFileUpload()}>{t('save')}</button>
              </div>
              :
              <div className="flex-container">
                <button className="button secondary disabled" >{t('changePhoto')}</button>
                <button className="button warning disabled" >{t('save')}</button>
              </div>
            }
            {this.state.isUploading &&
              <div className="image-preview-loading"></div>
            }
          </div>
          <button className="close-reveal" onClick={() => this.handleCloseAvatarModal()}>&times;</button>
        </Modal>
      </div>
    )
  };
}


export default withTranslation()(UserAvatar);