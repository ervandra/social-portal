import React, { Component } from "react";

class Drawer extends Component {
  state = {
    isOpen: this.props.open || false,
  }
  setOpen = newOpen => {
    const { external = false, handleOpen = false, open = false } = this.props;
    if (external) {
      handleOpen(!open);
    } else {
      this.setState({ isOpen: newOpen })
    }
  }
  render() {
    // const { isOpen } = this.state;
    const { position = 'left', title = 'Menu', icon = 'bars', size = 2, external = false, open = false } = this.props;
    const isOpen = external ? open : this.state.isOpen;
    return (
      <div className="off-canvas-container">
        <div className={`off-canvas off-canvas-${position} ${isOpen ? 'active' : ''}`}>
          {position === 'right' && (
            <div className="off-canvas-handle">
              <button className={`button mobile-size-${size}`} onClick={() => this.setOpen(!isOpen)}>
                <span className="icon">{isOpen ? (<span className={`fa fa-close`} />) : (<span className={`fa fa-${icon}`} />)}</span>
                <span className="text">{title}</span>
              </button>
            </div>
          )}
          <div className="off-canvas-content">
            <div className="mobile-close">
              <button className="button" onClick={() => this.setOpen(!isOpen)}><span className="fa fa-close"></span></button>
            </div>
            {this.props.children}
          </div>
          {position === 'left' && (
            <div className="off-canvas-handle">
              <button className={`button mobile-size-${size}`} onClick={() => this.setOpen(!isOpen)}>
                <span className="icon">{isOpen ? (<span className={`fa fa-close`} />) : (<span className={`fa fa-${icon}`} />)}</span>
                <span className="text">{title}</span>
              </button>
            </div>
          )}

        </div>
        <div className={`mobile-off-canvas-handle ${position}`}>
          <button className={`button mobile-size-${size}`} onClick={() => this.setOpen(!isOpen)}>
            <span className="icon">{isOpen ? (<span className={`fa fa-close`} />) : (<span className={`fa fa-${icon}`} />)}</span>
            <span className="text">{title}</span>
          </button>
        </div>
      </div>
    )
  }
}

export default Drawer;