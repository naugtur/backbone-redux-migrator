import React, {Component, Children, PropTypes} from 'react'
import { connect } from 'react-redux';


class Chooser extends Component {
  getChoice () {
    var visibleChildren = []

    Children.forEach(this.props.children, (child) => {
      if (child.type !== Choice || this.props.chosen === child.props.name) {
        visibleChildren.push(child)
      }
    })
    return visibleChildren
  }

  render () {
    return (
      <div className={this.props.className ? this.props.className : ''}>
        {this.getChoice().map(child => {
          return child
        })}
      </div>
    )
  }
}
Chooser.propTypes = {
  chosen: PropTypes.string.isRequired
}

class Choice extends Component {
  render () {
    return this.props.children
  }
}
Choice.propTypes = {
  name: PropTypes.string.isRequired
}

const ConnectedChooser connect(store => ({ chosen: store.choice }))(Chooser)

export {Chooser, ConnectedChooser, Choice}
