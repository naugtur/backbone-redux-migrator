import React, {Component, Children, PropTypes} from 'react'
import { connect } from 'react-redux';


function routeMatches(choice, name){
  const bits = name.split('/')
  if (route.length===1){
    return choice.default === name
  } else {
    return choice[route[0]] === route[1]
  }
}

class Chooser extends Component {
  getChoice () {
    var visibleChildren = []

    Children.forEach(this.props.children, (child) => {
      if (child.type !== Choice || routeMatches(this.props.choice, child.props.name)) {
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
  choice: PropTypes.object.isRequired
}

class Choice extends Component {
  render () {
    return this.props.children
  }
}
Choice.propTypes = {
  name: PropTypes.string.isRequired
}

const ConnectedChooser = connect(store => ({ choice: store.choice }))(Chooser)

export {Chooser, ConnectedChooser, Choice}
